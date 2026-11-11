---
title: GroceryStore POS
emoji: 🛒
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# 🛒 GroceryStore POS & Accounting (UZS / so'm)

**To'liq avtomatlashtirilgan oziq-ovqat do'koni tizimi / Полнофункциональная система автоматизации продуктового магазина**
(FastAPI, SQLModel, React 19 PWA Standalone, Tailwind CSS, i18n O'zbekcha/Русский, Light/Dark Theme, Hugging Face Spaces Docker Ready).

---

## 🌟 Asosiy imkoniyatlar / Ключевые возможности

### 1. 🌓 Mavzular (Themes: Light & Dark)
- **Yorug' va Qorong'i mavzu**: Yuqori paneldagi bitta tugma (`☀️ / 🌙`) orqali bir lahzada almashish.
- **Doimiy saqlash**: Tanlangan mavzu `localStorage` (`pos_theme`) da saqlanadi va sahifa yangilanganda ham saqlanib qoladi.
- **Tailwind CSS moslashuvi**: Oq/kulrang (`slate-100 / white`) yuqori kontrastli va qulay ko'rinish.

### 2. 🌐 Ikki tilli lokalizatsiya (i18n: O'zbekcha / Русский)
- **Mug'tadil almashtirish**: Yuqori paneldagi `🇺🇿 O'zbek` / `🇷🇺 Русский` tugmasi orqali interfeys tilini lahzada o'zgartirish.
- **To'liq qamrov**: Barcha 6 ta asosiy bo'lim to'liq tarjima qilingan:
  - 📱 **Kassa (POS)** / Касса (POS)
  - 📓 **Qarzlar daftari** / Тетрадь долгов
  - 📦 **Mahsulotlar katalogi** / Каталог товаров (2000 SKU)
  - 🚚 **Ta'minotchilar va yuk xatlari** / Поставщики и накладные
  - 💸 **Xarajatlar va hisobdan chiqarish** / Расходы и списания
  - 📊 **Buxgalteriya va tahlil** / Бухгалтерия и аналитика

### 3. 💰 O'zbek so'mi (UZS / so'm) & Tezkor kupyuralar
- Barcha hisob-kitoblar, narxlar, cheklar, qarzlar va tahlillar so'mda (`so'm` / `UZS`) yuritiladi.
- **Kassada tezkor naqd pul kupyuralari**:
  - `Aniq summa (rovno)`
  - `10 000 so'm`, `20 000 so'm`, `50 000 so'm`, `100 000 so'm`, `200 000 so'm`
- Qaytim (sdacha) avtomatik tarzda aniq hisoblab ko'rsatiladi.

### 4. 📱 Mobil tarmoq va Smartfondan foydalanish (PWA)
- **0.0.0.0 (Port 8000 lokal / 7860 HF Spaces)** orqali butun Wi-Fi tarmog'iga xizmat ko'rsatadi.
- **QR-kod orqali ochish**: Server ishga tushganda konsolda hamda dasturning yuqori qismidagi `📱 Mobil QR` tugmasi bosilganda skanerlash uchun maxsus QR-kod chiqadi.
- **PWA (Progressive Web App)**: Android va iOS smartfonlarida brauzer orqali "Bosh ekranga qo'shish" (Add to Home Screen) qilib, do'kon kassiri alohida dastur sifatida foydalanishi mumkin.
- **Service Worker kesh**: Tarmoq uzilishlarida ham dastur qobig'i uzluksiz ishlaydi.

### 5. 🛡️ Xavfsizlik va Doimiy saqlash (Persistence & Backups)
- **Hugging Face Spaces Persistent Storage (`/data`)**: Baza avtomatik ravishda doimiy `/data/grocery_pos.db` havolasiga ulanadi va konteyner qayta ishga tushganda ham ma'lumotlar saqlanadi.
- **Bir bosishda zaxira nusxa (1-Click Backup via API `/api/backup`)**: Do'kon xo'jayini istalgan paytda bitta havola yoki tugma orqali butun SQLite bazasini o'z telefoni yoki kompyuteriga yuklab olishi mumkin.
- **Avtomatik SQLite On-Disk Dumps**: `/api/backup/dump` orqali `/data/backups/` papkasiga zaxira nusxalar saqlab boriladi.
- **RBAC (Rollar bo'yicha huquqlar)**:
  - `owner` (Xo'jayin): barcha modullar, tannarx, foyda tahlili, tovar yaratish, zaxira nusxalarni yuklab olish.
  - `cashier` (Kassir): faqat kassa va qarzlar daftari (tannarx va foyda ko'rsatkichlari yashirilgan, HTTP 403 bilan himoyalangan).

---

## 🚀 Ishga tushirish va Joylashtirish (Deploy & Startup)

### 1. Hugging Face Spaces (Docker SDK - Bepul 24/7 Server)
Batafsil qo'llanma: [DEPLOY_HF_GUIDE.md](DEPLOY_HF_GUIDE.md)

Avtomatlashtirilgan sinxronizatsiya skripti:
```bash
python projects/grocery_pos/deploy_hf.py --repo-id <username>/<spacename> --token <hf_token>
```

### 2. Mahalliy kompyuterda ishga tushirish (Windows)
Do'kon kompyuterida dasturni bir bosishda ishga tushirish:
- `start_server.bat` — Serverni ishga tushiradi, LAN IP va QR-kodni ko'rsatadi hamda brauzerni ochadi.
- `run_pos.bat` — Kassa terminalini tezkor ishga tushirish.

Terminal orqali:
```bash
python projects/grocery_pos/server.py
```
Yoki uvicorn:
```bash
uvicorn projects.grocery_pos.app.main:app --host 0.0.0.0 --port 8000
```

### 3. Tizimga kirish
- Production hisoblari umumiy standart parol bilan yaratilmaydi. Egasi kuchli noyob parolni o‘rnating va kassirlar uchun alohida hisoblar yarating.
- Parollar kamida 12 belgidan iborat bo‘lishi, repozitoriyga yoki chatga joylanmasligi kerak.
- Yangi, bo‘sh bazada boshlang‘ich egani yaratish uchun deploydan oldin `DEFAULT_OWNER_USERNAME` va `DEFAULT_OWNER_PASSWORD` ni Render Environment’da kiriting. Parol kamida 12 belgidan iborat bo‘lishi kerak. Mavjud hisoblar bu sozlama orqali o‘zgartirilmaydi.
- `AUTO_SEED_CATALOG` standart holatda o‘chiq: yangi do‘konga demo mahsulotlar qo‘shilmaydi. Demo katalogni faqat ataylab yoqish mumkin.

---

## 💾 Baza zaxira nusxasini olish (SQLite Backup API)
- **GET `/api/backup`** (yoki `/api/backup?token=<owner_token>`): To'g'ridan-to'g'ri smartfon yoki kompyuterga `.db` faylni yuklab olish.
- **POST `/api/backup/dump`**: `/data/backups/` papkasiga to'liq atomik zaxira nusxa yaratish.
- **GET `/api/backup/info`**: Baza hajmi, yozuvlar soni va doimiy saqlash holatini ko'rish.

---

## 🧪 Avtotestlarni ishga tushirish

```bash
pytest tests/projects/test_grocery_pos.py -v
```
Testlar 100% muvaffaqiyatli o'tadi.
