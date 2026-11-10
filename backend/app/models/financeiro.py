from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

DINHEIRO = Numeric(14, 2)


def _fk_importacao() -> Mapped[int]:
    return mapped_column(ForeignKey("importacoes.id", ondelete="CASCADE"), index=True)


class SaldoInicial(Base):
    __tablename__ = "saldos_iniciais"

    id: Mapped[int] = mapped_column(primary_key=True)
    importacao_id: Mapped[int] = mapped_column(ForeignKey("importacoes.id", ondelete="CASCADE"), unique=True)
    usuario_id: Mapped[int] = mapped_column(index=True)
    data_referencia: Mapped[date] = mapped_column(Date)
    saldo: Mapped[Decimal] = mapped_column(DINHEIRO)


class Venda(Base):
    __tablename__ = "vendas"
    __table_args__ = (CheckConstraint("valor_bruto > 0", name="valor_bruto_positivo"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    importacao_id: Mapped[int] = _fk_importacao()
    usuario_id: Mapped[int] = mapped_column(index=True)
    data: Mapped[date] = mapped_column(Date)
    descricao: Mapped[str] = mapped_column(String(200))
    valor_bruto: Mapped[Decimal] = mapped_column(DINHEIRO)
    tipo: Mapped[str] = mapped_column(String(30))


class Recebivel(Base):
    __tablename__ = "recebiveis"
    __table_args__ = (CheckConstraint("valor_esperado > 0", name="valor_esperado_positivo"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    importacao_id: Mapped[int] = _fk_importacao()
    usuario_id: Mapped[int] = mapped_column(index=True)
    data_prevista: Mapped[date] = mapped_column(Date)
    valor_esperado: Mapped[Decimal] = mapped_column(DINHEIRO)
    descricao: Mapped[str | None] = mapped_column(String(200))


class Despesa(Base):
    __tablename__ = "despesas"
    __table_args__ = (CheckConstraint("valor > 0", name="valor_positivo"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    importacao_id: Mapped[int] = _fk_importacao()
    usuario_id: Mapped[int] = mapped_column(index=True)
    descricao: Mapped[str] = mapped_column(String(200))
    vencimento: Mapped[date] = mapped_column(Date)
    valor: Mapped[Decimal] = mapped_column(DINHEIRO)
