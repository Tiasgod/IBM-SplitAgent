"""adiciona saldo e movimentacoes financeiras manuais"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
revision: str = "0005"
down_revision: Union[str, Sequence[str], None] = "0004"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("saldos_manuais",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("data_referencia", sa.Date(), nullable=False),
        sa.Column("saldo", sa.Numeric(14, 2), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_saldos_manuais")),
        sa.UniqueConstraint("usuario_id", "data_referencia", name="uq_saldos_manuais_usuario_data"))
    op.create_index(op.f("ix_saldos_manuais_usuario_id"), "saldos_manuais", ["usuario_id"])
    op.create_table("movimentacoes_manuais",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("data", sa.Date(), nullable=False),
        sa.Column("descricao", sa.String(200), nullable=False),
        sa.Column("valor", sa.Numeric(14, 2), nullable=False),
        sa.Column("tipo", sa.String(10), nullable=False),
        sa.Column("categoria", sa.String(80), nullable=True),
        sa.CheckConstraint("valor > 0", name=op.f("ck_movimentacoes_manuais_valor_positivo")),
        sa.CheckConstraint("tipo IN ('entrada', 'saida')", name=op.f("ck_movimentacoes_manuais_tipo_valido")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_movimentacoes_manuais")))
    op.create_index(op.f("ix_movimentacoes_manuais_usuario_id"), "movimentacoes_manuais", ["usuario_id"])
    op.create_index(op.f("ix_movimentacoes_manuais_data"), "movimentacoes_manuais", ["data"])

def downgrade() -> None:
    op.drop_index(op.f("ix_movimentacoes_manuais_data"), table_name="movimentacoes_manuais")
    op.drop_index(op.f("ix_movimentacoes_manuais_usuario_id"), table_name="movimentacoes_manuais")
    op.drop_table("movimentacoes_manuais")
    op.drop_index(op.f("ix_saldos_manuais_usuario_id"), table_name="saldos_manuais")
    op.drop_table("saldos_manuais")
