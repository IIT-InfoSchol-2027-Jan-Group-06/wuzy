"""Application configuration.

All settings are loaded from environment variables (or a .env file) via
pydantic-settings. Defaults are safe for local Docker development.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Points to the docker-compose service name 'db' by default. Override
    # via .env when running against a local Postgres instance.
    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/wuzy"
    # Used to sign JWTs. Must be changed before any production deploy.
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    # Short-lived tokens keep the auth flow simple; long sessions are a
    # future concern once refresh tokens are needed.
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
