from fastapi.testclient import TestClient


def payload(email="tiago@example.com", documento="52998224725"):
    return {"nome": "Tiago Dias", "documento": documento, "email": email, "senha": "Senha-forte-123"}


def test_cadastro_login_logout_e_senha(client_db):
    r = client_db.post("/api/v1/acesso/cadastro", json=payload())
    assert r.status_code == 201, r.text
    assert "senha_hash" not in r.json()

    duplicado = client_db.post("/api/v1/acesso/cadastro", json=payload(email="TIAGO@example.com"))
    assert duplicado.status_code == 409

    login = client_db.post("/api/v1/acesso/login", json={"identificador": "529.982.247-25", "senha": "Senha-forte-123"})
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]

    logout = client_db.post("/api/v1/acesso/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout.status_code == 204

    protegido = client_db.get("/api/v1/movimentacoes", headers={"Authorization": f"Bearer {token}"})
    assert protegido.status_code == 401


def test_recuperacao_redefine_senha_e_invalida_sessoes(client_db):
    assert client_db.post("/api/v1/acesso/cadastro", json=payload()).status_code == 201
    login = client_db.post("/api/v1/acesso/login", json={"identificador": "tiago@example.com", "senha": "Senha-forte-123"})
    token_antigo = login.json()["access_token"]

    recuperacao = client_db.post("/api/v1/acesso/recuperar-senha", json={"email": "tiago@example.com"})
    assert recuperacao.status_code == 200
    token_reset = recuperacao.json()["token_desenvolvimento"]
    redefinir = client_db.post("/api/v1/acesso/redefinir-senha", json={"token": token_reset, "nova_senha": "Nova-senha-123"})
    assert redefinir.status_code == 200

    antigo = client_db.get("/api/v1/movimentacoes", headers={"Authorization": f"Bearer {token_antigo}"})
    assert antigo.status_code == 401
    novo = client_db.post("/api/v1/acesso/login", json={"identificador": "tiago@example.com", "senha": "Nova-senha-123"})
    assert novo.status_code == 200

    reutilizado = client_db.post("/api/v1/acesso/redefinir-senha", json={"token": token_reset, "nova_senha": "Outra-senha-123"})
    assert reutilizado.status_code == 400


def test_login_google_indisponivel_sem_configuracao(client_db):
    # Não faz chamadas externas: garante que a API não aceita OAuth sem Client ID configurado.
    from app.core.config import get_settings
    get_settings.cache_clear()
    resposta = client_db.post(
        "/api/v1/acesso/google",
        json={"credential": "x" * 40},
    )
    assert resposta.status_code == 503
    get_settings.cache_clear()


def test_crud_conta_usuario(client_db):
    cadastro = client_db.post("/api/v1/acesso/cadastro", json=payload())
    assert cadastro.status_code == 201, cadastro.text
    login = client_db.post("/api/v1/acesso/login", json={"identificador": "tiago@example.com", "senha": "Senha-forte-123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    consulta = client_db.get("/api/v1/acesso/me", headers=headers)
    assert consulta.status_code == 200, consulta.text
    assert consulta.json()["email"] == "tiago@example.com"
    assert "documento" not in consulta.json() and "senha_hash" not in consulta.json()

    atualizacao = client_db.put("/api/v1/acesso/me", headers=headers, json={"nome": "Tiago Pereira Dias"})
    assert atualizacao.status_code == 200, atualizacao.text
    assert atualizacao.json()["nome"] == "Tiago Pereira Dias"

    exclusao = client_db.delete("/api/v1/acesso/me", headers=headers)
    assert exclusao.status_code == 204, exclusao.text
    conta_inativa = client_db.get("/api/v1/acesso/me", headers=headers)
    assert conta_inativa.status_code == 401  # sessão revogada ao desativar a conta


def test_atualizacao_impede_email_duplicado(client_db):
    assert client_db.post("/api/v1/acesso/cadastro", json=payload()).status_code == 201
    assert client_db.post("/api/v1/acesso/cadastro", json=payload(email="outra@example.com", documento="39053344705")).status_code == 201
    login = client_db.post("/api/v1/acesso/login", json={"identificador": "outra@example.com", "senha": "Senha-forte-123"})
    resposta = client_db.put("/api/v1/acesso/me", headers={"Authorization": f"Bearer {login.json()['access_token']}"}, json={"email": "tiago@example.com"})
    assert resposta.status_code == 409
