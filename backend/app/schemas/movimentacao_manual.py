from datetime import date
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

class SaldoManualEntrada(BaseModel):
    data_referencia: date
    saldo: Decimal = Field(max_digits=14, decimal_places=2)

class SaldoManualSaida(SaldoManualEntrada):
    model_config = ConfigDict(from_attributes=True)
    id: int

class MovimentacaoManualEntrada(BaseModel):
    data: date
    descricao: str = Field(min_length=1, max_length=200)
    valor: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    tipo: Literal["entrada", "saida"]
    categoria: str | None = Field(default=None, max_length=80)

class MovimentacaoManualAtualizacao(BaseModel):
    data: date | None = None
    descricao: str | None = Field(default=None, min_length=1, max_length=200)
    valor: Decimal | None = Field(default=None, gt=0, max_digits=14, decimal_places=2)
    tipo: Literal["entrada", "saida"] | None = None
    categoria: str | None = Field(default=None, max_length=80)

class MovimentacaoManualSaida(MovimentacaoManualEntrada):
    model_config = ConfigDict(from_attributes=True)
    id: int
