from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.schemas.importacao import (
    ErroSimplesResponse,
    ErroValidacaoResponse,
    ImportacaoCriadaResponse,
    ResumoImportacao,
)
from app.services import importacao_service, planilha_service

router = APIRouter(prefix="/importacoes", tags=["Importação de planilha"])

TIPO_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.get(
    "/modelo",
    summary="Baixa a planilha modelo (.xlsx)",
    response_class=Response,
    responses={200: {"content": {TIPO_XLSX: {}}, "description": "Arquivo modelo"}},
)
def baixar_modelo() -> Response:
    settings = get_settings()
    conteudo = planilha_service.gerar_modelo(settings.importacao_max_linhas, settings.importacao_max_mb)
    return Response(
        content=conteudo,
        media_type=TIPO_XLSX,
        headers={"Content-Disposition": 'attachment; filename="modelo_splitagent.xlsx"'},
    )


@router.post(
    "",
    status_code=201,
    response_model=ImportacaoCriadaResponse,
    summary="Envia a planilha preenchida e importa os dados",
    responses={
        409: {"model": ErroSimplesResponse, "description": "Já existe planilha importada e substituir=false"},
        413: {"model": ErroSimplesResponse, "description": "Arquivo acima do limite de tamanho"},
        415: {"model": ErroSimplesResponse, "description": "Arquivo que não é .xlsx"},
        422: {"model": ErroValidacaoResponse, "description": "Planilha com erros: nada é salvo"},
    },
)
def enviar_planilha(
    arquivo: UploadFile = File(..., description="Planilha .xlsx baseada no modelo"),
    substituir: bool = Query(False, description="Autoriza apagar a importação anterior e trocar pelos novos dados"),
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    limite = get_settings().importacao_max_mb * 1024 * 1024
    conteudo = arquivo.file.read(limite + 1)
    return importacao_service.importar(db, usuario_id, arquivo.filename, conteudo, substituir)


@router.get(
    "/atual",
    response_model=ResumoImportacao,
    summary="Resumo da planilha importada atualmente",
    responses={404: {"model": ErroSimplesResponse, "description": "Nenhuma planilha importada"}},
)
def importacao_atual(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_atual_id),
) -> dict:
    return importacao_service.obter_resumo_atual(db, usuario_id)
