from typing import Annotated
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.database import get_db
from app.services.acesso_service import usuario_por_token


def get_usuario_atual_id(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> int:
    """Resolve o usuário autenticado; o usuário fixo só funciona em desenvolvimento."""

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        usuario = usuario_por_token(db, token)

        if usuario:
            return usuario.id

        raise HTTPException(
            status_code=401,
            detail="Token inválido, expirado ou revogado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    settings = get_settings()

    if settings.environment.lower() != "production":
        if settings.usuario_dev_id is not None:
            return settings.usuario_dev_id

        raise HTTPException(
            status_code=501,
            detail="Usuário de desenvolvimento não configurado.",
        )

    raise HTTPException(
        status_code=401,
        detail="Autenticação necessária.",
        headers={"WWW-Authenticate": "Bearer"},
    )
