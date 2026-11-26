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


def test_inventory_act_and_stock_movements(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create an inventory act
    res_act = client.post(
        "/api/v1/inventory/act",
        json={"name": "Oylik inventarizatsiya - Mart", "description": "Do'kon to'liq qayta sanash"},
        headers=headers
    )
    assert res_act.status_code == 200
    act_data = res_act.json()
    act_id = act_data["id"]
    assert act_data["total_products"] >= 1
    assert act_data["status"] == "IN_PROGRESS"

    # Find a product
    prod = session.exec(select(Product).where(Product.is_active == True)).first()
    assert prod is not None
    original_stock = prod.stock_quantity

    # 2. Scan item with surplus count (+5)
    new_counted = original_stock + 5.0
    res_scan = client.post(
        f"/api/v1/inventory/act/{act_id}/scan",
        json={"product_id": prod.id, "actual_quantity": new_counted, "note": "Ortiqcha 5 ta topildi"},
        headers=headers
    )
    assert res_scan.status_code == 200
    scan_data = res_scan.json()
    assert scan_data["diff"] == 5.0
    assert scan_data["is_surplus"] is True

    # 3. Apply the act
    res_apply = client.post(f"/api/v1/inventory/act/{act_id}/apply", headers=headers)
    assert res_apply.status_code == 200
    assert res_apply.json()["adjusted_products_count"] >= 1

    # 4. Verify product stock is updated
    session.refresh(prod)
    assert prod.stock_quantity == new_counted

    # 5. Verify StockMovement was recorded
    res_mov = client.get(f"/api/v1/inventory/movements?product_id={prod.id}", headers=headers)
    assert res_mov.status_code == 200
    mov_data = res_mov.json()
    assert mov_data["total"] >= 1
    latest_mov = mov_data["items"][0]
    assert latest_mov["movement_type"] == "REVISION_ADJUSTMENT"
    assert latest_mov["quantity_delta"] == 5.0
    assert latest_mov["new_stock"] == new_counted


def test_cash_shifts_and_refunds_and_scale_barcodes(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Open a cash shift with 100 000 so'm initial drawer cash
    res_open = client.post(
        "/api/v1/pos/shift/open",
        json={"initial_cash": 100000.0, "note": "Ertalabki smena (Dada)"},
        headers=headers
    )
    assert res_open.status_code == 200
    shift_data = res_open.json()
    assert shift_data["initial_cash"] == 100000.0
    assert shift_data["success"] is True

    # 2. Check current shift status
    res_cur = client.get("/api/v1/pos/shift/current", headers=headers)
    assert res_cur.status_code == 200
    assert res_cur.json()["is_open"] is True
    assert res_cur.json()["shift"]["expected_cash"] == 100000.0

    # 3. Cash In action: add 50 000 so'm for change
    res_cin = client.post(
        "/api/v1/pos/shift/cash-action",
        json={"action_type": "CASH_IN", "amount": 50000.0, "reason": "Mayda pul qo'shildi"},
        headers=headers
    )
    assert res_cin.status_code == 200
    assert res_cin.json()["expected_cash"] == 150000.0

    # 4. Scale barcode checkout: product code 2100123 with weight 1.500 kg (1500 grams) -> barcode 2100123015004
    scale_prod = session.exec(select(Product).where(Product.barcode == "2100123")).first()
    assert scale_prod is not None
    orig_scale_stock = scale_prod.stock_quantity

    res_sale = client.post(
        "/api/v1/pos/checkout",
        json={
            "items": [{"barcode": "2100123015004", "quantity": 1.0}],
            "payment_method": "CASH",
            "cash_received": 50000.0
        },
        headers=headers
    )
    assert res_sale.status_code == 200
    sale_data = res_sale.json()
    receipt_num = sale_data["receipt_number"]
    assert sale_data["items"][0]["quantity"] == 1.5
    assert sale_data["total_amount"] == round(scale_prod.sale_price * 1.5, 2)

    # Verify inventory decremented by 1.5 kg
    session.refresh(scale_prod)
    assert scale_prod.stock_quantity == round(orig_scale_stock - 1.5, 3)

    # 5. Look up receipt details
    res_rcpt = client.get(f"/api/v1/pos/receipt/{receipt_num}", headers=headers)
    assert res_rcpt.status_code == 200
    rcpt_data = res_rcpt.json()
    assert rcpt_data["receipt_number"] == receipt_num
    assert rcpt_data["items"][0]["refundable_quantity"] == 1.5

    # 6. Refund partial item: return 0.5 kg
    res_ref = client.post(
        "/api/v1/pos/refund",
        json={
            "receipt_number": receipt_num,
            "items": [{"product_id": scale_prod.id, "quantity": 0.5}],
            "reason": "Mijozga ko'plik qildi"
        },
        headers=headers
    )
    assert res_ref.status_code == 200
    ref_data = res_ref.json()
    assert ref_data["success"] is True
    assert ref_data["cash_refunded"] == round(scale_prod.sale_price * 0.5, 2)

    # Verify inventory was restored by 0.5 kg
    session.refresh(scale_prod)
    assert scale_prod.stock_quantity == round(orig_scale_stock - 1.0, 3)

    # 7. Close shift with actual cash count
    res_close = client.post(
        "/api/v1/pos/shift/close",
        json={"actual_cash": 160000.0, "note": "Kechki smena yakuni"},
        headers=headers
    )
    assert res_close.status_code == 200
    close_data = res_close.json()
    assert close_data["status"] == "CLOSED"
    assert "difference" in close_data
    assert close_data["refunds_count"] >= 1


def test_enhanced_voice_debt_parser_and_multi_store(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Voice debt with phone number & relative deadline (3 kundan keyin)
    res1 = client.post(
        "/api/v1/ai/parse-debt-voice",
        json={"speech_text": "Valisher aka +998 90 123 45 67 30 ming qarz oldi 3 kundan keyin", "language": "uz"},
        headers=headers
    )
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["transaction_type"] == "DEBT_INCREASE"
    assert d1["phone"] == "+998901234567"
    assert d1["amount"] == 30000.0
    assert d1["due_date"] is not None

    # 2. Voice payment intent detection ("to'ladi")
    res2 = client.post(
        "/api/v1/ai/parse-debt-voice",
        json={"speech_text": "Alisher aka 50 ming qarz to'ladi", "language": "uz"},
        headers=headers
    )
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["transaction_type"] == "DEBT_PAYMENT"
    assert d2["amount"] == 50000.0

    # 3. Item price estimation from catalog ("2 ta non" -> Test Non 4000 * 2 = 8000)
    res3 = client.post(
        "/api/v1/ai/parse-debt-voice",
        json={"speech_text": "Sardor 2 ta non qarzga oldi", "language": "uz"},
        headers=headers
    )
    assert res3.status_code == 200
    d3 = res3.json()
    assert d3["amount"] == 8000.0

    # 4. Multi-store / Tobacco outlet readiness
    res_st = client.post(
        "/api/v1/pos/stores",
        json={"name": "Tobacco House #1", "store_type": "tobacco", "address": "Chilonzor 5"},
        headers=headers
    )
    assert res_st.status_code == 200
    assert res_st.json()["store_type"] == "tobacco"

    res_list = client.get("/api/v1/pos/stores", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1


def test_offline_assets_served(session):
    res_html = client.get("/")
    assert res_html.status_code == 200
    assert "cdn.tailwindcss.com" not in res_html.text
    assert "/static/app.css" in res_html.text
    assert "/static/vendor/tesseract.min.js" in res_html.text

    res_css = client.get("/static/app.css")
    assert res_css.status_code == 200
    assert len(res_css.content) > 5000


def test_expiry_discount_receipts_and_telegram_status(session):
    from datetime import date, timedelta
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Product with expiry date within 3 days
    soon_date = (date.today() + timedelta(days=3)).isoformat()
    res_p = client.post(
        "/api/v1/products",
        json={
            "barcode": "4780005551112",
            "name": "Kefir 500ml",
            "purchase_price": 6000,
            "sale_price": 8000,
            "stock_quantity": 20,
            "expiry_date": soon_date,
        },
        headers=headers,
    )
    assert res_p.status_code == 200
    created_p = res_p.json()
    assert created_p["expiry_date"] == soon_date
    assert created_p["is_expiring_soon"] is True
    assert created_p["name"] == "Kefir 500ml"

    # Filter expiring_soon_only
    res_exp = client.get("/api/v1/products?expiring_soon_only=true", headers=headers)
    assert res_exp.status_code == 200
    assert any(it["barcode"] == "4780005551112" for it in res_exp.json()["items"])

    # 2. Checkout with discount_amount
    res_chk = client.post(
        "/api/v1/pos/checkout",
        json={
            "items": [{"product_id": created_p["id"], "quantity": 2}],
            "payment_method": "CASH",
            "discount_amount": 1000,
            "cash_received": 15000,
        },
        headers=headers,
    )
    assert res_chk.status_code == 200
    chk = res_chk.json()
    assert chk["gross_total"] == 16000.0
    assert chk["discount_amount"] == 1000.0
    assert chk["total_amount"] == 15000.0

    # 3. Recent receipts listing endpoint
    res_rcpts = client.get("/api/v1/pos/receipts?limit=10", headers=headers)
    assert res_rcpts.status_code == 200
    rcpts = res_rcpts.json()
    assert any(r["receipt_number"] == chk["receipt_number"] and r["discount_amount"] == 1000.0 for r in rcpts)

    # 4. Telegram status endpoint (safe masked response)
    res_tg = client.get("/api/v1/telegram/status", headers=headers)
    assert res_tg.status_code == 200
    assert "configured" in res_tg.json()


def test_ensure_categories_and_purge_demo_data(session):
    from app.seed import seed_database, ensure_default_categories
    cats = ensure_default_categories(session)
    assert len(cats) >= 11
    assert any("Tamaki" in k for k in cats)

    stats = seed_database(session, target_sku_count=30)

    # Real product added by owner should survive demo purge
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}
    real_res = client.post(
        "/api/v1/products",
        json={
            "barcode": "4780007778889",
            "name": "Real Milk 1L",
            "purchase_price": 8000,
            "sale_price": 11000,
            "stock_quantity": 12,
        },
        headers=headers,
    )
    assert real_res.status_code == 200

    purge_res = client.post("/api/v1/products/purge-demo", headers=headers)
    assert purge_res.status_code == 200
    removed = purge_res.json()["removed"]
    assert removed["products"] == stats["products"] == 28
    assert removed["suppliers"] >= 3
    assert removed["debtors"] >= 5

    remaining = session.exec(select(Product)).all()
    barcodes = {p.barcode for p in remaining}
    assert "4780007778889" in barcodes
    assert not any(b.startswith("460700000") for b in barcodes)


def test_uz_tax_profile_tobacco_datamatrix_and_report(session):
    token = create_access_token({"sub": "owner", "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Configure Uzbekistan taxpayer profile with strict tobacco DataMatrix check & VAT 12%
    res_prof = client.put(
        "/api/v1/tax/profile",
        json={
            "legal_name": "YaTT Shoxrux Tamaki",
            "inn_stir": "123456789",
            "tax_regime": "VAT_12",
            "tax_rate_percent": 12.0,
            "tobacco_license_note": "Soliq tamaki yig'imi 2026 to'langan",
            "strict_tobacco_marking": True,
        },
        headers=headers,
    )
    assert res_prof.status_code == 200
    assert res_prof.json()["profile"]["inn_stir"] == "123456789"

    # 2. Create tobacco product with 17-digit IKPU & VAT 12%
    res_prod = client.post(
        "/api/v1/products",
        json={
            "barcode": "4606203099999",
            "name": "Winston Blue KS",
            "purchase_price": 22000,
            "sale_price": 28000,
            "stock_quantity": 20,
            "ikpu_code": "02402001001000001",
            "vat_rate": 12.0,
            "is_tobacco": True,
            "requires_marking": True,
        },
        headers=headers,
    )
    assert res_prod.status_code == 200
    tob_prod = res_prod.json()
    assert tob_prod["ikpu_valid"] is True
    assert tob_prod["is_tobacco"] is True
    assert tob_prod["requires_marking"] is True

    # 3. Scanning GS1 DataMatrix matches pack GTIN and extracts marking_code
    from urllib.parse import quote
    dm_raw = "010460620309999921PACK001\x1d93AB12"
    res_dm = client.get(f"/api/v1/products/barcode/{quote(dm_raw)}", headers=headers)
    assert res_dm.status_code == 200
    dm_data = res_dm.json()
    assert dm_data["id"] == tob_prod["id"]
    assert dm_data["detected_marking_code"] == "010460620309999921PACK00193AB12"
    assert dm_data["marking_already_sold"] is False

    # 4. Strict mode blocks tobacco checkout without DataMatrix
    res_block = client.post(
        "/api/v1/pos/checkout",
        json={
            "items": [{"product_id": tob_prod["id"], "quantity": 1}],
            "payment_method": "CARD",
        },
        headers=headers,
    )
    assert res_block.status_code == 400

    # 5. Checkout with DataMatrix succeeds and computes VAT 12%
    res_ok = client.post(
        "/api/v1/pos/checkout",
        json={
            "items": [{"product_id": tob_prod["id"], "quantity": 1, "marking_code": dm_data["detected_marking_code"]}],
            "payment_method": "CARD",
        },
        headers=headers,
    )
    assert res_ok.status_code == 200
    chk = res_ok.json()
    assert chk["vat_amount"] == round(28000 * 12.0 / 112.0, 2)
    assert chk["tax_profile"]["inn_stir"] == "123456789"
    assert chk["items"][0]["marking_code"] == "010460620309999921PACK00193AB12"

    # 6. Selling the exact same DataMatrix pack a second time is rejected (409)
    res_dup = client.post(
        "/api/v1/pos/checkout",
        json={
            "items": [{"product_id": tob_prod["id"], "quantity": 1, "marking_code": dm_data["detected_marking_code"]}],
            "payment_method": "CARD",
        },
        headers=headers,
    )
    assert res_dup.status_code == 409

    # 7. Switch to IP Turnover 1% and verify tax report + tobacco ledger + CSV + MXIK search
    client.put("/api/v1/tax/profile", json={"tax_regime": "TURNOVER_1", "tax_rate_percent": 1.0}, headers=headers)
    res_rep = client.get("/api/v1/tax/report?period=today", headers=headers)
    assert res_rep.status_code == 200
    rep = res_rep.json()
    assert rep["summary"]["net_taxable_revenue"] >= 28000.0
    assert rep["summary"]["estimated_tax_due"] == round(rep["summary"]["net_taxable_revenue"] * 0.01, 2)
    assert rep["tobacco_and_marking"]["tobacco_units_sold"] == 1.0
    assert rep["tobacco_and_marking"]["marked_with_datamatrix_count"] == 1
    assert rep["tobacco_and_marking"]["missing_datamatrix_count"] == 0
    assert len(rep["tobacco_and_marking"]["marking_ledger"]) == 1
    assert any(r["ikpu_code"] == "02402001001000001" for r in rep["ikpu_breakdown"])

    res_csv = client.get("/api/v1/tax/export-csv?period=today", headers=headers)
    assert res_csv.status_code == 200
    assert "02402001001000001" in res_csv.text
    assert "010460620309999921PACK00193AB12" in res_csv.text

    res_mxik = client.get("/api/v1/tax/mxik-search?q=02402", headers=headers)
    assert res_mxik.status_code == 200
    assert len(res_mxik.json()["items"]) >= 1





