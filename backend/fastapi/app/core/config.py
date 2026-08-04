from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Reconexao Essencial API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    schema_version: str = "2026-04-02"
    default_timezone: str = "America/Sao_Paulo"
    cors_allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    trusted_hosts: str = "localhost,127.0.0.1"
    firebase_project_id: str | None = None
    firebase_credentials_path: str | None = None
    allow_insecure_dev_auth: bool = False
    dev_auth_token: str = "dev-token"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_allowed_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_allowed_origins.split(",") if item.strip()]

    @property
    def trusted_hosts_list(self) -> list[str]:
        return [item.strip() for item in self.trusted_hosts.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
