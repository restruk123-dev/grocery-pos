"""Interactive, first-run owner setup for a local GroceryStore POS install."""
import getpass
import os
import re
import sys

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
if not os.environ.get("SPACE_ID") and not os.environ.get("DATABASE_URL") and not os.environ.get("DATA_DIR"):
    os.environ["DATA_DIR"] = os.path.join(PROJECT_DIR, "store_data")

from sqlmodel import Session, select
from app.auth import hash_password
from app.database import engine, init_db
from app.models import User, UserRole


def ensure_initial_owner() -> bool:
    """Create an owner only on a database with zero users; never reset or erase data."""
    init_db()
    with Session(engine) as session:
        existing = session.exec(select(User.id).limit(1)).first()
        if existing is not None:
            print("Mavjud do'kon ma'lumotlari topildi; hech narsa o'zgartirilmadi.")
            return False

        print("\nBirinchi sozlash: do'kon egasining hisobini yarating.")
        print("Parol kamida 12 belgidan bo'lsin. Parol terminalda ko'rsatilmaydi.\n")
        while True:
            username = input("Egasi uchun login: ").strip()
            if re.fullmatch(r"[a-zA-Z0-9_.-]{3,64}", username):
                break
            print("Login 3–64 belgi bo'lsin: lotin harflari, raqam, nuqta, chiziqcha yoki pastki chiziq.")

        full_name = input("Egasi ismi (chekda ko'rinadi): ").strip()
        if not full_name:
            full_name = username

        while True:
            password = getpass.getpass("Kuchli parol: ")
            if len(password) < 12:
                print("Parol kamida 12 belgidan iborat bo'lishi kerak.")
                continue
            confirm = getpass.getpass("Parolni qayta kiriting: ")
            if password != confirm:
                print("Parollar mos kelmadi.")
                continue
            break

        session.add(User(
            username=username,
            full_name=full_name[:150],
            role=UserRole.OWNER,
            hashed_password=hash_password(password),
            is_active=True,
        ))
        session.commit()
        print("Egasi hisobi yaratildi. Endi dasturga shu login va parol bilan kiring.\n")
        return True


if __name__ == "__main__":
    try:
        ensure_initial_owner()
    except KeyboardInterrupt:
        print("\nBirinchi sozlash bekor qilindi; ma'lumotlar o'zgartirilmadi.")
        sys.exit(1)
