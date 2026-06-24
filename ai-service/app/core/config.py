from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    env: str = "development"
    host: str = "0.0.0.0"
    port: int = 8001
    api_prefix: str = "/"

    # Gemini (Google AI)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-lite-latest"
    gemini_fallback_models: str = "gemini-2.5-flash,gemini-flash-latest"

    # API Security
    api_key: str = "evalvision_default_secret_key"

    # Shared
    llm_max_tokens: int = 2048

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
