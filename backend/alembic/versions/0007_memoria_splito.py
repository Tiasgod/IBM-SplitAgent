"""adiciona memoria persistente do assistente Splito"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0007"
down_revision: Union[str, Sequence[str], None] = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "conversas_assistente",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("titulo", sa.String(length=120), nullable=False, server_default="Nova conversa"),
        sa.Column("criada_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("atualizada_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_conversas_assistente")),
    )
    op.create_index(op.f("ix_conversas_assistente_usuario_id"), "conversas_assistente", ["usuario_id"], unique=False)
    op.create_index("ix_conversas_assistente_usuario_atualizada", "conversas_assistente", ["usuario_id", "atualizada_em"], unique=False)

    op.create_table(
        "mensagens_assistente",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversa_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("criada_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["conversa_id"], ["conversas_assistente.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_mensagens_assistente")),
    )
    op.create_index(op.f("ix_mensagens_assistente_conversa_id"), "mensagens_assistente", ["conversa_id"], unique=False)
    op.create_index("ix_mensagens_assistente_conversa_data", "mensagens_assistente", ["conversa_id", "criada_em"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_mensagens_assistente_conversa_data", table_name="mensagens_assistente")
    op.drop_index(op.f("ix_mensagens_assistente_conversa_id"), table_name="mensagens_assistente")
    op.drop_table("mensagens_assistente")
    op.drop_index("ix_conversas_assistente_usuario_atualizada", table_name="conversas_assistente")
    op.drop_index(op.f("ix_conversas_assistente_usuario_id"), table_name="conversas_assistente")
    op.drop_table("conversas_assistente")
