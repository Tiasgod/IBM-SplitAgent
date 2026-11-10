from datetime import timedelta
from decimal import Decimal

from app.services.movimentacao_service import hoje
from tests.planilhas import XLSX, montar_planilha


def dia(n: int):
    return hoje() + timedelta(days=n)


def importar(client, **kwargs):
    conteudo = montar_planilha(saldo=(dia(-1), 1000), **kwargs)
    resposta = client.post("/api/v1/importacoes", files={"arquivo": ("calculos.xlsx", conteudo, XLSX)})
    assert resposta.status_code == 201, resposta.text


def test_visao_geral_calcula_vendas_tributos_liquido_e_projecao(client_db):
    importar(
        client_db,
        vendas=[(dia(-2), "Venda A", 1000, "Pix"), (dia(-1), "Venda B", 500, "Cartão de crédito")],
        recebiveis=[(dia(5), 500, "Recebimento futuro")],
        despesas=[("Fornecedor", dia(10), 200)],
    )
    resposta = client_db.get("/api/v1/calculos-financeiros/visao-geral")
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["total_vendido"] == "1500.00"
    assert corpo["tributos_estimados"] == "90.00"
    assert corpo["valor_liquido_vendas"] == "1410.00"
    assert corpo["saldo_atual"] == "1000.00"
    assert len(corpo["periodos_abaixo_minimo"]) == 0
    assert corpo["situacao_caixa"] == "saudavel"


def test_fluxo_caixa_30_dias_identifica_menor_saldo_e_periodo_critico(client_db):
    importar(
        client_db,
        recebiveis=[(dia(2), 100, "Entrada")],
        despesas=[("Despesa maior", dia(3), 1200)],
    )
    resposta = client_db.get(
        "/api/v1/calculos-financeiros/fluxo-caixa",
        params={"saldo_minimo": "200.00", "aliquota_tributaria_percentual": "6"},
    )
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert len(corpo["dias"]) == 30
    assert corpo["saldo_atual"] == "1000.00"
    assert corpo["menor_saldo_previsto"] == "-106.00"
    assert corpo["situacao_caixa"] == "critica"
    assert corpo["periodos_abaixo_minimo"]
    assert corpo["periodos_abaixo_minimo"][0]["data_inicio"] == dia(3).isoformat()


def test_visao_geral_rejeita_periodo_futuro(client_db):
    resposta = client_db.get(
        "/api/v1/calculos-financeiros/visao-geral",
        params={"data_inicio": dia(1).isoformat(), "data_fim": dia(2).isoformat()},
    )
    assert resposta.status_code == 422


def test_sem_planilha_retorna_resumo_com_zeros(client_db):
    resposta = client_db.get("/api/v1/calculos-financeiros/visao-geral")
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["total_vendido"] == "0.00"
    assert corpo["tributos_estimados"] == "0.00"
    assert corpo["valor_liquido_vendas"] == "0.00"
    assert corpo["saldo_atual"] == "0.00"


def test_fluxo_integrado_soma_planilha_e_lancamentos_manuais(client_db):
    importar(
        client_db,
        recebiveis=[(dia(2), 500, "Recebível da planilha")],
        despesas=[("Fornecedor da planilha", dia(3), 200)],
    )
    saldo = client_db.post("/api/v1/saldo-inicial", json={
        "data_referencia": dia(-1).isoformat(), "saldo": "1000.00"
    })
    assert saldo.status_code in (200, 201), saldo.text
    entrada = client_db.post("/api/v1/movimentacoes/manuais", json={
        "data": dia(4).isoformat(), "descricao": "Entrada manual", "valor": "300.00",
        "tipo": "entrada", "categoria": "Serviços"
    })
    assert entrada.status_code == 201, entrada.text
    saida = client_db.post("/api/v1/movimentacoes/manuais", json={
        "data": dia(5).isoformat(), "descricao": "Saída manual", "valor": "100.00",
        "tipo": "saida", "categoria": "Operacional"
    })
    assert saida.status_code == 201, saida.text
    fluxo = client_db.get("/api/v1/calculos-financeiros/fluxo-caixa", params={"aliquota_tributaria_percentual": "0"})
    assert fluxo.status_code == 200, fluxo.text
    dias = {item["data"]: item for item in fluxo.json()["dias"]}
    assert dias[dia(2).isoformat()]["total_entradas_brutas"] == "500.00"
    assert dias[dia(3).isoformat()]["total_saidas"] == "200.00"
    assert dias[dia(4).isoformat()]["total_entradas_brutas"] == "300.00"
    assert dias[dia(5).isoformat()]["total_saidas"] == "100.00"


def test_lancamento_manual_funciona_sem_planilha(client_db):
    resposta = client_db.post("/api/v1/movimentacoes/manuais", json={
        "data": dia(1).isoformat(), "descricao": "Receita avulsa", "valor": "75.00",
        "tipo": "entrada"
    })
    assert resposta.status_code == 201, resposta.text
    fluxo = client_db.get("/api/v1/calculos-financeiros/fluxo-caixa", params={"aliquota_tributaria_percentual": "0"})
    assert fluxo.status_code == 200, fluxo.text
    assert fluxo.json()["dias"][0]["total_entradas_brutas"] == "75.00"
