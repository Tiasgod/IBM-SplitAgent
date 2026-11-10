from datetime import date
from decimal import Decimal
from sqlalchemy import CheckConstraint, Date, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class SaldoManual(Base):
    __tablename__ = "saldos_manuais"
    __table_args__ = (UniqueConstraint("usuario_id", "data_referencia", name="uq_saldos_manuais_usuario_data"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(index=True)
    data_referencia: Mapped[date] = mapped_column(Date, nullable=False)
    saldo: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

class MovimentacaoManual(Base):
    __tablename__ = "movimentacoes_manuais"
    __table_args__ = (
        CheckConstraint("valor > 0", name="valor_positivo"),
        CheckConstraint("tipo IN ('entrada', 'saida')", name="tipo_valido"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(index=True)
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    descricao: Mapped[str] = mapped_column(String(200), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    tipo: Mapped[str] = mapped_column(String(10), nullable=False)
    categoria: Mapped[str | None] = mapped_column(String(80))
