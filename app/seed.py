import random
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from .config import settings
from .auth import hash_password
from .models import (
    User, UserRole, Category, Product, Debtor, Supplier, SystemSetting,
    DebtTransaction, DebtTransactionType, Expense, ExpenseCategory
)

CATEGORIES_DATA = [
    {"name": "Sut mahsulotlari / Молочная продукция", "description": "Sut, qatiq, tvorog, sariyog', pishloq", "icon": "milk"},
    {"name": "Non va pishiriqlar / Хлеб и выпечка", "description": "Tandir non, buxanka, patir, lavash, bulochkalar", "icon": "wheat"},
    {"name": "Go'sht va kolbasalar / Мясо и колбасы", "description": "Mol va tovuq go'shti, halol kolbasalar, sosiskalar", "icon": "beef"},
    {"name": "Ichimliklar va sharbatlar / Напитки и соки", "description": "Mineral suv, mevali sharbatlar, choy, kvas", "icon": "cup-soda"},
    {"name": "Baqoliya va don mahsulotlari / Бакалея и крупы", "description": "Guruch, un, shakar, yog', makaron, tuz", "icon": "package"},
    {"name": "Shirinliklar va qandolat / Сладости и кондитерка", "description": "Shokolad, konfetlar, pechenye, vafli", "icon": "cookie"},
    {"name": "Mevalar va sabzavotlar / Овощи и фрукты", "description": "Kartoshka, piyoz, sabzi, pomidor, olma, banan", "icon": "apple"},
    {"name": "Muzlatilgan mahsulotlar / Заморозка", "description": "Chuchvara, vareniklar, muzlatilgan go'sht va sabzavot", "icon": "snowflake"},
    {"name": "Choy va kofe / Чай и кофе", "description": "Ko'k choy 95, qora choy, eriydigan va donador kofe", "icon": "coffee"},
    {"name": "Maishiy kimyo / Бытовая химия", "description": "Kir yuvish kukuni, sovun, idish yuvish vositalari, salfetkalar", "icon": "sparkles"},
]

PRODUCT_TEMPLATES = {
    "Sut mahsulotlari / Молочная продукция": [
        ("Sut pasterizatsiyalangan 2.5% 1L", "l", 9000.0, 13000.0),
        ("Sut tabiiy 3.2% 1L", "l", 11000.0, 16000.0),
        ("Qatiq 1% 1L", "l", 8000.0, 12000.0),
        ("Qatiq an'anaviy 2.5% 1L", "l", 9500.0, 14000.0),
        ("Tvorog qishloqcha 5% 250g", "quti", 14000.0, 21000.0),
        ("Tvorog yog'siz 0% 250g", "quti", 13000.0, 19000.0),
        ("Smetana 15% 200g", "quti", 11000.0, 16000.0),
        ("Smetana 20% 200g", "quti", 13000.0, 19000.0),
        ("Sariyog' qaymoqli 82.5% 200g", "quti", 28000.0, 39000.0),
        ("Pishloq Gollandskiy 1kg", "kg", 85000.0, 120000.0),
        ("Pishloq Rossiskiy 1kg", "kg", 80000.0, 115000.0),
        ("Ichimlik yogurti Qulupnayli 290ml", "dona", 7500.0, 11000.0),
        ("Yogurt tabiiy 150g", "dona", 6000.0, 9500.0),
        ("Ryajenka 3.2% 500g", "quti", 8500.0, 13000.0),
        ("Quyultirilgan sut GOST", "dona", 16000.0, 24000.0),
    ],
    "Non va pishiriqlar / Хлеб и выпечка": [
        ("Buxanka non oq", "dona", 2500.0, 3500.0),
        ("Tandir non Samarqandcha", "dona", 4000.0, 6000.0),
        ("Patir non sutli", "dona", 6000.0, 9000.0),
        ("Lavash yupqa xamir", "quti", 4000.0, 6000.0),
        ("Shirin dolchinli bulochka", "dona", 3500.0, 5500.0),
        ("Vanilli korjik", "dona", 3000.0, 4800.0),
        ("Baget frantsuzcha qarsildoq", "dona", 5000.0, 8000.0),
        ("Javdar non Borodinskiy", "dona", 6000.0, 9000.0),
        ("Mayizli suxari 300g", "quti", 9000.0, 14000.0),
        ("Pryanik shakarli 400g", "quti", 11000.0, 16000.0),
    ],
    "Go'sht va kolbasalar / Мясо и колбасы": [
        ("Kolbasa Doktorskaya Halol 1kg", "kg", 45000.0, 65000.0),
        ("Kolbasa Sutli GOST 1kg", "kg", 42000.0, 60000.0),
        ("Sosiska Sutli Halol 500g", "quti", 28000.0, 40000.0),
        ("Sardelka mol go'shtidan 1kg", "kg", 55000.0, 78000.0),
        ("Servelat quruq dudlangan 1kg", "kg", 85000.0, 120000.0),
        ("Kurka go'shti vetshinasi 1kg", "kg", 68000.0, 98000.0),
        ("Mol go'shti lahm yangi 1kg", "kg", 95000.0, 125000.0),
        ("Jigar pashteti klassik 150g", "dona", 8000.0, 12000.0),
        ("Tovuq filesi toza 1kg", "kg", 45000.0, 62000.0),
        ("Dudlangan tovuq soni 1kg", "kg", 48000.0, 68000.0),
    ],
    "Ichimliklar va sharbatlar / Напитки и соки": [
        ("Mineral gazlangan suv 1.5L", "dona", 3500.0, 5000.0),
        ("Ichimlik toza suvi 5L", "dona", 8000.0, 12000.0),
        ("Olma sharbati tabiiy 1L", "dona", 12000.0, 17000.0),
        ("Apelsin sharbati 1L", "dona", 14000.0, 20000.0),
        ("Gilos va anor mors 1L", "dona", 13000.0, 18500.0),
        ("Limonad Tarxun 0.5L", "dona", 5000.0, 7500.0),
        ("Non kvasi an'anaviy 2L", "dona", 11000.0, 16000.0),
        ("Muzdek ko'k choy 0.5L", "dona", 6000.0, 9000.0),
        ("Energetik ichimlik 0.45L", "dona", 11000.0, 16000.0),
        ("Multimeva nektari 1L", "dona", 11500.0, 16500.0),
    ],
    "Baqoliya va don mahsulotlari / Бакалея и крупы": [
        ("Grechka donasi Ekstra 800g", "quti", 11000.0, 16000.0),
        ("Guruch Alanga saralangan 1kg", "kg", 18000.0, 24000.0),
        ("Guruch Lazer premium 1kg", "kg", 26000.0, 34000.0),
        ("Makaron Spaghetti oliy nav 450g", "quti", 8000.0, 12000.0),
        ("Makaron Spiral 450g", "quti", 7500.0, 11500.0),
        ("Shakar qadoqlangan 1kg", "kg", 11000.0, 15000.0),
        ("Osh tuzi yodlangan 1kg", "dona", 2000.0, 3500.0),
        ("Bug'doy uni oliy nav 2kg", "quti", 17000.0, 24000.0),
        ("Pista yog'i tozalangan 1L", "dona", 16000.0, 22000.0),
        ("Suli yormasi (Gerkules) 400g", "quti", 7000.0, 10500.0),
        ("No'xat saralangan 800g", "quti", 14000.0, 20000.0),
    ],
    "Shirinliklar va qandolat / Сладости и кондитерка": [
        ("Sutli shokolad funduk bilan 90g", "dona", 12000.0, 17500.0),
        ("Qora shokolad 72% 100g", "dona", 14000.0, 21000.0),
        ("Konfet Qush suti 200g", "quti", 19000.0, 28000.0),
        ("Suli pechenyesi 300g", "quti", 9500.0, 14000.0),
        ("Vafli qaymoqli qarsildoq 200g", "quti", 8000.0, 12000.0),
        ("Shokoladli pryanik 350g", "quti", 10000.0, 15000.0),
        ("Mevali marmelad assorti 250g", "quti", 11000.0, 16000.0),
        ("Zefir vanilli shokoladda 250g", "quti", 16000.0, 24000.0),
        ("Muzqaymoqli karamel konfet 200g", "quti", 8500.0, 13000.0),
    ],
    "Mevalar va sabzavotlar / Овощи и фрукты": [
        ("Kartoshka yangi saralangan 1kg", "kg", 4500.0, 6500.0),
        ("Sabzi tozalangan shirin 1kg", "kg", 3500.0, 5000.0),
        ("Piyoz oq saralangan 1kg", "kg", 2500.0, 4000.0),
        ("Pomidor qizil mayin 1kg", "kg", 18000.0, 25000.0),
        ("Bodring yangi qisqa 1kg", "kg", 14000.0, 20000.0),
        ("Karam oq yangi 1kg", "kg", 3500.0, 5500.0),
        ("Olma qizil shirin 1kg", "kg", 12000.0, 18000.0),
        ("Banan import Ekvador 1kg", "kg", 19000.0, 26000.0),
        ("Apelsin sershira 1kg", "kg", 18000.0, 25000.0),
        ("Limon sariq 1kg", "kg", 22000.0, 30000.0),
    ],
    "Muzlatilgan mahsulotlar / Заморозка": [
        ("Chuchvara Sibircha mol go'shti 800g", "quti", 34000.0, 49000.0),
        ("Varenik kartoshka va qo'ziqorin 450g", "quti", 17000.0, 25000.0),
        ("Uy kotletlari muzlatilgan 400g", "quti", 24000.0, 35000.0),
        ("Sabzavot aralashmasi Meksikacha 400g", "quti", 14000.0, 21000.0),
        ("Mintaq balig'i filesi 600g", "quti", 28000.0, 40000.0),
        ("Blinchik go'shtli tayyor 360g", "quti", 18000.0, 27000.0),
        ("Muzqaymoq Plombir stakanchik 80g", "dona", 5000.0, 8000.0),
    ],
    "Choy va kofe / Чай и кофе": [
        ("Qora choy Seylon 100 paket", "quti", 28000.0, 40000.0),
        ("Ko'k choy 95 maxsus 100g", "quti", 12000.0, 18000.0),
        ("Ko'k choy yasminli 25 paket", "quti", 11000.0, 16000.0),
        ("Qora choy yaproqli Assam 100g", "quti", 16000.0, 24000.0),
        ("Kofe eriydigan sublimatsiyalangan 95g", "dona", 34000.0, 49000.0),
        ("Kofe donador Arabika 250g", "quti", 48000.0, 70000.0),
        ("Tabiiy kakao kukuni 100g", "quti", 11000.0, 16500.0),
        ("Tsikoriy eruvchan 85g", "quti", 12000.0, 18000.0),
    ],
    "Maishiy kimyo / Бытовая химия": [
        ("Atir sovuni xushbo'y 90g", "dona", 4500.0, 7000.0),
        ("Suyuq sovun dozator bilan 500ml", "dona", 14000.0, 21000.0),
        ("Idish yuvish vositasi 450ml", "dona", 13000.0, 19000.0),
        ("Kir yuvish kukuni Avtomat 1.5kg", "quti", 35000.0, 50000.0),
        ("Nam salfetkalar antibakterial 60 dona", "quti", 7500.0, 12000.0),
        ("Hojatxona qog'ozi 3 qavat 4 dona", "quti", 14000.0, 21000.0),
        ("Idish yuvish gubkasi 5 dona", "quti", 6000.0, 9500.0),
        ("Chiqindi qoplari bog'ichli 30L 20 dona", "quti", 8000.0, 12000.0),
    ]
}

BRANDS = [
    "Musaffo", "Nestle", "Kamilka", "Dena", "Chortoq", "Oila Tanlovi", "Hydra", "Crafers",
    "Makfa", "Toshkent Non", "Zolotoy Sezam", "Savdogar", "Sherin", "Rozmetov", "To'xtaniyoz Ota",
    "Sag'bon", "Greenfield", "Ahmad Tea", "Nescafe", "Fairy", "Tide", "Ariel", "Domik v derevne",
    "Prostokvashino", "Agrokompleks", "EkoProdukt"
]

VARIATIONS = [
    "Klassik", "Oilaviy", "Lyuks", "Saralangan", "Maxsus",
    "An'anaviy", "Tejamkor", "Ekstra", "Fitnes", "Qishloqcha",
    "Original", "Oltin", "Sevimli", "Bayramona", "Yangi"
]

QUICK_STAPLE_NAMES = [
    "Buxanka non", "Tandir non", "Shakar qadoqlangan", "Kartoshka yangi",
    "Piyoz oq", "Sut tabiiy", "Bug'doy uni", "Pista yog'i", "Tuxum"
]

def seed_accounts(session: Session) -> int:
    """Create explicitly configured initial accounts; never add known default passwords."""
    created = 0
    now_utc = datetime.now(timezone.utc)

    # Existing accounts are never modified by seeding.
    owner = session.exec(select(User).where(User.username == settings.DEFAULT_OWNER_USERNAME)).first() if settings.DEFAULT_OWNER_USERNAME else None
    if settings.DEFAULT_OWNER_USERNAME and len(settings.DEFAULT_OWNER_PASSWORD) >= 12 and not owner:
        owner = User(
            username=settings.DEFAULT_OWNER_USERNAME,
            hashed_password=hash_password(settings.DEFAULT_OWNER_PASSWORD),
            full_name="Shoxrux (Do'kon egasi / Владелец)",
            role=UserRole.OWNER,
            is_active=True,
            created_at=now_utc
        )
        session.add(owner)
        created += 1

    cashiers_seed = []
    if settings.DEFAULT_CASHIER_USERNAME and len(settings.DEFAULT_CASHIER_PASSWORD) >= 12:
        cashiers_seed.append((settings.DEFAULT_CASHIER_USERNAME, settings.DEFAULT_CASHIER_PASSWORD, "Cashier"))
    for c_user, c_pass, c_name in cashiers_seed:
        c_exist = session.exec(select(User).where(User.username == c_user)).first()
        if not c_exist:
            c_inst = User(
                username=c_user,
                hashed_password=hash_password(c_pass),
                full_name=c_name,
                role=UserRole.CASHIER,
                is_active=True,
                created_at=now_utc
            )
            session.add(c_inst)
            created += 1

    session.commit()

    return created

def seed_database(session: Session, target_sku_count: int = 2000) -> dict:
    """Populate demo catalog data; initial users require explicit strong credentials."""
    stats = {"users": seed_accounts(session), "categories": 0, "products": 0, "debtors": 0, "suppliers": 0}
    now_utc = datetime.now(timezone.utc)

    # 2. Always ensure default Categories exist
    category_map = {}
    for cat_data in CATEGORIES_DATA:
        cat = session.exec(select(Category).where(Category.name == cat_data["name"])).first()
        if not cat:
            cat = Category(**cat_data)
            session.add(cat)
            session.commit()
            session.refresh(cat)
            stats["categories"] += 1
        category_map[cat.name] = cat.id

    # If owner cleared catalog for clean store start, DO NOT seed fake suppliers, debts, products or expenses!
    cleared_setting = session.get(SystemSetting, 'catalog_cleared')
    if cleared_setting and cleared_setting.value == 'true':
        return stats

    # 3. Seed Suppliers
    suppliers_data = [
        {"name": "MCHJ 'Musaffo Sut Alyansi'", "contact_person": "Akmal Karimov", "phone": "+998 (71) 200-11-22", "address": "Toshkent sh., Zavod ko'chasi 12", "note": "Har kuni soat 06:30 da sut mahsulotlari keltirish"},
        {"name": "AJ 'Toshkent Non Kombinati'", "contact_person": "Elena Vasilyeva", "phone": "+998 (71) 230-33-44", "address": "Toshkent sh., Bobur ko'chasi 45", "note": "Har tong yangi pishgan non va patirlar"},
        {"name": "XK 'OptBaqoliya va Shirinliklar'", "contact_person": "Baxtiyor Qosimov", "phone": "+998 (90) 333-44-55", "address": "Qo'yliq ulgurji bozor 7-ombor", "note": "Don mahsulotlari, shakar, o'simlik yog'i, choy"}
    ]
    for s_data in suppliers_data:
        sup = session.exec(select(Supplier).where(Supplier.name == s_data["name"])).first()
        if not sup:
            sup = Supplier(**s_data, created_at=now_utc)
            session.add(sup)
            stats["suppliers"] += 1
    session.commit()

    # 4. Seed Debtors (Qarzlar daftari / Тетрадь долгов)
    debtors_data = [
        {"full_name": "Alisher Rahimov", "phone": "+998 (90) 123-45-67", "note": "44-xonadon qo'shni, haftalik hisob", "due_date": "Dushanba", "initial_debt": 150000.0},
        {"full_name": "Mariya Ivanovna (muallima)", "phone": "+998 (91) 234-56-78", "note": "Non va sut mahsulotlari oladi, maoshda to'laydi", "due_date": "Oy oxirida", "initial_debt": 75000.0},
        {"full_name": "Damir usta (avtoservis)", "phone": "+998 (93) 345-67-89", "note": "Do'kon ro'parasidagi 12-ustaxona", "due_date": "Juma", "initial_debt": 280000.0},
        {"full_name": "Nargiza opa", "phone": "+998 (94) 456-78-90", "note": "Pensiyada har oyning 15-sanasida yopadi", "due_date": "15-sana", "initial_debt": 90000.0},
        {"full_name": "Sergey quruvchi", "phone": "+998 (97) 567-89-01", "note": "Ta'mirlash brigadasi boshlig'i", "due_date": "1 hafta", "initial_debt": 0.0},
    ]
    for d_data in debtors_data:
        debtor = session.exec(select(Debtor).where(Debtor.full_name == d_data["full_name"])).first()
        if not debtor:
            init_debt = d_data.pop("initial_debt")
            debtor = Debtor(**d_data, balance=init_debt, created_at=now_utc, updated_at=now_utc)
            session.add(debtor)
            session.commit()
            session.refresh(debtor)
            stats["debtors"] += 1
            if init_debt > 0:
                tx = DebtTransaction(
                    debtor_id=debtor.id,
                    amount=init_debt,
                    transaction_type=DebtTransactionType.DEBT_INCREASE,
                    note="Boshlang'ich qarz qoldig'i (so'm)",
                    due_date=d_data.get("due_date"),
                    created_at=now_utc - timedelta(days=3)
                )
                session.add(tx)
                session.commit()

    # 5. Seed 2000 SKU Products
    existing_count = session.exec(select(Product)).all()
    current_count = len(existing_count)
    if current_count < target_sku_count:
        needed = target_sku_count - current_count
        categories_list = list(PRODUCT_TEMPLATES.keys())
        products_to_add = []
        
        base_barcode = 4607000000000
        start_idx = current_count + 1

        for i in range(needed):
            idx = start_idx + i
            cat_name = categories_list[i % len(categories_list)]
            cat_id = category_map[cat_name]
            templates = PRODUCT_TEMPLATES[cat_name]
            tpl = templates[(i // len(categories_list)) % len(templates)]
            base_name, unit, base_pur, base_sale = tpl

            brand = BRANDS[i % len(BRANDS)]
            variation = VARIATIONS[(i // len(BRANDS)) % len(VARIATIONS)]
            weight_suffix = f"#{idx}"

            full_name = f"{base_name} '{brand}' ({variation}) {weight_suffix}"
            barcode = f"{base_barcode + idx}"

            price_factor = 1.0 + ((i % 11) - 5) * 0.03
            purchase_price = round(round((base_pur * price_factor) / 500.0) * 500.0, 2)
            sale_price = round(round((base_sale * price_factor) / 500.0) * 500.0, 2)
            
            if sale_price <= purchase_price:
                sale_price = purchase_price + 2000.0
            
            if i % 25 == 0:
                stock_qty = float(random.randint(1, 4))
            else:
                stock_qty = float(random.randint(10, 150))
            
            min_stock = 5.0 if unit != "kg" else 15.0

            # Mark staple products as is_quick
            is_quick = any(base_name.startswith(q) for q in QUICK_STAPLE_NAMES) and (i < 15)

            p = Product(
                barcode=barcode,
                name=full_name,
                category_id=cat_id,
                unit=unit,
                purchase_price=purchase_price,
                sale_price=sale_price,
                stock_quantity=stock_qty,
                min_stock_alert=min_stock,
                is_quick=is_quick,
                is_active=True,
                created_at=now_utc,
                updated_at=now_utc
            )
            products_to_add.append(p)
            
            if len(products_to_add) >= 500:
                session.add_all(products_to_add)
                session.commit()
                stats["products"] += len(products_to_add)
                products_to_add = []

        if products_to_add:
            session.add_all(products_to_add)
            session.commit()
            stats["products"] += len(products_to_add)

    # 6. Seed a sample expense ONLY if not cleared
    exp = session.exec(select(Expense)).first()
    if not exp:
        session.add(Expense(
            category=ExpenseCategory.RENT,
            amount=5000000.0,
            description="Do'kon binosi oylik ijara to'lovi (so'm)",
            expense_date=now_utc - timedelta(days=5),
            created_at=now_utc
        ))
        session.add(Expense(
            category=ExpenseCategory.UTILITIES,
            amount=1200000.0,
            description="Elektr energiyasi va muzlatgichlar uchun to'lov (so'm)",
            expense_date=now_utc - timedelta(days=3),
            created_at=now_utc
        ))
        session.add(Expense(
            category=ExpenseCategory.SPOILAGE,
            amount=180000.0,
            description="Hisobdan chiqarish: zararlangan banan va pomidorlar (so'm)",
            expense_date=now_utc - timedelta(days=1),
            created_at=now_utc
        ))
        session.commit()

    return stats
