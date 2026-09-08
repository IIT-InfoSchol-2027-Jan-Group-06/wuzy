"""Database engine and session management.

A single shared SQLAlchemy engine backed by the configured Postgres URL.
get_session is a FastAPI dependency that yields one session per request,
so transactions are scoped to a single HTTP call.
"""

from sqlmodel import Session, SQLModel, create_engine

import app.models  # noqa: F401 - imports register every table on SQLModel metadata
from app.core.config import settings

engine = create_engine(settings.database_url)


def get_session():
    """Yield one database session per request. The context manager
    automatically commits or rolls back when the request finishes.
    """
    with Session(engine) as session:
        yield session


def init_db():
    # Create all tables from models. This runs at startup; in production,
    # Alembic migrations handle schema changes instead.
    SQLModel.metadata.create_all(engine)
