def test_analise_financeira_com_agentes(client_db):
    resposta = client_db.get("/api/v1/agentes/financeiro/analisar?incluir_ia=false")

    assert resposta.status_code == 200
    dados = resposta.json()
    assert set(dados["agentes"]["results"]) == {"cash", "forecast", "tax"}
    assert dados["ia_generativa"]["status"] == "ignorada"
    assert dados["projecao"]["situacao_caixa"] == "saudavel"


def test_split_payment_executa_guardian_e_inclusion(client_db):
    resposta = client_db.post(
        "/api/v1/agentes/split-payment/simular",
        json={"total": "100.00", "participants": [{"name": "Ana"}, {"name": "Bia"}]},
    )

    assert resposta.status_code == 200
    dados = resposta.json()
    assert dados["status"] == "ok"
    assert dados["results"]["guardian"]["status"] == "ok"
    assert dados["results"]["inclusion"]["status"] == "ok"
    assert sum(float(item["amount"]) for item in dados["results"]["split_payment"]["shares"]) == 100.0


def test_credito_e_tributos_deterministicos(client_db):
    credito = client_db.post(
        "/api/v1/agentes/credito/analisar",
        json={"total": "20.00", "credit_context": {"credit_limit": "100.00", "current_debt": "10.00"}},
    )
    tributos = client_db.post(
        "/api/v1/agentes/tributos/estimar",
        json={"total": "100.00", "aliquota_percentual": "6.00"},
    )

    assert credito.status_code == 200
    assert credito.json()["status"] == "ok"
    assert tributos.status_code == 200
    assert tributos.json()["tributos_estimados"] == "6.00"
