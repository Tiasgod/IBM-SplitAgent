from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ErroDeDominio(Exception):
    """Erro previsto pelas regras do sistema. Vira uma resposta HTTP padronizada."""

    status_code = 400

    def __init__(self, mensagem: str, erros: list[dict] | None = None, status_code: int | None = None):
        super().__init__(mensagem)
        self.mensagem = mensagem
        self.erros = erros or []
        if status_code is not None:
            self.status_code = status_code


class ArquivoInvalidoError(ErroDeDominio):
    status_code = 415


class PlanilhaInvalidaError(ErroDeDominio):
    status_code = 422

    def __init__(self, mensagem: str, erros: list[dict], truncado: bool = False):
        super().__init__(mensagem, erros)
        self.truncado = truncado


class ImportacaoExistenteError(ErroDeDominio):
    status_code = 409


class NaoEncontradoError(ErroDeDominio):
    status_code = 404


class RequisicaoInvalidaError(ErroDeDominio):
    status_code = 422


def registrar_handlers(app: FastAPI) -> None:
    @app.exception_handler(ErroDeDominio)
    async def _tratar_erro_de_dominio(_: Request, erro: ErroDeDominio) -> JSONResponse:
        corpo = {"mensagem": erro.mensagem, "erros": erro.erros}
        if isinstance(erro, PlanilhaInvalidaError):
            corpo["total_erros"] = len(erro.erros)
            corpo["erros_truncados"] = erro.truncado
        return JSONResponse(status_code=erro.status_code, content=corpo)
