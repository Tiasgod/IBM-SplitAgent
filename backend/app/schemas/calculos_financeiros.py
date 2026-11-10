from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class VisaoGeralResponse(BaseModel):
    data_inicio: date
    data_fim: date
    aliquota_tributaria_percentual: Decimal
    total_vendido: Decimal
    tributos_estimados: Decimal
    valor_liquido_vendas: Decimal
    saldo_atual: Decimal
    saldo_minimo_configurado: Decimal
    menor_saldo_previsto: Decimal
    data_menor_saldo_previsto: date
    situacao_caixa: Literal["saudavel", "atencao", "critica"]
    periodos_abaixo_minimo: list[dict]
    observacao_tributaria: str


class PontoFluxoCaixa(BaseModel):
    data: date
    saldo_inicial_dia: Decimal
    total_entradas_brutas: Decimal
    tributos_estimados: Decimal
    total_entradas_liquidas: Decimal
    total_saidas: Decimal
    saldo_previsto: Decimal
    abaixo_minimo: bool


class FluxoCaixaResponse(BaseModel):
    data_inicio: date
    data_fim: date
    saldo_atual: Decimal
    saldo_minimo_configurado: Decimal
    menor_saldo_previsto: Decimal
    data_menor_saldo_previsto: date
    situacao_caixa: Literal["saudavel", "atencao", "critica"]
    periodos_abaixo_minimo: list[dict]
    dias: list[PontoFluxoCaixa]
