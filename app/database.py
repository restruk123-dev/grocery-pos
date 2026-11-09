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
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args
)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
