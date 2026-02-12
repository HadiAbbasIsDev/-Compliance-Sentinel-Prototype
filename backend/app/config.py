import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "Compliance Sentinel - Pakistan"
    API_V1_STR: str = "/api/v1"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "openai/gpt-4o")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    VECTOR_STORE_PATH: str = os.getenv("VECTOR_STORE_PATH", "app/data/vector_store")
    
    # Pakistan Specific Configs
    PAKISTAN_REQUIREMENTS_PATH: str = "app/data/pakistan_requirements.json"
    PAKISTAN_SCORING_PATH: str = "app/data/pakistan_scoring.json"

    class Config:
        env_file = ".env"

settings = Settings()
