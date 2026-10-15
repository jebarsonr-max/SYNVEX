import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "SYNVEX"
    SECRET_KEY: str = "synvex-super-secure-production-ready-jwt-secret-key-32chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./synvex.db"
    MAX_UPLOAD_SIZE_MB: int = 25
    TEMP_UPLOAD_DIR: str = "./uploads"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
