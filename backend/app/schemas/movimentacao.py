from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class MovimentacaoOut(BaseModel):
    data: date
    descricao: str
    valor: Decimal
    tipo: Literal["entrada", "saida"]
    origem: Literal["recebivel", "despesa", "manual"]


class MovimentacoesResponse(BaseModel):
    data_inicio: date
    data_fim: date | None
    total_itens: int
    total_entradas: Decimal
    total_saidas: Decimal
    limite: int
    offset: int
    movimentacoes: list[MovimentacaoOut]


class ResumoDia(BaseModel):
    data: date
    total_entradas: Decimal
    total_saidas: Decimal
    saldo_liquido: Decimal
    quantidade_movimentacoes: int


class AnaliseMovimentacoesResponse(BaseModel):
    data_inicio: date
    data_fim: date
    total_itens: int
    total_entradas: Decimal
    total_saidas: Decimal
    saldo_liquido: Decimal
    por_data: list[ResumoDia]
    movimentacoes: list[MovimentacaoOut]
