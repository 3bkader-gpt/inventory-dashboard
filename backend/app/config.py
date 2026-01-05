"""Application configuration using pydantic-settings."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # Database (PostgreSQL for production, SQLite for local dev)
    database_url: str = "postgresql+asyncpg://inventory_user:inventory_secret_password@localhost:5432/inventory_db"
    redis_url: str = "redis://localhost:6379/0"
    
    # JWT Configuration
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # First Admin (created on startup if no users exist)
    first_admin_email: str = "admin@example.com"
    first_admin_password: str = "admin123"
    
    # AI / LLM Configuration
    gemini_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
