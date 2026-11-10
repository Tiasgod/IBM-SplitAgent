from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

from app.core.config import get_settings
from app.models import Base

from dotenv import load_dotenv
load_dotenv()

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = Base.metadata


def _url() -> str:
    # Usa DATABASE_URL_DIRECT (Neon sem pooler) quando existir; senão, DATABASE_URL.
    url = get_settings().sqlalchemy_migration_url
    if not url:
        raise RuntimeError("Defina DATABASE_URL (ou DATABASE_URL_DIRECT) para executar as migrações.")
    return url


def run_migrations_offline() -> None:
    context.configure(
        url=_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    url = _url()
    argumentos = {"connect_args": {"connect_timeout": 15}} if url.startswith("postgresql") else {}
    engine = create_engine(url, poolclass=pool.NullPool, **argumentos)
    with engine.connect() as conexao:
        context.configure(connection=conexao, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
