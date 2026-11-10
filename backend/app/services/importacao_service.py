import os
import re

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.erros import ArquivoInvalidoError, ImportacaoExistenteError, NaoEncontradoError
from app.repositories import importacao_repository as repo
from app.services import planilha_service


def _nome_seguro(nome: str | None) -> str:
    base = os.path.basename((nome or "planilha.xlsx").replace("\\", "/"))
    base = re.sub(r"[\x00-\x1f\x7f]", "", base).strip() or "planilha.xlsx"
    return base[:255]


def validar_arquivo(nome: str | None, conteudo: bytes, max_bytes: int) -> None:
    if not nome or not nome.lower().endswith(".xlsx"):
        raise ArquivoInvalidoError("Envie um arquivo Excel no formato .xlsx (baixe o modelo na plataforma).")
    if len(conteudo) > max_bytes:
        raise ArquivoInvalidoError(
            f"Arquivo maior que o limite de {max_bytes // (1024 * 1024)} MB.", status_code=413
        )
    if not conteudo.startswith(b"PK"):  # .xlsx é um arquivo zip
        raise ArquivoInvalidoError("O arquivo não parece ser uma planilha .xlsx válida.")


def montar_resumo(db: Session, importacao) -> dict:
    saldo = repo.obter_saldo(db, importacao.id)
    return {
        "importacao_id": importacao.id,
        "nome_arquivo": importacao.nome_arquivo,
        "importado_em": importacao.criado_em,
        "saldo_inicial": {"data_referencia": saldo.data_referencia, "saldo": saldo.saldo},
        "total_vendas": importacao.total_vendas,
        "total_recebiveis": importacao.total_recebiveis,
        "total_despesas": importacao.total_despesas,
    }


def importar(db: Session, usuario_id: int, nome_arquivo: str | None, conteudo: bytes, substituir: bool) -> dict:
    settings = get_settings()
    validar_arquivo(nome_arquivo, conteudo, settings.importacao_max_mb * 1024 * 1024)

    atual = repo.obter_atual(db, usuario_id)
    if atual is not None and not substituir:
        raise ImportacaoExistenteError(
            "Já existe uma planilha importada. Para trocar os dados pela nova versão, envie novamente "
            "confirmando a substituição (substituir=true)."
        )

    dados = planilha_service.ler_planilha(conteudo, settings.importacao_max_linhas)

    try:
        if atual is not None:
            repo.remover_dados_do_usuario(db, usuario_id)
        nova = repo.criar(db, usuario_id, _nome_seguro(nome_arquivo), dados)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(nova)

    resumo = montar_resumo(db, nova)
    resumo["substituiu_dados_anteriores"] = atual is not None
    return resumo


def obter_resumo_atual(db: Session, usuario_id: int) -> dict:
    atual = repo.obter_atual(db, usuario_id)
    if atual is None:
        raise NaoEncontradoError("Nenhuma planilha foi importada ainda.")
    return montar_resumo(db, atual)
