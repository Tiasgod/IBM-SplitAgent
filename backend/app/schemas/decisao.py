from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DecisaoCriar(BaseModel):
    recomendacao: str = Field(min_length=1, max_length=10000, description="Recomendação exibida pelo simulador")
    escolha_usuario: str = Field(min_length=1, max_length=200, description="Decisão tomada pelo usuário")
    resultado_projetado: dict[str, Any] = Field(description="Resultado da simulação apresentado ao usuário")

    @field_validator("recomendacao", "escolha_usuario")
    @classmethod
    def validar_texto(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("O campo não pode ficar vazio.")
        return valor


class DecisaoResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    data_decisao: datetime
    recomendacao: str
    escolha_usuario: str
    resultado_projetado: dict[str, Any]


class HistoricoDecisoesResposta(BaseModel):
    total: int
    estado_vazio: bool
    decisoes: list[DecisaoResposta]
