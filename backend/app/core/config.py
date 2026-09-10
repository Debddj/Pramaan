import secrets
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Pramaan Statutory Inspection Engine"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "pramaan-sih26034-production-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    ALGORITHM: str = "HS256"

    # ---------- Database ----------
    DATABASE_URL: str = "postgresql://pramaan:pramaan_dev@localhost:5432/pramaan"
    # Fallback for local dev without Postgres:
    # DATABASE_URL: str = "sqlite:///./pramaan.db"

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ]
    CORS_ORIGIN_REGEX: Optional[str] = r"^https?://(localhost|127\.0\.0\.1|.*\.onrender\.com|.*\.vercel\.app)(:\d+)?$"

    # ---------- Statutory Calibration & Risk ----------
    EAN13_NOMINAL_WIDTH_MM: float = 37.29
    MIN_CONTRAST_RATIO: float = 3.0
    TRIAGE_CONFIDENCE_THRESHOLD: float = 0.85

    # ---------- Storage ----------
    STORAGE_BACKEND: str = "local"   # "local" | "minio" | "gcs"
    UPLOAD_DIR: str = "./data/uploads"
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "pramaan-evidence"

    # ---------- Gemini VLM ----------
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.5-flash"

    # ---------- Observability ----------
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"   # "json" | "console"

    # ---------- Rate Limiting ----------
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_SCAN: str = "30/minute"
    RATE_LIMIT_UPLOAD: str = "10/minute"

    # ---------- Rules Engine ----------
    RULES_ENGINE_VERSION: str = "2.0.0"
    RULES_EFFECTIVE_DATE: str = "2024-01-01"

    # ---------- Database Seeding ----------
    AUTO_SEED_DEMO_DATA: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="allow")


settings = Settings()
