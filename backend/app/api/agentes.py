from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.schemas.agentes import (
    AnaliseCreditoRequest, EstimativaTributariaRequest, SplitPaymentRequest,
)
from app.services.agentes_service import (
    analisar_credito, analisar_financas_com_agentes, estimar_tributos, simular_divisao,
)

router = APIRouter(prefix="/agentes", tags=["Agentes inteligentes"])


@router.get("/financeiro/analisar", summary="Analisa o fluxo financeiro com agentes e IBM watsonx.ai")
def analisar_financeiro(
    aliquota_tributaria_percentual: Decimal = Query(Decimal("6.00"), ge=0, le=100),
    saldo_minimo: Decimal = Query(Decimal("0.00"), ge=0),
    horizonte_dias: int = Query(30, ge=1, le=90),
    incluir_ia: bool = Query(True),
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return analisar_financas_com_agentes(
        db, usuario_id, aliquota_tributaria_percentual, saldo_minimo, horizonte_dias, incluir_ia
    )


@router.post("/split-payment/simular", summary="Valida e simula a divisão de um pagamento")
def simular_split_payment(dados: SplitPaymentRequest, usuario_id: int = Depends(get_usuario_atual_id)) -> dict:
    # O usuário precisa estar autenticado; a simulação não grava nem altera dados financeiros.
    return simular_divisao(dados.model_dump(mode="json"))


@router.post("/credito/analisar", summary="Analisa matematicamente a disponibilidade informada de crédito")
def analisar_credito_endpoint(dados: AnaliseCreditoRequest, usuario_id: int = Depends(get_usuario_atual_id)) -> dict:
    return analisar_credito(dados.model_dump(mode="json"))


@router.post("/tributos/estimar", summary="Calcula estimativa demonstrativa com alíquota informada")
def estimar_tributos_endpoint(dados: EstimativaTributariaRequest, usuario_id: int = Depends(get_usuario_atual_id)) -> dict:
    return estimar_tributos(dados.total, dados.aliquota_percentual)
