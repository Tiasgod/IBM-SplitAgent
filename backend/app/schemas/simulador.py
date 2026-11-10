from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class SimulacaoRequest(BaseModel):
    tipo: Literal["venda", "despesa"] = Field(description="Tipo de evento que será simulado")
    descricao: str = Field(min_length=1, max_length=200)
    data: date = Field(description="Data em que a venda ou despesa afetará o caixa")
    valor: Decimal = Field(gt=0, max_digits=14, decimal_places=2, description="Valor bruto da venda ou valor da despesa, em reais")
    aliquota_tributaria_percentual: Decimal = Field(default=Decimal("6.00"), ge=0, le=100, description="Alíquota estimada aplicada somente à venda")
    saldo_minimo: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=14, decimal_places=2)

    @model_validator(mode="after")
    def validar_descricao(self):
        self.descricao = self.descricao.strip()
        if not self.descricao:
            raise ValueError("A descrição não pode ficar vazia.")
        return self


class ProjecaoResumo(BaseModel):
    saldo_atual: Decimal
    menor_saldo_previsto: Decimal
    data_menor_saldo_previsto: date
    situacao_caixa: Literal["saudavel", "atencao", "critica"]
    saldo_minimo_configurado: Decimal
    periodos_abaixo_minimo: list[dict]
    dias: list[dict]


class SimulacaoResponse(BaseModel):
    id: int | None = None
    criado_em: datetime | None = None
    tipo: Literal["venda", "despesa"]
    descricao: str
    data_simulada: date
    valor_simulado: Decimal
    tributos_estimados_simulacao: Decimal
    valor_liquido_simulacao: Decimal | None
    impacto_no_saldo: Decimal
    saldo_atual_original: Decimal
    saldo_atual_simulado: Decimal
    menor_saldo_original: Decimal
    data_menor_saldo_original: date
    menor_saldo_simulado: Decimal
    data_menor_saldo_simulado: date
    gera_saldo_negativo: bool
    fica_abaixo_minimo: bool
    situacao_original: Literal["saudavel", "atencao", "critica"]
    situacao_simulada: Literal["saudavel", "atencao", "critica"]
    periodos_abaixo_minimo_simulados: list[dict]
    projecao_original: ProjecaoResumo
    projecao_simulada: ProjecaoResumo
    observacao_tributaria: str


class SimulacaoHistoricoItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    criado_em: datetime
    parametros: dict
    resultado: dict


class HistoricoSimulacoesResponse(BaseModel):
    total: int
    estado_vazio: bool
    simulacoes: list[SimulacaoHistoricoItem]
