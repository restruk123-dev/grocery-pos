import os
import glob
import sqlite3
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select, func

from ..config import settings
from ..database import engine, get_session
from ..auth import decode_access_token
from ..models import User, UserRole, Product, Debtor, Supplier, SupplierInvoice, DebtTransaction, Expense

router = APIRouter(tags=["Backup & Persistence"])
security = HTTPBearer(auto_error=False)

def get_owner_from_auth_or_query(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    token: Optional[str] = Query(None),
    session: Session = Depends(get_session)
) -> User:
    """Authenticates owner either via Authorization header or ?token query param."""
    raw_token = None
    if credentials and credentials.credentials:
        raw_token = credentials.credentials
    elif token:
        raw_token = token

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token. Provide Bearer token or ?token=...",
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
    """Creates a consistent atomic snapshot of the SQLite database using the SQLite backup API."""
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
        # Memory or dynamic engine connection
        raw_conn = engine.raw_connection()
        try:
            driver = getattr(raw_conn, "driver_connection", None) or getattr(raw_conn, "connection", raw_conn)
            dest_conn = sqlite3.connect(backup_filepath)
            try:
                with dest_conn:
                    driver.backup(dest_conn)
            finally:
                dest_conn.close()
        finally:
            raw_conn.close()

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
    cleanup_file(filepath)  # test creation success, client downloads via GET /api/backup

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
        raw_conn = engine.raw_connection()
        try:
            driver = getattr(raw_conn, "driver_connection", None) or getattr(raw_conn, "connection", raw_conn)
            dest_conn = sqlite3.connect(dest_path)
            try:
                with dest_conn:
                    driver.backup(dest_conn)
            finally:
                dest_conn.close()
        finally:
            raw_conn.close()

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

    return {
        "database_url": settings.DATABASE_URL,
        "sqlite_file_path": db_path,
        "is_persistent_storage": settings.is_persistent_storage,
        "storage_mode": "HF Spaces Persistent (/data)" if settings.is_persistent_storage else "Local / Ephemeral",
        "size_bytes": size_bytes,
        "size_human": f"{round(size_bytes / 1024, 1)} KB" if size_bytes < 1024 * 1024 else f"{round(size_bytes / (1024 * 1024), 2)} MB",
        "statistics": {
            "products_count": session.exec(select(func.count(Product.id))).one(),
            "debtors_count": session.exec(select(func.count(Debtor.id))).one(),
            "suppliers_count": session.exec(select(func.count(Supplier.id))).one(),
            "invoices_count": session.exec(select(func.count(SupplierInvoice.id))).one(),
            "debt_transactions_count": session.exec(select(func.count(DebtTransaction.id))).one(),
            "expenses_count": session.exec(select(func.count(Expense.id))).one(),
        },
        "backup_download_url": "/api/backup",
        "auto_dump_url": "/api/backup/dump"
    }
