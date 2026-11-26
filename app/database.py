import os
from typing import Generator
from sqlalchemy import event
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

if db_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragmas(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA busy_timeout=5000")
            if db_url != "sqlite:///:memory:":
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute("PRAGMA synchronous=NORMAL")
        except Exception:
            pass
        finally:
            cursor.close()

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
            try:
                with engine.connect() as conn:
                    conn.exec_driver_sql(f"ALTER TABLE {tbl} ADD COLUMN due_date VARCHAR(100)")
                    conn.commit()
            except Exception:
                pass

    # Safe is_quick column migration for product
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("ALTER TABLE product ADD COLUMN IF NOT EXISTS is_quick BOOLEAN DEFAULT FALSE")
            conn.commit()
    except Exception:
        try:
            with engine.connect() as conn:
                conn.exec_driver_sql("ALTER TABLE product ADD COLUMN is_quick BOOLEAN DEFAULT 0")
                conn.commit()
        except Exception:
            pass

    # Safe shift_id & store_id column migrations
    for tbl, col in [("sale", "shift_id"), ("sale", "store_id"), ("cashshift", "store_id")]:
        try:
            with engine.connect() as conn:
                conn.exec_driver_sql(f"ALTER TABLE {tbl} ADD COLUMN IF NOT EXISTS {col} INTEGER")
                conn.commit()
        except Exception:
            try:
                with engine.connect() as conn:
                    conn.exec_driver_sql(f"ALTER TABLE {tbl} ADD COLUMN {col} INTEGER")
                    conn.commit()
            except Exception:
                pass

    # Safe expiry_date, discount_amount & Uzbekistan Soliq/Tax column migrations
    for tbl, col, pg_def, sq_def in [
        ("product", "expiry_date", "VARCHAR(32)", "VARCHAR(32)"),
        ("product", "ikpu_code", "VARCHAR(32)", "VARCHAR(32)"),
        ("product", "package_code", "VARCHAR(32)", "VARCHAR(32)"),
        ("product", "vat_rate", "DOUBLE PRECISION DEFAULT 0", "REAL DEFAULT 0"),
        ("product", "requires_marking", "BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
        ("product", "is_tobacco", "BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
        ("product", "marking_group", "VARCHAR(32) DEFAULT 'NONE'", "VARCHAR(32) DEFAULT 'NONE'"),
        ("sale", "discount_amount", "DOUBLE PRECISION DEFAULT 0", "REAL DEFAULT 0"),
        ("sale", "vat_amount", "DOUBLE PRECISION DEFAULT 0", "REAL DEFAULT 0"),
        ("sale", "fiscal_status", "VARCHAR(32) DEFAULT 'INTERNAL'", "VARCHAR(32) DEFAULT 'INTERNAL'"),
        ("sale", "fiscal_sign", "VARCHAR(128)", "VARCHAR(128)"),
        ("sale", "fiscal_receipt_url", "VARCHAR(512)", "VARCHAR(512)"),
        ("saleitem", "ikpu_code", "VARCHAR(32)", "VARCHAR(32)"),
        ("saleitem", "package_code", "VARCHAR(32)", "VARCHAR(32)"),
        ("saleitem", "vat_rate", "DOUBLE PRECISION DEFAULT 0", "REAL DEFAULT 0"),
        ("saleitem", "vat_amount", "DOUBLE PRECISION DEFAULT 0", "REAL DEFAULT 0"),
        ("saleitem", "marking_code", "VARCHAR(255)", "VARCHAR(255)"),
        ("saleitem", "is_tobacco", "BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0"),
        ("saleitem", "marking_group", "VARCHAR(32) DEFAULT 'NONE'", "VARCHAR(32) DEFAULT 'NONE'"),
        ("storeoutlet", "legal_name", "VARCHAR(255)", "VARCHAR(255)"),
        ("storeoutlet", "inn_stir", "VARCHAR(32)", "VARCHAR(32)"),
        ("storeoutlet", "tax_regime", "VARCHAR(32) DEFAULT 'TURNOVER_1'", "VARCHAR(32) DEFAULT 'TURNOVER_1'"),
        ("storeoutlet", "tax_rate_percent", "DOUBLE PRECISION DEFAULT 1.0", "REAL DEFAULT 1.0"),
        ("storeoutlet", "kkm_serial", "VARCHAR(128)", "VARCHAR(128)"),
        ("storeoutlet", "tobacco_license_note", "VARCHAR(255)", "VARCHAR(255)"),
    ]:
        try:
            with engine.connect() as conn:
                conn.exec_driver_sql(f"ALTER TABLE {tbl} ADD COLUMN IF NOT EXISTS {col} {pg_def}")
                conn.commit()
        except Exception:
            try:
                with engine.connect() as conn:
                    conn.exec_driver_sql(f"ALTER TABLE {tbl} ADD COLUMN {col} {sq_def}")
                    conn.commit()
            except Exception:
                pass

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
