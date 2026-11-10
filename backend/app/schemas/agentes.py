from decimal import Decimal
from pydantic import BaseModel, Field


class ParticipanteSplit(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    weight: Decimal | None = Field(default=None, gt=0)


class SplitPaymentRequest(BaseModel):
    total: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    participants: list[ParticipanteSplit] = Field(min_length=1, max_length=100)


class ContextoCredito(BaseModel):
    credit_limit: Decimal = Field(ge=0, max_digits=14, decimal_places=2)
    current_debt: Decimal = Field(ge=0, max_digits=14, decimal_places=2)


class AnaliseCreditoRequest(BaseModel):
    total: Decimal = Field(ge=0, max_digits=14, decimal_places=2)
    credit_context: ContextoCredito


class EstimativaTributariaRequest(BaseModel):
    total: Decimal = Field(ge=0, max_digits=14, decimal_places=2)
    aliquota_percentual: Decimal = Field(ge=0, le=100, max_digits=5, decimal_places=2)
