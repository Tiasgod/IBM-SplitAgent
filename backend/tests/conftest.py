import pytest
from fastapi.testclient import TestClient

from app.core import config, database
from app.main import create_app
from app.models import Base


def _limpar_caches() -> None:
    config.get_settings.cache_clear()
    database.get_engine.cache_clear()
    database.get_session_factory.cache_clear()


@pytest.fixture(autouse=True)
def ambiente_isolado(monkeypatch):
    """Impede que os testes usem o .env (e o banco real do Neon) por acidente."""
    monkeypatch.setenv("DATABASE_URL", "")
    monkeypatch.setenv("DATABASE_URL_DIRECT", "")
    monkeypatch.setenv("DOCS_ENABLED", "true")
    monkeypatch.setenv("USUARIO_DEV_ID", "")
    monkeypatch.setenv("IMPORTACAO_MAX_MB", "5")
    monkeypatch.setenv("IMPORTACAO_MAX_LINHAS", "5000")
    _limpar_caches()
    yield
    _limpar_caches()


@pytest.fixture
def client():
    return TestClient(create_app())


@pytest.fixture
def client_db(monkeypatch, tmp_path):
    """API com um SQLite temporário e o usuário de desenvolvimento 1 habilitado."""
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path / 'teste.db'}")
    monkeypatch.setenv("USUARIO_DEV_ID", "1")
    _limpar_caches()
    Base.metadata.create_all(database.get_engine())
    return TestClient(create_app())
