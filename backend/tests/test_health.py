from fastapi.testclient import TestClient

from app.core import config
from app.main import create_app


def test_health_retorna_ok(client):
    resposta = client.get("/health")
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["status"] == "ok"
    assert corpo["app"] == "SplitAgent API"


def test_health_db_sem_configuracao_retorna_503(client):
    resposta = client.get("/health/db")
    assert resposta.status_code == 503
    assert resposta.json() == {"status": "error", "database": "não configurado"}


def test_health_db_conectado(monkeypatch, tmp_path):
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path / 'teste.db'}")
    config.get_settings.cache_clear()
    resposta = TestClient(create_app()).get("/health/db")
    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok", "database": "conectado"}


def test_health_db_falha_nao_vaza_credenciais(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://usuario:senha_secreta@127.0.0.1:1/banco")
    config.get_settings.cache_clear()
    resposta = TestClient(create_app()).get("/health/db")
    assert resposta.status_code == 503
    assert resposta.json() == {"status": "error", "database": "indisponível"}
    assert "senha_secreta" not in resposta.text


def test_swagger_disponivel_em_desenvolvimento(client):
    assert client.get("/docs").status_code == 200


def test_swagger_pode_ser_desativado(monkeypatch):
    monkeypatch.setenv("DOCS_ENABLED", "false")
    config.get_settings.cache_clear()
    assert TestClient(create_app()).get("/docs").status_code == 404
