import logging
import smtplib
from email.message import EmailMessage
from typing import Annotated
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.seguranca import get_usuario_atual_id
from app.core.config import get_settings
from app.models.usuario import Usuario
from app.schemas.acesso import AtualizarUsuarioRequest, CadastroRequest, LoginRequest, GoogleLoginRequest, UsuarioResponse, TokenResponse, RecuperacaoRequest, RedefinirSenhaRequest
from app.services import acesso_service as service

router = APIRouter(prefix="/acesso", tags=["Acesso e conta"])
logger = logging.getLogger(__name__)

@router.post("/cadastro", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def cadastrar(dados: CadastroRequest, db: Session = Depends(get_db)):
    try:
        usuario = service.cadastrar(db, dados)
        return service.criar_sessao(db, usuario)
    except service.AcessoErro as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.mensagem) from exc



@router.get("/me", response_model=UsuarioResponse, summary="Consultar a própria conta")
def consultar_conta(usuario_id: int = Depends(get_usuario_atual_id), db: Session = Depends(get_db)):
    try:
        return service.obter_usuario(db, usuario_id)
    except service.AcessoErro as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.mensagem) from exc


@router.put("/me", response_model=UsuarioResponse, summary="Atualizar a própria conta")
def atualizar_conta(dados: AtualizarUsuarioRequest, usuario_id: int = Depends(get_usuario_atual_id), db: Session = Depends(get_db)):
    try:
        return service.atualizar_usuario(db, usuario_id, dados)
    except service.AcessoErro as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.mensagem) from exc


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT, summary="Desativar a própria conta")
def excluir_conta(usuario_id: int = Depends(get_usuario_atual_id), db: Session = Depends(get_db)):
    try:
        service.excluir_usuario(db, usuario_id)
    except service.AcessoErro as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.mensagem) from exc


@router.post("/login", response_model=TokenResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    try:
        return service.login(db, dados.identificador, dados.senha)
    except service.AcessoErro as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.mensagem) from exc

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(authorization: Annotated[str | None, Header()] = None, db: Session = Depends(get_db)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Autenticação necessária.")
    service.logout(db, authorization.split(" ", 1)[1].strip())

@router.post("/recuperar-senha")
def recuperar(dados: RecuperacaoRequest, db: Session = Depends(get_db)):
    token = service.solicitar_recuperacao(db, str(dados.email))
    settings = get_settings()
    resposta = {"mensagem": "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha."}
    if token and settings.environment.lower() == "production":
        if not all([settings.smtp_host, settings.smtp_from]):
            logger.error("SMTP não configurado: recuperação de senha indisponível em produção.")
            raise HTTPException(status_code=503, detail="Serviço de recuperação temporariamente indisponível.")
        mensagem = EmailMessage()
        mensagem["Subject"] = "Redefinição de senha - SplitAgent"
        mensagem["From"] = settings.smtp_from
        mensagem["To"] = str(dados.email)
        link = f"{settings.frontend_reset_url}?token={token}"
        mensagem.set_content(f"Recebemos uma solicitação para redefinir sua senha do SplitAgent.\n\nAcesse este link em até 30 minutos e use-o uma única vez: {link}\n\nSe você não solicitou a redefinição, ignore esta mensagem.")
        try:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as servidor:
                servidor.starttls()
                if settings.smtp_user and settings.smtp_password:
                    servidor.login(settings.smtp_user, settings.smtp_password)
                servidor.send_message(mensagem)
        except Exception as exc:
            logger.exception("Falha ao enviar e-mail de recuperação")
            raise HTTPException(status_code=503, detail="Não foi possível enviar o e-mail de recuperação.") from exc
    elif token:
        # Token só é exposto em desenvolvimento para permitir testar o fluxo local.
        resposta["token_desenvolvimento"] = token
    return resposta

@router.post("/redefinir-senha")
def redefinir(dados: RedefinirSenhaRequest, db: Session = Depends(get_db)):
    try:
        service.redefinir_senha(db, dados.token, dados.nova_senha)
    except service.AcessoErro as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.mensagem) from exc
    return {"mensagem": "Senha redefinida com sucesso. Faça login novamente."}


@router.post("/google", response_model=TokenResponse)
def login_google(dados: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Recebe o ID token do front-end e valida sua assinatura/audiência com o Google."""
    settings = get_settings()
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Login Google não está configurado.")
    try:
        from google.auth.transport import requests as google_requests
        from google.oauth2 import id_token
        claims = id_token.verify_oauth2_token(
            dados.credential, google_requests.Request(), settings.google_client_id
        )
    except ImportError as exc:
        logger.exception("Dependência google-auth ausente")
        raise HTTPException(status_code=503, detail="Login Google indisponível.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Credencial Google inválida ou expirada.") from exc
    try:
        return service.login_google(db, claims)
    except service.AcessoErro as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.mensagem) from exc
