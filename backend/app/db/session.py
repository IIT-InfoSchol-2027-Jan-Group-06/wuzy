from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings
import app.models  # Import models so tables get registered

engine = create_engine(settings.database_url)


def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    # Create all tables from models (auto on app startup)
    SQLModel.metadata.create_all(engine)
