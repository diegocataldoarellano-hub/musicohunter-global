from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Music Hunter API"
    database_url: str = "sqlite:///./music_hunter.db"
    cors_origins: str = "*"
    admin_token: str | None = None
    open_model_base_url: str | None = None
    open_model_api_key: str | None = None
    open_model_name: str = "mistralai/Mistral-7B-Instruct-v0.3"
    google_search_api_key: str | None = None
    google_search_engine_id: str | None = None
    discovery_country_limit: int = 67
    discovery_queries_per_country: int = 4
    discovery_results_per_query: int = 5
    curator_max_pages: int = 40
    request_timeout_seconds: float = 12.0

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
