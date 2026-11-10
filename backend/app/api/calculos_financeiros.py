from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.schemas.calculos_financeiros import FluxoCaixaResponse, VisaoGeralResponse
from app.services import calculos_financeiros_service as service

router = APIRouter(prefix="/calculos-financeiros", tags=["Cálculos financeiros"])


@router.get("/visao-geral", response_model=VisaoGeralResponse, summary="Resumo financeiro para a tela Visão geral")
def visao_geral(
    data_inicio: date | None = Query(None, description="Padrão: primeiro dia do mês atual"),
    data_fim: date | None = Query(None, description="Padrão: hoje"),
    aliquota_tributaria_percentual: Decimal = Query(Decimal("6.00"), ge=0, le=100, description="Alíquota estimada em porcentagem; padrão 6%"),
    saldo_minimo: Decimal = Query(Decimal("0.00"), ge=0, description="Saldo mínimo de caixa desejado, em reais"),
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return service.calcular_visao_geral(db, usuario_id, data_inicio, data_fim, aliquota_tributaria_percentual, saldo_minimo)


@router.get("/fluxo-caixa", response_model=FluxoCaixaResponse, summary="Projeção diária do fluxo de caixa para os próximos 30 dias")
def fluxo_caixa(
    aliquota_tributaria_percentual: Decimal = Query(Decimal("6.00"), ge=0, le=100, description="Alíquota estimada em porcentagem; padrão 6%"),
    saldo_minimo: Decimal = Query(Decimal("0.00"), ge=0, description="Saldo mínimo de caixa desejado, em reais"),
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return service.calcular_fluxo_caixa(db, usuario_id, aliquota_tributaria_percentual, saldo_minimo)
