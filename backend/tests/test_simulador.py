from datetime import timedelta
from decimal import Decimal

from app.services.movimentacao_service import hoje
from tests.planilhas import XLSX, montar_planilha


def dia(n: int):
    return hoje() + timedelta(days=n)


def importar(client, **kwargs):
    conteudo = montar_planilha(saldo=(dia(-1), 1000), **kwargs)
    resposta = client.post("/api/v1/importacoes", files={"arquivo": ("simulador.xlsx", conteudo, XLSX)})
    assert resposta.status_code == 201, resposta.text


def test_simular_venda_calcula_tributos_liquido_e_registra_historico(client_db):
    importar(client_db, despesas=[("Aluguel", dia(5), 100)])
    resposta = client_db.post("/api/v1/simulador/simular", json={
        "tipo": "venda", "descricao": "Venda hipotética", "data": dia(3).isoformat(),
        "valor": "1000.00", "aliquota_tributaria_percentual": "6", "saldo_minimo": "500"
    })
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["tributos_estimados_simulacao"] == "60.00"
    assert corpo["valor_liquido_simulacao"] == "940.00"
    assert corpo["saldo_atual_original"] == corpo["saldo_atual_simulado"]
    assert Decimal(corpo["menor_saldo_simulado"]) > Decimal(corpo["menor_saldo_original"])
    assert len(corpo["projecao_original"]["dias"]) == 30
    assert len(corpo["projecao_simulada"]["dias"]) == 30
    assert corpo["id"] is not None
    historico = client_db.get("/api/v1/simulador/simulacoes")
    assert historico.status_code == 200, historico.text
    dados_historico = historico.json()
    assert dados_historico["total"] == 1
    assert dados_historico["simulacoes"][0]["resultado"]["descricao"] == "Venda hipotética"


def test_simular_despesa_detecta_risco_sem_alterar_projecao_original(client_db):
    importar(client_db, vendas=[(dia(-2), "Venda base", 100, "Pix")])
    resposta = client_db.post("/api/v1/simulador/simular", json={
        "tipo": "despesa", "descricao": "Compra hipotética", "data": dia(2).isoformat(),
        "valor": "1500.00", "saldo_minimo": "200"
    })
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["tributos_estimados_simulacao"] == "0.00"
    assert corpo["valor_liquido_simulacao"] is None
    assert corpo["gera_saldo_negativo"] is True
    assert corpo["fica_abaixo_minimo"] is True
    assert corpo["situacao_original"] == "saudavel"
    assert corpo["situacao_simulada"] == "critica"
    assert corpo["projecao_original"]["saldo_atual"] == "1000.00"


def test_simulador_rejeita_data_fora_do_horizonte(client_db):
    resposta = client_db.post("/api/v1/simulador/simular", json={
        "tipo": "despesa", "descricao": "Despesa futura", "data": dia(31).isoformat(),
        "valor": "100.00"
    })
    assert resposta.status_code == 422


def test_simulador_rejeita_valor_zero(client_db):
    resposta = client_db.post("/api/v1/simulador/simular", json={
        "tipo": "venda", "descricao": "Venda inválida", "data": dia(1).isoformat(), "valor": "0"
    })
    assert resposta.status_code == 422


def test_historico_de_simulacoes_isola_usuario_e_consulta_item(client_db):
    resposta = client_db.post("/api/v1/simulador/simular", json={
        "tipo": "despesa", "descricao": "Conta de energia", "data": dia(4).isoformat(),
        "valor": "250.00", "saldo_minimo": "100"
    })
    assert resposta.status_code == 200, resposta.text
    simulacao_id = resposta.json()["id"]
    detalhe = client_db.get(f"/api/v1/simulador/simulacoes/{simulacao_id}")
    assert detalhe.status_code == 200, detalhe.text
    assert detalhe.json()["parametros"]["descricao"] == "Conta de energia"
    assert detalhe.json()["resultado"]["tipo"] == "despesa"
