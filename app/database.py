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
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"create_all notice: {e}")

    # Safe column migration: separate connections so failure in one never aborts others
    for tbl in ["debtor", "debttransaction"]:
        try:
            with engine.connect() as conn:
                # PostgreSQL supports IF NOT EXISTS natively
                conn.exec_driver_sql(f"ALTER TABLE {tbl} ADD COLUMN IF NOT EXISTS due_date VARCHAR(100)")
                conn.commit()
        except Exception:
            # Fallback for SQLite or engines without IF NOT EXISTS
            try:
                with engine.connect() as conn:
                    conn.exec_driver_sql(f"ALTER TABLE {tbl} ADD COLUMN due_date VARCHAR(100)")
                    conn.commit()
            except Exception:
                pass

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
