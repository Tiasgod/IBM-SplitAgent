from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import case, func, literal_column, select, union_all
from sqlalchemy.orm import Session

from app.models import Despesa, Recebivel, MovimentacaoManual

CENTAVOS = Decimal("0.01")


@dataclass
class ResultadoMovimentacoes:
    itens: list[dict]
    total_itens: int
    total_entradas: Decimal
    total_saidas: Decimal


def _dinheiro(valor) -> Decimal:
    return Decimal(str(valor or 0)).quantize(CENTAVOS)


def listar(
    db: Session,
    usuario_id: int,
    data_inicio: date,
    data_fim: date | None,
    tipo: str | None,
    limite: int,
    offset: int,
) -> ResultadoMovimentacoes:
    """Entradas (recebíveis) e saídas (despesas) do usuário, unidas e ordenadas por data."""
    selects = []
    if tipo in (None, "entrada"):
        consulta = select(
            Recebivel.data_prevista.label("data"),
            func.coalesce(Recebivel.descricao, literal_column("'Recebimento previsto'")).label("descricao"),
            Recebivel.valor_esperado.label("valor"),
            literal_column("'entrada'").label("tipo"),
            literal_column("'recebivel'").label("origem"),
            Recebivel.id.label("id"),
        ).where(Recebivel.usuario_id == usuario_id, Recebivel.data_prevista >= data_inicio)
        if data_fim is not None:
            consulta = consulta.where(Recebivel.data_prevista <= data_fim)
        selects.append(consulta)
    if tipo in (None, "saida"):
        consulta = select(
            Despesa.vencimento.label("data"),
            Despesa.descricao.label("descricao"),
            Despesa.valor.label("valor"),
            literal_column("'saida'").label("tipo"),
            literal_column("'despesa'").label("origem"),
            Despesa.id.label("id"),
        ).where(Despesa.usuario_id == usuario_id, Despesa.vencimento >= data_inicio)
        if data_fim is not None:
            consulta = consulta.where(Despesa.vencimento <= data_fim)
        selects.append(consulta)

    # Lançamentos manuais são consultados separadamente dos dados importados.
    if tipo in (None, "entrada", "saida"):
        consulta = select(
            MovimentacaoManual.data.label("data"),
            MovimentacaoManual.descricao.label("descricao"),
            MovimentacaoManual.valor.label("valor"),
            MovimentacaoManual.tipo.label("tipo"),
            literal_column("'manual'").label("origem"),
            MovimentacaoManual.id.label("id"),
        ).where(MovimentacaoManual.usuario_id == usuario_id, MovimentacaoManual.data >= data_inicio)
        if data_fim is not None:
            consulta = consulta.where(MovimentacaoManual.data <= data_fim)
        if tipo is not None:
            consulta = consulta.where(MovimentacaoManual.tipo == tipo)
        selects.append(consulta)

    uniao = union_all(*selects).subquery()

    totais = db.execute(
        select(
            func.count(),
            func.coalesce(func.sum(case((uniao.c.tipo == "entrada", uniao.c.valor), else_=0)), 0),
            func.coalesce(func.sum(case((uniao.c.tipo == "saida", uniao.c.valor), else_=0)), 0),
        ).select_from(uniao)
    ).one()

    linhas = db.execute(
        select(uniao).order_by(uniao.c.data, uniao.c.tipo, uniao.c.id).limit(limite).offset(offset)
    ).all()
    itens = [
        {"data": l.data, "descricao": l.descricao, "valor": _dinheiro(l.valor), "tipo": l.tipo, "origem": l.origem}
        for l in linhas
    ]
    return ResultadoMovimentacoes(itens, int(totais[0]), _dinheiro(totais[1]), _dinheiro(totais[2]))
