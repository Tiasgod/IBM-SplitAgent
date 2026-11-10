"""adiciona cadastro, sessões e recuperação de senha"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, Sequence[str], None] = "0001"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("usuarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(120), nullable=False),
        sa.Column("documento", sa.String(14), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("senha_hash", sa.String(255), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_usuarios")),
        sa.UniqueConstraint("documento", name=op.f("uq_usuarios_documento")),
        sa.UniqueConstraint("email", name=op.f("uq_usuarios_email")),
    )
    op.create_index(op.f("ix_usuarios_documento"), "usuarios", ["documento"], unique=True)
    op.create_index(op.f("ix_usuarios_email"), "usuarios", ["email"], unique=True)
    op.create_table("sessoes_usuario",
        sa.Column("id", sa.Integer(), nullable=False), sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False), sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revogada", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("criada_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE", name=op.f("fk_sessoes_usuario_usuario_id_usuarios")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sessoes_usuario")), sa.UniqueConstraint("token_hash", name=op.f("uq_sessoes_usuario_token_hash")))
    op.create_index(op.f("ix_sessoes_usuario_usuario_id"), "sessoes_usuario", ["usuario_id"])
    op.create_index(op.f("ix_sessoes_usuario_token_hash"), "sessoes_usuario", ["token_hash"], unique=True)
    op.create_table("tokens_recuperacao",
        sa.Column("id", sa.Integer(), nullable=False), sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False), sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.Column("usado", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE", name=op.f("fk_tokens_recuperacao_usuario_id_usuarios")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tokens_recuperacao")), sa.UniqueConstraint("token_hash", name=op.f("uq_tokens_recuperacao_token_hash")))
    op.create_index(op.f("ix_tokens_recuperacao_usuario_id"), "tokens_recuperacao", ["usuario_id"])
    op.create_index(op.f("ix_tokens_recuperacao_token_hash"), "tokens_recuperacao", ["token_hash"], unique=True)

def downgrade() -> None:
    op.drop_index(op.f("ix_tokens_recuperacao_token_hash"), table_name="tokens_recuperacao")
    op.drop_index(op.f("ix_tokens_recuperacao_usuario_id"), table_name="tokens_recuperacao")
    op.drop_table("tokens_recuperacao")
    op.drop_index(op.f("ix_sessoes_usuario_token_hash"), table_name="sessoes_usuario")
    op.drop_index(op.f("ix_sessoes_usuario_usuario_id"), table_name="sessoes_usuario")
    op.drop_table("sessoes_usuario")
    op.drop_index(op.f("ix_usuarios_email"), table_name="usuarios")
    op.drop_index(op.f("ix_usuarios_documento"), table_name="usuarios")
    op.drop_table("usuarios")
