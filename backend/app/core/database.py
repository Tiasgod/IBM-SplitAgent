import logging
from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class DatabaseNotConfiguredError(RuntimeError):
    """A variável DATABASE_URL não foi definida."""


@lru_cache
def get_engine() -> Engine:
    settings = get_settings()
    url = settings.sqlalchemy_database_url

    if not url:
        raise DatabaseNotConfiguredError("DATABASE_URL não configurada.")

    opcoes = {
        "pool_pre_ping": True,
        "pool_size": settings.database_pool_size,
        "max_overflow": settings.database_max_overflow,
        "pool_timeout": settings.database_pool_timeout,
        "pool_recycle": settings.database_pool_recycle,
    }

    if url.startswith("postgresql"):
        opcoes["connect_args"] = {
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 3,
        }

    elif url.startswith("sqlite"):
        opcoes.pop("pool_size", None)
        opcoes.pop("max_overflow", None)
        opcoes.pop("pool_timeout", None)
        opcoes.pop("pool_recycle", None)

    return create_engine(url, **opcoes)


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(
        bind=get_engine(),
        autoflush=False,
        expire_on_commit=False,
    )


def get_db() -> Iterator[Session]:
    """Abre uma sessão por requisição e sempre a encerra."""
    db = get_session_factory()()

    try:
        yield db
    finally:
        db.close()


def check_connection() -> None:
    """Confirma que o banco responde."""
    with get_engine().connect() as conexao:
        conexao.execute(text("SELECT 1"))