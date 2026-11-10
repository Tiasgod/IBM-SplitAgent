from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Importacao(Base):
    """Cada planilha enviada pelo usuário. Só a mais recente fica ativa por usuário."""

    __tablename__ = "importacoes"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Ainda sem chave estrangeira: a tabela de usuários virá com o card B02.
    usuario_id: Mapped[int] = mapped_column(index=True)
    nome_arquivo: Mapped[str] = mapped_column(String(255))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    total_vendas: Mapped[int]
    total_recebiveis: Mapped[int]
    total_despesas: Mapped[int]
