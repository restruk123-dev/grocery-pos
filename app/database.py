import os
from typing import Generator
from sqlmodel import SQLModel, create_engine, Session
from .config import settings

# Ensure target database directory exists if file-based sqlite
if settings.sqlite_file_path:
    parent_dir = os.path.dirname(settings.sqlite_file_path)
    if parent_dir and not os.path.exists(parent_dir):
        try:
            os.makedirs(parent_dir, exist_ok=True)
        except Exception:
            pass

connect_args = {}
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    echo=False,
    connect_args=connect_args
)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    # Safe migration: ensure due_date columns exist if existing DB
    try:
        with engine.begin() as conn:
            for col_stmt in [
                "ALTER TABLE debtor ADD COLUMN due_date VARCHAR(100)",
                "ALTER TABLE debttransaction ADD COLUMN due_date VARCHAR(100)"
            ]:
                try:
                    conn.exec_driver_sql(col_stmt)
                except Exception:
                    pass
    except Exception:
        pass

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
