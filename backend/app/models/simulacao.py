from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class SimulacaoHistorico(Base):
    __tablename__ = "simulacoes_historico"
    __table_args__ = (Index("ix_simulacoes_historico_usuario_data", "usuario_id", "criado_em"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    parametros: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    resultado: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
