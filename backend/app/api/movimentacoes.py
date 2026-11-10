from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.schemas.importacao import ErroSimplesResponse
from app.schemas.movimentacao import AnaliseMovimentacoesResponse, MovimentacoesResponse
from app.services import movimentacao_service

router = APIRouter(prefix="/movimentacoes", tags=["Movimentações financeiras"])


@router.get(
    "",
    response_model=MovimentacoesResponse,
    summary="Próximas entradas e saídas, ordenadas por data",
    description=(
        "Entradas vêm dos recebíveis (data prevista) e saídas das despesas (vencimento). "
        "Vendas já realizadas não entram aqui. Por padrão lista de hoje em diante. "
        "Valores monetários são devolvidos como texto (ex.: \"1234.50\") para não perder precisão."
    ),
    responses={422: {"model": ErroSimplesResponse, "description": "Período inválido"}},
)
def listar_movimentacoes(
    data_inicio: date | None = Query(None, description="Padrão: hoje (fuso America/Sao_Paulo)"),
    data_fim: date | None = Query(None, description="Sem limite se omitido"),
    tipo: Literal["entrada", "saida"] | None = Query(None),
    limite: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return movimentacao_service.listar(db, usuario_id, data_inicio, data_fim, tipo, limite, offset)


@router.get(
    "/entradas",
    response_model=MovimentacoesResponse,
    summary="Consultar entradas por descrição, data e valor",
)
def listar_entradas(
    data_inicio: date | None = Query(None, description="Padrão: hoje"),
    data_fim: date | None = Query(None),
    limite: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return movimentacao_service.listar(db, usuario_id, data_inicio, data_fim, "entrada", limite, offset)


@router.get(
    "/saidas",
    response_model=MovimentacoesResponse,
    summary="Consultar saídas por descrição, data e valor",
)
def listar_saidas(
    data_inicio: date | None = Query(None, description="Padrão: hoje"),
    data_fim: date | None = Query(None),
    limite: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return movimentacao_service.listar(db, usuario_id, data_inicio, data_fim, "saida", limite, offset)


@router.get(
    "/analise",
    response_model=AnaliseMovimentacoesResponse,
    summary="Dados consolidados para cálculos financeiros e SplitAgent",
    description=(
        "Retorna histórico e previsões de entradas (recebíveis) e saídas (despesas), "
        "ordenados por data, com totais e saldo líquido por período e por dia. "
        "Por padrão considera o intervalo de 2000 a 2100. Não inclui vendas para evitar "
        "contagem duplicada com recebíveis."
    ),
)
def obter_dados_analise(
    data_inicio: date | None = Query(None),
    data_fim: date | None = Query(None),
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return movimentacao_service.obter_dados_para_analise(db, usuario_id, data_inicio, data_fim)
