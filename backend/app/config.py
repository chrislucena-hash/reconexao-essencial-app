from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    frontend_origins: str = "http://localhost:3000"
    firestore_database_id: str = "ai-studio-0a1cfe0f-6450-46ad-8e17-b4f70d5c2672"
    firebase_service_account_json: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
