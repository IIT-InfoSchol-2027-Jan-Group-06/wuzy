from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Default points to docker-compose service name 'db'
    # Override via .env for local development
    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/wuzy"
    # Secret for JWT signing - MUST change in production
    secret_key: str = "dev-secret-key"
    # Algorithm for JWT encoding
    algorithm: str = "HS256"
    # Token expiry in minutes
    access_token_expire_minutes: int = 30

    class Config:
        # Load from .env file for local dev
        env_file = ".env"


settings = Settings()
