from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import literal, select, union_all
from sqlalchemy.orm import Session

from app.agents.cash import CashAgent
from app.agents.orchestrator import SplitAgentOrchestrator
from app.models import Recebivel, Despesa, MovimentacaoManual
from app.services.calculos_financeiros_service import (
    calcular_fluxo_caixa,
    _saldo_base,
)
from app.services.ia_service import interpretar_analise_financeira
from app.services.movimentacao_service import hoje


CENTAVOS = Decimal("0.01")


def _dinheiro(valor) -> Decimal:
    return Decimal(str(valor or 0)).quantize(
        CENTAVOS,
        rounding=ROUND_HALF_UP
    )


def _movimentacoes_realizadas(
    db: Session,
    usuario_id: int,
    aliquota_tributaria_percentual: Decimal,
    data_hoje,
) -> list[dict]:
    """
    Recupera as movimentações realizadas desde a data de referência
    do saldo inicial, considerando planilhas e lançamentos manuais.
    """

    data_saldo, _ = _saldo_base(db, usuario_id)

    taxa = aliquota_tributaria_percentual / Decimal("100")

    filtros_recebiveis = [
        Recebivel.usuario_id == usuario_id,
        Recebivel.data_prevista <= data_hoje,
    ]
    filtros_despesas = [
        Despesa.usuario_id == usuario_id,
        Despesa.vencimento <= data_hoje,
    ]
    filtros_manuais = [
        MovimentacaoManual.usuario_id == usuario_id,
        MovimentacaoManual.data <= data_hoje,
    ]

    if data_saldo is not None:
        filtros_recebiveis.append(Recebivel.data_prevista > data_saldo)
        filtros_despesas.append(Despesa.vencimento > data_saldo)
        # Mantém a regra original: movimentação manual na data do saldo entra.
        filtros_manuais.append(MovimentacaoManual.data >= data_saldo)

    movimentos_query = union_all(
        select(
            Recebivel.valor_esperado.label("valor"),
            Recebivel.data_prevista.label("data"),
            literal("income").label("tipo"),
            literal("Recebível importado da planilha").label("descricao"),
        ).where(*filtros_recebiveis),
        select(
            Despesa.valor.label("valor"),
            Despesa.vencimento.label("data"),
            literal("expense").label("tipo"),
            literal("Despesa importada da planilha").label("descricao"),
        ).where(*filtros_despesas),
        select(
            MovimentacaoManual.valor.label("valor"),
            MovimentacaoManual.data.label("data"),
            MovimentacaoManual.tipo.label("tipo"),
            MovimentacaoManual.descricao.label("descricao"),
        ).where(*filtros_manuais),
    ).subquery()

    registros = db.execute(
        select(
            movimentos_query.c.valor,
            movimentos_query.c.data,
            movimentos_query.c.tipo,
            movimentos_query.c.descricao,
        )
    ).all()

    movimentos = []
    for valor, data, tipo, descricao in registros:
        valor_decimal = _dinheiro(valor)

        # Recebíveis importados recebem a mesma dedução tributária usada
        # anteriormente; entradas manuais não são presumidas como vendas.
        if tipo == "income":
            valor_decimal = _dinheiro(
                valor_decimal * (Decimal("1") - taxa)
            )
            if valor_decimal <= 0:
                continue
        else:
            valor_decimal = _dinheiro(valor_decimal)

        movimentos.append({
            "type": "income" if tipo in ("income", "entrada") else "expense",
            "amount": format(valor_decimal, ".2f"),
            "date": data.isoformat(),
            "description": descricao,
        })

    return movimentos


def analisar_financas_com_agentes(
    db: Session,
    usuario_id: int,
    aliquota_tributaria_percentual: Decimal,
    saldo_minimo: Decimal,
    horizonte_dias: int,
    incluir_ia: bool = True,
) -> dict:

    data_hoje = hoje()

    projecao = calcular_fluxo_caixa(
        db,
        usuario_id,
        aliquota_tributaria_percentual,
        saldo_minimo,
        data_hoje,
        horizonte_dias,
    )

    # Movimentações futuras consolidadas para o Forecast.
    movimentos_futuros = []

    total_entradas = Decimal("0.00")
    total_saidas = Decimal("0.00")

    for dia in projecao["dias"]:

        data_iso = dia["data"].isoformat()

        entradas = _dinheiro(
            dia["total_entradas_liquidas"]
        )

        saidas = _dinheiro(
            dia["total_saidas"]
        )

        if entradas > 0:
            movimentos_futuros.append({
                "type": "income",
                "amount": format(entradas, ".2f"),
                "date": data_iso,
                "description": "Entradas previstas consolidadas",
            })

            total_entradas += entradas

        if saidas > 0:
            movimentos_futuros.append({
                "type": "expense",
                "amount": format(saidas, ".2f"),
                "date": data_iso,
                "description": "Saídas previstas consolidadas",
            })

            total_saidas += saidas

    # Movimentações realizadas para o agente Cash.
    movimentos_realizados = _movimentacoes_realizadas(
        db,
        usuario_id,
        aliquota_tributaria_percentual,
        data_hoje,
    )

    # Executa os agentes.
    orchestrator = SplitAgentOrchestrator()

    tributos_ja_calculados = sum(
        (
            _dinheiro(dia["tributos_estimados"])
            for dia in projecao["dias"]
        ),
        Decimal("0.00"),
    )

    taxa = Decimal(str(aliquota_tributaria_percentual))

    base_tributavel_equivalente = (
        tributos_ja_calculados * Decimal("100") / taxa
        if taxa > 0
        else Decimal("0.00")
    )

    resultado_agentes = orchestrator.process_financial(
        movimentos_futuros,
        projecao["data_fim"].isoformat(),
        format(projecao["saldo_atual"], ".2f"),
        format(base_tributavel_equivalente, ".2f"),
        format(taxa, ".2f"),
    )

    # O Cash recebe somente movimentações já realizadas.
    resultado_agentes["results"]["cash"] = CashAgent().process(
        movimentos_realizados
    )

    # Mantém os tributos calculados pelo serviço financeiro.
    resultado_agentes["results"]["tax"][
        "tributos_estimados_calculo_financeiro"
    ] = format(tributos_ja_calculados, ".2f")

    resultado_agentes["results"]["tax"]["observacao"] = (
        "Estimativa demonstrativa alinhada à alíquota informada. "
        "O valor da projeção financeira é a referência e não substitui "
        "apuração contábil/fiscal."
    )

    # Indicadores enviados à IA.
    dados_ia = {
        "saldo_atual": format(
            projecao["saldo_atual"], ".2f"
        ),
        "saldo_minimo": format(
            projecao["saldo_minimo_configurado"], ".2f"
        ),
        "menor_saldo_previsto": format(
            projecao["menor_saldo_previsto"], ".2f"
        ),
        "data_menor_saldo_previsto": (
            projecao["data_menor_saldo_previsto"].isoformat()
        ),
        "situacao_caixa": projecao["situacao_caixa"],
        "total_entradas_liquidas_previstas": format(
            total_entradas, ".2f"
        ),
        "total_saidas_previstas": format(
            total_saidas, ".2f"
        ),
        "periodos_abaixo_minimo": [
            {
                "data_inicio": periodo["data_inicio"].isoformat(),
                "data_fim": periodo["data_fim"].isoformat(),
                "menor_saldo_no_periodo": format(
                    periodo["menor_saldo_no_periodo"], ".2f"
                ),
            }
            for periodo in projecao["periodos_abaixo_minimo"]
        ],
    }

    if incluir_ia:
        interpretacao = interpretar_analise_financeira(
            dados_ia
        )
    else:
        interpretacao = {
            "status": "ignorada",
            "provedor": "Cloudflare Workers AI",
            "recomendacao": None,
        }

    return {
        "agentes": resultado_agentes,
        "projecao": projecao,
        "ia_generativa": interpretacao,
        "observacao": (
            "Os valores numéricos são calculados pelo back-end e pelos "
            "agentes determinísticos. A IA do Cloudflare Workers AI "
            "apenas interpreta os indicadores e não altera os cálculos."
        ),
    }


def simular_divisao(dados: dict) -> dict:
    return SplitAgentOrchestrator().process_split_payment(dados)


def analisar_credito(dados: dict) -> dict:
    return SplitAgentOrchestrator().process_credit(dados)


def estimar_tributos(total: Decimal, aliquota: Decimal) -> dict:
    from app.agents.tax import TaxAgent

    return TaxAgent().process_with_rate(total, aliquota)