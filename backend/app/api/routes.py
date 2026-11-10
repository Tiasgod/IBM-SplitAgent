from fastapi import APIRouter

from app.api import acesso, agentes, assistente, calculos_financeiros, importacoes, movimentacoes, simulador, movimentacoes_manuais
from app.api.health import router as health_router

# Rotas de saúde ficam na raiz (/health), usadas pelo Railway e por monitoramento.
# Os domínios de negócio ficam sob /api/v1.
api_v1_router = APIRouter()
api_v1_router.include_router(acesso.router)
api_v1_router.include_router(importacoes.router)
api_v1_router.include_router(movimentacoes.router)
api_v1_router.include_router(movimentacoes_manuais.router)
api_v1_router.include_router(calculos_financeiros.router)
api_v1_router.include_router(simulador.router)
api_v1_router.include_router(agentes.router)
api_v1_router.include_router(assistente.router)

__all__ = ["health_router", "api_v1_router"]
