from datetime import timedelta

from app.services.movimentacao_service import hoje


def simular(client, descricao="Simulação de teste", tipo="venda", valor="500.00"):
    return client.post("/api/v1/simulador/simular", json={
        "tipo": tipo,
        "descricao": descricao,
        "data": (hoje() + timedelta(days=3)).isoformat(),
        "valor": valor,
        "aliquota_tributaria_percentual": "6",
        "saldo_minimo": "100",
    })


def test_historico_retorna_estado_vazio_quando_nao_ha_simulacoes(client_db):
    resposta = client_db.get("/api/v1/simulador/simulacoes")
    assert resposta.status_code == 200, resposta.text
    assert resposta.json() == {"total": 0, "estado_vazio": True, "simulacoes": []}


def test_simulacoes_sao_salvas_listadas_e_consultadas(client_db):
    primeira = simular(client_db, "Venda de teste")
    segunda = simular(client_db, "Despesa de teste", "despesa", "200.00")
    assert primeira.status_code == 200, primeira.text
    assert segunda.status_code == 200, segunda.text
    assert primeira.json()["id"] is not None
    assert primeira.json()["criado_em"]

    historico = client_db.get("/api/v1/simulador/simulacoes")
    assert historico.status_code == 200, historico.text
    corpo = historico.json()
    assert corpo["total"] == 2
    assert corpo["estado_vazio"] is False
    assert [item["id"] for item in corpo["simulacoes"]] == [segunda.json()["id"], primeira.json()["id"]]

    detalhe = client_db.get(f"/api/v1/simulador/simulacoes/{primeira.json()['id']}")
    assert detalhe.status_code == 200, detalhe.text
    assert detalhe.json()["parametros"]["descricao"] == "Venda de teste"
    assert detalhe.json()["resultado"]["tipo"] == "venda"


def test_nao_consulta_simulacao_inexistente(client_db):
    resposta = client_db.get("/api/v1/simulador/simulacoes/99999")
    assert resposta.status_code == 404


def test_endpoint_antigo_de_decisoes_nao_e_mais_publicado(client_db):
    resposta = client_db.get("/api/v1/simulador/decisoes")
    assert resposta.status_code == 404
