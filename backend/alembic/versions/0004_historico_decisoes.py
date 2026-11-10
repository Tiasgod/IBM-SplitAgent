"""adiciona histórico de decisões do simulador"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004"
down_revision: Union[str, Sequence[str], None] = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "decisoes_simulador",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("data_decisao", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("recomendacao", sa.Text(), nullable=False),
        sa.Column("escolha_usuario", sa.String(length=200), nullable=False),
        sa.Column("resultado_projetado", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE", name=op.f("fk_decisoes_simulador_usuario_id_usuarios")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_decisoes_simulador")),
    )
    op.create_index(op.f("ix_decisoes_simulador_usuario_id"), "decisoes_simulador", ["usuario_id"], unique=False)
    op.create_index("ix_decisoes_simulador_usuario_data", "decisoes_simulador", ["usuario_id", "data_decisao"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_decisoes_simulador_usuario_data", table_name="decisoes_simulador")
    op.drop_index(op.f("ix_decisoes_simulador_usuario_id"), table_name="decisoes_simulador")
    op.drop_table("decisoes_simulador")
