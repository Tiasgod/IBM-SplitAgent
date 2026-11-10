import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.database import DatabaseNotConfiguredError, check_connection
from app.schemas.resposta import DBHealthResponse, HealthResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Inicializando a API"])


@router.get("/health", response_model=HealthResponse, summary="Verifica se a API está no ar")
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )


@router.get(
    "/health/db",
    response_model=DBHealthResponse,
    responses={503: {"model": DBHealthResponse, "description": "Banco indisponível"}},
    summary="Verifica a conexão com o PostgreSQL",
)
def health_db():
    try:
        check_connection()
    except DatabaseNotConfiguredError:
        corpo = DBHealthResponse(status="error", database="não configurado")
        return JSONResponse(status_code=503, content=corpo.model_dump())
    except Exception as erro:
        # Registra só o tipo do erro: a mensagem pode conter dados de conexão.
        logger.error("Falha ao conectar ao banco: %s", type(erro).__name__)
        corpo = DBHealthResponse(status="error", database="indisponível")
        return JSONResponse(status_code=503, content=corpo.model_dump())
    return DBHealthResponse(status="ok", database="conectado")
