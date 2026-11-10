from datetime import datetime, timedelta, timezone
from hashlib import sha256
import secrets

from pwdlib import PasswordHash
from sqlalchemy import or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.usuario import Usuario, SessaoUsuario, TokenRecuperacao
from app.schemas.acesso import AtualizarUsuarioRequest, CadastroRequest, normalizar_documento

password_hash = PasswordHash.recommended()
DURACAO_SESSAO_HORAS = 12
DURACAO_RECUPERACAO_MINUTOS = 30

class AcessoErro(Exception):
    def __init__(self, mensagem: str, status_code: int = 400):
        super().__init__(mensagem)
        self.mensagem = mensagem
        self.status_code = status_code

def hash_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()

def cadastrar(db: Session, dados: CadastroRequest) -> Usuario:
    email = str(dados.email).strip().lower()
    documento = normalizar_documento(dados.documento)
    if db.scalar(select(Usuario.id).where(Usuario.email == email)):
        raise AcessoErro("Este e-mail já está cadastrado.", 409)
    if db.scalar(select(Usuario.id).where(Usuario.documento == documento)):
        raise AcessoErro("Este CPF/CNPJ já está cadastrado.", 409)
    usuario = Usuario(nome=dados.nome, documento=documento, email=email, senha_hash=password_hash.hash(dados.senha))
    db.add(usuario)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AcessoErro("E-mail ou CPF/CNPJ já cadastrado.", 409)
    db.refresh(usuario)
    return usuario

def criar_sessao(db: Session, usuario: Usuario) -> dict:
    token = secrets.token_urlsafe(48)
    expira = datetime.now(timezone.utc) + timedelta(hours=DURACAO_SESSAO_HORAS)
    db.add(SessaoUsuario(usuario_id=usuario.id, token_hash=hash_token(token), expira_em=expira, revogada=False))
    db.commit()
    return {"access_token": token, "token_type": "bearer", "expires_in": DURACAO_SESSAO_HORAS * 3600, "usuario": usuario}

def login(db: Session, identificador: str, senha: str) -> dict:
    valor = identificador.strip().lower()
    if "@" in valor:
        criterio = Usuario.email == valor
    else:
        documento = normalizar_documento(valor)
        criterio = Usuario.documento == documento
    usuario = db.scalar(select(Usuario).where(criterio, Usuario.ativo.is_(True)))
    if not usuario or not usuario.senha_hash or not password_hash.verify(senha, usuario.senha_hash):
        raise AcessoErro("Credenciais inválidas.", 401)
    return criar_sessao(db, usuario)

def usuario_por_token(db: Session, token: str) -> Usuario | None:
    sessao = db.scalar(select(SessaoUsuario).where(SessaoUsuario.token_hash == hash_token(token), SessaoUsuario.revogada.is_(False)))
    if not sessao:
        return None
    expira = sessao.expira_em
    if expira.tzinfo is None:
        expira = expira.replace(tzinfo=timezone.utc)
    if expira <= datetime.now(timezone.utc):
        sessao.revogada = True
        db.commit()
        return None
    usuario = db.get(Usuario, sessao.usuario_id)
    return usuario if usuario and usuario.ativo else None

def logout(db: Session, token: str) -> None:
    db.execute(update(SessaoUsuario).where(SessaoUsuario.token_hash == hash_token(token)).values(revogada=True))
    db.commit()

def solicitar_recuperacao(db: Session, email: str) -> str | None:
    usuario = db.scalar(select(Usuario).where(Usuario.email == str(email).strip().lower(), Usuario.ativo.is_(True)))
    if not usuario:
        return None
    token = secrets.token_urlsafe(32)
    expira = datetime.now(timezone.utc) + timedelta(minutes=DURACAO_RECUPERACAO_MINUTOS)
    db.add(TokenRecuperacao(usuario_id=usuario.id, token_hash=hash_token(token), expira_em=expira, usado=False))
    db.commit()
    return token

def redefinir_senha(db: Session, token: str, nova_senha: str) -> None:
    registro = db.scalar(select(TokenRecuperacao).where(TokenRecuperacao.token_hash == hash_token(token), TokenRecuperacao.usado.is_(False)))
    if not registro:
        raise AcessoErro("Token de recuperação inválido ou expirado.", 400)
    expira = registro.expira_em
    if expira.tzinfo is None:
        expira = expira.replace(tzinfo=timezone.utc)
    if expira <= datetime.now(timezone.utc):
        raise AcessoErro("Token de recuperação inválido ou expirado.", 400)
    usuario = db.get(Usuario, registro.usuario_id)
    if not usuario:
        raise AcessoErro("Token de recuperação inválido ou expirado.", 400)
    usuario.senha_hash = password_hash.hash(nova_senha)
    registro.usado = True
    db.execute(update(SessaoUsuario).where(SessaoUsuario.usuario_id == usuario.id).values(revogada=True))
    db.commit()


def login_google(db: Session, claims: dict) -> dict:
    """Cria ou autentica conta Google somente após validação externa do ID token."""
    email = str(claims.get("email", "")).strip().lower()
    google_sub = str(claims.get("sub", "")).strip()
    nome = str(claims.get("name", "Usuário Google")).strip()[:120] or "Usuário Google"
    if not email or not google_sub or claims.get("email_verified") is not True:
        raise AcessoErro("A conta Google precisa ter e-mail verificado.", 401)

    usuario = db.scalar(select(Usuario).where(or_(Usuario.google_sub == google_sub, Usuario.email == email)))
    if usuario:
        if not usuario.ativo:
            raise AcessoErro("Conta desativada.", 403)
        # Vincular uma conta existente pelo e-mail só é seguro após validação do token
        # e confirmação email_verified feita pelo Google. Não sobrescreve outro Google sub.
        if usuario.google_sub and usuario.google_sub != google_sub:
            raise AcessoErro("Este e-mail está vinculado a outra conta Google.", 409)
        if not usuario.google_sub:
            usuario.google_sub = google_sub
            db.commit()
            db.refresh(usuario)
    else:
        usuario = Usuario(nome=nome, documento=None, email=email, senha_hash=None, google_sub=google_sub)
        db.add(usuario)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise AcessoErro("Não foi possível criar a conta Google. Tente novamente.", 409)
        db.refresh(usuario)
    return criar_sessao(db, usuario)


def obter_usuario(db: Session, usuario_id: int) -> Usuario:
    usuario = db.get(Usuario, usuario_id)
    if not usuario or not usuario.ativo:
        raise AcessoErro("Conta não encontrada ou desativada.", 404)
    return usuario

def atualizar_usuario(db: Session, usuario_id: int, dados: AtualizarUsuarioRequest) -> Usuario:
    usuario = obter_usuario(db, usuario_id)
    alteracoes = dados.model_dump(exclude_unset=True)
    if not alteracoes:
        raise AcessoErro("Informe pelo menos um campo para atualizar.", 422)

    if "email" in alteracoes and alteracoes["email"] is not None:
        email = str(alteracoes["email"]).strip().lower()
        existente = db.scalar(select(Usuario.id).where(Usuario.email == email, Usuario.id != usuario_id))
        if existente:
            raise AcessoErro("Este e-mail já está cadastrado.", 409)
        alteracoes["email"] = email

    if "documento" in alteracoes and alteracoes["documento"] is not None:
        documento = normalizar_documento(alteracoes["documento"])
        existente = db.scalar(select(Usuario.id).where(Usuario.documento == documento, Usuario.id != usuario_id))
        if existente:
            raise AcessoErro("Este CPF/CNPJ já está cadastrado.", 409)
        alteracoes["documento"] = documento

    for campo, valor in alteracoes.items():
        if valor is not None:
            setattr(usuario, campo, valor)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AcessoErro("E-mail ou CPF/CNPJ já cadastrado.", 409)
    db.refresh(usuario)
    return usuario

def excluir_usuario(db: Session, usuario_id: int) -> None:
    usuario = obter_usuario(db, usuario_id)
    usuario.ativo = False
    db.execute(update(SessaoUsuario).where(SessaoUsuario.usuario_id == usuario_id).values(revogada=True))
    db.execute(update(TokenRecuperacao).where(TokenRecuperacao.usuario_id == usuario_id).values(usado=True))
    db.commit()
