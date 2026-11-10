"""Permite contas Google sem documento/senha local e armazena o identificador Google."""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, Sequence[str], None] = "0002"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.alter_column("usuarios", "documento", existing_type=sa.String(length=14), nullable=True)
    op.alter_column("usuarios", "senha_hash", existing_type=sa.String(length=255), nullable=True)
    op.add_column("usuarios", sa.Column("google_sub", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_usuarios_google_sub"), "usuarios", ["google_sub"], unique=True)

def downgrade() -> None:
    op.drop_index(op.f("ix_usuarios_google_sub"), table_name="usuarios")
    op.drop_column("usuarios", "google_sub")
    # Reverter para NOT NULL exige que contas Google sem documento/senha sejam tratadas antes.
    op.alter_column("usuarios", "senha_hash", existing_type=sa.String(length=255), nullable=False)
    op.alter_column("usuarios", "documento", existing_type=sa.String(length=14), nullable=False)
