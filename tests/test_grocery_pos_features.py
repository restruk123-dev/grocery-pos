import os
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine, select
from sqlmodel.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["AUTO_SEED"] = "false"

from app.main import app
from app.database import get_session
from app.models import User, UserRole, Product, Debtor, Expense, ExpenseCategory
from app.auth import hash_password, create_access_token

client = TestClient(app)

@pytest.fixture(name="session", autouse=True)
def session_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        def get_session_override():
            return session
        app.dependency_overrides[get_session] = get_session_override

        # Seed admin and cashiers
        owner = User(
            username="owner",
            full_name="Alisher Usmonov",
            role=UserRole.OWNER,
            hashed_password=hash_password("owner123")
        )
        cashier1 = User(
            username="cashier_aziza",
            full_name="Aziza Karimova (1-smena)",
            role=UserRole.CASHIER,
            hashed_password=hash_password("cashier123")
        )
        product = Product(
            name="Test Non",
            barcode="4780009999999",
            sale_price=4000.0,
            purchase_price=3000.0,
            stock_quantity=50.0,
            unit="dona",
            is_quick=True
        )
        scale_product = Product(
            name="Olma Qizil (Tarozi)",
            barcode="2100123",
            sale_price=15000.0,
            purchase_price=10000.0,
            stock_quantity=100.0,
            unit="kg"
        )
        debtor = Debtor(
            full_name="Bobur Mirzo",
            phone="+998901234567",
            balance=0.0,
            due_date="2026-11-20"
        )
        session.add(owner)
        session.add(cashier1)
        session.add(product)
        session.add(scale_product)
        session.add(debtor)
        session.commit()
        session.refresh(owner)
        session.refresh(product)
        session.refresh(scale_product)
        session.refresh(debtor)

        yield session

    app.dependency_overrides.clear()


def test_auth_and_cashier_switch(session):
    assert client.get("/api/v1/auth/cashiers").status_code == 401
    assert client.post("/api/v1/auth/switch-cashier", json={"cashier_id": 1, "password": "cashier123"}).status_code == 401

    # Login as cashier via /token
    res = client.post("/api/v1/auth/token", json={"username": "cashier_aziza", "password": "cashier123"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get active cashiers list
    c_res = client.get("/api/v1/auth/cashiers", headers=headers)
    assert c_res.status_code == 200
    cashiers = c_res.json()
    assert len(cashiers) >= 1

    # Switching requires both a valid session and the selected cashier's password.
    wrong = client.post("/api/v1/auth/switch-cashier", json={"cashier_id": cashiers[0]["id"], "password": "wrong-password"}, headers=headers)
    assert wrong.status_code == 401
    sw_res = client.post("/api/v1/auth/switch-cashier", json={"cashier_id": cashiers[0]["id"], "password": "cashier123"}, headers=headers)
    assert sw_res.status_code == 200
    assert "access_token" in sw_res.json()


def test_owner_can_rotate_password(session):
    token = client.post("/api/v1/auth/token", json={"username": "owner", "password": "owner123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    changed = client.post("/api/v1/auth/change-password", json={
        "current_password": "owner123",
        "new_password": "NewStorePassword-2026!"
    }, headers=headers)
    assert changed.status_code == 204
    assert client.post("/api/v1/auth/token", json={"username": "owner", "password": "owner123"}).status_code == 401
    assert client.post("/api/v1/auth/token", json={"username": "owner", "password": "NewStorePassword-2026!"}).status_code == 200


def test_only_owner_can_create_cashiers(session):
    cashier_token = client.post("/api/v1/auth/token", json={
        "username": "cashier_aziza", "password": "cashier123"
    }).json()["access_token"]
    cashier_headers = {"Authorization": f"Bearer {cashier_token}"}
    payload = {"username": "new_cashier", "full_name": "New Cashier", "password": "A-Strong-Password-2026!"}
    assert client.post("/api/v1/auth/cashiers", json=payload, headers=cashier_headers).status_code == 403

    owner_token = client.post("/api/v1/auth/token", json={
        "username": "owner", "password": "owner123"
    }).json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    assert client.post("/api/v1/auth/cashiers", json={**payload, "password": "short"}, headers=owner_headers).status_code == 422
    created = client.post("/api/v1/auth/cashiers", json=payload, headers=owner_headers)
    assert created.status_code == 201
    assert created.json()["username"] == "new_cashier"


def test_weight_barcode_parser(session):
    # Barcode prefix 21, PLU 00123, weight 1250g (1.25kg), checksum digit 3
    # 2100123012503 -> matches Product.barcode == '2100123'
    owner_token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {owner_token}"}

    res = client.get("/api/v1/products/barcode/2100123012503", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Olma Qizil (Tarozi)"
    assert data["detected_weight"] == 1.25


def test_checkout_persists_sale_and_updates_stock(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    prod = session.exec(select(Product).where(Product.barcode == "4780009999999")).first()
    init_stock = prod.stock_quantity

    checkout_payload = {
        "items": [{"product_id": prod.id, "quantity": 2.0}],
        "payment_method": "CASH",
        "cash_received": 8000.0
    }
    res = client.post("/api/v1/pos/checkout", json=checkout_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_amount"] == 8000.0
    assert data["payment_method"] == "CASH"

    # Verify stock decremented
    session.refresh(prod)
    assert prod.stock_quantity == init_stock - 2.0

    # Verify analytics reflect the sale
    an_res = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert an_res.status_code == 200
    an_data = an_res.json()
    assert an_data["revenue"] == 8000.0


def test_debt_checkout_and_due_date(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    debtor = session.exec(select(Debtor)).first()
    prod = session.exec(select(Product)).first()

    checkout_payload = {
        "items": [{"product_id": prod.id, "quantity": 1.0}],
        "payment_method": "DEBT",
        "debtor_id": debtor.id,
        "due_date": "2026-11-25"
    }
    res = client.post("/api/v1/pos/checkout", json=checkout_payload, headers=headers)
    assert res.status_code == 200
    session.refresh(debtor)
    assert debtor.balance == prod.sale_price
    assert debtor.due_date == "2026-11-25"


def test_clear_catalog_and_reseed(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # Clear catalog
    clr_res = client.post("/api/v1/products/clear-catalog", headers=headers, json={"confirmation": "DELETE ALL STORE DATA", "current_password": "owner123"})
    assert clr_res.status_code == 200

    # Products count should be 0
    p_res = client.get("/api/v1/products", headers=headers)
    assert p_res.status_code == 200
    assert len(p_res.json()["items"]) == 0

    # Reseed catalog
    reseed_res = client.post("/api/v1/products/reseed-catalog?target_count=50", headers=headers)
    assert reseed_res.status_code == 200
    p_res2 = client.get("/api/v1/products", headers=headers)
    assert len(p_res2.json()["items"]) > 0


def test_ai_store_assistant(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # Voice debt parsing
    voice_res = client.post(
        "/api/v1/ai/parse-debt-voice",
        json={"speech_text": "Alisher aka 50 ming so'm nonga oldi, dushanba beradi"},
        headers=headers
    )
    assert voice_res.status_code == 200
    v_data = voice_res.json()
    assert "Alisher" in v_data["debtor_name"]
    assert v_data["amount"] == 50000.0
    assert "dushanba" in (v_data.get("due_date_label") or "").lower() or v_data.get("due_date") is not None

    # Smart store assistant natural query
    ai_res = client.post(
        "/api/v1/ai/assistant",
        json={"query": "Bugun qancha savdo bo'ldi?"},
        headers=headers
    )
    assert ai_res.status_code == 200
    assert "savdo" in ai_res.json()["answer"].lower() or "tushum" in ai_res.json()["answer"].lower()

    # Smart store assistant numbered menu "1"
    ai_num1 = client.post(
        "/api/v1/ai/assistant",
        json={"query": "1"},
        headers=headers
    )
    assert ai_num1.status_code == 200
    assert "kunlik savdo" in ai_num1.json()["answer"].lower() or "tushum" in ai_num1.json()["answer"].lower()


def test_transliteration_and_quick_products(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # Search Latin "Test Non" with Cyrillic "тест" or "нон"
    res_cyr = client.get("/api/v1/products?search=нон", headers=headers)
    assert res_cyr.status_code == 200
    items = res_cyr.json()["items"]
    assert len(items) >= 1
    assert any("non" in it["name"].lower() for it in items)

    # Search with "буханка" (synonym maps to non/buxanka)
    res_syn = client.get("/api/v1/products?search=буханка", headers=headers)
    assert res_syn.status_code == 200

    # Quick products endpoint
    quick_res = client.get("/api/v1/products/quick", headers=headers)
    assert quick_res.status_code == 200
    quick_items = quick_res.json()
    assert len(quick_items) >= 1
    assert quick_items[0]["is_quick"] is True


def test_expense_delete(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # Create expense
    exp_res = client.post(
        "/api/v1/expenses",
        json={
            "category": "UTILITIES",
            "amount": 25000.0,
            "description": "Elektr energiyasi to'lovi"
        },
        headers=headers
    )
    assert exp_res.status_code == 200
    exp_id = exp_res.json()["id"]

    # Delete expense
    del_res = client.delete(f"/api/v1/expenses/{exp_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "ok"

    # Verify not found
    del_again = client.delete(f"/api/v1/expenses/{exp_id}", headers=headers)
    assert del_again.status_code == 404


def test_voice_command_actions(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Open scanner
    res_sc = client.post(
        "/api/v1/ai/voice-command",
        json={"speech_text": "Skanerni och", "language": "uz"},
        headers=headers
    )
    assert res_sc.status_code == 200
    assert res_sc.json()["action"] == "open_scanner"
    assert "ochildi" in res_sc.json()["voice_text"].lower()

    # 2. Add to cart
    res_cart = client.post(
        "/api/v1/ai/voice-command",
        json={"speech_text": "Savatga 2 ta non qo'sh", "language": "uz"},
        headers=headers
    )
    assert res_cart.status_code == 200
    assert res_cart.json()["action"] == "add_to_cart"
    assert res_cart.json()["data"]["quantity"] == 2.0
    assert "non" in res_cart.json()["data"]["product"]["name"].lower()

    # 3. Calculate finances / profit
    res_fin = client.post(
        "/api/v1/ai/voice-command",
        json={"speech_text": "Bugungi foyda va marja qancha?", "language": "uz"},
        headers=headers
    )
    assert res_fin.status_code == 200
    assert res_fin.json()["action"] == "calculate_finances"
    assert "profit" in res_fin.json()["data"]

    # 4. Debt voice command
    res_debt = client.post(
        "/api/v1/ai/voice-command",
        json={"speech_text": "Bobur Mirzoga 30 ming qarz yoz", "language": "uz"},
        headers=headers
    )
    assert res_debt.status_code == 200
    assert res_debt.json()["action"] == "open_debt"
    assert res_debt.json()["data"]["amount"] == 30000.0


def test_scan_image_barcode(session):
    import io, qrcode
    qr = qrcode.make('4780009999999')
    buf = io.BytesIO()
    qr.save(buf, format='PNG')
    buf.seek(0)

    token = create_access_token({"sub": "cashier_aziza", "role": "cashier"})
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post(
        '/api/v1/pos/scan-image',
        headers=headers,
        files={'file': ('test_qr.png', buf.getvalue(), 'image/png')}
    )
    assert res.status_code == 200
    data = res.json()
    assert data['success'] is True
    assert data['barcode'] == '4780009999999'
    assert data['product'] is not None
    assert data['product']['name'] == 'Test Non'


def test_day_details_and_custom_date_analytics(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    from datetime import date
    today_str = date.today().isoformat()

    # Query day-details
    res = client.get(f"/api/v1/analytics/day-details?date_str={today_str}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "revenue" in data
    assert "sales_count" in data
    assert "cogs" in data
    assert "net_profit" in data
    assert "sales" in data

    # Query custom date dashboard
    res_dash = client.get(f"/api/v1/analytics/dashboard?period=custom&date={today_str}", headers=headers)
    assert res_dash.status_code == 200
    dash_data = res_dash.json()
    assert "revenue" in dash_data
    assert "daily_breakdown" in dash_data


def test_supplier_reconciliation_and_autocreate_product(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a supplier
    res_sup = client.post(
        "/api/v1/suppliers",
        json={"name": "Sut Mahsulotlari MCHJ", "phone": "+998901234567"},
        headers=headers
    )
    assert res_sup.status_code == 200
    supplier_id = res_sup.json()["id"]

    # 2. Create invoice with missing product name -> auto creates product!
    res_inv = client.post(
        "/api/v1/suppliers/invoices",
        json={
            "supplier_id": supplier_id,
            "items": [
                {"product_name": "Qaymoq 200g", "quantity": 15, "purchase_price": 12000}
            ],
            "paid_amount": 50000
        },
        headers=headers
    )
    assert res_inv.status_code == 200
    inv_data = res_inv.json()
    assert inv_data["total_amount"] == 15 * 12000
    assert inv_data["debt_to_supplier"] == (15 * 12000) - 50000

    # 3. Check reconciliation endpoint
    res_rec = client.get(f"/api/v1/suppliers/{supplier_id}/reconciliation", headers=headers)
    assert res_rec.status_code == 200
    rec_data = res_rec.json()
    assert rec_data["supplier"]["id"] == supplier_id
    assert rec_data["summary"]["total_invoiced"] == 180000
    assert rec_data["summary"]["total_paid"] == 50000
    assert rec_data["summary"]["current_debt"] == 130000
    assert len(rec_data["invoices"]) >= 1
