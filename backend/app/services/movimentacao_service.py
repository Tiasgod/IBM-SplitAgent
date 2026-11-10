from datetime import date, datetime
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.erros import RequisicaoInvalidaError
from app.repositories import movimentacao_repository as repo


def hoje() -> date:
    return datetime.now(ZoneInfo(get_settings().fuso_horario)).date()


def listar(
    db: Session,
    usuario_id: int,
    data_inicio: date | None,
    data_fim: date | None,
    tipo: str | None,
    limite: int,
    offset: int,
) -> dict:
    """Próximas movimentações: por padrão, de hoje em diante."""
    inicio = data_inicio or hoje()
    if data_fim is not None and data_fim < inicio:
        raise RequisicaoInvalidaError(
            f"data_fim não pode ser anterior à data de início ({inicio.isoformat()})."
        )
    resultado = repo.listar(db, usuario_id, inicio, data_fim, tipo, limite, offset)
    return {
        "data_inicio": inicio,
        "data_fim": data_fim,
        "total_itens": resultado.total_itens,
        "total_entradas": resultado.total_entradas,
        "total_saidas": resultado.total_saidas,
        "limite": limite,
        "offset": offset,
        "movimentacoes": resultado.itens,
    }


def obter_dados_para_analise(
    db: Session,
    usuario_id: int,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> dict:
    """Retorna movimentações normalizadas e agregações reutilizáveis por cálculos e agentes.

    Diferentemente da listagem operacional, esta consulta inclui histórico e previsões;
    por padrão cobre o intervalo aceito pela planilha (2000–2100).
    """
    from collections import defaultdict
    from decimal import Decimal

    inicio = data_inicio or date(2000, 1, 1)
    fim = data_fim or date(2100, 12, 31)
    if fim < inicio:
        raise RequisicaoInvalidaError(
            f"data_fim não pode ser anterior à data de início ({inicio.isoformat()})."
        )

    resultado = repo.listar(db, usuario_id, inicio, fim, None, 10000, 0)
    por_data: dict[date, dict] = defaultdict(
        lambda: {"total_entradas": Decimal("0.00"), "total_saidas": Decimal("0.00"), "quantidade_movimentacoes": 0}
    )
    for item in resultado.itens:
        dia = por_data[item["data"]]
        if item["tipo"] == "entrada":
            dia["total_entradas"] += item["valor"]
        else:
            dia["total_saidas"] += item["valor"]
        dia["quantidade_movimentacoes"] += 1

    dias = [
        {"data": data, **valores, "saldo_liquido": valores["total_entradas"] - valores["total_saidas"]}
        for data, valores in sorted(por_data.items())
    ]
    return {
        "data_inicio": inicio,
        "data_fim": fim,
        "total_itens": resultado.total_itens,
        "total_entradas": resultado.total_entradas,
        "total_saidas": resultado.total_saidas,
        "saldo_liquido": resultado.total_entradas - resultado.total_saidas,
        "por_data": dias,
        "movimentacoes": resultado.itens,
    }
