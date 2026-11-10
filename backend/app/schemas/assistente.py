from typing import Literal

from pydantic import BaseModel, Field


class MensagemHistorico(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class ConversaRequest(BaseModel):
    mensagem: str = Field(min_length=1, max_length=2000)

    # Mantido por compatibilidade com versões antigas do frontend.
    # O backend usa o histórico persistido no banco como fonte confiável.
    historico: list[MensagemHistorico] = Field(
        default_factory=list,
        max_length=10,
    )

    # Identificador da conversa persistida no PostgreSQL.
    conversa_id: int | None = Field(default=None, ge=1)


class ConversaResponse(BaseModel):
    resposta: str
    provedor: str = "Cloudflare Workers AI"
    conversa_id: int