from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class SaldoInicialOut(BaseModel):
    data_referencia: date
    saldo: Decimal


class ResumoImportacao(BaseModel):
    importacao_id: int
    nome_arquivo: str
    importado_em: datetime
    saldo_inicial: SaldoInicialOut
    total_vendas: int
    total_recebiveis: int
    total_despesas: int


class ImportacaoCriadaResponse(ResumoImportacao):
    substituiu_dados_anteriores: bool


class ErroImportacao(BaseModel):
    aba: str
    linha: int | None = None
    coluna: str | None = None
    mensagem: str


class ErroValidacaoResponse(BaseModel):
    mensagem: str
    erros: list[ErroImportacao]
    total_erros: int
    erros_truncados: bool


class ErroSimplesResponse(BaseModel):
    mensagem: str
    erros: list[ErroImportacao] = []
