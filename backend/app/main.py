import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_v1_router, health_router
from app.core.config import get_settings
from app.core.erros import registrar_handlers

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


def create_app() -> FastAPI:
    settings = get_settings()

    opcoes_docs = {}
    if not settings.docs_enabled:
        opcoes_docs = {"docs_url": None, "redoc_url": None, "openapi_url": None}

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="API do SplitAgent: fluxo de caixa e inteligência financeira para pequenos negócios.",
        **opcoes_docs,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    registrar_handlers(app)
    app.include_router(health_router)
    app.include_router(api_v1_router, prefix="/api/v1")
    return app


app = create_app()
