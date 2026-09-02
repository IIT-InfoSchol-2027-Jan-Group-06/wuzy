from sqlmodel import Session, SQLModel, create_engine

import app.models  # noqa: F401 - registers tables for SQLModel metadata
from app.core.config import settings

engine = create_engine(settings.database_url)


def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    # Create all tables from models (auto on app startup)
    SQLModel.metadata.create_all(engine)
