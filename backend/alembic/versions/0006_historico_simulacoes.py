"""cria histórico de simulações financeiras"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0006"
down_revision: Union[str, Sequence[str], None] = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "simulacoes_historico",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("parametros", sa.JSON(), nullable=False),
        sa.Column("resultado", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE", name=op.f("fk_simulacoes_historico_usuario_id_usuarios")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_simulacoes_historico")),
    )
    op.create_index(op.f("ix_simulacoes_historico_usuario_id"), "simulacoes_historico", ["usuario_id"], unique=False)
    op.create_index("ix_simulacoes_historico_usuario_data", "simulacoes_historico", ["usuario_id", "criado_em"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_simulacoes_historico_usuario_data", table_name="simulacoes_historico")
    op.drop_index(op.f("ix_simulacoes_historico_usuario_id"), table_name="simulacoes_historico")
    op.drop_table("simulacoes_historico")
