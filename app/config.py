import os
from pydantic import BaseModel

DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "grocery_pos.db")

def resolve_database_url() -> str:
    """Resolves database URL with priority:
    1. Explicit DATABASE_URL environment variable (fixing postgres:// to postgresql://)
    2. HF Spaces Persistent Storage (/data) if directory exists and is writable
    3. DATA_DIR environment variable
    4. Default local repository grocery_pos.db
    """
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        if env_url.startswith("postgres://"):
            env_url = env_url.replace("postgres://", "postgresql://", 1)
        return env_url

    # Check Hugging Face Spaces Persistent Storage mount (/data)
    if os.path.exists("/data") and os.access("/data", os.W_OK):
        return "sqlite:////data/grocery_pos.db"

    data_dir = os.getenv("DATA_DIR")
    if data_dir:
        try:
            os.makedirs(data_dir, exist_ok=True)
            norm = os.path.join(data_dir, "grocery_pos.db").replace(os.sep, "/")
            return f"sqlite:///{norm}"
        except Exception:
            pass

    return f"sqlite:///{DEFAULT_DB_PATH.replace(os.sep, '/')}"

class Settings(BaseModel):
    PROJECT_NAME: str = "GroceryStore POS & Accounting"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = resolve_database_url()
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "grocery-pos-super-secret-production-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Default initial accounts
    DEFAULT_OWNER_USERNAME: str = os.getenv("DEFAULT_OWNER_USERNAME", "owner")
    DEFAULT_OWNER_PASSWORD: str = os.getenv("DEFAULT_OWNER_PASSWORD", "owner123")
    DEFAULT_CASHIER_USERNAME: str = os.getenv("DEFAULT_CASHIER_USERNAME", "cashier")
    DEFAULT_CASHIER_PASSWORD: str = os.getenv("DEFAULT_CASHIER_PASSWORD", "cashier123")
    
    # Seed options
    AUTO_SEED_CATALOG: bool = os.getenv("AUTO_SEED_CATALOG", "true").lower() in ("true", "1", "yes")

    @property
    def is_persistent_storage(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite:////data")

    @property
    def sqlite_file_path(self) -> str | None:
        if not self.DATABASE_URL.startswith("sqlite:///"):
            return None
        raw = self.DATABASE_URL[len("sqlite:///"):]
        if raw == ":memory:":
            return None
        if raw.startswith("/"):
            return raw
        return os.path.abspath(raw)

settings = Settings()
