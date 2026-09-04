from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pramaan Statutory Inspection Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "pramaan-sih26034-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    ALGORITHM: str = "HS256"

    DATABASE_URL: str = "sqlite:///./pramaan.db"
    CORS_ORIGINS: List[str] = ["*"]

    # Statutory Calibration & Risk Constants
    EAN13_NOMINAL_WIDTH_MM: float = 37.29
    MIN_CONTRAST_RATIO: float = 3.0
    TRIAGE_CONFIDENCE_THRESHOLD: float = 0.85

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
