"""GroceryStore POS & Accounting - Production Server Launcher
Discovers LAN IP, prints terminal QR code for phone access, and runs uvicorn on 0.0.0.0.
Works locally (default port 8000) and in Hugging Face Spaces Docker container (port 7860).
"""
import io
import os
import sys
import socket
import webbrowser
import threading
import time

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

def get_local_lan_ip() -> str:
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

def print_banner(local_ip: str, port: int):
    url = f"http://{local_ip}:{port}"
    local_url = f"http://localhost:{port}"

    print("=" * 64)
    print("   🛒 GROCERY STORE POS & ACCOUNTING (UZS)   ")
    print("   Oziq-ovqat do'koni avtomatlashtirish tizimi")
    print("=" * 64)
    print(f"[*] Mahalliy kompyuterda ochish:  {local_url}")
    print(f"[*] Telefon / planshetda ochish:   {url}")
    print("-" * 64)
    print("🔑 Kirish ma'lumotlari (Demo):")
    print("   • Xo'jayin (Owner):   login: owner   | parol: owner123")
    print("   • Kassir   (Cashier): login: cashier | parol: cashier123")
    print("-" * 64)

    try:
        import qrcode
        print("\n📱 TELEFON KAMERASINI USHBU QR-KODGA QARATING:")
        print("   (Mobil brauzerda to'g'ridan-to'g'ri ochiladi)\n")
        qr = qrcode.QRCode(border=1)
        qr.add_data(url)
        qr.make(fit=True)
        qr.print_ascii(invert=True)
    except Exception as e:
        print(f"[!] QR-kod terminalda chiqarilmadi ({e}), havolani brauzerda oching: {url}")

    print("\n" + "=" * 64)
    print(f"   Server faol holatda ishlamoqda (0.0.0.0:{port}). To'xtatish: Ctrl+C")
    print("=" * 64 + "\n")

def open_browser_delayed(url: str, delay: float = 1.5):
    time.sleep(delay)
    try:
        webbrowser.open(url)
    except Exception:
        pass

def main():
    import uvicorn

    default_port = 7860 if os.environ.get("SPACE_ID") else 8000
    try:
        port = int(os.environ.get("PORT", str(default_port)))
    except (ValueError, TypeError):
        port = default_port

    lan_ip = get_local_lan_ip()
    print_banner(lan_ip, port)

    # Automatically open local browser in background if not running in cloud space
    if not os.environ.get("SPACE_ID") and os.environ.get("OPEN_BROWSER", "true").lower() in ("true", "1", "yes"):
        threading.Thread(target=open_browser_delayed, args=(f"http://localhost:{port}",), daemon=True).start()

    # Determine import path dynamically
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)

    app_target = "app.main:app"
    try:
        __import__("app.main")
    except ImportError:
        app_target = "projects.grocery_pos.app.main:app"

    # Run Uvicorn on 0.0.0.0:port
    uvicorn.run(
        app_target,
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
