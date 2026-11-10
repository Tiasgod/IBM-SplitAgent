from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import func, literal, select, union_all
from sqlalchemy.orm import Session

from app.core.erros import RequisicaoInvalidaError
from app.models import (
    Despesa,
    Recebivel,
    SaldoInicial,
    Venda,
    SaldoManual,
    MovimentacaoManual,
)
from app.services.movimentacao_service import hoje

CENTAVOS = Decimal("0.01")
ZERO = Decimal("0.00")


def _dinheiro(valor) -> Decimal:
    return Decimal(str(valor or 0)).quantize(
        CENTAVOS,
        rounding=ROUND_HALF_UP
    )


def _somar(db: Session, coluna, *filtros) -> Decimal:
    valor = db.scalar(
        select(func.coalesce(func.sum(coluna), 0)).where(*filtros)
    )
    return _dinheiro(valor)


def _saldo_base(db: Session, usuario_id: int) -> tuple[date | None, Decimal]:
    """Busca o saldo-base mais recente em uma única consulta."""
    saldos = union_all(
        select(
            SaldoInicial.data_referencia.label("data_referencia"),
            SaldoInicial.saldo.label("saldo"),
            literal(0).label("prioridade"),
            SaldoInicial.id.label("id"),
        ).where(SaldoInicial.usuario_id == usuario_id),
        select(
            SaldoManual.data_referencia.label("data_referencia"),
            SaldoManual.saldo.label("saldo"),
            literal(1).label("prioridade"),
            SaldoManual.id.label("id"),
        ).where(SaldoManual.usuario_id == usuario_id),
    ).subquery()

    registro = db.execute(
        select(saldos.c.data_referencia, saldos.c.saldo)
        .order_by(
            saldos.c.data_referencia.desc(),
            saldos.c.prioridade.desc(),
            saldos.c.id.desc(),
        )
        .limit(1)
    ).first()

    if registro is None:
        return None, ZERO

    return registro.data_referencia, _dinheiro(registro.saldo)


def _periodos_abaixo_minimo(
    dias: list[dict],
    minimo: Decimal
) -> list[dict]:

    periodos: list[dict] = []
    atual = None

    for dia in dias:
        if dia["saldo_previsto"] < minimo:

            if atual is None:
                atual = {
                    "data_inicio": dia["data"],
                    "data_fim": dia["data"],
                    "menor_saldo_no_periodo": dia["saldo_previsto"],
                }

            else:
                atual["data_fim"] = dia["data"]
                atual["menor_saldo_no_periodo"] = min(
                    atual["menor_saldo_no_periodo"],
                    dia["saldo_previsto"]
                )

        elif atual is not None:
            periodos.append(atual)
            atual = None

    if atual is not None:
        periodos.append(atual)

    return periodos


def _situacao(menor: Decimal, minimo: Decimal) -> str:
    if menor < ZERO:
        return "critica"

    if menor < minimo:
        return "atencao"

    return "saudavel"


def calcular_visao_geral(
    db: Session,
    usuario_id: int,
    data_inicio: date | None,
    data_fim: date | None,
    aliquota_tributaria_percentual: Decimal,
    saldo_minimo: Decimal,
) -> dict:

    data_hoje = hoje()

    inicio = data_inicio or data_hoje.replace(day=1)
    fim = data_fim or data_hoje

    if fim < inicio:
        raise RequisicaoInvalidaError(
            "data_fim não pode ser anterior à data_inicio."
        )

    if fim > data_hoje:
        raise RequisicaoInvalidaError(
            "A visão geral de vendas aceita somente períodos até hoje."
        )

    vendas = _somar(
        db,
        Venda.valor_bruto,
        Venda.usuario_id == usuario_id,
        Venda.data >= inicio,
        Venda.data <= fim,
    )

    taxa = aliquota_tributaria_percentual / Decimal("100")

    tributos = _dinheiro(vendas * taxa)
    liquido = _dinheiro(vendas - tributos)

    fluxo = calcular_fluxo_caixa(
        db,
        usuario_id,
        aliquota_tributaria_percentual,
        saldo_minimo,
        data_hoje,
        30,
    )

    return {
        "data_inicio": inicio,
        "data_fim": fim,
        "aliquota_tributaria_percentual": aliquota_tributaria_percentual,
        "total_vendido": vendas,
        "tributos_estimados": tributos,
        "valor_liquido_vendas": liquido,
        "saldo_atual": fluxo["saldo_atual"],
        "saldo_minimo_configurado": saldo_minimo,
        "menor_saldo_previsto": fluxo["menor_saldo_previsto"],
        "data_menor_saldo_previsto": fluxo["data_menor_saldo_previsto"],
        "situacao_caixa": fluxo["situacao_caixa"],
        "periodos_abaixo_minimo": fluxo["periodos_abaixo_minimo"],
        "observacao_tributaria": (
            "Estimativa simplificada sobre o faturamento bruto. "
            "A alíquota é configurável e não substitui cálculo contábil/fiscal."
        ),
    }


def calcular_fluxo_caixa(
    db: Session,
    usuario_id: int,
    aliquota_tributaria_percentual: Decimal,
    saldo_minimo: Decimal,
    data_base: date | None = None,
    horizonte_dias: int = 30,
) -> dict:

    hoje_local = data_base or hoje()
    fim = hoje_local + timedelta(days=horizonte_dias)

    data_saldo, saldo_inicial = _saldo_base(db, usuario_id)

    if data_saldo is not None and data_saldo > hoje_local:
        saldo_inicial = ZERO
        data_saldo = None

    # Recebíveis e despesas importados da planilha.
    filtros_recebidos = [
        Recebivel.usuario_id == usuario_id,
        Recebivel.data_prevista <= hoje_local,
    ]

    filtros_pagos = [
        Despesa.usuario_id == usuario_id,
        Despesa.vencimento <= hoje_local,
    ]

    if data_saldo is not None:
        filtros_recebidos.append(
            Recebivel.data_prevista > data_saldo
        )

        filtros_pagos.append(
            Despesa.vencimento > data_saldo
        )

    # Quatro totais históricos são obtidos em uma única ida ao banco.
    filtros_manuais = [
        MovimentacaoManual.usuario_id == usuario_id,
        MovimentacaoManual.data <= hoje_local,
    ]
    if data_saldo is not None:
        filtros_manuais.append(MovimentacaoManual.data >= data_saldo)

    totais_historicos = db.execute(
        select(
            select(func.coalesce(func.sum(Recebivel.valor_esperado), 0))
            .where(*filtros_recebidos).scalar_subquery().label("recebidos_brutos"),
            select(func.coalesce(func.sum(Despesa.valor), 0))
            .where(*filtros_pagos).scalar_subquery().label("despesas_passadas"),
            select(func.coalesce(func.sum(MovimentacaoManual.valor), 0))
            .where(*filtros_manuais, MovimentacaoManual.tipo == "entrada")
            .scalar_subquery().label("entradas_manuais_passadas"),
            select(func.coalesce(func.sum(MovimentacaoManual.valor), 0))
            .where(*filtros_manuais, MovimentacaoManual.tipo == "saida")
            .scalar_subquery().label("saidas_manuais_passadas"),
        )
    ).one()

    recebidos_brutos = _dinheiro(totais_historicos.recebidos_brutos)
    despesas_passadas = _dinheiro(totais_historicos.despesas_passadas)
    entradas_manuais_passadas = _dinheiro(totais_historicos.entradas_manuais_passadas)
    saidas_manuais_passadas = _dinheiro(totais_historicos.saidas_manuais_passadas)

    taxa = aliquota_tributaria_percentual / Decimal("100")

    recebidos_liquidos = _dinheiro(
        recebidos_brutos * (Decimal("1") - taxa)
    )

    saldo_atual = _dinheiro(
        saldo_inicial
        + recebidos_liquidos
        - despesas_passadas
        + entradas_manuais_passadas
        - saidas_manuais_passadas
    )

    # Agrupamento das movimentações futuras.
    entradas_por_dia: dict[date, Decimal] = defaultdict(
        lambda: ZERO
    )

    saidas_por_dia: dict[date, Decimal] = defaultdict(
        lambda: ZERO
    )

    entradas_manuais_por_dia: dict[date, Decimal] = defaultdict(
        lambda: ZERO
    )

    # Recebíveis, despesas e lançamentos manuais futuros em uma única consulta.
    movimentos_futuros = union_all(
        select(
            Recebivel.data_prevista.label("data"),
            literal("recebivel").label("tipo"),
            func.sum(Recebivel.valor_esperado).label("total"),
        )
        .where(
            Recebivel.usuario_id == usuario_id,
            Recebivel.data_prevista > hoje_local,
            Recebivel.data_prevista <= fim,
        )
        .group_by(Recebivel.data_prevista),
        select(
            Despesa.vencimento.label("data"),
            literal("saida").label("tipo"),
            func.sum(Despesa.valor).label("total"),
        )
        .where(
            Despesa.usuario_id == usuario_id,
            Despesa.vencimento > hoje_local,
            Despesa.vencimento <= fim,
        )
        .group_by(Despesa.vencimento),
        select(
            MovimentacaoManual.data.label("data"),
            MovimentacaoManual.tipo.label("tipo"),
            func.sum(MovimentacaoManual.valor).label("total"),
        )
        .where(
            MovimentacaoManual.usuario_id == usuario_id,
            MovimentacaoManual.data > hoje_local,
            MovimentacaoManual.data <= fim,
        )
        .group_by(MovimentacaoManual.data, MovimentacaoManual.tipo),
    ).subquery()

    registros_futuros = db.execute(
        select(
            movimentos_futuros.c.data,
            movimentos_futuros.c.tipo,
            movimentos_futuros.c.total,
        )
    ).all()

    for data, tipo, total in registros_futuros:
        valor = _dinheiro(total)
        if tipo in ("recebivel", "entrada"):
            entradas_por_dia[data] += valor
            if tipo == "entrada":
                entradas_manuais_por_dia[data] += valor
        else:
            saidas_por_dia[data] += valor

    # Projeção diária do saldo.
    dias: list[dict] = []
    saldo_corrente = saldo_atual

    for deslocamento in range(1, horizonte_dias + 1):

        data = hoje_local + timedelta(days=deslocamento)

        entrada_bruta = entradas_por_dia[data]

        # Entradas manuais não recebem tributação estimada.
        imposto = _dinheiro(
            (entrada_bruta - entradas_manuais_por_dia[data]) * taxa
        )

        entrada_liquida = _dinheiro(
            entrada_bruta - imposto
        )

        saldo_antes = saldo_corrente

        saldo_corrente = _dinheiro(
            saldo_corrente
            + entrada_liquida
            - saidas_por_dia[data]
        )

        dias.append({
            "data": data,
            "saldo_inicial_dia": saldo_antes,
            "total_entradas_brutas": entrada_bruta,
            "tributos_estimados": imposto,
            "total_entradas_liquidas": entrada_liquida,
            "total_saidas": saidas_por_dia[data],
            "saldo_previsto": saldo_corrente,
            "abaixo_minimo": saldo_corrente < saldo_minimo,
        })

    if dias:

        menor_dia = min(
            dias,
            key=lambda item: (
                item["saldo_previsto"],
                item["data"]
            )
        )

        menor_saldo = menor_dia["saldo_previsto"]
        data_menor = menor_dia["data"]

    else:
        menor_saldo = saldo_atual
        data_menor = hoje_local

    periodos = _periodos_abaixo_minimo(
        dias,
        saldo_minimo
    )

    return {
        "data_inicio": hoje_local,
        "data_fim": fim,
        "saldo_atual": saldo_atual,
        "saldo_minimo_configurado": _dinheiro(saldo_minimo),
        "menor_saldo_previsto": menor_saldo,
        "data_menor_saldo_previsto": data_menor,
        "situacao_caixa": _situacao(
            menor_saldo,
            saldo_minimo
        ),
        "periodos_abaixo_minimo": periodos,
        "dias": dias,
    }