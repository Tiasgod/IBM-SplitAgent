from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DecisaoSimulador(Base):
    __tablename__ = "decisoes_simulador"
    __table_args__ = (Index("ix_decisoes_simulador_usuario_data", "usuario_id", "data_decisao"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    data_decisao: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    recomendacao: Mapped[str] = mapped_column(Text, nullable=False)
    escolha_usuario: Mapped[str] = mapped_column(String(200), nullable=False)
    resultado_projetado: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
