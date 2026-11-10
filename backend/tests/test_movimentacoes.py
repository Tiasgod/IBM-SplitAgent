from datetime import timedelta

from app.services.movimentacao_service import hoje
from tests.planilhas import XLSX, montar_planilha


def dia(n: int):
    return hoje() + timedelta(days=n)


def importar(client, **kwargs):
    conteudo = montar_planilha(saldo=(dia(-1), 1000), **kwargs)
    resposta = client.post("/api/v1/importacoes", files={"arquivo": ("p.xlsx", conteudo, XLSX)})
    assert resposta.status_code == 201, resposta.text


def cenario(client):
    importar(
        client,
        vendas=[(dia(-2), "Venda antiga", 999, "Pix")],
        recebiveis=[(dia(5), 1000, "Parcela A"), (dia(2), 500.5, None), (dia(-3), 300, "Recebido há dias")],
        despesas=[("Aluguel", dia(2), 800), ("Fornecedor", dia(10), 1200.75), ("Conta paga", dia(-1), 50)],
    )


def resumo(corpo):
    return [(m["data"], m["tipo"], m["descricao"]) for m in corpo["movimentacoes"]]


def test_lista_proximas_movimentacoes_ordenadas_por_data(client_db):
    cenario(client_db)
    resposta = client_db.get("/api/v1/movimentacoes")
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert resumo(corpo) == [
        (dia(2).isoformat(), "entrada", "Recebimento previsto"),
        (dia(2).isoformat(), "saida", "Aluguel"),
        (dia(5).isoformat(), "entrada", "Parcela A"),
        (dia(10).isoformat(), "saida", "Fornecedor"),
    ]
    assert corpo["total_itens"] == 4
    assert corpo["total_entradas"] == "1500.50"
    assert corpo["total_saidas"] == "2000.75"
    assert corpo["data_inicio"] == hoje().isoformat()
    assert corpo["movimentacoes"][0]["valor"] == "500.50"
    assert corpo["movimentacoes"][0]["origem"] == "recebivel"
    assert corpo["movimentacoes"][1]["origem"] == "despesa"


def test_vendas_nao_entram_nas_movimentacoes(client_db):
    cenario(client_db)
    corpo = client_db.get("/api/v1/movimentacoes", params={"data_inicio": dia(-30).isoformat()}).json()
    assert "Venda antiga" not in [m["descricao"] for m in corpo["movimentacoes"]]
    assert corpo["total_itens"] == 6  # 3 recebíveis + 3 despesas


def test_filtro_por_tipo(client_db):
    cenario(client_db)
    entradas = client_db.get("/api/v1/movimentacoes", params={"tipo": "entrada"}).json()
    assert {m["tipo"] for m in entradas["movimentacoes"]} == {"entrada"}
    assert entradas["total_saidas"] == "0.00"
    saidas = client_db.get("/api/v1/movimentacoes", params={"tipo": "saida"}).json()
    assert {m["tipo"] for m in saidas["movimentacoes"]} == {"saida"}
    assert saidas["total_entradas"] == "0.00"
    assert client_db.get("/api/v1/movimentacoes", params={"tipo": "outro"}).status_code == 422


def test_filtro_por_periodo(client_db):
    cenario(client_db)
    corpo = client_db.get(
        "/api/v1/movimentacoes", params={"data_inicio": dia(3).isoformat(), "data_fim": dia(5).isoformat()}
    ).json()
    assert resumo(corpo) == [(dia(5).isoformat(), "entrada", "Parcela A")]
    assert corpo["total_entradas"] == "1000.00"


def test_periodo_invalido_retorna_422(client_db):
    cenario(client_db)
    resposta = client_db.get(
        "/api/v1/movimentacoes", params={"data_inicio": dia(5).isoformat(), "data_fim": dia(1).isoformat()}
    )
    assert resposta.status_code == 422
    assert "data_fim" in resposta.json()["mensagem"]


def test_paginacao_mantem_totais_do_filtro(client_db):
    cenario(client_db)
    pagina = client_db.get("/api/v1/movimentacoes", params={"limite": 2, "offset": 2}).json()
    assert resumo(pagina) == [
        (dia(5).isoformat(), "entrada", "Parcela A"),
        (dia(10).isoformat(), "saida", "Fornecedor"),
    ]
    assert pagina["total_itens"] == 4
    assert pagina["total_entradas"] == "1500.50"
    assert client_db.get("/api/v1/movimentacoes", params={"limite": 0}).status_code == 422


def test_sem_importacao_retorna_lista_vazia(client_db):
    corpo = client_db.get("/api/v1/movimentacoes").json()
    assert corpo["movimentacoes"] == []
    assert corpo["total_itens"] == 0
    assert corpo["total_entradas"] == "0.00"
    assert corpo["total_saidas"] == "0.00"


def test_endpoints_especificos_de_entradas_e_saidas(client_db):
    cenario(client_db)
    entradas = client_db.get("/api/v1/movimentacoes/entradas").json()
    saidas = client_db.get("/api/v1/movimentacoes/saidas").json()
    assert entradas["movimentacoes"]
    assert all(m["tipo"] == "entrada" for m in entradas["movimentacoes"])
    assert all({"descricao", "data", "valor"}.issubset(m) for m in entradas["movimentacoes"])
    assert saidas["movimentacoes"]
    assert all(m["tipo"] == "saida" for m in saidas["movimentacoes"])


def test_analise_consolida_historico_entradas_saidas_e_saldo_liquido(client_db):
    cenario(client_db)
    resposta = client_db.get("/api/v1/movimentacoes/analise")
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["total_itens"] == 6
    assert corpo["total_entradas"] == "1800.50"
    assert corpo["total_saidas"] == "2050.75"
    assert corpo["saldo_liquido"] == "-250.25"
    assert len(corpo["por_data"]) > 0
    assert [m["data"] for m in corpo["movimentacoes"]] == sorted(
        m["data"] for m in corpo["movimentacoes"]
    )
    assert all("saldo_liquido" in dia for dia in corpo["por_data"])


def test_analise_rejeita_intervalo_invertido(client_db):
    resposta = client_db.get(
        "/api/v1/movimentacoes/analise",
        params={"data_inicio": dia(5).isoformat(), "data_fim": dia(1).isoformat()},
    )
    assert resposta.status_code == 422
