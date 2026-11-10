from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.schemas.simulador import (
    HistoricoSimulacoesResponse, SimulacaoHistoricoItem, SimulacaoRequest, SimulacaoResponse,
)
from app.services.simulador_service import (
    consultar_simulacao, listar_simulacoes, simular_movimentacao,
)

router = APIRouter(prefix="/simulador", tags=["Simulações financeiras"])


@router.post(
    "/simular",
    response_model=SimulacaoResponse,
    summary="Simular e registrar uma simulação no histórico",
    description=(
        "Compara a projeção financeira original com a projeção após um evento hipotético. "
        "Registra os parâmetros e resultados no histórico, sem alterar os lançamentos financeiros."
    ),
)
def simular(
    dados: SimulacaoRequest,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return simular_movimentacao(db, usuario_id, dados)


@router.get(
    "/simulacoes", response_model=HistoricoSimulacoesResponse,
    summary="Listar histórico de simulações",
)
def obter_historico_simulacoes(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    simulacoes = listar_simulacoes(db, usuario_id)
    return {
        "total": len(simulacoes),
        "estado_vazio": len(simulacoes) == 0,
        "simulacoes": simulacoes,
    }


@router.get(
    "/simulacoes/{simulacao_id}", response_model=SimulacaoHistoricoItem,
    summary="Consultar uma simulação do histórico",
)
def obter_simulacao(
    simulacao_id: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> SimulacaoHistoricoItem:
    return consultar_simulacao(db, usuario_id, simulacao_id)
