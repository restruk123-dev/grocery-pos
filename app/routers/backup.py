import os
import glob
import sqlite3
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select, func, SQLModel, create_engine as create_sqlmodel_engine

from ..config import settings
from ..database import engine, get_session
from ..auth import decode_access_token
from ..models import (
    SystemSetting, User, UserRole, Category, Product, Debtor,
    Supplier, SupplierInvoice, SupplierInvoiceItem, DebtTransaction,
    Sale, SaleItem, Expense
)

router = APIRouter(tags=["Backup & Persistence"])
security = HTTPBearer(auto_error=False)

def get_owner_from_auth_or_query(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Requires a bearer header; credentials in URLs leak through history and logs."""
    raw_token = credentials.credentials if credentials else None

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token. Provide an Authorization: Bearer header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(raw_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = session.exec(select(User).where(User.username == username)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User inactive or not found"
        )

    if user.role != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Only store owner can export or backup the database"
        )

    return user

def create_sqlite_backup_file() -> tuple[str, str, int]:
    """Creates a consistent atomic snapshot of the database as a portable SQLite database.
    Works natively on both SQLite and PostgreSQL without crashing or external tools."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"grocery_pos_backup_{timestamp}.db"
    temp_dir = tempfile.gettempdir()
    backup_filepath = os.path.join(temp_dir, backup_filename)

    db_path = settings.sqlite_file_path
    if db_path and os.path.exists(db_path):
        source_conn = sqlite3.connect(db_path)
        dest_conn = sqlite3.connect(backup_filepath)
        try:
            with dest_conn:
                source_conn.backup(dest_conn)
        finally:
            dest_conn.close()
            source_conn.close()
    else:
        # PostgreSQL or dynamic engine: export all tables to a clean, portable SQLite database
        sqlite_eng = create_sqlmodel_engine(f"sqlite:///{backup_filepath.replace(os.sep, '/')}")
        SQLModel.metadata.create_all(sqlite_eng)
        all_models = [
            SystemSetting, User, Category, Product, Debtor,
            DebtTransaction, Sale, SaleItem, Supplier,
            SupplierInvoice, SupplierInvoiceItem, Expense
        ]
        with Session(engine) as src_session, Session(sqlite_eng) as dst_session:
            for model in all_models:
                try:
                    rows = src_session.exec(select(model)).all()
                    for row in rows:
                        data = row.model_dump()
                        dst_session.add(model(**data))
                    dst_session.commit()
                except Exception:
                    src_session.rollback()
                    dst_session.rollback()
        sqlite_eng.dispose()

    file_size = os.path.getsize(backup_filepath)
    return backup_filepath, backup_filename, file_size

def resolve_backups_dir() -> str:
    """Determines target directory for persistent on-disk auto-dumps."""
    if os.path.exists("/data") and os.access("/data", os.W_OK):
        backups_dir = "/data/backups"
    else:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        backups_dir = os.path.join(base_dir, "backups")
    os.makedirs(backups_dir, exist_ok=True)
    return backups_dir

def rotate_backups(backups_dir: str, keep_count: int = 10) -> None:
    """Keeps the latest N backups in the backups directory."""
    try:
        files = glob.glob(os.path.join(backups_dir, "grocery_pos_dump_*.db"))
        files.sort(key=os.path.getmtime, reverse=True)
        for old_file in files[keep_count:]:
            try:
                os.remove(old_file)
            except Exception:
                pass
    except Exception:
        pass

def cleanup_file(filepath: str) -> None:
    """Background task to remove temporary backup file after download."""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception:
        pass

@router.get("", summary="Download database backup (SQLite)")
@router.get("/download", summary="Download database backup (SQLite) alias")
def download_backup(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_owner_from_auth_or_query)
):
    """Generates an atomic SQLite snapshot and downloads it directly to owner's device."""
    backup_filepath, backup_filename, file_size = create_sqlite_backup_file()
    background_tasks.add_task(cleanup_file, backup_filepath)

    return FileResponse(
        path=backup_filepath,
        filename=backup_filename,
        media_type="application/x-sqlite3",
        headers={
            "Content-Disposition": f'attachment; filename="{backup_filename}"',
            "Content-Length": str(file_size)
        }
    )

@router.post("/export", summary="Export database snapshot with metadata")
def export_backup(
    current_user: User = Depends(get_owner_from_auth_or_query)
):
    """Triggers an export and returns metadata and download URL."""
    filepath, filename, size = create_sqlite_backup_file()
    cleanup_file(filepath)

    return {
        "status": "ok",
        "message": "SQLite database snapshot ready for download",
        "filename": filename,
        "size_bytes": size,
        "download_url": "/api/backup",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/dump", summary="Create on-disk dump in persistent storage")
def dump_to_disk(
    current_user: User = Depends(get_owner_from_auth_or_query)
):
    """Creates a permanent dump in /data/backups/ (retains last 10 dumps)."""
    backups_dir = resolve_backups_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dump_filename = f"grocery_pos_dump_{timestamp}.db"
    dest_path = os.path.join(backups_dir, dump_filename)

    db_path = settings.sqlite_file_path
    if db_path and os.path.exists(db_path):
        source_conn = sqlite3.connect(db_path)
        dest_conn = sqlite3.connect(dest_path)
        try:
            with dest_conn:
                source_conn.backup(dest_conn)
        finally:
            dest_conn.close()
            source_conn.close()
    else:
        sqlite_eng = create_sqlmodel_engine(f"sqlite:///{dest_path.replace(os.sep, '/')}")
        SQLModel.metadata.create_all(sqlite_eng)
        all_models = [
            SystemSetting, User, Category, Product, Debtor,
            DebtTransaction, Sale, SaleItem, Supplier,
            SupplierInvoice, SupplierInvoiceItem, Expense
        ]
        with Session(engine) as src_session, Session(sqlite_eng) as dst_session:
            for model in all_models:
                try:
                    rows = src_session.exec(select(model)).all()
                    for row in rows:
                        data = row.model_dump()
                        dst_session.add(model(**data))
                    dst_session.commit()
                except Exception:
                    src_session.rollback()
                    dst_session.rollback()
        sqlite_eng.dispose()

    rotate_backups(backups_dir, keep_count=10)
    file_size = os.path.getsize(dest_path)

    return {
        "status": "ok",
        "message": "Persistent database dump created",
        "path": dest_path,
        "filename": dump_filename,
        "size_bytes": file_size,
        "backups_dir": backups_dir,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/info", summary="Get database storage & health info")
def get_backup_info(
    current_user: User = Depends(get_owner_from_auth_or_query),
    session: Session = Depends(get_session)
):
    """Returns database size, persistent storage status, and row statistics."""
    db_path = settings.sqlite_file_path
    size_bytes = os.path.getsize(db_path) if db_path and os.path.exists(db_path) else 0

    mode = "PostgreSQL (Render)" if not db_path else ("Persistent (/data)" if settings.is_persistent_storage else "Local SQLite")
    
    def safe_count(model):
        try:
            return session.exec(select(func.count(model.id))).one()
        except Exception:
            return 0

    return {
        "database_url": "postgresql://***" if "postgres" in settings.DATABASE_URL else settings.DATABASE_URL,
        "sqlite_file_path": db_path,
        "is_persistent_storage": settings.is_persistent_storage,
        "storage_mode": mode,
        "size_bytes": size_bytes,
        "size_human": f"{round(size_bytes / 1024, 1)} KB" if size_bytes < 1024 * 1024 else f"{round(size_bytes / (1024 * 1024), 2)} MB",
        "statistics": {
            "products_count": safe_count(Product),
            "debtors_count": safe_count(Debtor),
            "suppliers_count": safe_count(Supplier),
            "invoices_count": safe_count(SupplierInvoice),
            "debt_transactions_count": safe_count(DebtTransaction),
            "expenses_count": safe_count(Expense),
        },
        "backup_download_url": "/api/backup",
        "auto_dump_url": "/api/backup/dump"
    }
