from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.schemas.decisao import DecisaoCriar, DecisaoResposta, HistoricoDecisoesResposta
from app.services.decisao_service import consultar_decisao, listar_decisoes, registrar_decisao

router = APIRouter(prefix="/simulador/decisoes", tags=["Histórico de decisões"])


@router.post("", response_model=DecisaoResposta, status_code=status.HTTP_201_CREATED,
             summary="Registrar uma decisão do simulador")
def criar_decisao(
    dados: DecisaoCriar,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> DecisaoResposta:
    return registrar_decisao(db, usuario_id, dados)


@router.get("", response_model=HistoricoDecisoesResposta, summary="Listar histórico de decisões")
def obter_historico(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    decisoes = listar_decisoes(db, usuario_id)
    return {"total": len(decisoes), "estado_vazio": len(decisoes) == 0, "decisoes": decisoes}


@router.get("/{decisao_id}", response_model=DecisaoResposta, summary="Consultar uma decisão anterior")
def obter_decisao(
    decisao_id: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> DecisaoResposta:
    return consultar_decisao(db, usuario_id, decisao_id)
