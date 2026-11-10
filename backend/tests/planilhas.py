"""Monta planilhas .xlsx de teste (sem depender do modelo gerado pela aplicação)."""
import io
from datetime import date

from openpyxl import Workbook

XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

CABECALHOS = {
    "Saldo inicial": ["Data de referência", "Saldo disponível (R$)"],
    "Vendas": ["Data", "Descrição", "Valor bruto (R$)", "Tipo de venda"],
    "Recebíveis": ["Data prevista", "Valor esperado (R$)", "Descrição"],
    "Despesas": ["Descrição", "Vencimento", "Valor (R$)"],
}


def montar_planilha(
    saldo=(date(2026, 11, 1), 5000),
    vendas=(),
    recebiveis=(),
    despesas=(),
    omitir_abas=(),
    cabecalhos=None,
) -> bytes:
    cabecalhos = {**CABECALHOS, **(cabecalhos or {})}
    wb = Workbook()
    wb.active.title = "Instruções"
    dados = {
        "Saldo inicial": [saldo] if saldo else [],
        "Vendas": vendas,
        "Recebíveis": recebiveis,
        "Despesas": despesas,
    }
    for nome, linhas in dados.items():
        if nome in omitir_abas:
            continue
        aba = wb.create_sheet(nome)
        aba.append(cabecalhos[nome])
        for linha in linhas:
            aba.append(list(linha))
    saida = io.BytesIO()
    wb.save(saida)
    return saida.getvalue()
