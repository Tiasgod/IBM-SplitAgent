from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.models import Despesa, Recebivel, MovimentacaoManual
from app.models.conversa import ConversaAssistente, MensagemAssistente
from app.schemas.assistente import ConversaRequest, ConversaResponse
from app.services.agentes_service import analisar_financas_com_agentes
from app.services.calculos_financeiros_service import calcular_fluxo_caixa
from app.services.ia_service import responder_assistente
from app.services.movimentacao_service import hoje

router = APIRouter(prefix="/assistente", tags=["Assistente Splito"])

ALIQUOTA_PADRAO = Decimal("6.00")


def _decimal_seguro(valor, nome: str, minimo: Decimal = Decimal("0")) -> Decimal:
    try:
        if isinstance(valor, bool):
            raise ValueError()
        resultado = Decimal(str(valor))
        if not resultado.is_finite() or resultado < minimo:
            raise ValueError()
        return resultado
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError(f"Parâmetro {nome} inválido.") from None


def _executar_ferramenta(
    db: Session, usuario_id: int, nome: str, argumentos: dict
) -> dict:
    """Lista fechada de ferramentas; o modelo nunca escolhe o usuário ou executa escrita."""

    if nome == "consultar_fluxo_caixa":
        horizonte = argumentos.get("horizonte_dias")
        if isinstance(horizonte, bool) or not isinstance(horizonte, int) or not 1 <= horizonte <= 90:
            raise ValueError("O horizonte deve estar entre 1 e 90 dias.")
        projecao = calcular_fluxo_caixa(
            db, usuario_id, ALIQUOTA_PADRAO, Decimal("0.00"), hoje(), horizonte
        )
        return jsonable_encoder({
            "data_inicio": projecao["data_inicio"],
            "data_fim": projecao["data_fim"],
            "saldo_atual": projecao["saldo_atual"],
            "menor_saldo_previsto": projecao["menor_saldo_previsto"],
            "data_menor_saldo_previsto": projecao["data_menor_saldo_previsto"],
            "situacao_caixa": projecao["situacao_caixa"],
            "dias": projecao["dias"],
            "observacao_tributaria": (
                "A projeção utiliza alíquota demonstrativa padrão de 6%; "
                "não representa apuração tributária individual."
            ),
        })

    if nome == "analisar_com_agentes":
        horizonte = argumentos.get("horizonte_dias")
        if isinstance(horizonte, bool) or not isinstance(horizonte, int) or not 1 <= horizonte <= 90:
            raise ValueError("O horizonte deve estar entre 1 e 90 dias.")
        aliquota = _decimal_seguro(
            argumentos.get("aliquota_tributaria_percentual", ALIQUOTA_PADRAO),
            "aliquota_tributaria_percentual",
        )
        if aliquota > 100:
            raise ValueError("A alíquota não pode ultrapassar 100%.")
        saldo_minimo = _decimal_seguro(
            argumentos.get("saldo_minimo", 0), "saldo_minimo"
        )
        resultado = analisar_financas_com_agentes(
            db, usuario_id, aliquota, saldo_minimo, horizonte, incluir_ia=False
        )
        return jsonable_encoder({
            "agentes": resultado["agentes"],
            "projecao": resultado["projecao"],
            "observacao": resultado["observacao"],
        })

    if nome == "consultar_movimentacoes":
        dias = argumentos.get("dias")
        limite = argumentos.get("limite", 20)
        if isinstance(dias, bool) or not isinstance(dias, int) or not 1 <= dias <= 90:
            raise ValueError("O período deve estar entre 1 e 90 dias.")
        if isinstance(limite, bool) or not isinstance(limite, int) or not 1 <= limite <= 30:
            raise ValueError("O limite deve estar entre 1 e 30 registros.")
        inicio = hoje()
        fim = inicio + timedelta(days=dias)
        despesas = db.scalars(
            select(Despesa).where(
                Despesa.usuario_id == usuario_id,
                Despesa.vencimento >= inicio,
                Despesa.vencimento <= fim,
            ).order_by(Despesa.vencimento.asc()).limit(limite)
        ).all()
        recebiveis = db.scalars(
            select(Recebivel).where(
                Recebivel.usuario_id == usuario_id,
                Recebivel.data_prevista >= inicio,
                Recebivel.data_prevista <= fim,
            ).order_by(Recebivel.data_prevista.asc()).limit(limite)
        ).all()
        manuais = db.scalars(
            select(MovimentacaoManual).where(
                MovimentacaoManual.usuario_id == usuario_id,
                MovimentacaoManual.data >= inicio,
                MovimentacaoManual.data <= fim,
            ).order_by(MovimentacaoManual.data.asc()).limit(limite)
        ).all()
        registros = (
            [{"data": d.vencimento, "tipo": "despesa", "descricao": d.descricao,
              "valor": d.valor, "origem": "planilha"} for d in despesas]
            + [{"data": r.data_prevista, "tipo": "recebimento",
                "descricao": r.descricao or "Recebimento previsto",
                "valor": r.valor_esperado, "origem": "planilha"} for r in recebiveis]
            + [{"data": m.data, "tipo": m.tipo, "descricao": m.descricao,
                "valor": m.valor, "origem": "manual"} for m in manuais]
        )
        registros.sort(key=lambda item: (item["data"], item["tipo"]))
        return jsonable_encoder({
            "periodo": {"inicio": inicio, "fim": fim},
            "quantidade": len(registros),
            "movimentacoes": registros,
        })

    raise ValueError("Ferramenta não permitida.")


def _obter_conversa(
    db: Session, usuario_id: int, conversa_id: int | None, mensagem: str
) -> ConversaAssistente:
    if conversa_id is None:
        conversa = ConversaAssistente(usuario_id=usuario_id, titulo=mensagem[:117] + ("..." if len(mensagem) > 117 else ""))
        db.add(conversa)
        db.flush()
        return conversa

    conversa = db.scalar(
        select(ConversaAssistente).where(
            ConversaAssistente.id == conversa_id,
            ConversaAssistente.usuario_id == usuario_id,
        )
    )
    if conversa is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada.",
        )
    return conversa


@router.post("/conversar", response_model=ConversaResponse, summary="Conversa com o assistente Splito")
def conversar(
    dados: ConversaRequest,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> ConversaResponse:
    conversa = _obter_conversa(db, usuario_id, dados.conversa_id, dados.mensagem)

    historico_registros = db.scalars(
        select(MensagemAssistente)
        .where(MensagemAssistente.conversa_id == conversa.id)
        .order_by(MensagemAssistente.criada_em.desc(), MensagemAssistente.id.desc())
        .limit(12)
    ).all()
    historico = [
        {"role": item.role, "content": item.content}
        for item in reversed(historico_registros)
        if item.role in ("user", "assistant")
    ]

    db.add(MensagemAssistente(
        conversa_id=conversa.id, role="user", content=dados.mensagem
    ))
    conversa.atualizada_em = datetime.now(timezone.utc)
    db.commit()

    def executar(nome: str, argumentos: dict) -> dict:
        return _executar_ferramenta(db, usuario_id, nome, argumentos)

    resultado = responder_assistente(
        mensagem=dados.mensagem,
        contexto_financeiro=None,
        historico=historico,
        executar_ferramenta=executar,
    )

    if resultado.get("status") != "ok" or not resultado.get("resposta"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=resultado.get("mensagem", "O assistente está temporariamente indisponível."),
        )

    resposta = resultado["resposta"]
    db.add(MensagemAssistente(
        conversa_id=conversa.id, role="assistant", content=resposta
    ))
    conversa.atualizada_em = datetime.now(timezone.utc)
    db.commit()

    return ConversaResponse(
        resposta=resposta,
        conversa_id=conversa.id,
    )


@router.get("/conversas", summary="Lista as conversas do usuário autenticado")
def listar_conversas(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> list[dict]:
    conversas = db.scalars(
        select(ConversaAssistente)
        .where(ConversaAssistente.usuario_id == usuario_id)
        .order_by(ConversaAssistente.atualizada_em.desc(), ConversaAssistente.id.desc())
        .limit(50)
    ).all()
    return [
        {
            "conversa_id": item.id,
            "titulo": item.titulo,
            "criada_em": item.criada_em,
            "atualizada_em": item.atualizada_em,
        }
        for item in conversas
    ]


@router.get("/conversas/{conversa_id}", summary="Recupera as mensagens de uma conversa")
def obter_conversa(
    conversa_id: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    conversa = db.scalar(
        select(ConversaAssistente).where(
            ConversaAssistente.id == conversa_id,
            ConversaAssistente.usuario_id == usuario_id,
        )
    )
    if conversa is None:
        raise HTTPException(status_code=404, detail="Conversa não encontrada.")

    mensagens = db.scalars(
        select(MensagemAssistente)
        .where(MensagemAssistente.conversa_id == conversa_id)
        .order_by(MensagemAssistente.criada_em.asc(), MensagemAssistente.id.asc())
    ).all()
    return {
        "conversa_id": conversa.id,
        "titulo": conversa.titulo,
        "mensagens": [
            {"role": item.role, "content": item.content, "criada_em": item.criada_em}
            for item in mensagens
        ],
    }
