import io
import os
import socket
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlmodel import Session

import qrcode
import qrcode.image.svg

from .config import settings
from .database import init_db, engine
from .seed import seed_database
from .routers import auth, products, pos, debts, suppliers, expenses, analytics, backup, ai, inventory

def get_current_port() -> int:
    """Returns runtime port from environment, defaulting to 7860 on Spaces or 8000 locally."""
    default_port = 7860 if os.environ.get("SPACE_ID") else 8000
    try:
        return int(os.environ.get("PORT", str(default_port)))
    except (ValueError, TypeError):
        return default_port

def get_local_lan_ip() -> str:
    """Discovers the LAN IP address of the machine (e.g. 192.168.x.x / 10.x.x.x)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        try:
            ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            ip = "127.0.0.1"
    finally:
        s.close()
    return ip

def generate_svg_qr(url: str) -> str:
    """Generates an SVG QR code string for the given URL without requiring PIL."""
    qr = qrcode.QRCode(box_size=10, border=2, image_factory=qrcode.image.svg.SvgImage)
    qr.add_data(url)
    qr.make(fit=True)
    svg_img = qr.make_image()
    buf = io.BytesIO()
    svg_img.save(buf)
    return buf.getvalue().decode("utf-8")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and seed initial catalog
    init_db()
    if settings.AUTO_SEED_CATALOG:
        with Session(engine) as session:
            seed_database(session, target_sku_count=2000)
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(products.router, prefix=api_prefix)
app.include_router(pos.router, prefix=api_prefix)
app.include_router(debts.router, prefix=api_prefix)
app.include_router(suppliers.router, prefix=api_prefix)
app.include_router(expenses.router, prefix=api_prefix)
app.include_router(inventory.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)

# Backup endpoints: both /api/backup and /api/v1/backup
app.include_router(backup.router, prefix="/api/backup")
app.include_router(backup.router, prefix=f"{api_prefix}/backup")

# Network Info & Mobile QR Code Endpoints
@app.get("/api/network-info")
def get_network_info():
    local_ip = get_local_lan_ip()
    port = get_current_port()
    mobile_url = f"http://{local_ip}:{port}"
    try:
        svg_qr = generate_svg_qr(mobile_url)
    except Exception:
        svg_qr = None
    return {
        "local_ip": local_ip,
        "port": port,
        "mobile_url": mobile_url,
        "local_url": f"http://localhost:{port}",
        "svg_qr": svg_qr
    }

@app.get("/qr.svg", include_in_schema=False)
def get_qr_svg():
    local_ip = get_local_lan_ip()
    port = get_current_port()
    mobile_url = f"http://{local_ip}:{port}"
    svg_qr = generate_svg_qr(mobile_url)
    return Response(content=svg_qr, media_type="image/svg+xml")

# Static files & SPA PWA serving
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/manifest.json", include_in_schema=False)
    async def get_manifest():
        return FileResponse(os.path.join(static_dir, "manifest.json"), media_type="application/manifest+json")

    @app.get("/sw.js", include_in_schema=False)
    async def get_sw():
        return FileResponse(os.path.join(static_dir, "sw.js"), media_type="application/javascript")

    @app.get("/", include_in_schema=False)
    async def serve_index():
        return FileResponse(os.path.join(static_dir, "index.html"))

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "currency": "UZS (so'm)",
        "languages": ["uz", "ru"],
        "persistent_storage": settings.is_persistent_storage
    }
