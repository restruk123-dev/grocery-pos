const { useState, useEffect, useMemo, useRef } = React;

const API_BASE = '/api/v1';

// Global fallback for lang
var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang')) || 'uz';

// ------------------- I18N TRANSLATIONS -------------------
const TRANSLATIONS = {
  uz: {
    appName: "GroceryStore POS",
    appSubtitle: "Do'kon savdosi & Buxgalteriya",
    switchCashierBtn: "Smena / Kassir",
    cashierSwitchTitle: "Smenadagi kassirni tanlang (1-bosish)",
    installAppBtn: "Ilovani o'rnatish",
    installedMsg: "Ilova smartfoningizga o'rnatildi!",
    cameraScannerBtn: "Kamera skaner",
    torchOn: "Fonar (Yoqish)",
    torchOff: "Fonar (O'chirish)",
    barcodeScanned: "Shtrixkod o'qildi",
    scaleWeightDetected: "Tarozidan tortilgan vazn aniqlandi",
    voiceSearchBtn: "Ovoz",
    voiceListening: "Eshitilmoqda... gapiring",
    quickItemsTitle: "Tezkor tovarlar (Shtrixkodsiz)",
    toggleAllCatalog: "Barcha tovarlar",
    instantCashBtn: "Naqd (Aniq)",
    instantCardBtn: "Karta (Humo/Uzcard)",
    instantDebtBtn: "Qarzga",
    saleSuccessToast: "Savdo muvaffaqiyatli saqlandi!",
    printReceiptOptional: "Chekni chop etish",
    voiceDebtBtn: "Ovozli qarz yozish",
    voiceDebtPrompt: "Masalan: «Alisher 50 ming so'm nonga oldi, dushanba beradi»",
    scanPaperNotebookBtn: "Qog'oz daftardan rasm olish",
    ocrPreviewTitle: "Daftardan o'qilgan qarzlar predprosmotri",
    importAllDebts: "Barchasini qarzlar daftariga kiritish",
    dueDateLabel: "Qaytarish muddati",
    scanInvoiceBtn: "Faktura / Yuk xatini skanerlash",
    invoiceOcrTitle: "Faktura qatorlari predprosmotri",
    importInvoiceBtn: "Omborga qabul qilish",
        addProductBtn: "+ Tovar qo'shish",
    addProductTitle: "Yangi tovar qo'shish (Katalog / POS)",
    productNameLabel: "Mahsulot nomi *",
    barcodeLabel: "Shtrixkod *",
    scanBarcodeBtn: "Kamera skaner",
    categoryLabel: "Kategoriya",
    unitLabel: "O'lchov birligi",
    purchasePriceLabel: "Tannarxi / Kirim narxi (so'm)",
    salePriceLabel: "Sotish narxi (so'm) *",
    stockQtyLabel: "Ombordagi qoldiq soni",
    isQuickLabel: "Tezkor tovar (Kassada 1-bosish bilan sotish uchun)",
    pwaBannerTitle: "Ilovani to'liq ekranga o'rnatish (Brauzersiz ochish)",
    pwaBannerDesc: "Brauzer manzil qatorisiz, qulay ilova ko'rinishida ochish uchun: brauzer menyusida (3 nuqta) «Bosh ekranga qo'shish» (Добавить на главный экран) tugmasini bosing.",
    pwaBannerClose: "Tushunarli",
    clearCatalogBtn: "Test tovarlarni tozalash / Toza varaqdan boshlash",
    clearCatalogWarning: "Rostdan ham barcha test tovarlar va cheklarni tozalamoqchimisiz? Kechki savdo uchun toza baza tayyorlanadi.",
    reseedCatalogBtn: "2000 ta demo tovarlarni qaytarish",
    tabAiAssistant: "AI Yordamchi",
    aiAssistantTitle: "Do'kon AI-yordamchisi",
    aiPlaceholder: "Savolingizni yozing (masalan: Bugun qancha savdo bo'ldi? yoki Tamaki do'koni maslahatlari)...",
    ownerRole: "Ega (Xo'jayin)",
    cashierRole: "Kassir",
    tabPos: "📱 Kassa (POS)",
    tabDebts: "📓 Qarzlar daftari",
    tabCatalog: "📦 Mahsulotlar",
    tabSuppliers: "🚚 Ta'minotchilar",
    tabExpenses: "💸 Xarajatlar",
    tabAnalytics: "📊 Buxgalteriya",
    mobileQrBtn: "📱 Mobil QR",
    backupBtn: "💾 Baza",
    logout: "Chiqish",
    welcome: "Xush kelibsiz",
    loginTitle: "GroceryStore POS",
    loginSubtitle: "Oziq-ovqat do'koni avtomatizatsiyasi",
    usernameLabel: "Foydalanuvchi (Login)",
    passwordLabel: "Maxfiy parol",
    loginBtn: "Kassaga kirish",
    loggingIn: "Kirilmoqda...",
    quickDemo: "Tezkor demo-kirish:",
    ownerBtn: "👑 Ega (owner)",
    cashierBtn: "👩‍💼 Kassir (cashier)",
    searchProductPlaceholder: "🔍 Shtrixkod yoki mahsulot nomi bo'yicha qidirish...",
    barcodeScanPlaceholder: "⚡ Shtrixkod skaneri (Enter)",
    allCategories: "Barcha toifalar",
    stockLabel: "Qoldiq:",
    outOfStock: "Qolmagan",
    cartTitle: "Savdo cheki (Savat)",
    clearCart: "Tozalash",
    cartEmpty: "Savat bo'sh. Mahsulotni tanlang yoki shtrixkodni skanerlang",
    totalToPay: "Jami to'lov:",
    checkoutBtn: "To'lovni qabul qilish",
    checkoutTitle: "Xarid to'lovi",
    methodCash: "Naqd pul",
    methodCard: "Karta",
    methodDebt: "Qarzga berish",
    cashReceivedLabel: "Berilgan naqd pul (so'm):",
    changeLabel: "Qaytim:",
    exactAmount: "Aniq summa",
    cardSwipePrompt: "Bank kartasini tolov terminaliga tekkizing",
    selectDebtorLabel: "Qarzdor mijozni tanlang:",
    newDebtorBtn: "+ Yangi mijoz qo'shish",
    debtorNameLabel: "Mijoz F.I.Sh. *",
    phoneLabel: "Telefon raqami",
    noteLabel: "Izoh",
    confirmPayBtn: "To'lovni tasdiqlash",
    processing: "Bajarilmoqda...",
    receiptHeader: "KASSA CHEKI",
    receiptNumber: "Chek №:",
    dateLabel: "Sana:",
    cashierLabel: "Kassir:",
    paymentMethodLabel: "To'lov turi:",
    amountPaid: "To'langan summa:",
    debtRecorded: "Qarzga yozildi:",
    clientName: "Mijoz:",
    printReceipt: "Chekni chop etish (80mm)",
    closeBtn: "Yopish",
    cancelBtn: "Bekor qilish",
    saveBtn: "Saqlash",
    saving: "Saqlanmoqda...",
    createBtn: "Yaratish",
    creating: "Yaratilmoqda...",
    debtsTitle: "Qarzlar daftari",
    totalOutstandingDebt: "Jami mijozlar qarzi:",
    activeDebtorsCount: "faol qarzdor",
    addDebtorModalTitle: "+ Yangi qarzdor qo'shish",
    searchDebtorPlaceholder: "🔍 Qarzdorni qidirish (ism, telefon)...",
    onlyWithDebtFilter: "⚠️ Faqat qarzi borlar",
    payDebtBtn: "Qarz to'lash",
    addDebtBtn: "Qarz qo'shish",
    historyBtn: "Tarix",
    currentDebtBalance: "Qarz qoldig'i:",
    payDebtModalTitle: "Qarz tolovini qabul qilish",
    paymentAmountLabel: "To'lov summasi (so'm) *",
    addDebtModalTitle: "Qo'shimcha qarz yozish",
    debtAmountLabel: "Qarz summasi (so'm) *",
    historyModalTitle: "Qarz operatsiyalari tarixi",
    catalogTitle: "Mahsulotlar katalogi",
    lowStockFilter: "⚠️ Oz qolganlar",
    syncCatalogBtn: "🔄 Sinxronlash (2000 SKU)",
    colBarcode: "Shtrixkod",
    colName: "Nomi",
    colCategory: "Kategoriya",
    colPurchasePrice: "Tannarx (Xarid)",
    colSalePrice: "Sotish narxi",
    colStock: "Qoldiq",
    colStatus: "Holat",
    statusOrderMore: "Buyurtma berish",
    statusInNorm: "Yetarli",
    paginationShown: "Ko'rsatildi:",
    paginationOf: "dan",
    prevBtn: "← Oldingi",
    nextBtn: "Keyingi →",
    suppliersTitle: "Yetkazib beruvchilar va yuk xatlari",
    addSupplierBtn: "+ Yangi yetkazib beruvchi",
    addInvoiceBtn: "+ Yangi yuk xati (nakladnaya)",
    supplierNameLabel: "Yetkazib beruvchi nomi *",
    contactPersonLabel: "Mas'ul shaxs",
    addressLabel: "Manzil",
    invoiceNumberLabel: "Yuk xati raqami",
    invoiceItemsLabel: "Tovarlar ro'yxati",
    paidAmountLabel: "To'langan summa (so'm)",
    debtToSupplierLabel: "Ta'minotchiga qarz:",
    payInvoiceBtn: "Yuk xatini to'lash",
    invoiceStatusPaid: "To'langan",
    invoiceStatusPartial: "Qisman to'langan",
    invoiceStatusPending: "To'lanmagan",
    expensesTitle: "Operatsion xarajatlar va hisobdan chiqarish",
    addExpenseBtn: "+ Yangi xarajat",
    spoilageBtn: "⚠️ Yaroqsiz tovar hisobdan chiqarish (Spisanie)",
    expenseCategoryLabel: "Xarajat toifasi",
    expenseAmountLabel: "Xarajat summasi (so'm) *",
    expenseDescLabel: "Tavsif / Sabab *",
    spoilageProductLabel: "Yaroqsiz tovar *",
    spoilageQtyLabel: "Hisobdan chiqariladigan miqdor *",
    analyticsTitle: "Buxgalteriya va tahliliy hisobot",
    periodLabel: "Davr tanlash:",
    periodToday: "Bugun",
    periodWeek: "Hafta (7 kun)",
    periodMonth: "Oy (30 kun)",
    periodAll: "Barcha davr",
    kpiRevenue: "Tushum (Savdo)",
    kpiCogs: "Tannarx (COGS)",
    kpiGrossMargin: "Yalpi foyda",
    kpiNetProfit: "Sof foyda",
    kpiMarginPct: "Rentabellik:",
    kpiAvgReceipt: "O'rtacha chek:",
    kpiReceiptsCount: "ta chek",
    kpiCustomerDebt: "Mijozlar qarzi (Jami)",
    paymentsBreakdownTitle: "To'lov turlari bo'yicha tushum",
    expensesBreakdownTitle: "Davriy operatsion xarajatlar",
    topSellingTitle: "🏆 Eng ko'p sotilgan Top-5 tovarlar",
    mobileModalTitle: "Smartfon orqali ulash (PWA)",
    mobileModalDesc: "Kassani telefondan ishlatish uchun ushbu QR-kodni smartfoningiz kamerasi bilan skanerlang:",
    mobileModalUrlLabel: "Yoki brauzerda to'g'ridan-to'g'ri oching:",
    mobileModalPwaHelp: "Ilovani o'rnatish: Telefonda sahifa ochilgach, brauzer menyusidan 'Bosh ekranga qo'shish' (Add to Home Screen) tugmasini bosing.",
    themeDark: "Qorong'i mavju",
    themeLight: "Yorug' mavju",
    currency: "so'm",
    // Quick items translations
    quick_bread: "Tandir nona",
    quick_tandyr_lepeshka: "Тандыр лепешка",
    quick_sugar: "Сахар",
    quick_potatoes: "Картофель",
    quick_onions: "Лук",
    quick_eggs: "Яйца",
  },
  ru: {
    appName: "GroceryStore POS",
    appSubtitle: "Автоматизация и Бухгалтерия",
    ownerRole: "Хозяин",
    cashierRole: "Кассир",
    tabPos: "📱 Касса (POS)",
    tabDebts: "📓 Тетрадь долгов",
    tabCatalog: "📦 Каталог товаров",
    tabSuppliers: "🚚 Поставщики",
    tabExpenses: "💸 Расходы",
    tabAnalytics: "📊 Бухгалтерия",
    mobileQrBtn: "📱 Телефон (QR)",
    backupBtn: "💾 Бэкап",
    logout: "Выход",
    welcome: "Добро пожаловать",
    loginTitle: "GroceryStore POS",
    loginSubtitle: "Автоматизация продуктового магазина",
    usernameLabel: "Логин",
    passwordLabel: "Пароль",
    loginBtn: "Войти в терминал",
    loggingIn: "Вход в систему...",
    quickDemo: "Быстрый демо-вход:",
    ownerBtn: "👑 Хозяин (owner)",
    cashierBtn: "👩‍💼 Кассир (cashier)",
    searchProductPlaceholder: "🔍 Поиск по штрихкоду или названию товара...",
    barcodeScanPlaceholder: "⚡ Сканер штрихкода (Enter)",
    allCategories: "Все категории",
    stockLabel: "Остаток:",
    outOfStock: "Нет в наличии",
    cartTitle: "Текущий чек (Корзина)",
    clearCart: "Очистить",
    cartEmpty: "Корзина пуста. Выберите товар или отсканируйте штрихкод",
    totalToPay: "Итого к оплате:",
    checkoutBtn: "Принять оплату",
    checkoutTitle: "Оплата покупки",
    methodCash: "Наличные",
    methodCard: "Карта",
    methodDebt: "В долг",
    cashReceivedLabel: "Получено наличных (сум):",
    changeLabel: "Сдача:",
    exactAmount: "Ровно",
    cardSwipePrompt: "Приложите банковскую карту к терминалу",
    selectDebtorLabel: "Выберите клиента для записи долга:",
    newDebtorBtn: "+ Создать клиента",
    debtorNameLabel: "ФИО клиента *",
    phoneLabel: "Номер телефона",
    noteLabel: "Примечание",
    confirmPayBtn: "Подтвердить оплату",
    processing: "Обработка...",
    receiptHeader: "КАССОВЫЙ ЧЕК",
    receiptNumber: "Чек №:",
    dateLabel: "Дата:",
    cashierLabel: "Кассир:",
    paymentMethodLabel: "Способ оплаты:",
    amountPaid: "Оплачено:",
    debtRecorded: "Записано в долг:",
    clientName: "Клиент:",
    printReceipt: "Распечатать чек (80мм)",
    closeBtn: "Закрыть",
    cancelBtn: "Отмена",
    saveBtn: "Сохранить",
    saving: "Сохранение...",
    createBtn: "Создать",
    creating: "Создание...",
    debtsTitle: "Тетрадь долгов",
    totalOutstandingDebt: "Общий долг клиентов:",
    activeDebtorsCount: "активных должников",
    addDebtorModalTitle: "+ Новый должник",
    searchDebtorPlaceholder: "🔍 Поиск должника (имя, телефон)...",
    onlyWithDebtFilter: "⚠️ Только с долгом",
    payDebtBtn: "Погасить долг",
    addDebtBtn: "Записать долг",
    historyBtn: "История",
    currentDebtBalance: "Баланс долга:",
    payDebtModalTitle: "Прием оплаты долга",
    paymentAmountLabel: "Сумма оплаты (сум) *",
    addDebtModalTitle: "Запись дополнительного долга",
    debtAmountLabel: "Сумма долга (сум) *",
    historyModalTitle: "История операций по долгу",
        addProductBtn: "+ Добавить товар",
    addProductTitle: "Добавление нового товара в базу",
    productNameLabel: "Наименование товара *",
    barcodeLabel: "Штрихкод *",
    scanBarcodeBtn: "Камера сканер",
    categoryLabel: "Категория",
    unitLabel: "Единица измерения",
    purchasePriceLabel: "Цена закупки / Себестоимость (сум)",
    salePriceLabel: "Цена продажи (сум) *",
    stockQtyLabel: "Остаток на складе (кол-во)",
    isQuickLabel: "Быстрый товар на кассе (без штрихкода)",
    pwaBannerTitle: "Установить на домашний экран (Открыть без браузера)",
    pwaBannerDesc: "Чтобы приложение открывалось в отдельном изолированном окне без адресной строки: нажмите Меню браузера (3 точки) ➔ «Добавить на главный экран» (или «Установить приложение»).",
    pwaBannerClose: "Понятно",
    catalogTitle: "Каталог товаров",
    lowStockFilter: "⚠️ Мало на складе",
    syncCatalogBtn: "🔄 Синхр. 2000 SKU",
    colBarcode: "Штрихкод",
    colName: "Наименование",
    colCategory: "Категория",
    colPurchasePrice: "Закупка",
    colSalePrice: "Продажа",
    colStock: "Остаток",
    colStatus: "Статус",
    statusOrderMore: "Заказать",
    statusInNorm: "В норме",
    paginationShown: "Показано:",
    paginationOf: "из",
    prevBtn: "← Назад",
    nextBtn: "Вперед →",
    suppliersTitle: "Поставщики и накладные",
    addSupplierBtn: "+ Новый поставщик",
    addInvoiceBtn: "+ Новая накладная (приход)",
    supplierNameLabel: "Название поставщика *",
    contactPersonLabel: "Контактное лицо",
    addressLabel: "Адрес",
    invoiceNumberLabel: "Номер накладной",
    invoiceItemsLabel: "Список товаров",
    paidAmountLabel: "Оплачено поставщику (сум)",
    debtToSupplierLabel: "Долг перед поставщиком:",
    payInvoiceBtn: "Оплатить накладную",
    invoiceStatusPaid: "Оплачена",
    invoiceStatusPartial: "Частично",
    invoiceStatusPending: "Не оплачена",
    expensesTitle: "Операционные расходы и списания",
    addExpenseBtn: "+ Новый расход",
    spoilageBtn: "⚠️ Списание испорченного товара",
    expenseCategoryLabel: "Категория расхода",
    expenseAmountLabel: "Сумма расхода (сум) *",
    expenseDescLabel: "Описание / Причина *",
    spoilageProductLabel: "Товар для списания *",
    spoilageQtyLabel: "Списываемое количество *",
    analyticsTitle: "Бухгалтерия и финансовая аналитика",
    periodLabel: "Период отчета:",
    periodToday: "Сегодня",
    periodWeek: "Неделя (7 дн)",
    periodMonth: "Месяц (30 дн)",
    periodAll: "Все время",
    kpiRevenue: "Выручка",
    kpiCogs: "Себестоимость (COGS)",
    kpiGrossMargin: "Валовая прибыль",
    kpiNetProfit: "Чистая прибыль",
    kpiMarginPct: "Маржинальность:",
    kpiAvgReceipt: "Ср. чек:",
    kpiReceiptsCount: "чеков",
    kpiCustomerDebt: "Долг покупателей (Всего)",
    paymentsBreakdownTitle: "Выручка по видам оплат",
    expensesBreakdownTitle: "Операционные расходы за период",
    topSellingTitle: "🏆 Топ-5 продаваемых товаров",
    mobileModalTitle: "Открыть на смартфоне (PWA)",
    mobileModalDesc: "Для работы с телефона наведите камеру смартфона на этот QR-код:",
    mobileModalUrlLabel: "Или перейдите в мобильном браузере по ссылке:",
    mobileModalPwaHelp: "Установка на экран: В браузере телефона нажмите меню и выберите 'Добавить на главный экран' (Add to Home screen).",
    themeDark: "Темная тема",
    themeLight: "Светлая тема",
    currency: "сум",
    // Quick items translations
    quick_bread: "Хлеб",
    quick_tandyr_lepeshka: "Тандыр лепешка",
    quick_sugar: "Сахар",
    quick_potatoes: "Картофель",
    quick_onions: "Лук",
    quick_eggs: "Яйца",
  }
};

// Formats number to Uzbek sum with space separators: e.g. "12 500 so'm"

// ------------------- TRANSLITERATION CLIENT HELPERS -------------------
const CYR_TO_LAT_MAP = {
  'ш': 'sh', 'ч': 'ch', 'ё': 'yo', 'ю': 'yu', 'я': 'ya', 'ц': 'ts',
  'ў': "o'", 'ғ': "g'", 'қ': 'q', 'ҳ': 'h', 'х': 'x', 'ж': 'j',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'э': 'e',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
  'ъ': "'", 'ь': '', 'ы': 'i', 'щ': 'sh'
};
function cyrToLat(text) {
  if (!text) return '';
  return text.toLowerCase().split('').map(c => CYR_TO_LAT_MAP[c] || c).join('');
}


// ------------------- SPEECH SYNTHESIS & VOICE HELPERS -------------------
function speakAloud(text, lang = 'uz') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`•\n]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices() || [];
    if (lang === 'ru') {
      const ruVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ru'));
      if (ruVoice) utterance.voice = ruVoice;
      utterance.lang = 'ru-RU';
    } else {
      const uzVoice = voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('uz') || v.lang.toLowerCase().startsWith('tr')));
      if (uzVoice) utterance.voice = uzVoice;
      utterance.lang = uzVoice ? uzVoice.lang : 'ru-RU';
    }
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
}

function VoiceInputBtn({ onResult, lang = 'uz', title = 'Ovozli kiritish', className = '' }) {
  const [listening, setListening] = useState(false);
  const start = (e) => {
    if (e) e.preventDefault();
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(lang === 'uz' ? "Brauzeringizda ovozli kiritish qo'llab-quvvatlanmaydi" : "Голосовой ввод не поддерживается браузером");
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
      rec.continuous = false;
      rec.interimResults = false;
      setListening(true);
      rec.onresult = (ev) => {
        setListening(false);
        const txt = ev.results[0][0].transcript;
        if (txt && onResult) onResult(txt);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
    } catch (err) {
      setListening(false);
    }
  };
  return (
    <button
      type="button"
      onClick={start}
      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center ${
        listening
          ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
      } ${className}`}
      title={title}
    >
      <span>🎙️</span>
    </button>
  );
}

function formatMoney(amount, currency = "so'm") {
  if (amount === undefined || amount === null || isNaN(amount)) return `0 ${currency}`;
  const parts = Math.round(Number(amount)).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${parts.join(".")} ${currency}`;
}

// ------------------- MAIN APPLICATION ROOT -------------------
function App() {
  const [token, setToken] = useState(localStorage.getItem('pos_token') || null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pos_user') || 'null');
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('pos');
  const [notification, setNotification] = useState(null);
  
  // Theme state: 'dark' (default) or 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('pos_theme') || 'dark');
  
  // Language state: 'uz' (default) or 'ru'
  const [lang, setLang] = useState(() => localStorage.getItem('pos_lang') || 'uz');
  
  // Mobile Network QR Modal state
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  
  // Telegram modals
  const [testSendOpen, setTestSendOpen] = useState(false);
  const [zReportOpen, setZReportOpen] = useState(false);
  const [cashierSwitchOpen, setCashierSwitchOpen] = useState(false);
  const [storeAiOpen, setStoreAiOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [pwaBannerDismissed, setPwaBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem('pwa_banner_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      notify(lang === 'uz' ? "Ilova smartfonga o'rnatildi!" : "Приложение успешно установлено!");
    }
    setDeferredPrompt(null);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;
  
  // Multilingual quick items (popular & weight items for 1-click add to cart)
  const quickItems = {
    uz: {
      bread: { name: "Tandir nona", barcode: "20000101001", price: 5000, unit: "dona" },
      tandyr_lepeshka: { name: "Тандыр лепешка", barcode: "20000101002", price: 3000, unit: "dona" },
      sugar: { name: "Сахар", barcode: "20000101003", price: 8000, unit: "kg" },
      potatoes: { name: "Картофель", barcode: "20000101004", price: 4000, unit: "kg" },
      onions: { name: "Лук", barcode: "20000101005", price: 3500, unit: "kg" },
      eggs: { name: "Яйца", barcode: "20000101006", price: 12000, unit: "dona" },
    },
    oz: {
      bread: { name: "Bread", barcode: "20000101001", price: 5000, unit: "dona" },
      tandyr_lepeshka: { name: "Tandyr Lavash", barcode: "20000101002", price: 3000, unit: "dona" },
      sugar: { name: "Sugar", barcode: "20000101003", price: 8000, unit: "kg" },
      potatoes: { name: "Potatoes", barcode: "20000101004", price: 4000, unit: "kg" },
      onions: { name: "Onions", barcode: "20000101005", price: 3500, unit: "kg" },
      eggs: { name: "Eggs", barcode: "20000101006", price: 12000, unit: "dona" },
    },
  };

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('pos_theme', theme);
  }, [theme]);

  // Apply language persistence
  useEffect(() => {
    localStorage.setItem('pos_lang', lang);
  }, [lang]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'uz' ? 'ru' : 'uz'));
  };

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('pos_token', newToken);
    localStorage.setItem('pos_user', JSON.stringify(newUser));
    notify(`${t.welcome}, ${newUser.full_name}!`);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
  };

  if (!token || !user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        notify={notify}
        t={t}
        theme={theme}
        toggleTheme={toggleTheme}
        lang={lang}
        toggleLang={toggleLang}
      />
    );
  }

  const isOwner = user.role === 'owner';

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border text-sm font-semibold transition-all duration-300 ${
            notification.type === 'error'
              ? 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950/90 dark:border-rose-600 dark:text-rose-200'
              : 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-600 dark:text-emerald-200'
          }`}
        >
          <span>{notification.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Network / Mobile QR Modal */}
      {networkModalOpen && (
        <NetworkQrModal onClose={() => setNetworkModalOpen(false)} t={t} />
      )}

      {/* Telegram Modals */}
      {testSendOpen && <TestSendModal onClose={() => setTestSendOpen(false)} t={t} />}
      {/* Cashier Shift Switcher Modal */}
      {cashierSwitchOpen && (
        <CashierSwitchModal
          token={token}
          currentUserId={user?.id || user?.username}
          onClose={() => setCashierSwitchOpen(false)}
          onSwitch={(newToken, newUser) => {
            setToken(newToken);
            setUser(newUser);
            localStorage.setItem('pos_token', newToken);
            localStorage.setItem('pos_user', JSON.stringify(newUser));
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}

      {/* Store AI Assistant Modal */}
      {storeAiOpen && (
        <StoreAiModal
          token={token}
          onClose={() => setStoreAiOpen(false)}
          notify={notify}
          t={t}
          lang={lang}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setStoreAiOpen(false);
          }}
        />
      )}
      {zReportOpen && <ZReportModal onClose={() => setZReportOpen(false)} t={t} />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        {/* Top Control Bar */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-3 py-2">
          {/* Logo & Active Cashier Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                {t.appName}
              </span>
              <button
                type="button"
                onClick={() => setCashierSwitchOpen(true)}
                className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 hover:bg-emerald-200 transition"
                title={lang === 'uz' ? "Smenani almashtirish (1-bosish)" : "Быстрая смена кассира"}
              >
                <span>👤 {user ? user.full_name.split(' ')[0] : 'Kassir'}</span>
                <span className="text-[10px]">🔄</span>
              </button>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            {/* Install PWA Button */}
            {canInstall && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow flex items-center gap-1 transition animate-bounce"
                title={lang === 'uz' ? "Ilovani smartfoningizga o'rnatish" : "Установить на рабочий стол"}
              >
                <span>📲</span>
                <span className="hidden sm:inline">{lang === 'uz' ? "O'rnatish" : "Установить"}</span>
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              type="button"
              onClick={() => setStoreAiOpen(true)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800 transition flex items-center gap-1 shadow-sm"
              title={lang === 'uz' ? "Do'kon AI-Yordamchisi" : "AI-Помощник"}
            >
              <span>🤖</span>
              <span className="hidden md:inline">AI</span>
            </button>

            {/* Mobile QR */}
            <button
              type="button"
              onClick={() => setNetworkModalOpen(true)}
              className="p-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 transition shadow-sm"
              title="Mobil telefon orqali ochish"
            >
              <span>📱</span>
            </button>

            {/* Language Switch */}
            <button
              type="button"
              onClick={toggleLang}
              className="px-2 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 transition"
            >
              <span>{lang === 'uz' ? '🇺🇿 UZ' : '🇷🇺 RU'}</span>
            </button>

            {/* Theme Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-xs bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
              title={t.logout}
            >
              <span>🚪</span>
            </button>
          </div>
        </div>

        {/* Dedicated Horizontal Scrolling Tab Bar */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 bg-slate-50/80 dark:bg-slate-900/80">
          <nav className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${
                activeTab === 'pos'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t.tabPos}
            </button>
            <button
              onClick={() => setActiveTab('debts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${
                activeTab === 'debts'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t.tabDebts}
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${
                activeTab === 'catalog'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t.tabCatalog}
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => setActiveTab('suppliers')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${
                    activeTab === 'suppliers'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.tabSuppliers}
                </button>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${
                    activeTab === 'expenses'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.tabExpenses}
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${
                    activeTab === 'analytics'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.tabAnalytics}
                </button>
              </>
            )}
            <button
              onClick={() => setStoreAiOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition whitespace-nowrap touch-target"
            >
              🤖 {lang === 'uz' ? 'AI Yordamchi' : 'AI Помощник'}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      {/* PWA Standalone Notice Banner */}
      {!pwaBannerDismissed && (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-3 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-4xl">
            <span className="text-base">📲</span>
            <div>
              <span className="font-bold mr-1">{t.pwaBannerTitle || "Ilovani to'liq ekranga o'rnatish:"}</span>
              <span className="opacity-95">{t.pwaBannerDesc || "Brauzer manzil qatorisiz ishlash uchun brauzer menyusida (3 nuqta) «Bosh ekranga qo'shish» tugmasini bosing."}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPwaBannerDismissed(true);
              try { localStorage.setItem('pwa_banner_dismissed', 'true'); } catch (e) {}
            }}
            className="ml-2 bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-0.5 rounded-lg text-[11px] whitespace-nowrap transition"
          >
            ✕ {t.pwaBannerClose || "Tushunarli"}
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4">
        {activeTab === 'pos' && <PosScreen token={token} notify={notify} isOwner={isOwner} t={t} lang={lang} setLang={setLang} toggleLang={toggleLang} />}
        {activeTab === 'debts' && <DebtsScreen token={token} notify={notify} t={t} lang={lang} />}
        {activeTab === 'catalog' && <CatalogScreen token={token} notify={notify} isOwner={isOwner} t={t} lang={lang} />}
        {activeTab === 'suppliers' && isOwner && <SuppliersScreen token={token} notify={notify} t={t} lang={lang} />}
        {activeTab === 'expenses' && isOwner && <ExpensesScreen token={token} notify={notify} t={t} />}
        {activeTab === 'analytics' && isOwner && <AnalyticsScreen token={token} notify={notify} t={t} />}
      </main>
    </div>
  );
}

// ------------------- LOGIN SCREEN -------------------
function LoginScreen({ onLogin, notify, t, theme, toggleTheme, lang, toggleLang }) {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('owner123');
  const [loading, setLoading] = useState(false);

  const submit = async (u, p) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: (u || username).trim(), password: p || password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Avtorizatsiya xatosi / Ошибка авторизации');
      onLogin(data.access_token, {
        username: data.username,
        full_name: data.full_name,
        role: data.role
      });
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-colors duration-200">
        {/* Top Controls: Language and Theme */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleLang}
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {lang === 'uz' ? "🇺🇿 O'zbek" : '🇷🇺 Русский'}
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🛒</div>
          <h1 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{t.loginTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t.loginSubtitle}</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.usernameLabel}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition touch-target text-sm"
          >
            {loading ? t.loggingIn : t.loginBtn}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">{t.quickDemo}</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setUsername('owner'); setPassword('owner123'); submit('owner', 'owner123'); }}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-xl transition text-center font-medium"
            >
              {t.ownerBtn}
            </button>
            <button
              type="button"
              onClick={() => { setUsername('cashier'); setPassword('cashier123'); submit('cashier', 'cashier123'); }}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-xl transition text-center font-medium"
            >
              {t.cashierBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------- NETWORK QR / MOBILE ACCESS MODAL -------------------
function NetworkQrModal({ onClose, t }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/network-info')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span>📲</span>
            <span>{t.mobileModalTitle}</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          {t.mobileModalDesc}
        </p>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">{t.processing}</div>
        ) : data ? (
          <div className="text-center space-y-4">
            {/* SVG QR Code display */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto max-w-[240px]">
              {data.svg_qr ? (
                <div
                  dangerouslySetInnerHTML={{ __html: data.svg_qr }}
                  className="w-48 h-48 mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                />
              ) : (
                <img src="/qr.svg" alt="QR Code" className="w-48 h-48 mx-auto" />
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.mobileModalUrlLabel}
              </div>
              <a
                href={data.mobile_url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 underline break-all bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 inline-block"
              >
                {data.mobile_url}
              </a>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-left text-[11px] text-amber-900 dark:text-amber-200">
              <span className="font-bold">💡 PWA Maslahat: </span>
              {t.mobileModalPwaHelp}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-rose-500">IP manzilni aniqlab bo'lmadi</div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- TELEGRAM MODALS -------------------

function TestSendModal({ onClose, t }) {
  const [customMessage, setCustomMessage] = useState('');
  
  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const message = customMessage || '🧪 Test xabari: GroceryStore POS / Test from GroceryStore POS';
      await fetch('/api/v1/telegram/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      notify('Test xabari yuborildi!');
      setTestSendOpen(false);
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3">🧪 Test xabari</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Xabaringizni kiriting / Enter your message
        </p>
        <div>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Xabar matni..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 resize-none py-3"
            rows={3}
            required
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold">
            Bekor qilish / Cancel
          </button>
          <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow">
            Yuborish / Send
          </button>
        </div>
      </form>
    </div>
  );
}

function ZReportModal({ onClose, t }) {
  const [loading, setLoading] = useState(false);
  
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/v1/telegram/z-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      notify('Z-gesi yuborildi!');
      setZReportOpen(false);
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3">📊 Z-gesi</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Kutilgina yaxlit Z-gesini yuborish
        </p>
        <div className="mt-3">
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition">
            {loading ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </div>
      </form>
    </div>
  );
}


// ------------------- CASHIER SWITCH MODAL (3-4 CASHIERS) -------------------
function CashierSwitchModal({ token, currentUserId, onClose, onSwitch, notify, t, lang }) {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/cashiers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCashiers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelect = async (cashierId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/switch-cashier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashier_id: cashierId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Kassirni almashtirishda xatolik');
      onSwitch(data.access_token, {
        username: data.username,
        full_name: data.full_name,
        role: data.role
      });
      notify(lang === 'uz' ? `Kassir almashtirildi: ${data.full_name}` : `Смена переключена: ${data.full_name}`);
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {t.cashierSwitchTitle || 'Kassirni tanlang (1-bosish)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {lang === 'uz' ? 'Kun davomida smenani almashtirish uchun kassir nomini bosing:' : 'Нажмите на имя кассира для мгновенного переключения смены:'}
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {cashiers.map((c) => {
            const isCurrent = (c.id === currentUserId || c.username === currentUserId);
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                disabled={loading}
                className={`w-full p-3 rounded-2xl flex items-center justify-between transition border text-left touch-target ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{c.role === 'owner' ? '👑' : '👩‍💼'}</span>
                  <div>
                    <div className="text-xs font-bold">{c.full_name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">{c.role} • @{c.username}</div>
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    {lang === 'uz' ? 'Hozirgi' : 'Текущий'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ------------------- CAMERA BARCODE SCANNER MODAL (HTML5QRCODE) ------------
function CameraScannerModal({ onScan, onClose, notify, t, lang }) {
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode = null;
    let isStopped = false;

    const startScanner = async () => {
      try {
        if (window.Html5Qrcode) {
          const formats = window.Html5QrcodeSupportedFormats ? [
            window.Html5QrcodeSupportedFormats.EAN_13,
            window.Html5QrcodeSupportedFormats.EAN_8,
            window.Html5QrcodeSupportedFormats.CODE_128,
            window.Html5QrcodeSupportedFormats.CODE_39,
            window.Html5QrcodeSupportedFormats.QR_CODE,
            window.Html5QrcodeSupportedFormats.UPC_A,
            window.Html5QrcodeSupportedFormats.UPC_E,
            window.Html5QrcodeSupportedFormats.DATA_MATRIX
          ] : undefined;

          html5QrCode = new window.Html5Qrcode('qr-reader', {
            formatsToSupport: formats,
            verbose: false
          });
          scannerRef.current = html5QrCode;
          const config = {
            fps: 20,
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.333333
          };
          await html5QrCode.start(
            { facingMode: facingMode },
            config,
            (decodedText) => {
              if (decodedText && !isStopped) {
                isStopped = true;
                onScan(decodedText);
              }
            },
            () => {}
          );
        }
      } catch (err) {
        console.error('Camera Scanner Error:', err);
        notify(lang === 'uz' ? "Kamera ochilmadi: " + err.message : 'Ошибка камеры: ' + err.message, 'error');
      }
    };

    startScanner();

    return () => {
      isStopped = true;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(e => console.error(e));
      }
    };
  }, [facingMode]);

  const toggleTorch = async () => {
    try {
      if (scannerRef.current && scannerRef.current.applyVideoConstraints) {
        const next = !torchOn;
        await scannerRef.current.applyVideoConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
      }
    } catch (e) {
      console.error('Torch error:', e);
    }
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md p-4 text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <span className="font-bold text-sm text-emerald-400">
              {lang === 'uz' ? 'Shtrixkod skaneri (EAN-13 / QR / 1D)' : 'Сканер штрихкодов (EAN-13 / QR)'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full"></div>
          {/* Target Box Reticle */}
          <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
            <div className="laser-line"></div>
            <div className="text-[10px] text-emerald-300 font-mono absolute bottom-2 bg-black/60 px-2 py-0.5 rounded">
              {lang === 'uz' ? "Shtrixkodni ramkaga to'g'rilang" : 'Наведите на штрихкод'}
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-around gap-2 mt-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={toggleTorch}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              torchOn ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🔦</span>
            <span>{torchOn ? (lang === 'uz' ? "Fonarni o'chirish" : 'Выкл фонарик') : (lang === 'uz' ? 'Fonar (Chiroq)' : 'Вкл фонарик')}</span>
          </button>

          <button
            type="button"
            onClick={flipCamera}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            <span>🔄</span>
            <span>{lang === 'uz' ? "Kamera almashtirish" : 'Сменить камеру'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


// ------------------- CREATE / EDIT PRODUCT MODAL -------------------
function CreateProductModal({ token, initialBarcode = '', onClose, onSuccess, notify, t, lang }) {
  const [barcode, setBarcode] = useState(initialBarcode);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [unit, setUnit] = useState('dona');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [isQuick, setIsQuick] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/categories/all`);
      const data = await res.json();
      setCategories(data || []);
      if (data && data.length > 0 && !categoryId) {
        setCategoryId(data[0].id.toString());
      }
    } catch (e) {}
  };

  const startVoiceName = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify(lang === 'uz' ? "Ovozli kiritish qo'llab-quvvatlanmaydi" : "Голосовой ввод не поддерживается", 'error');
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.lang = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
      setVoiceActive(true);
      notify(lang === 'uz' ? "Eshitilmoqda... tovar nomini ayting" : "Слушаю... назовите товар", 'info');
      rec.onresult = (e) => {
        setVoiceActive(false);
        const spoken = e.results[0][0].transcript;
        setName(spoken);
      };
      rec.onerror = () => setVoiceActive(false);
      rec.onend = () => setVoiceActive(false);
      rec.start();
    } catch (e) {
      setVoiceActive(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!barcode.trim() || !name.trim() || !salePrice) {
      notify(lang === 'uz' ? "Shtrixkod, nom va sotish narxini to'ldiring" : "Заполните штрихкод, название и цену", 'error');
      return;
    }
    setLoading(true);
    try {
      const pPrice = Number(purchasePrice) || Math.round(Number(salePrice) * 0.75);
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          barcode: barcode.trim(),
          name: name.trim(),
          category_id: categoryId ? Number(categoryId) : null,
          unit: unit || 'dona',
          purchase_price: pPrice,
          sale_price: Number(salePrice),
          stock_quantity: Number(stockQuantity) || 0,
          is_quick: Boolean(isQuick)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Mahsulot yaratishda xatolik');
      notify(lang === 'uz' ? `Tovar qo'shildi: ${name}` : `Товар добавлен: ${name}`);
      onSuccess(data);
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">➕</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {t.addProductTitle || "Yangi tovar qo'shish"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Barcode with Camera Scan button */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.barcodeLabel || "Shtrixkod *"}
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="4607000000001"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
              <VoiceInputBtn onResult={(txt) => setBarcode(txt.replace(/\D/g, ''))} lang={lang} title="Shtrixkodni ovoz bilan aytish" />
              <button
                type="button"
                onClick={() => setCameraActive(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <span>📷</span>
                <span className="hidden sm:inline">{lang === 'uz' ? "Kamera" : "Скан"}</span>
              </button>
            </div>
          </div>

          {/* Product Name with Voice Search button */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.productNameLabel || "Mahsulot nomi *"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buxanka non oq / Coca-Cola 1.5L"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={startVoiceName}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  voiceActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
                title="Ovoz bilan aytish"
              >
                <span>🎙️</span>
              </button>
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.categoryLabel || "Kategoriya"}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name.split('/')[0].trim()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.unitLabel || "Birlik"}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="dona">dona (шт)</option>
                <option value="kg">kg (кг)</option>
                <option value="l">l (литр)</option>
                <option value="quti">quti (пачка/коробка)</option>
                <option value="metr">metr (метр)</option>
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.purchasePriceLabel || "Kirim narxi (so'm)"}
              </label>
              <input
                type="number"
                placeholder="4000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.salePriceLabel || "Sotish narxi (so'm) *"}
              </label>
              <input
                type="number"
                placeholder="5500"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                required
              />
            </div>
          </div>

          {/* Stock & Quick toggle */}
          <div className="grid grid-cols-2 gap-2 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.stockQtyLabel || "Boshlang'ich qoldiq"}
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isQuick}
                  onChange={(e) => setIsQuick(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>⚡ Tezkor tovar (Kassa)</span>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
            >
              {loading ? t.saving : t.saveBtn}
            </button>
          </div>
        </form>
      </div>

      {cameraActive && (
        <CameraScannerModal
          onScan={(scanned) => {
            setBarcode(scanned);
            setCameraActive(false);
            notify((lang === 'uz' ? "Shtrixkod o'qildi: " : "Штрихкод считан: ") + scanned);
          }}
          onClose={() => setCameraActive(false)}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}
    </div>
  );
}

// ------------------- VOICE DEBT RECORDING MODAL (HAQQIM.UZ) ----------------
function VoiceDebtModal({ token, onClose, onSuccess, notify, t, lang }) {
  const [speechText, setSpeechText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify(lang === 'uz' ? "Brauzeringiz ovoz yozishni qo'llab-quvvatlamaydi" : 'Голосовой ввод не поддерживается', 'error');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
      recognition.interimResults = false;
      setIsListening(true);

      recognition.onresult = async (event) => {
        setIsListening(false);
        const text = event.results[0][0].transcript;
        setSpeechText(text);
        await parseVoice(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const parseVoice = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/parse-debt-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speech_text: text, language: lang })
      });
      const data = await res.json();
      setParsedData(data);
    } catch (e) {
      notify('NLP parsing xatosi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedData || !parsedData.debtor_name || !parsedData.amount) {
      notify('Mijoz va summa aniqlanmadi', 'error');
      return;
    }
    setLoading(true);
    try {
      let debtorId = parsedData.debtor_id;
      if (!debtorId) {
        const createRes = await fetch(`${API_BASE}/debts/debtors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            full_name: parsedData.debtor_name,
            due_date: parsedData.due_date || null,
            note: parsedData.note || 'Ovozli yozuv',
            initial_debt: Number(parsedData.amount)
          })
        });
        const created = await createRes.json();
        debtorId = created.id;
      } else {
        await fetch(`${API_BASE}/debts/debtors/${debtorId}/add-debt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            amount: Number(parsedData.amount),
            due_date: parsedData.due_date || null,
            note: parsedData.note || 'Ovozli yozuv'
          })
        });
      }
      notify(lang === 'uz' ? `Qarz saqlandi: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})` : `Долг сохранен: ${parsedData.debtor_name}`);
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {lang === 'uz' ? 'Ovozli qarz yozish (Haqqim.uz)' : 'Голосовая запись долга'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {lang === 'uz' ? 'Mikrofonni bosing va ayting:' : 'Нажмите на микрофон и произнесите:'}
          </p>
          <div className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            «Alisher 50 ming so'm nonga oldi, dushanba beradi»
          </div>

          <button
            type="button"
            onClick={startListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition mx-auto shadow-lg ${
              isListening ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            <span>🎙️</span>
          </button>
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2">
            {isListening ? (lang === 'uz' ? 'Eshitilmoqda... gapiring' : 'Слушаю... говорите') : (lang === 'uz' ? 'Mikrofonni yoqish' : 'Включить микрофон')}
          </div>
        </div>

        {speechText && (
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Aytilgan matn:</label>
            <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-800 dark:text-slate-200">
              "{speechText}"
            </div>
          </div>
        )}

        {parsedData && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2 mb-4">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
              <span>✨</span>
              <span>{lang === 'uz' ? "Aniqlangan ma'lumotlar:" : 'Распознанные данные:'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Mijoz: </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{parsedData.debtor_name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Summa: </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{formatMoney(parsedData.amount)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Muddat: </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{parsedData.due_date_label || parsedData.due_date || 'Belgilanmagan'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Izoh: </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{parsedData.note || '-'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {t.cancelBtn}
          </button>
          <button
            type="button"
            disabled={!parsedData || loading}
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
          >
            {loading ? t.saving : (lang === 'uz' ? 'Qarzni yozish' : 'Записать долг')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- PAPER DEBT NOTEBOOK OCR MODAL ------------------------
function OcrDebtNotebookModal({ token, onClose, onSuccess, notify, t, lang }) {
  const [ocrText, setOcrText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      if (window.Tesseract) {
        const worker = await window.Tesseract.createWorker(lang === 'uz' ? 'eng' : 'rus');
        const ret = await worker.recognize(file);
        await worker.terminate();
        setOcrText(ret.data.text);
        await parseText(ret.data.text);
      } else {
        notify('OCR kutubxonasi yuklanmoqda...', 'info');
      }
    } catch (err) {
      console.error(err);
      notify("Rasm matnini o'qishda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  const parseText = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/parse-debt-ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text })
      });
      const data = await res.json();
      setParsedRows(data.items || []);
    } catch (err) {
      notify('Matnni tahlil qilishda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (idx, field, val) => {
    setParsedRows(prev => {
      const copy = [...prev];
      copy[idx][field] = field === 'amount' ? Number(val) : val;
      return copy;
    });
  };

  const removeRow = (idx) => {
    setParsedRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleImportAll = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    try {
      for (const row of parsedRows) {
        if (!row.debtor_name || !row.amount) continue;
        if (row.matched_debtor_id) {
          await fetch(`${API_BASE}/debts/debtors/${row.matched_debtor_id}/add-debt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ amount: Number(row.amount), note: row.note || 'Daftardan kiritildi' })
          });
        } else {
          await fetch(`${API_BASE}/debts/debtors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              full_name: row.debtor_name,
              initial_debt: Number(row.amount),
              note: row.note || "Qog'oz daftardan"
            })
          });
        }
      }
      notify(lang === 'uz' ? `${parsedRows.length} ta qarz bazaga kiritildi!` : `Импортировано ${parsedRows.length} долгов!`);
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {lang === 'uz' ? "Qog'oz daftardan rasm olish (OCR)" : 'Фото-сканер тетради долгов'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
          >
            <span>📷</span>
            <span>{lang === 'uz' ? 'Kameradan rasmga olish / Yuklash' : 'Сделать фото / Загрузить'}</span>
          </button>
          {loading && <span className="text-xs text-emerald-600 font-semibold animate-pulse">{t.processing}</span>}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
          {parsedRows.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6">
              {lang === 'uz' ? "Eski qog'oz daftaringiz sahifasini rasmga oling. Sun'iy intellekt mijozlar ismlari va qarz summalarini avtomatik jadvalga ajratadi." : 'Сфотографируйте страницу бумажной тетради долгов. ИИ автоматически выделит имена и суммы.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2">Mijoz ismi</th>
                  <th className="py-2">Summa (so'm)</th>
                  <th className="py-2">Izoh</th>
                  <th className="py-2 text-right">O'chirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parsedRows.map((r, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={r.debtor_name}
                        onChange={(e) => updateRow(i, 'debtor_name', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        value={r.amount}
                        onChange={(e) => updateRow(i, 'amount', e.target.value)}
                        className="w-28 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-600"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={r.note || ''}
                        onChange={(e) => updateRow(i, 'note', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 text-right">
                      <button
                        onClick={() => removeRow(i)}
                        className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">{t.cancelBtn}</button>
          <button
            onClick={handleImportAll}
            disabled={parsedRows.length === 0 || loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
          >
            {lang === 'uz' ? `Barchasini kiritish (${parsedRows.length} ta)` : `Импортировать все (${parsedRows.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- INVOICE PHOTO SCANNER MODAL (KIRIM) -------------------
function OcrInvoiceModal({ token, suppliers, onClose, onSuccess, notify, t, lang }) {
  const [supplierId, setSupplierId] = useState(suppliers.length > 0 ? suppliers[0].id : '');
  const [parsedItems, setParsedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      if (window.Tesseract) {
        const worker = await window.Tesseract.createWorker(lang === 'uz' ? 'eng' : 'rus');
        const ret = await worker.recognize(file);
        await worker.terminate();
        await parseInvoiceText(ret.data.text);
      }
    } catch (err) {
      notify("Fakturani o'qishda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  const parseInvoiceText = async (text) => {
    try {
      const res = await fetch(`${API_BASE}/ai/parse-invoice-ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text })
      });
      const data = await res.json();
      setParsedItems(data.items || []);
    } catch (err) {
      notify("Faktura qatorlarini ajratib bo'lmadi", 'error');
    }
  };

  const updateItem = (idx, field, val) => {
    setParsedItems(prev => {
      const copy = [...prev];
      copy[idx][field] = Number(val);
      copy[idx].total_price = Math.round(copy[idx].quantity * copy[idx].purchase_price);
      return copy;
    });
  };

  const handleSaveInvoice = async () => {
    if (parsedItems.length === 0 || !supplierId) return;
    setLoading(true);
    try {
      const payload = {
        supplier_id: Number(supplierId),
        items: parsedItems.map(it => ({
          product_id: it.matched_product_id || 1,
          quantity: Number(it.quantity),
          purchase_price: Number(it.purchase_price)
        })),
        paid_amount: 0
      };
      const res = await fetch(`${API_BASE}/suppliers/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Yuk xatini saqlashda xatolik');
      notify(lang === 'uz' ? 'Faktura omborga muvaffaqiyatli qabul qilindi!' : 'Накладная успешно принята на склад!');
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📑</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {lang === 'uz' ? 'Faktura / Yuk xatini skanerlash' : 'Фото-сканер накладных (Kirim)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-slate-500">Ta'minotchi:</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
          >
            📷 {lang === 'uz' ? 'Rasmga olish' : 'Сделать фото'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
          {parsedItems.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6">
              {lang === 'uz' ? "Qog'oz faktura / yuk xatini rasmga oling. Tovar nomlari, soni va kirim narxlari avtomatik jadvalga olinadi." : 'Сфотографируйте бумажную накладную. Товары, количество и цены будут извлечены.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2">Tovar</th>
                  <th className="py-2">Miqdor</th>
                  <th className="py-2">Kirim narxi</th>
                  <th className="py-2">Jami</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parsedItems.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 pr-2 font-medium">{it.product_name}</td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        value={it.purchase_price}
                        onChange={(e) => updateItem(idx, 'purchase_price', e.target.value)}
                        className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 text-xs font-mono"
                      />
                    </td>
                    <td className="py-1.5 font-bold font-mono text-emerald-600">{formatMoney(it.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">{t.cancelBtn}</button>
          <button
            onClick={handleSaveInvoice}
            disabled={parsedItems.length === 0 || loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
          >
            {lang === 'uz' ? 'Omborga qabul qilish' : 'Принять на склад'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- STORE AI ASSISTANT MODAL -----------------------------
function StoreAiModal({ token, onClose, notify, t, lang, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'uz'
        ? "Salom! Men sizning do'kon AI-yordamchingizman. Savdolar, qarzlar, ombor qoldiqlari yoki tamaki do'koniga moslashtirish bo'yicha savollaringiz bo'lsa, so'rang!"
        : "Здравствуйте! Я ваш умный AI-помощник магазина. Отвечу на любые вопросы по выручке, долгам, остаткам или тиражированию кассы под табачный магазин."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendQuery = async (queryText) => {
    const q = queryText || input;
    if (!q.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language: lang })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer,
          suggestions: data.quick_suggestions || [],
          actionType: data.action_type
        }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Kechirasiz, xatolik yuz berdi.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-slate-800 dark:text-slate-100 h-[600px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {lang === 'uz' ? "Do'kon AI-Yordamchisi" : 'AI-Помощник магазина'}
              </h3>
              <p className="text-[10px] text-emerald-600 font-bold">100% Bepul & Avtonom</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-xs">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700/60'
              }`}>
                {m.text}
              </div>

              {m.suggestions && m.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendQuery(sug)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <div className="text-xs text-slate-400 animate-pulse">AI javob yozmoqda...</div>}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendQuery(); }} className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === 'uz' ? 'Savolingizni yozing...' : 'Напишите ваш вопрос...'}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow disabled:opacity-40"
          >
            Yuborish
          </button>
        </form>
      </div>
    </div>
  );
}

// ------------------- POS TERMINAL SCREEN -------------------
function PosScreen({ token, notify, isOwner, t, lang: propLang, setLang: propSetLang, toggleLang: propToggleLang }) {
  const lang = propLang || (typeof window !== 'undefined' && window.pos_lang) || (typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang')) || 'uz';
  const setLang = propSetLang || (typeof window !== 'undefined' && window.setPosLang) || ((val) => {
    try {
      const next = typeof val === 'function' ? val(lang) : val;
      localStorage.setItem('pos_lang', next);
      if (typeof window !== 'undefined') window.pos_lang = next;
      window.location.reload();
    } catch (e) {}
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutInitialMethod, setCheckoutInitialMethod] = useState('CASH');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [quickProducts, setQuickProducts] = useState([]);
  const [notFoundBarcode, setNotFoundBarcode] = useState(null);
  const [createProductOpen, setCreateProductOpen] = useState(false);

  // Parked / Held Carts (MoySklad Queue)
  const [parkedCarts, setParkedCarts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pos_parked_carts') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [parkedModalOpen, setParkedModalOpen] = useState(false);

  // Quick Banknotes & Change Calculation (1C / MoySklad style)
  const [selectedCashReceived, setSelectedCashReceived] = useState(null);

  // Master Voice AI Assistant state
  const [voiceAiActive, setVoiceAiActive] = useState(false);
  const [voiceAiSpeaking, setVoiceAiSpeaking] = useState(false);

  const barcodeInputRef = useRef(null);

  const QUICK_ITEMS = [
    { id: 'q_tandir', name: "Tandir non", price: 4000, icon: '🫓', barcode: 'NON_TANDIR' },
    { id: 'q_buxanka', name: "Buxanka non", price: 3000, icon: '🍞', barcode: 'NON_BUXANKA' },
    { id: 'q_paket_katta', name: "Paket (katta)", price: 1000, icon: '🛍️', barcode: 'PAKET_KAT' },
    { id: 'q_paket_kichik', name: "Paket (kichik)", price: 500, icon: '🛍️', barcode: 'PAKET_KICH' },
    { id: 'q_tuxum', name: "Tuxum (1 dona)", price: 2000, icon: '🥚', barcode: 'TUXUM_1' },
    { id: 'q_lavash', name: "Lavash xamiri", price: 5000, icon: '🌯', barcode: 'LAVASH' },
    { id: 'q_suv', name: "Gazsiz suv 0.5L", price: 3000, icon: '💧', barcode: 'SUV_05' },
    { id: 'q_shakar', name: "Shakar (1 kg)", price: 9000, icon: '🍚', barcode: 'SHAKAR_1' },
    { id: 'q_sigaret', name: "Sigaret (Winston)", price: 22000, icon: '🚬', barcode: 'SIG_WINSTON' },
    { id: 'q_zajigalka', name: "Zajigalka (Chaqmoq)", price: 3000, icon: '🔥', barcode: 'ZAJIGALKA' }
  ];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchQuickProducts();
  }, [selectedCategory, search]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/categories/all`);
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({ limit: '24' });
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory.toString());

      const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuickProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/quick`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setQuickProducts(data);
      }
    } catch (e) {
      console.error('Quick products fetch error:', e);
    }
  };

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.25;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.12);
    } catch (e) {}
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  }, [cart]);

  // When total changes, sync quick cash banknote if exact was selected
  const cashGiven = selectedCashReceived !== null ? selectedCashReceived : cartTotal;
  const cashChange = Math.max(0, cashGiven - cartTotal);

  // ------------------- HOTKEYS LISTENER (1C:Retail Style) -------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept function keys if a modal is open
      if (e.key === 'F2') {
        e.preventDefault();
        if (barcodeInputRef.current) barcodeInputRef.current.focus();
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (cart.length > 0) handleDirectCheckout('CASH');
      } else if (e.key === 'F6') {
        e.preventDefault();
        if (cart.length > 0) handleDirectCheckout('CARD');
      } else if (e.key === 'F7') {
        e.preventDefault();
        if (cart.length > 0) handleDirectCheckout('DEBT');
      } else if (e.key === 'F12') {
        e.preventDefault();
        if (cart.length > 0) setCheckoutModalOpen(true);
      } else if (e.key === 'Escape') {
        if (checkoutModalOpen) setCheckoutModalOpen(false);
        else if (scannerActive) setScannerActive(false);
        else if (parkedModalOpen) setParkedModalOpen(false);
        else if (cart.length > 0) parkCurrentCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, cartTotal, checkoutModalOpen, scannerActive, parkedModalOpen, parkedCarts]);

  // ------------------- PARK / HOLD CART QUEUE -------------------
  const parkCurrentCart = () => {
    if (cart.length === 0) {
      notify(lang === 'uz' ? "Savat bo'sh, saqlashga tovar yo'q" : "Корзина пуста", 'warn');
      return;
    }
    const newHold = {
      id: Date.now().toString().slice(-5),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: cart,
      total: cartTotal,
      itemCount: cart.reduce((sum, it) => sum + it.quantity, 0)
    };
    const updated = [newHold, ...parkedCarts].slice(0, 10);
    setParkedCarts(updated);
    try { localStorage.setItem('pos_parked_carts', JSON.stringify(updated)); } catch (e) {}
    setCart([]);
    setSelectedCashReceived(null);
    notify(lang === 'uz' ? `Chek #${newHold.id} saqlandi` : `Чек #${newHold.id} отложен`, 'info');
    speakAloud(lang === 'uz' ? "Chek saqlandi" : "Чек отложен", lang);
  };

  const resumeParkedCart = (heldId) => {
    const found = parkedCarts.find(h => h.id === heldId);
    if (!found) return;
    if (cart.length > 0) {
      const autoPark = {
        id: Date.now().toString().slice(-5),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: cart,
        total: cartTotal,
        itemCount: cart.reduce((sum, it) => sum + it.quantity, 0)
      };
      const updated = [autoPark, ...parkedCarts.filter(h => h.id !== heldId)];
      setParkedCarts(updated);
      try { localStorage.setItem('pos_parked_carts', JSON.stringify(updated)); } catch (e) {}
    } else {
      const updated = parkedCarts.filter(h => h.id !== heldId);
      setParkedCarts(updated);
      try { localStorage.setItem('pos_parked_carts', JSON.stringify(updated)); } catch (e) {}
    }
    setCart(found.items);
    setSelectedCashReceived(null);
    setParkedModalOpen(false);
    notify(lang === 'uz' ? `Chek #${heldId} tiklandi` : `Чек #${heldId} восстановлен`, 'success');
    speakAloud(lang === 'uz' ? "Chek tiklandi" : "Чек восстановлен", lang);
  };

  const removeParkedCart = (heldId) => {
    const updated = parkedCarts.filter(h => h.id !== heldId);
    setParkedCarts(updated);
    try { localStorage.setItem('pos_parked_carts', JSON.stringify(updated)); } catch (e) {}
  };

  // ------------------- MASTER VOICE AI ASSISTANT & COMMAND ROUTER -------------------
  const startMasterVoiceAI = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify(lang === 'uz' ? "Brauzeringiz ovozli boshqaruvni qo'llab-quvvatlamaydi" : "Голосовой ввод не поддерживается", 'error');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
      recognition.continuous = false;
      recognition.interimResults = false;
      setVoiceAiActive(true);
      notify(lang === 'uz' ? "🎙️ Eshitilmoqda... Buyruqni ayting (skaner, tovar qo'shish, qarz, foyda)" : "🎙️ Слушаю команду (сканер, добавить товар, долг, прибыль)...", 'info');

      recognition.onresult = async (e) => {
        setVoiceAiActive(false);
        const spoken = e.results[0][0].transcript;
        if (!spoken) return;
        await handleVoiceCommand(spoken);
      };
      recognition.onerror = () => setVoiceAiActive(false);
      recognition.onend = () => setVoiceAiActive(false);
      recognition.start();
    } catch (err) {
      setVoiceAiActive(false);
      notify(err.message, 'error');
    }
  };

  const handleVoiceCommand = async (speechText) => {
    try {
      notify((lang === 'uz' ? "Bajarilmoqda: " : "Обработка: ") + speechText, 'info');
      const res = await fetch(`${API_BASE}/ai/voice-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          speech_text: speechText,
          language: lang,
          context: 'pos'
        })
      });
      const data = await res.json();

      if (data.voice_text) {
        speakAloud(data.voice_text, lang);
      }

      if (data.action === 'open_scanner') {
        setScannerActive(true);
      } else if (data.action === 'add_to_cart' && data.data && data.data.product) {
        addToCart(data.data.product, data.data.quantity || 1.0);
        playBeep();
        notify(data.answer, 'success');
      } else if (data.action === 'clear_cart') {
        setCart([]);
        notify(lang === 'uz' ? "Savat tozalandi" : "Корзина очищена");
      } else if (data.action === 'checkout') {
        if (cart.length > 0) setCheckoutModalOpen(true);
      } else if (data.action === 'product_not_found') {
        setNotFoundBarcode(data.data ? data.data.query : speechText);
      } else {
        notify(data.answer, 'info');
      }
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleBarcodeSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = barcodeQuery.trim();
    if (!code) return;
    await processBarcode(code);
  };

  const processBarcode = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/products/barcode/${encodeURIComponent(code)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        playBeep();
        setNotFoundBarcode(code);
        setBarcodeQuery('');
        return;
      }
      const prod = await res.json();
      playBeep();
      const qty = prod.detected_weight ? Number(prod.detected_weight) : 1.0;
      addToCart(prod, qty);
      if (prod.detected_weight) {
        notify((lang === 'uz' ? "Vazn aniqlandi: " : "Вес с весов: ") + qty + " kg");
      } else {
        notify(prod.name);
      }
      setBarcodeQuery('');
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const addToCart = (product, quantity = 1.0) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.round((item.quantity + quantity) * 100) / 100 }
            : item
        );
      }
      return [...prev, { product, quantity: Math.round(quantity * 100) / 100 }];
    });
  };

  const addQuickItem = (item) => {
    playBeep();
    const prod = {
      id: item.id || item.barcode,
      name: item.name,
      barcode: item.barcode,
      sale_price: item.sale_price !== undefined ? item.sale_price : item.price,
      purchase_price: item.purchase_price !== undefined ? item.purchase_price : Math.round((item.sale_price || item.price) * 0.75),
      unit: item.unit || 'dona',
      stock_quantity: item.stock_quantity !== undefined ? item.stock_quantity : 999
    };
    addToCart(prod, 1.0);
    notify(item.name + " (+1)");
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = Math.round((item.quantity + delta) * 100) / 100;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const setItemExactQty = (productId, newQty) => {
    const parsed = parseFloat(newQty);
    if (isNaN(parsed) || parsed <= 0) return;
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: parsed } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCashReceived(null);
  };

  // Direct 1-Click Checkout Handler
  const handleDirectCheckout = async (paymentMethod) => {
    if (cart.length === 0) return;
    if (paymentMethod === 'DEBT') {
      setCheckoutInitialMethod('DEBT');
      setCheckoutModalOpen(true);
      return;
    }
    setDirectLoading(true);
    try {
      const cashVal = paymentMethod === 'CASH' ? cashGiven : 0;
      const payload = {
        items: cart.map((i) => ({
          product_id: typeof i.product.id === 'number' ? i.product.id : null,
          barcode: i.product.barcode,
          name: i.product.name,
          price: i.product.sale_price,
          quantity: i.quantity
        })),
        payment_method: paymentMethod,
        cash_received: cashVal,
        card_amount: paymentMethod === 'CARD' ? cartTotal : 0,
        debt_amount: 0
      };

      const res = await fetch(`${API_BASE}/pos/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "To'lovda xatolik");

      playBeep();
      setCart([]);
      setSelectedCashReceived(null);
      setSuccessToast({
        receiptNumber: data.receipt_number,
        total: cartTotal,
        change: data.change_given,
        method: data.payment_method,
        data: data
      });
      setTimeout(() => setSuccessToast(null), 6000);
      
      const spkMsg = paymentMethod === 'CASH'
        ? (lang === 'uz' ? `Xarid yakunlandi. Qaytim: ${formatMoney(data.change_given)}` : `Покупка завершена. Сдача: ${formatMoney(data.change_given)}`)
        : (lang === 'uz' ? "Karta orqali to'lov qabul qilindi" : "Оплата картой принята");
      speakAloud(spkMsg, lang);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDirectLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Success Non-blocking Toast Banner */}
      {successToast && (
        <div className="bg-emerald-600 text-white rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 animate-fade-in border border-emerald-400">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-extrabold text-xs sm:text-sm">
                {lang === 'uz' ? "Xarid muvaffaqiyatli yakunlandi!" : "Покупка успешно завершена!"} #{successToast.receiptNumber}
              </div>
              <div className="text-[11px] opacity-90 font-mono">
                {formatMoney(successToast.total)} ({successToast.method})
                {successToast.change > 0 && (
                  <span className="ml-2 font-black text-amber-200">
                    {lang === 'uz' ? "Qaytim:" : "Сдача:"} {formatMoney(successToast.change)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setLastReceipt(successToast.data)}
            className="bg-white text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>{t.printReceiptOptional || "Chekni chop etish"}</span>
          </button>
        </div>
      )}

      {/* MoySklad 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        
        {/* LEFT COLUMN: Input tools + Quick items + Dense Cart Table (7-8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          
          {/* Top Barcode, Search & Voice AI Command Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-col sm:flex-row gap-2 transition-colors duration-200">
            {/* Barcode input & Submit */}
            <form onSubmit={handleBarcodeSubmit} className="flex-1 flex gap-1.5 items-center">
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder={t.barcodeScanPlaceholder || "Shtrixkodni kiriting (F2)..."}
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition"
                title="Shtrixkodni qidirish"
              >
                ↵
              </button>
            </form>

            <div className="flex items-center gap-1.5">
              {/* Universal Voice Input Button for Barcode/Search */}
              <VoiceInputBtn
                onResult={(txt) => setBarcodeQuery(txt.replace(/\D/g, ''))}
                lang={lang}
                title="Shtrixkodni ovoz bilan aytish"
              />

              {/* Master AI Voice Assistant Button with Speech Synthesis */}
              <button
                type="button"
                onClick={startMasterVoiceAI}
                className={`font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5 touch-target ${
                  voiceAiActive
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                }`}
                title={lang === 'uz' ? "Ovozli AI boshqaruv (O'zbek / Rus): 'Skanerni och', '2 ta non qo'sh', 'qarz yoz'" : "Голосовой AI ассистент"}
              >
                <span>🤖🎙️</span>
                <span className="hidden sm:inline font-extrabold">{lang === 'uz' ? "AI Ovoz" : "AI Голос"}</span>
              </button>

              {/* Camera Scanner Button */}
              <button
                type="button"
                onClick={() => setScannerActive(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5 touch-target"
                title={lang === 'uz' ? "Kamera orqali shtrixkod skaneri" : "Сканер через камеру"}
              >
                <span>📷</span>
                <span className="hidden sm:inline">{lang === 'uz' ? "Skaner" : "Скан"}</span>
              </button>
            </div>

            {/* Fast Product Search Input */}
            <div className="flex items-center gap-1 w-full sm:w-44">
              <input
                type="text"
                placeholder={t.searchProductPlaceholder || "Tovar nomi..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <VoiceInputBtn onResult={(txt) => setSearch(txt)} lang={lang} title="Tovar nomini ovoz bilan qidirish" />
            </div>
          </div>

          {/* Quick 1-Click Items Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>⚡</span>
                <span>{lang === 'uz' ? "Tezkor tovarlar (Shtrixkodsiz 1-bosish):" : "Быстрые товары (без штрихкода):"}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAllCatalog(!showAllCatalog)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                {showAllCatalog
                  ? (lang === 'uz' ? "Yashirish" : "Скрыть каталог")
                  : (lang === 'uz' ? "Barcha tovarlar (2000+)" : "Показать все товары")}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(quickProducts.length > 0 ? quickProducts : QUICK_ITEMS).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addQuickItem(item)}
                  className="bg-emerald-50/80 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-emerald-200 dark:border-slate-700 rounded-xl p-2 text-left transition flex items-center gap-2 touch-target shadow-sm"
                >
                  <span className="text-xl">{item.icon || '⚡'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatMoney(item.sale_price || item.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Professional Dense Cart Table (MoySklad style) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>🧾</span>
                  <span>{lang === 'uz' ? "Faol savdo cheki" : "Текущий чек"}</span>
                </span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full font-mono">
                  {cart.length} {lang === 'uz' ? "pozitsiya" : "поз"}
                </span>
              </div>

              {/* Parked Carts Queue Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={parkCurrentCart}
                  disabled={cart.length === 0}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition disabled:opacity-40 flex items-center gap-1"
                  title="Xaridorni navbatga qo'yib boshqasiga o'tish (Esc)"
                >
                  <span>⏸️</span>
                  <span>{lang === 'uz' ? "Chekni saqlash (Esc)" : "Отложить чек (Esc)"}</span>
                </button>

                {parkedCarts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setParkedModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1 animate-pulse"
                  >
                    <span>📂</span>
                    <span>{lang === 'uz' ? `Saqlanganlar (${parkedCarts.length})` : `Отложенные (${parkedCarts.length})`}</span>
                  </button>
                )}

                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded-lg"
                    title="Savatni tozalash"
                  >
                    🗑️ {t.clearCart || "Tozalash"}
                  </button>
                )}
              </div>
            </div>

            {/* Dense Table */}
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                  <span className="text-3xl mb-1.5 opacity-60">🛒</span>
                  <p className="font-semibold text-slate-600 dark:text-slate-400">
                    {lang === 'uz' ? "Chek bo'sh. Mahsulot shtrixkodini skanerlang yoki tezkor tovarlardan tanlang." : "Чек пуст. Отсканируйте штрихкод или выберите товар."}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hotkeys: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">F2</span> Qidiruv | <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">F5</span> Naqd | <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">F6</span> Karta | <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Esc</span> Saqlash
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 backdrop-blur">
                    <tr>
                      <th className="px-3 py-2 w-8">#</th>
                      <th className="px-3 py-2">{lang === 'uz' ? "Mahsulot nomi" : "Наименование"}</th>
                      <th className="px-3 py-2 text-right">{lang === 'uz' ? "Narxi" : "Цена"}</th>
                      <th className="px-3 py-2 text-center w-32">{lang === 'uz' ? "Miqdor" : "Кол-во"}</th>
                      <th className="px-3 py-2 text-right">{lang === 'uz' ? "Jami" : "Сумма"}</th>
                      <th className="px-2 py-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    {cart.map((item, idx) => {
                      const itemTotal = item.product.sale_price * item.quantity;
                      return (
                        <tr key={item.product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="px-3 py-2 text-[11px] text-slate-400 font-mono">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">{item.product.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.product.barcode}</div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {formatMoney(item.product.sale_price)}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, -1)}
                                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                step="any"
                                value={item.quantity}
                                onChange={(e) => setItemExactQty(item.product.id, e.target.value)}
                                className="w-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold font-mono text-xs py-0.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, 1)}
                                className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {formatMoney(itemTotal)}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-slate-400 hover:text-rose-600 text-xs p-1"
                              title="O'chirish"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Big Numbers + Quick Banknotes + Checkout Actions (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors duration-200 sticky top-20">
          
          {/* Big Monospace Total Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              {lang === 'uz' ? "Jami to'lov miqdori" : "Итого к оплате"}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatMoney(cartTotal)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-2">
              <span>{cart.length} {lang === 'uz' ? "ta mahsulot" : "товаров"}</span>
              <span>•</span>
              <span>{cart.reduce((sum, it) => sum + it.quantity, 0)} {lang === 'uz' ? "dona" : "шт"}</span>
            </div>
          </div>

          {/* Quick Banknotes for Fast Cash Change Calculation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>💵 {lang === 'uz' ? "Xaridordan olingan naqd pul:" : "Получено наличными:"}</span>
              <button
                type="button"
                onClick={() => setSelectedCashReceived(cartTotal)}
                className="text-emerald-600 hover:underline font-extrabold text-[11px]"
              >
                {lang === 'uz' ? "Aniq (Qaytimsiz)" : "Без сдачи"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[10000, 20000, 50000, 100000, 200000].map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => setSelectedCashReceived(note)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                    selectedCashReceived === note
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {formatMoney(note)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedCashReceived(cartTotal)}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                  selectedCashReceived === cartTotal
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {lang === 'uz' ? "Aniq" : "Ровно"}
              </button>
            </div>

            {/* Instant Change Calculation Display */}
            {cart.length > 0 && selectedCashReceived !== null && (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 flex items-center justify-between animate-fade-in">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  {lang === 'uz' ? "Mijozga qaytim:" : "Сдача клиенту:"}
                </span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
                  {formatMoney(cashChange)}
                </span>
              </div>
            )}
          </div>

          {/* Large 1-Click Payment Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cart.length === 0 || directLoading}
                onClick={() => handleDirectCheckout('CASH')}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold py-3 px-3 rounded-2xl shadow transition flex flex-col items-center justify-center gap-0.5 touch-target text-xs sm:text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">💵</span>
                  <span>{lang === 'uz' ? "Naqd pul" : "Наличные"}</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono font-normal">Hotkey: F5</span>
              </button>

              <button
                type="button"
                disabled={cart.length === 0 || directLoading}
                onClick={() => handleDirectCheckout('CARD')}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-extrabold py-3 px-3 rounded-2xl shadow transition flex flex-col items-center justify-center gap-0.5 touch-target text-xs sm:text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">💳</span>
                  <span>{lang === 'uz' ? "Karta (Humo/Uz)" : "Карта"}</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono font-normal">Hotkey: F6</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cart.length === 0 || directLoading}
                onClick={() => handleDirectCheckout('DEBT')}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-extrabold py-2.5 px-3 rounded-2xl shadow transition flex flex-col items-center justify-center gap-0.5 touch-target text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span>📓</span>
                  <span>{lang === 'uz' ? "Qarzga berish" : "В долг"}</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono font-normal">Hotkey: F7</span>
              </button>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => setCheckoutModalOpen(true)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-extrabold py-2.5 px-3 rounded-2xl transition flex flex-col items-center justify-center gap-0.5 touch-target text-xs border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span>{lang === 'uz' ? "Boshqa to'lov" : "Сплит / Сдача"}</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono font-normal">F12</span>
              </button>
            </div>
          </div>

          {/* Big Confirm / Submit Button */}
          <button
            type="button"
            disabled={cart.length === 0 || directLoading}
            onClick={() => handleDirectCheckout('CASH')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base border border-emerald-400"
          >
            <span>✅</span>
            <span>{lang === 'uz' ? "Chekni tasdiqlash (Enter / F12)" : "Пробить чек (Enter / F12)"}</span>
          </button>
        </div>
      </div>

      {/* Parked Carts Modal */}
      {parkedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>📂</span>
                <span>{lang === 'uz' ? "Saqlangan (otlojenny) cheklar" : "Отложенные чеки"}</span>
              </h3>
              <button onClick={() => setParkedModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {parkedCarts.map((h) => (
                <div key={h.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs">Chek #{h.id} ({h.timestamp})</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {h.itemCount} ta tovar • <span className="font-bold text-emerald-600">{formatMoney(h.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => resumeParkedCart(h.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow transition"
                    >
                      {lang === 'uz' ? "Davom etish" : "Восстановить"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeParkedCart(h.id)}
                      className="text-slate-400 hover:text-rose-500 px-2 py-1.5 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unknown Barcode Prompt Modal */}
      {notFoundBarcode && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-center">
            <span className="text-4xl mb-2 inline-block">🔍</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              {lang === 'uz' ? "Mahsulot topilmadi" : "Товар не найден"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-3 bg-slate-100 dark:bg-slate-800 py-1.5 px-2 rounded-lg font-bold">
              {notFoundBarcode}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              {lang === 'uz' ? "Ushbu shtrixkod bazada yo'q. Uni hoziroq bazaga qo'shasizmi?" : "Этого штрихкода нет в базе. Добавить его прямо сейчас?"}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNotFoundBarcode(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              >
                {t.cancelBtn || "Bekor qilish"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const b = notFoundBarcode;
                  setNotFoundBarcode(null);
                  setCreateProductOpen(b);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
              >
                ➕ {lang === 'uz' ? "Qo'shish" : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Product from POS Modal */}
      {createProductOpen && (
        <CreateProductModal
          token={token}
          initialBarcode={typeof createProductOpen === 'string' ? createProductOpen : ''}
          onClose={() => setCreateProductOpen(false)}
          onSuccess={(newProd) => {
            setCreateProductOpen(false);
            if (newProd && newProd.name) {
              addToCart(newProd, 1.0);
            }
            fetchProducts();
            fetchQuickProducts();
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}

      {/* Camera Scanner Modal */}
      {scannerActive && (
        <CameraScannerModal
          onScan={(code) => {
            setScannerActive(false);
            processBarcode(code);
          }}
          onClose={() => setScannerActive(false)}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}

      {/* Checkout Payment Modal */}
      {checkoutModalOpen && (
        <CheckoutModal
          token={token}
          total={cartTotal}
          cart={cart}
          initialMethod={checkoutInitialMethod}
          onClose={() => setCheckoutModalOpen(false)}
          onSuccess={(receipt) => {
            setCheckoutModalOpen(false);
            playBeep();
            setCart([]);
            setSelectedCashReceived(null);
            setSuccessToast({
              receiptNumber: receipt.receipt_number,
              total: cartTotal,
              change: receipt.change_given,
              method: receipt.payment_method,
              data: receipt
            });
            setTimeout(() => setSuccessToast(null), 6000);
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}

      {/* Receipt Modal (opened only when user taps print) */}
      {lastReceipt && (
        <ReceiptModal receipt={lastReceipt} onClose={() => setLastReceipt(null)} t={t} />
      )}
    </div>
  );
}

function DebtsScreen({ token, notify, t }) {
  const [debtors, setDebtors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [onlyWithDebt, setOnlyWithDebt] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [addDebtModalOpen, setAddDebtModalOpen] = useState(false);
  const [createDebtorModalOpen, setCreateDebtorModalOpen] = useState(false);
  const [voiceDebtOpen, setVoiceDebtOpen] = useState(false);
  const [ocrDebtOpen, setOcrDebtOpen] = useState(false);
  const lang = (typeof window !== "undefined" && window.pos_lang) || (typeof localStorage !== "undefined" && localStorage.getItem("pos_lang")) || "uz";

  useEffect(() => {
    fetchDebtors();
    fetchSummary();
  }, [search, onlyWithDebt]);

  const fetchDebtors = async () => {
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.append('search', search);
      if (onlyWithDebt) params.append('only_with_debt', 'true');

      const res = await fetch(`${API_BASE}/debts/debtors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDebtors(data.items || []);
    } catch (e) {
      notify('Qarzdorlar ro\'yxatini yuklashda xatolik', 'error');
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/debts/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary KPI Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.totalOutstandingDebt}</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {summary ? formatMoney(summary.total_outstanding_debt) : '0 so\'m'}
            </div>
          </div>
          <span className="text-3xl">📓</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Qarzdor mijozlar:</div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {summary ? summary.active_debtors_with_debt : 0}{' '}
              <span className="text-xs font-normal text-slate-400">/ {summary ? summary.debtors_count : 0}</span>
            </div>
          </div>
          <span className="text-3xl">👥</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm flex flex-col justify-center gap-1.5">
          <button
            onClick={() => setCreateDebtorModalOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5"
          >
            <span>➕</span>
            <span>{t.addDebtorModalTitle || "Yangi mijoz"}</span>
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setVoiceDebtOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 rounded-xl shadow transition text-[11px] flex items-center justify-center gap-1"
              title="Ovozli qarz yozish"
            >
              <span>🎙️</span>
              <span>Ovozli</span>
            </button>
            <button
              onClick={() => setOcrDebtOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded-xl shadow transition text-[11px] flex items-center justify-center gap-1"
              title="Daftardan rasm olish"
            >
              <span>📸</span>
              <span>Daftar OCR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
        <input
          type="text"
          placeholder={t.searchDebtorPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
        />

        <button
          onClick={() => setOnlyWithDebt(!onlyWithDebt)}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
            onlyWithDebt
              ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {t.onlyWithDebtFilter}
        </button>
      </div>

      {/* Debtors List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {debtors.map((debtor) => (
          <div
            key={debtor.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{debtor.full_name}</h4>
                {debtor.phone && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    📞 {debtor.phone}
                  </div>
                )}
                {debtor.note && (
                  <div className="text-[11px] text-slate-400 mt-1 italic">"{debtor.note}"</div>
                )}
                {debtor.due_date && (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1 flex items-center gap-1">
                    <span>⏳</span>
                    <span>{t.dueDateLabel || "Muddati"}: {debtor.due_date}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">{t.currentDebtBalance}</span>
                <span
                  className={`text-base font-black font-mono ${
                    debtor.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatMoney(debtor.balance)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => { setSelectedDebtor(debtor); setPayModalOpen(true); }}
                className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 py-1.5 rounded-xl text-xs font-bold transition text-center"
              >
                💵 {t.payDebtBtn}
              </button>
              <button
                onClick={() => { setSelectedDebtor(debtor); setAddDebtModalOpen(true); }}
                className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 py-1.5 rounded-xl text-xs font-bold transition text-center"
              >
                ➕ {t.addDebtBtn}
              </button>
              <button
                onClick={() => { setSelectedDebtor(debtor); setHistoryModalOpen(true); }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-1.5 rounded-xl text-xs font-bold transition text-center"
              >
                📜 {t.historyBtn}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pay Debt Modal */}
      {payModalOpen && selectedDebtor && (
        <PayDebtModal
          token={token}
          debtor={selectedDebtor}
          onClose={() => setPayModalOpen(false)}
          onSuccess={() => {
            setPayModalOpen(false);
            fetchDebtors();
            fetchSummary();
            notify('Qarz to\'lovi qabul qilindi / Оплата долга принята');
          }}
          notify={notify}
          t={t}
        />
      )}

      {/* Add Debt Modal */}
      {addDebtModalOpen && selectedDebtor && (
        <AddDebtModal
          token={token}
          debtor={selectedDebtor}
          onClose={() => setAddDebtModalOpen(false)}
          onSuccess={() => {
            setAddDebtModalOpen(false);
            fetchDebtors();
            fetchSummary();
            notify('Qo\'shimcha qarz yozildi / Долг записан');
          }}
          notify={notify}
          t={t}
        />
      )}

      {/* History Modal */}
      {historyModalOpen && selectedDebtor && (
        <DebtorHistoryModal
          token={token}
          debtor={selectedDebtor}
          onClose={() => setHistoryModalOpen(false)}
          t={t}
        />
      )}

      {/* Voice Debt Recording Modal */}
      {voiceDebtOpen && (
        <VoiceDebtModal
          token={token}
          onClose={() => setVoiceDebtOpen(false)}
          onSuccess={() => {
            setVoiceDebtOpen(false);
            fetchDebtors();
            fetchSummary();
            notify(lang === 'uz' ? "Ovozli qarz muvaffaqiyatli saqlandi!" : "Голосовой долг сохранен!");
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}

      {/* OCR Debt Notebook Modal */}
      {ocrDebtOpen && (
        <OcrDebtNotebookModal
          token={token}
          onClose={() => setOcrDebtOpen(false)}
          onSuccess={() => {
            setOcrDebtOpen(false);
            fetchDebtors();
            fetchSummary();
            notify(lang === 'uz' ? "Daftar yozuvlari kiritildi!" : "Записи из тетради распознаны и внесены!");
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}

      {/* Create Debtor Modal */}
      {createDebtorModalOpen && (
        <CreateDebtorModal
          token={token}
          onClose={() => setCreateDebtorModalOpen(false)}
          onSuccess={() => {
            setCreateDebtorModalOpen(false);
            fetchDebtors();
            fetchSummary();
            notify('Yangi mijoz qo\'shildi / Новый клиент зарегистрирован');
          }}
          notify={notify}
          t={t}
        />
      )}
    </div>
  );
}

// ------------------- PAY DEBT MODAL -------------------
function PayDebtModal({ token, debtor, onClose, onSuccess, notify, t }) {
  const [amount, setAmount] = useState(debtor.balance > 0 ? debtor.balance : 10000);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount), note: note.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'To\'lov xatosi');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
          💵 {t.payDebtModalTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {debtor.full_name} ({t.currentDebtBalance} {formatMoney(debtor.balance)})
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.paymentAmountLabel}
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.noteLabel}
            </label>
            <input
              type="text"
              placeholder="Qarz to'lovi / Погашение"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold">
            {t.cancelBtn}
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow">
            {loading ? t.saving : t.saveBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- ADD DEBT MODAL -------------------
function AddDebtModal({ token, debtor, onClose, onSuccess, notify, t }) {
  const [amount, setAmount] = useState(25000);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/add-debt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount), note: note.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Qarz yozish xatosi');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
          📓 {t.addDebtModalTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {debtor.full_name} ({t.currentDebtBalance} {formatMoney(debtor.balance)})
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.debtAmountLabel}
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.noteLabel}
            </label>
            <input
              type="text"
              placeholder="Masalan: Yog' va guruch oldi"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold">
            {t.cancelBtn}
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold shadow">
            {loading ? t.saving : t.saveBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- DEBTOR HISTORY MODAL -------------------
function DebtorHistoryModal({ token, debtor, onClose, t }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t.historyModalTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {debtor.full_name} • {t.currentDebtBalance}{' '}
              <span className="font-bold font-mono text-amber-600 dark:text-amber-400">{formatMoney(debtor.balance)}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">{t.processing}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Tarix bo'sh</div>
          ) : (
            history.map((tx) => {
              const isIncrease = tx.transaction_type === 'DEBT_INCREASE';
              return (
                <div
                  key={tx.id}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className={isIncrease ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {isIncrease ? '➕ Qarz qo\'shildi' : '💵 To\'lov qabul qilindi'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {tx.note || '-'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(tx.created_at).toLocaleString()} • {tx.created_by_name}
                    </div>
                  </div>

                  <div className={`font-mono font-bold text-sm ${isIncrease ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {isIncrease ? '+' : '-'}{formatMoney(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 rounded-xl text-xs transition"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- CREATE DEBTOR MODAL -------------------
function CreateDebtorModal({ token, onClose, onSuccess, notify, t }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [initialDebt, setInitialDebt] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          note: note.trim() || undefined,
          initial_debt: Number(initialDebt) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Yaratishda xatolik');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3">{t.addDebtorModalTitle}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.debtorNameLabel}</label>
            <input
              type="text"
              placeholder="Alisher Rahimov (qo'shni)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.phoneLabel}</label>
            <input
              type="text"
              placeholder="+998 (90) 123-45-67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.noteLabel}</label>
            <input
              type="text"
              placeholder="44-xonadon"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.debtAmountLabel}</label>
            <input
              type="number"
              step="any"
              value={initialDebt}
              onChange={(e) => setInitialDebt(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold">
            {t.cancelBtn}
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow">
            {loading ? t.creating : t.createBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- CATALOG SCREEN (2000 SKU) -------------------
function CatalogScreen({ token, notify, isOwner, t, lang: propLang }) {
  const lang = propLang || (typeof window !== "undefined" && window.pos_lang) || (typeof localStorage !== "undefined" && localStorage.getItem("pos_lang")) || "uz";
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 40;

  useEffect(() => {
    fetchProducts();
  }, [search, lowStockOnly, skip]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString()
      });
      if (search) params.append('search', search);
      if (lowStockOnly) params.append('low_stock_only', 'true');

      const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      notify('Katalog yuklashda xatolik', 'error');
    }
  };

  const reseed = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/reseed-catalog?target_count=2000`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      notify(`Katalog yangilandi: ${data.message}`);
      fetchProducts();
    } catch (e) {
      notify('Sinxronlashda xatolik', 'error');
    }
  };

  const clearCatalog = async () => {
    if (!confirm(t.clearCatalogWarning || "Rostdan ham barcha test tovarlar va cheklarni tozalamoqchimisiz? Kechki savdo uchun toza baza tayyorlanadi.")) return;
    try {
      const res = await fetch(`${API_BASE}/products/clear-catalog`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      notify(data.message || "Baza tozalandi!");
      fetchProducts();
    } catch (e) {
      notify('Tozalashda xatolik', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm transition-colors duration-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📦</span>
            <span>{t.catalogTitle}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {total} SKU
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Shtrixkodlar, tovar narxlari va qoldiq monitoringi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={clearCatalog}
            className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1 touch-target"
            title="Test tovarlar va savdolarni tozalash"
          >
            <span>🗑️</span>
            <span>{t.clearCatalogBtn || "Toza varaqdan boshlash"}</span>
          </button>
          <button
            onClick={reseed}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition border border-slate-300 dark:border-slate-700 flex items-center gap-1 touch-target"
            title="2000 ta demo tovarlarni qaytarish"
          >
            <span>🔄</span>
            <span>{t.reseedCatalogBtn || "2000 ta tovar"}</span>
          </button>
          <input
            type="text"
            placeholder={t.searchProductPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
            className="flex-1 md:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => { setLowStockOnly(!lowStockOnly); setSkip(0); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              lowStockOnly
                ? 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t.lowStockFilter}
          </button>
          {isOwner && (
            <button
              onClick={reseed}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition whitespace-nowrap shadow"
            >
              {t.syncCatalogBtn}
            </button>
          )}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t.colBarcode}</th>
                <th className="px-4 py-3">{t.colName}</th>
                <th className="px-4 py-3">{t.colCategory}</th>
                {isOwner && <th className="px-4 py-3 text-right">{t.colPurchasePrice}</th>}
                <th className="px-4 py-3 text-right">{t.colSalePrice}</th>
                <th className="px-4 py-3 text-right">{t.colStock}</th>
                <th className="px-4 py-3 text-center">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{p.barcode}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{p.category_name}</td>
                  {isOwner && (
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500 dark:text-slate-400">
                      {formatMoney(p.purchase_price)}
                    </td>
                  )}
                  <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatMoney(p.sale_price)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    <span className={p.is_low_stock ? 'text-rose-500 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                      {p.stock_quantity} {p.unit}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {p.is_low_stock ? (
                      <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {t.statusOrderMore}
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {t.statusInNorm}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            {t.paginationShown} {products.length} {t.paginationOf} {total} SKU
          </div>
          <div className="flex gap-2">
            <button
              disabled={skip === 0}
              onClick={() => setSkip(Math.max(0, skip - limit))}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-semibold"
            >
              {t.prevBtn}
            </button>
            <button
              disabled={skip + limit >= total}
              onClick={() => setSkip(skip + limit)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-semibold"
            >
              {t.nextBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------- SUPPLIERS & INCOMING INVOICES -------------------
function SuppliersScreen({ token, notify, t }) {
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [catalogSample, setCatalogSample] = useState([]);
  const [createSupplierModalOpen, setCreateSupplierModalOpen] = useState(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [payInvoiceModalOpen, setPayInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ocrInvoiceOpen, setOcrInvoiceOpen] = useState(false);
  const lang = (typeof window !== "undefined" && window.pos_lang) || (typeof localStorage !== "undefined" && localStorage.getItem("pos_lang")) || "uz";

  useEffect(() => {
    fetchSuppliers();
    fetchInvoices();
    fetchCatalogSample();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSuppliers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInvoices(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCatalogSample = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCatalogSample(data.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🚚</span>
            <span>{t.suppliersTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tovarlar qabuli, omborni to'ldirish va hisob-kitoblar
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCreateSupplierModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm"
          >
            {t.addSupplierBtn}
          </button>
          <button
            onClick={() => setOcrInvoiceOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md flex items-center gap-1.5 touch-target"
          >
            <span>📸</span>
            <span>{t.scanInvoiceBtn || "Faktura OCR"}</span>
          </button>
          <button
            onClick={() => setCreateInvoiceModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md"
          >
            {t.addInvoiceBtn}
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t.invoiceNumberLabel}</th>
                <th className="px-4 py-3">{t.supplierNameLabel}</th>
                <th className="px-4 py-3 text-right">{t.totalToPay}</th>
                <th className="px-4 py-3 text-right">{t.paidAmountLabel}</th>
                <th className="px-4 py-3 text-right">{t.debtToSupplierLabel}</th>
                <th className="px-4 py-3 text-center">{t.colStatus}</th>
                <th className="px-4 py-3 text-center">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {inv.invoice_number}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{inv.supplier_name}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    {formatMoney(inv.total_amount)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {formatMoney(inv.paid_amount)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-amber-600 dark:text-amber-400">
                    {formatMoney(inv.debt_to_supplier)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : inv.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {inv.status === 'PAID'
                        ? t.invoiceStatusPaid
                        : inv.status === 'PARTIAL'
                        ? t.invoiceStatusPartial
                        : t.invoiceStatusPending}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {inv.debt_to_supplier > 0 && (
                      <button
                        onClick={() => { setSelectedInvoice(inv); setPayInvoiceModalOpen(true); }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold transition"
                      >
                        {t.payInvoiceBtn}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {createSupplierModalOpen && (
        <CreateSupplierModal
          token={token}
          onClose={() => setCreateSupplierModalOpen(false)}
          onSuccess={() => {
            setCreateSupplierModalOpen(false);
            fetchSuppliers();
            notify('Yetkazib beruvchi qo\'shildi');
          }}
          notify={notify}
          t={t}
        />
      )}

      {createInvoiceModalOpen && (
        <CreateInvoiceModal
          token={token}
          suppliers={suppliers}
          catalogSample={catalogSample}
          onClose={() => setCreateInvoiceModalOpen(false)}
          onSuccess={() => {
            setCreateInvoiceModalOpen(false);
            fetchInvoices();
            notify('Yuk xati muvaffaqiyatli qabul qilindi va ombor to\'ldirildi');
          }}
          notify={notify}
          t={t}
        />
      )}

      {payInvoiceModalOpen && selectedInvoice && (
        <PayInvoiceModal
          token={token}
          invoice={selectedInvoice}
          onClose={() => setPayInvoiceModalOpen(false)}
          onSuccess={() => {
            setPayInvoiceModalOpen(false);
            fetchInvoices();
            notify('Ta\'minotchiga to\'lov amalga oshirildi');
          }}
          notify={notify}
          t={t}
        />
      )}
    </div>
  );
}

// ------------------- CREATE SUPPLIER MODAL -------------------
function CreateSupplierModal({ token, onClose, onSuccess, notify, t }) {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          contact_person: contactPerson.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Ta\'minotchi yaratishda xatolik');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3">{t.addSupplierBtn}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.supplierNameLabel}</label>
            <input
              type="text"
              placeholder="MCHJ 'Musaffo Sut Alyansi'"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.contactPersonLabel}</label>
            <input
              type="text"
              placeholder="Akmal Karimov"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.phoneLabel}</label>
            <input
              type="text"
              placeholder="+998 (71) 200-11-22"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.addressLabel}</label>
            <input
              type="text"
              placeholder="Toshkent sh."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold">
            {t.cancelBtn}
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow">
            {loading ? t.creating : t.createBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- CREATE INVOICE MODAL -------------------
function CreateInvoiceModal({ token, suppliers, catalogSample, onClose, onSuccess, notify, t }) {
  const [supplierId, setSupplierId] = useState(suppliers.length > 0 ? suppliers[0].id : '');
  const [items, setItems] = useState([
    {
      product_id: catalogSample.length > 0 ? catalogSample[0].id : '',
      quantity: 50,
      purchase_price: catalogSample.length > 0 && catalogSample[0].purchase_price ? catalogSample[0].purchase_price : 10000
    }
  ]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_id: catalogSample.length > 0 ? catalogSample[0].id : '',
        quantity: 10,
        purchase_price: 10000
      }
    ]);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = Number(value);
      return copy;
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, it) => sum + (it.quantity * it.purchase_price), 0);

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      notify('Kamida bitta tovar qo\'shing', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          supplier_id: Number(supplierId),
          items: items.map((it) => ({
            product_id: Number(it.product_id),
            quantity: Number(it.quantity),
            purchase_price: Number(it.purchase_price)
          })),
          paid_amount: Number(paidAmount)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Yuk xatini saqlashda xatolik');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3">{t.addInvoiceBtn}</h3>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.supplierNameLabel}</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t.invoiceItemsLabel}</label>
              <button type="button" onClick={addItem} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                + Tovar qo'shish
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <select
                    value={it.product_id}
                    onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                    className="flex-2 w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    {catalogSample.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Miqdor"
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 text-center"
                  />

                  <input
                    type="number"
                    placeholder="Tannarx"
                    value={it.purchase_price}
                    onChange={(e) => updateItem(idx, 'purchase_price', e.target.value)}
                    className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 text-right"
                  />

                  <button type="button" onClick={() => removeItem(idx)} className="text-rose-500 font-bold px-1.5">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.paidAmountLabel}</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col justify-center text-right">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.totalToPay}</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatMoney(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold">
            {t.cancelBtn}
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow">
            {loading ? t.saving : t.saveBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- PAY INVOICE MODAL -------------------
function PayInvoiceModal({ token, invoice, onClose, onSuccess, notify, t }) {
  const [amount, setAmount] = useState(invoice.debt_to_supplier);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'To\'lov xatosi');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">{t.payInvoiceBtn}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Yuk xati № {invoice.invoice_number} ({t.debtToSupplierLabel} {formatMoney(invoice.debt_to_supplier)})
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">To'lov summasi (so'm) *</label>
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold">
            {t.cancelBtn}
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow">
            {loading ? t.saving : t.saveBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- OPERATIONAL EXPENSES & SPOILAGE -------------------
function ExpensesScreen({ token, notify, t }) {
  const [expenses, setExpenses] = useState([]);
  const [catalogSample, setCatalogSample] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSpoilageMode, setIsSpoilageMode] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchCatalogSample();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setExpenses(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCatalogSample = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCatalogSample(data.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>💸</span>
            <span>{t.expensesTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ijara, maosh, kommunal xizmatlar va yaroqsiz tovarlarni hisobdan chiqarish
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setIsSpoilageMode(true); setCreateModalOpen(true); }}
            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm"
          >
            {t.spoilageBtn}
          </button>
          <button
            onClick={() => { setIsSpoilageMode(false); setCreateModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md"
          >
            {t.addExpenseBtn}
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t.dateLabel}</th>
                <th className="px-4 py-3">{t.expenseCategoryLabel}</th>
                <th className="px-4 py-3">{t.expenseDescLabel}</th>
                <th className="px-4 py-3 text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(exp.expense_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 font-semibold">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium">
                    {exp.description}
                    {exp.product_name && (
                      <span className="block text-[11px] text-rose-500 font-mono">
                        ⚠️ Mahsulot: {exp.product_name} ({exp.spoilage_quantity} dona hisobdan chiqarildi)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    -{formatMoney(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <CreateExpenseModal
          token={token}
          catalogSample={catalogSample}
          isSpoilage={isSpoilageMode}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchExpenses();
            notify('Xarajat muvaffaqiyatli qayd etildi');
          }}
          notify={notify}
          t={t}
        />
      )}
    </div>
  );
}

// ------------------- CREATE EXPENSE MODAL -------------------
function CreateExpenseModal({ token, catalogSample, isSpoilage, onClose, onSuccess, notify, t }) {
  const [category, setCategory] = useState(isSpoilage ? 'SPOILAGE' : 'RENT');
  const [amount, setAmount] = useState(isSpoilage ? '' : 500000);
  const [description, setDescription] = useState(isSpoilage ? 'Yaroqlilik muddati o\'tgan mahsulot' : 'Oylik xarajat');
  const [productId, setProductId] = useState(catalogSample.length > 0 ? catalogSample[0].id : '');
  const [spoilageQuantity, setSpoilageQuantity] = useState(5);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        category,
        amount: amount ? Number(amount) : null,
        description: description.trim(),
        product_id: isSpoilage ? Number(productId) : null,
        spoilage_quantity: isSpoilage ? Number(spoilageQuantity) : null
      };

      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xarajatni saqlashda xatolik');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3">
          {isSpoilage ? t.spoilageBtn : t.addExpenseBtn}
        </h3>

        <div className="space-y-3">
          {!isSpoilage && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.expenseCategoryLabel}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="RENT">RENT (Ijara)</option>
                <option value="UTILITIES">UTILITIES (Kommunal xizmatlar)</option>
                <option value="SALARY">SALARY (Ish haqi)</option>
                <option value="TAXES">TAXES (Soliqlar)</option>
                <option value="TRANSPORT">TRANSPORT (Logistika)</option>
                <option value="OTHER">OTHER (Boshqa)</option>
              </select>
            </div>
          )}

          {isSpoilage && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.spoilageProductLabel}</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  required
                >
                  {catalogSample.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} {p.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.spoilageQtyLabel}</label>
                <input
                  type="number"
                  step="any"
                  value={spoilageQuantity}
                  onChange={(e) => setSpoilageQuantity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.expenseAmountLabel} {isSpoilage && "(ixtiyoriy, tannarxdan avtomatik hisoblanadi)"}
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-slate-100"
              required={!isSpoilage}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.expenseDescLabel}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              required
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold">
            {t.cancelBtn}
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow">
            {loading ? t.saving : t.saveBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- ACCOUNTING & ANALYTICS DASHBOARD -------------------
function AnalyticsScreen({ token, notify, t }) {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      setData(resData);
    } catch (e) {
      notify('Hisobotni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Period Toggles Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.periodLabel}</div>
        <div className="flex gap-1">
          {[
            { id: 'today', label: t.periodToday },
            { id: 'week', label: t.periodWeek },
            { id: 'month', label: t.periodMonth },
            { id: 'all', label: t.periodAll }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                period === item.id
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="py-20 text-center text-xs text-slate-400">{t.processing}</div>
      ) : (
        <>
          {/* Main Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Revenue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.kpiRevenue}</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatMoney(data.revenue)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {data.sales_count} {t.kpiReceiptsCount} ({t.kpiAvgReceipt} {formatMoney(data.average_receipt)})
              </div>
            </div>

            {/* COGS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.kpiCogs}</div>
              <div className="text-2xl font-black text-slate-700 dark:text-slate-200 mt-1 font-mono">
                {formatMoney(data.cogs)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Sotilgan tovarlar tannarxi</div>
            </div>

            {/* Gross Margin */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.kpiGrossMargin}</div>
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
                {formatMoney(data.gross_margin)}
              </div>
              <div className="text-[11px] text-cyan-600 dark:text-cyan-500 mt-1 font-bold">
                {t.kpiMarginPct} {data.margin_percentage}%
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.kpiNetProfit}</div>
              <div className={`text-2xl font-black mt-1 font-mono ${data.net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {formatMoney(data.net_profit)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Xarajatlar ayirilgandan so'ng
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Payments Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">{t.paymentsBreakdownTitle}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">💵 {t.methodCash}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(data.cash_total)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">💳 {t.methodCard}</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{formatMoney(data.card_total)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">📓 {t.methodDebt}</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatMoney(data.debt_total)}</span>
                </div>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">{t.expensesBreakdownTitle}</h3>
              <div className="space-y-2">
                {Object.entries(data.expenses_by_category).length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4">Xarajatlar mavjud emas</div>
                ) : (
                  Object.entries(data.expenses_by_category).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-{formatMoney(amt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          {data.top_selling_products && data.top_selling_products.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">{t.topSellingTitle}</h3>
              <div className="space-y-2">
                {data.top_selling_products.map((item, idx) => (
                  <div key={item.product_id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-xs text-slate-800 dark:text-slate-200">{item.name}</span>
                    </div>
                    <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {item.quantity_sold} dona • {formatMoney(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ------------------- PRICE TAG MODAL -------------------
function PriceTagModal({ onClose, t, sessionLocal }) {
  const [productId, setProductId] = useState(0);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState('');
  
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/expenses/price-tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, price, quantity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      setTemplate(data.template);
      notify('Fiyatka generatsiyalandi!');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-800 dark:text-slate-100">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3">🏷️ Fiyatka generatori</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Mahsulot ID
            </label>
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Sotish narxi (so'm)
            </label>
            <input
              type="number"
              step="any"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Miqdar
            </label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Shblash uchun narx
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Barcha mahsulotlar uchun bir xil narx kiriting
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition touch-target text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {loading ? 'Yuborilmoqda...' : 'Generatsiya qilish'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------- ERROR BOUNDARY -------------------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('GroceryPOS Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-3xl p-6 max-w-md text-center shadow-2xl">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-rose-500 mb-2">Interfeysda xatolik yuz berdi / Произошла ошибка</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">
              {this.state.error ? this.state.error.message : 'Noma\'lum xatolik'}
            </p>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
            >
              Keshni tozalash va qayta yuklash / Сбросить кэш
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<ErrorBoundary><App /></ErrorBoundary>);
}
