const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;
const API_BASE = '/api/v1';

// Global 401 session interceptor: immediately catches expired/invalid JWTs across all screens & modals
if (typeof window !== 'undefined' && !window.__posFetchWrapped) {
  window.__posFetchWrapped = true;
  const __origFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const res = await __origFetch(...args);
    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      if (res && res.status === 401 && url.includes('/api/v1/') && !url.includes('/auth/token') && !url.includes('/auth/switch-cashier') && !url.includes('/auth/change-password') && !url.includes('/products/clear-catalog')) {
        window.dispatchEvent(new CustomEvent('pos-unauthorized'));
      }
    } catch (e) {}
    return res;
  };
}

// Global fallback for lang
var lang = typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang') || 'uz';

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
    pwaBannerDesc: "Brauzer manzil qatorisiz, qulay ilova ko'rinishida ochish uchun: brauzer menyusida (3 nuqta) «Bosh ekranga qo'shish» tugmasini bosing.",
    pwaBannerClose: "Tushunarli",
    clearCatalogBtn: "Test tovarlarni tozalash / Toza varaqdan boshlash",
    clearCatalogWarning: "Rostdan ham barcha test tovarlar va cheklarni tozalamoqchimisiz? Kechki savdo uchun toza baza tayyorlanadi.",
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
    mobileModalPwaHelp: "Ilovani o'rnatish: Telefonda sahifa ochilgach, brauzer menyusidan 'Bosh ekranga qo'shish' tugmasini bosing.",
    themeDark: "Qorong'i mavzu",
    themeLight: "Yorug' mavzu",
    currency: "so'm",
    parkCartBtn: "Navbatga qo'yish (F4)",
    parkedCartsTitle: "Kechiktirilgan cheklar",
    numpadBtn: "Raqamlar",
    voiceBarcode: "Shtrixkodni ovoz bilan aytish",
    cogsDesc: "Sotilgan tovarlar tannarxi",
    colId: "ID",
    colQty: "Miqdor",
    colTotal: "Jami",
    colActions: "Amallar",
    unknownBarcodeTitle: "Mahsulot topilmadi",
    unknownBarcodePrompt: "Ushbu shtrixkod bazada yo'q. Uni yangi tovar sifatida qo'shasizmi?",
    voiceAssistantListening: "Eshitilmoqda... gapiring",
    voiceAssistantHint: "Masalan: «non 2 ta qo'sh», «kola 1», «to'lov», «skaner», «qarz yoz»",
    voiceAssistantSuccess: "Buyruq bajarildi",
    voiceAssistantNotFound: "Tovar topilmadi",
    // Quick items translations
    quick_bread: "Tandir non",
    quick_tandyr_lepeshka: "Tandir non",
    quick_sugar: "Shakar",
    quick_potatoes: "Kartoshka",
    quick_onions: "Piyoz",
    quick_eggs: "Tuxum"
  },
  ru: {
    appName: "GroceryStore POS",
    appSubtitle: "Автоматизация и Бухгалтерия",
    switchCashierBtn: "Смена / Кассир",
    cashierSwitchTitle: "Выберите кассира на смену (в 1 клик)",
    installAppBtn: "Установить приложение",
    installedMsg: "Приложение установлено на смартфон!",
    cameraScannerBtn: "Камера-сканер",
    torchOn: "Фонарик (Вкл)",
    torchOff: "Фонарик (Выкл)",
    barcodeScanned: "Штрихкод считан",
    scaleWeightDetected: "Определен вес с весов",
    voiceSearchBtn: "Голос",
    voiceListening: "Слушаю... говорите",
    quickItemsTitle: "Быстрые товары (без штрихкода)",
    toggleAllCatalog: "Все товары",
    instantCashBtn: "Наличные (Ровно)",
    instantCardBtn: "Карта (Humo/Uzcard)",
    instantDebtBtn: "В долг",
    saleSuccessToast: "Продажа успешно сохранена!",
    printReceiptOptional: "Распечатать чек",
    voiceDebtBtn: "Голосовая запись долга",
    voiceDebtPrompt: "Например: «Алишер 50 тысяч на хлеб, вернет в пятницу»",
    scanPaperNotebookBtn: "Сфотографировать тетрадь долгов",
    ocrPreviewTitle: "Предпросмотр долгов из тетради",
    importAllDebts: "Внести все в тетрадь долгов",
    dueDateLabel: "Срок возврата",
    scanInvoiceBtn: "Скан накладной (OCR)",
    invoiceOcrTitle: "Предпросмотр строк накладной",
    importInvoiceBtn: "Оприходовать на склад",
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
    clearCatalogBtn: "Очистить базу / Начать с чистого листа",
    clearCatalogWarning: "Вы действительно хотите удалить все товары и чеки? База будет очищена для старта с нуля.",
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
    catalogTitle: "Каталог товаров",
    lowStockFilter: "⚠️ Мало на складе",
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
    parkCartBtn: "Отложить чек (F4)",
    parkedCartsTitle: "Отложенные чеки",
    numpadBtn: "Клавиатура",
    voiceBarcode: "Сказать штрихкод голосом",
    cogsDesc: "Себестоимость проданных товаров",
    colId: "ID",
    colQty: "Количество",
    colTotal: "Итого",
    colActions: "Действия",
    unknownBarcodeTitle: "Товар не найден",
    unknownBarcodePrompt: "Этого штрихкода нет в базе. Добавить его в базу прямо сейчас?",
    voiceAssistantListening: "Слушаю... говорите",
    voiceAssistantHint: "Например: «добавь хлеб 2 штуки», «кола 1», «чек», «сканер», «запиши долг»",
    voiceAssistantSuccess: "Команда выполнена",
    voiceAssistantNotFound: "Товар не найден",
    // Quick items translations
    quick_bread: "Хлеб",
    quick_tandyr_lepeshka: "Тандыр лепешка",
    quick_sugar: "Сахар",
    quick_potatoes: "Картофель",
    quick_onions: "Лук",
    quick_eggs: "Яйца"
  }
};
const EXPENSE_CATEGORY_NAMES = {
  uz: {
    RENT: 'Ijara',
    UTILITIES: 'Kommunal to‘lovlar',
    SALARY: 'Ish haqi',
    SPOILAGE: 'Buzilgan tovarni hisobdan chiqarish',
    TAXES: 'Soliqlar',
    TRANSPORT: 'Transport',
    OTHER: 'Boshqa'
  },
  ru: {
    RENT: 'Аренда',
    UTILITIES: 'Коммунальные услуги',
    SALARY: 'Зарплата',
    SPOILAGE: 'Порча и списание товара',
    TAXES: 'Налоги',
    TRANSPORT: 'Транспорт',
    OTHER: 'Прочее'
  }
};
const expenseCategoryName = (category, language) => EXPENSE_CATEGORY_NAMES[language]?.[category] || String(category).replace(/_/g, ' ').toLocaleLowerCase(language === 'ru' ? 'ru' : 'uz');

// Formats number to Uzbek sum with space separators: e.g. "12 500 so'm"

// ------------------- TRANSLITERATION CLIENT HELPERS -------------------
const CYR_TO_LAT_MAP = {
  'ш': 'sh',
  'ч': 'ch',
  'ё': 'yo',
  'ю': 'yu',
  'я': 'ya',
  'ц': 'ts',
  'ў': "o'",
  'ғ': "g'",
  'қ': 'q',
  'ҳ': 'h',
  'х': 'x',
  'ж': 'j',
  'а': 'a',
  'б': 'b',
  'в': 'v',
  'г': 'g',
  'д': 'd',
  'е': 'e',
  'э': 'e',
  'з': 'z',
  'и': 'i',
  'й': 'y',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'о': 'o',
  'п': 'p',
  'р': 'r',
  'с': 's',
  'т': 't',
  'у': 'u',
  'ф': 'f',
  'ъ': "'",
  'ь': '',
  'ы': 'i',
  'щ': 'sh'
};
function cyrToLat(text) {
  if (!text) return '';
  return text.toLowerCase().split('').map(c => CYR_TO_LAT_MAP[c] || c).join('');
}

// ------------------- SPEECH SYNTHESIS & VOICE HELPERS -------------------

// ------------------- WEB AUDIO SOUND EFFECTS -------------------
function playAudioCue(type = 'success') {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem('pos_sound') === 'false') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'success' || type === 'add') {
      // Pleasant high double beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'listen') {
      // Gentle start listening chirp
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'error') {
      // Low double error beep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(240, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
    setTimeout(() => {
      try {
        ctx.close();
      } catch (e) {}
    }, 400);
  } catch (e) {
    // Audio context not allowed or failed, ignore
  }
}
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
function VoiceInputBtn({
  onResult,
  lang = 'uz',
  title = 'Ovozli kiritish',
  className = ''
}) {
  const [listening, setListening] = useState(false);
  const start = e => {
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
      rec.onresult = ev => {
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
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: start,
    className: `px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center ${listening ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'} ${className}`,
    title: title
  }, /*#__PURE__*/React.createElement("span", null, "🎙️"));
}
function safeArray(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object') {
    if (Array.isArray(val.categories)) return val.categories;
    if (Array.isArray(val.items)) return val.items;
    if (Array.isArray(val.products)) return val.products;
    if (Array.isArray(val.debtors)) return val.debtors;
    if (Array.isArray(val.suppliers)) return val.suppliers;
    if (Array.isArray(val.invoices)) return val.invoices;
    if (Array.isArray(val.expenses)) return val.expenses;
    if (Array.isArray(val.history)) return val.history;
    if (Array.isArray(val.cashiers)) return val.cashiers;
    if (Array.isArray(val.data)) return val.data;
    if (Array.isArray(val.results)) return val.results;
  }
  return [];
}
function formatMoney(amount, currency = "so'm") {
  if (amount === undefined || amount === null || isNaN(amount)) return `0 ${currency}`;
  const parts = Math.round(Number(amount)).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${parts.join(".")} ${currency}`;
}
function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function formatRelativeDate(dateStr, lang = "uz") {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return lang === "uz" ? "Bugun" : "Сегодня";
    if (diffDays === 1) return lang === "uz" ? "Kecha" : "Вчера";
    if (diffDays < 7) return lang === "uz" ? `${diffDays} kun oldin` : `${diffDays} дн. назад`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return lang === "uz" ? `${weeks} hafta oldin` : `${weeks} нед. назад`;
    }
    const months = Math.floor(diffDays / 30);
    return lang === "uz" ? `${months} oy oldin` : `${months} мес. назад`;
  } catch (e) {
    return dateStr;
  }
}
function checkOverdueStatus(dueDateStr, balance, lang = "uz") {
  if (!dueDateStr || Number(balance) <= 0) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = today - due;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return {
        isOverdue: true,
        days: diffDays,
        badge: lang === "uz" ? `${diffDays} kun kechikdi` : `Просрочено на ${diffDays} дн.`,
        color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800"
      };
    } else if (diffDays === 0) {
      return {
        isOverdue: false,
        days: 0,
        badge: lang === "uz" ? "Bugun to'lov kuni" : "Оплата сегодня",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800"
      };
    }
  } catch (e) {}
  return null;
}

// ------------------- MINIMAL VECTOR ICON SET -------------------
function Icon({
  name,
  size = 16,
  className = ""
}) {
  const s = size;
  const props = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `shrink-0 ${className}`
  };
  switch (name) {
    case 'bag':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 6h18"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M16 10a4 4 0 0 1-8 0"
      }));
    case 'pos':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("rect", {
        width: "18",
        height: "14",
        x: "3",
        y: "5",
        rx: "2"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "3",
        y1: "10",
        x2: "21",
        y2: "10"
      }));
    case 'debts':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "9",
        cy: "7",
        r: "4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M22 21v-2a4 4 0 0 0-3-3.87"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M16 3.13a4 4 0 0 1 0 7.75"
      }));
    case 'box':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "m7.5 4.27 9 5.15"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m3.3 7 8.7 5 8.7-5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 22V12"
      }));
    case 'truck':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M15 18H9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "17",
        cy: "18",
        r: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "7",
        cy: "18",
        r: "2"
      }));
    case 'chart':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M3 3v18h18"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m19 9-5 5-4-4-3 3"
      }));
    case 'scan':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M3 7V5a2 2 0 0 1 2-2h2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M17 3h2a2 2 0 0 1 2 2v2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M21 17v2a2 2 0 0 1-2 2h-2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M7 21H5a2 2 0 0 1-2-2v-2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "3"
      }));
    case 'search':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("circle", {
        cx: "11",
        cy: "11",
        r: "8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m21 21-4.3-4.3"
      }));
    case 'mic':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19 10v2a7 7 0 0 1-14 0v-2"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "19",
        x2: "12",
        y2: "22"
      }));
    case 'tag':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M7 7h.01"
      }));
    case 'receipt':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 17V7"
      }));
    case 'pause':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("rect", {
        width: "4",
        height: "14",
        x: "6",
        y: "5",
        rx: "1"
      }), /*#__PURE__*/React.createElement("rect", {
        width: "4",
        height: "14",
        x: "14",
        y: "5",
        rx: "1"
      }));
    case 'folder':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"
      }));
    case 'trash':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M3 6h18"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
      }));
    case 'settings':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
      }));
    case 'sun':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 2v2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 20v2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m4.93 4.93 1.41 1.41"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m17.66 17.66 1.41 1.41"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M2 12h2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M20 12h2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m6.34 17.66-1.41 1.41"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m19.07 4.93-1.41 1.41"
      }));
    case 'moon':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
      }));
    case 'soundOn':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("polygon", {
        points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M15.54 8.46a5 5 0 0 1 0 7.07"
      }));
    case 'soundOff':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("polygon", {
        points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "22",
        y1: "9",
        x2: "16",
        y2: "15"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "16",
        y1: "9",
        x2: "22",
        y2: "15"
      }));
    case 'cash':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("rect", {
        width: "20",
        height: "12",
        x: "2",
        y: "6",
        rx: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M6 12h.01M18 12h.01"
      }));
    case 'split':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M16 3h5v5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 3H3v5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m15 9 6-6"
      }));
    case 'plus':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M5 12h14"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 5v14"
      }));
    case 'minus':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M5 12h14"
      }));
    case 'close':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M18 6 6 18"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m6 6 12 12"
      }));
    case 'check':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M20 6 9 17l-5-5"
      }));
    case 'arrowRight':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M5 12h14"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m12 5 7 7-7 7"
      }));
    case 'user':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "7",
        r: "4"
      }));
    case 'camera':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "13",
        r: "3"
      }));
    case 'printer':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("polyline", {
        points: "6 9 6 2 18 2 18 9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
      }), /*#__PURE__*/React.createElement("rect", {
        width: "12",
        height: "8",
        x: "6",
        y: "14"
      }));
    case 'shield':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"
      }));
    case 'phone':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
      }));
    case 'edit':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
      }));
    case 'bell':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M10.3 21a1.94 1.94 0 0 0 3.4 0"
      }));
    case 'history':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 3v5h5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 7v5l4 2"
      }));
    case 'download':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      }), /*#__PURE__*/React.createElement("polyline", {
        points: "7 10 12 15 17 10"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "15",
        x2: "12",
        y2: "3"
      }));
    case 'upload':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      }), /*#__PURE__*/React.createElement("polyline", {
        points: "17 8 12 3 7 8"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "3",
        x2: "12",
        y2: "15"
      }));
    case 'alert':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "9",
        x2: "12",
        y2: "13"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "17",
        x2: "12.01",
        y2: "17"
      }));
    case 'bolt':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("polygon", {
        points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
      }));
    case 'sparkles':
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("path", {
        d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
      }));
    default:
      return /*#__PURE__*/React.createElement("svg", props, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }));
  }
}

// ------------------- UNIFIED SETTINGS MODAL -------------------
function SettingsModal({
  token,
  user,
  lang,
  onLangChange,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenPasswordModal,
  onOpenPhoneModal,
  onLogout,
  onClose,
  notify,
  t
}) {
  const [downloading, setDownloading] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [clearPassword, setClearPassword] = useState('');
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(() => localStorage.getItem('pos_store_id') || '');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreType, setNewStoreType] = useState('grocery');
  const [showTaxProfile, setShowTaxProfile] = useState(false);
  const [taxProfile, setTaxProfile] = useState({
    legal_name: '',
    inn_stir: '',
    tax_regime: 'TURNOVER_1',
    tax_rate_percent: '1',
    address: '',
    kkm_serial: '',
    ofd_gateway_url: '',
    ofd_api_token: '',
    has_ofd_token: false,
    tobacco_license_note: '',
    strict_tobacco_marking: false,
    strict_beverage_marking: false
  });
  const [savingTax, setSavingTax] = useState(false);
  useEffect(() => {
    fetch(`${API_BASE}/pos/stores`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.ok ? r.json() : []).then(list => setStores(safeArray(list))).catch(() => {});
    if (user?.role === 'owner') {
      fetch(`${API_BASE}/tax/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(r => r.ok ? r.json() : null).then(d => {
        if (d?.profile) {
          setTaxProfile({
            legal_name: d.profile.legal_name || '',
            inn_stir: d.profile.inn_stir || '',
            tax_regime: d.profile.tax_regime || 'TURNOVER_1',
            tax_rate_percent: String(d.profile.tax_rate_percent ?? '1'),
            address: d.profile.address || '',
            kkm_serial: d.profile.kkm_serial || '',
            ofd_gateway_url: d.profile.ofd_gateway_url || '',
            ofd_api_token: '',
            has_ofd_token: Boolean(d.profile.has_ofd_token),
            tobacco_license_note: d.profile.tobacco_license_note || '',
            strict_tobacco_marking: Boolean(d.profile.strict_tobacco_marking),
            strict_beverage_marking: Boolean(d.profile.strict_beverage_marking)
          });
        }
      }).catch(() => {});
    }
  }, []);
  const saveTaxProfile = async () => {
    setSavingTax(true);
    try {
      const payload = {
        legal_name: taxProfile.legal_name,
        inn_stir: taxProfile.inn_stir,
        tax_regime: taxProfile.tax_regime,
        tax_rate_percent: Number(taxProfile.tax_rate_percent) || 0,
        address: taxProfile.address,
        kkm_serial: taxProfile.kkm_serial,
        ofd_gateway_url: taxProfile.ofd_gateway_url,
        tobacco_license_note: taxProfile.tobacco_license_note,
        strict_tobacco_marking: Boolean(taxProfile.strict_tobacco_marking),
        strict_beverage_marking: Boolean(taxProfile.strict_beverage_marking),
        store_id: activeStoreId ? Number(activeStoreId) : null
      };
      if (taxProfile.ofd_api_token && taxProfile.ofd_api_token.trim()) {
        payload.ofd_api_token = taxProfile.ofd_api_token.trim();
      }
      const res = await fetch(`${API_BASE}/tax/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || 'Xatolik');
      setTaxProfile(p => ({
        ...p,
        ofd_api_token: '',
        has_ofd_token: Boolean(d?.profile?.has_ofd_token)
      }));
      notify(lang === 'uz' ? 'Soliq profili saqlandi!' : 'Налоговый профиль сохранён!');
      setShowTaxProfile(false);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSavingTax(false);
    }
  };
  const createStoreOutlet = async () => {
    if (!newStoreName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/pos/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newStoreName.trim(),
          store_type: newStoreType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      setStores(prev => [...prev, data]);
      setActiveStoreId(String(data.id));
      localStorage.setItem('pos_store_id', String(data.id));
      localStorage.setItem('pos_store_name', data.name);
      setNewStoreName('');
      notify(lang === 'uz' ? `Filial qo'shildi: ${data.name}` : `Точка добавлена: ${data.name}`);
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const downloadBackup = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/backup/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error(lang === "uz" ? "Zaxira nusxa yaratib bo'lmadi" : "Не удалось создать бэкап");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grocery_pos_backup_${new Date().toISOString().slice(0, 10)}.db`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify(lang === "uz" ? "Zaxira nusxa yuklab olindi!" : "Резервная копия скачана!");
    } catch (e) {
      notify(e.message || (lang === "uz" ? "Yuklab olishda xatolik" : "Ошибка скачивания бэкапа"), "error");
    } finally {
      setDownloading(false);
    }
  };
  const purgeDemoOnly = async () => {
    setPurgeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/purge-demo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      const r = data.removed || {};
      notify(lang === "uz" ? `Demo tozalandi: ${r.products || 0} tovar, ${r.debtors || 0} qarz, ${r.suppliers || 0} ta'minotchi` : `Демо очищено: ${r.products || 0} товаров, ${r.debtors || 0} долгов, ${r.suppliers || 0} поставщ.`);
    } catch (e) {
      notify(e.message || (lang === "uz" ? "Tozalashda xatolik" : "Ошибка очистки"), "error");
    } finally {
      setPurgeLoading(false);
    }
  };
  const clearCatalog = async e => {
    e.preventDefault();
    if (clearConfirmText.trim() !== "DELETE ALL STORE DATA" || !clearPassword) {
      notify(lang === "uz" ? "Tasdiq matni va parolni kiriting" : "Введите фразу подтверждения и пароль", "error");
      return;
    }
    setClearLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/clear-catalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          confirmation: clearConfirmText.trim(),
          current_password: clearPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      notify(data.message || (lang === "uz" ? "Baza tozalandi!" : "База очищена!"));
      setShowDangerZone(false);
      setClearConfirmText('');
      setClearPassword('');
    } catch (e) {
      notify(e.message || (lang === "uz" ? "Tozalashda xatolik" : "Ошибка очистки"), "error");
    } finally {
      setClearLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-2.5 sm:p-4 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-modal rounded-[28px] w-full max-w-lg p-4 sm:p-5 modal-mobile-safe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b atelier-border mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-2xl atelier-subtle flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, lang === "uz" ? "Tizim sozlamalari" : "Настройки"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs atelier-text-muted"
  }, user?.full_name || user?.username, " (", user?.role === 'owner' ? t.ownerRole : t.cashierRole, ")"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "w-8 h-8 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 atelier-subtle rounded-2xl"
  }, /*#__PURE__*/React.createElement("label", {
    className: "font-semibold atelier-text-muted block mb-2"
  }, lang === "uz" ? "Til / Язык" : "Язык интерфейса"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onLangChange("uz"),
    className: `py-2 rounded-xl font-semibold transition ${lang === "uz" ? "atelier-btn-primary shadow-sm" : "atelier-card"}`
  }, "O'zbekcha"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onLangChange("ru"),
    className: `py-2 rounded-xl font-semibold transition ${lang === "ru" ? "atelier-btn-primary shadow-sm" : "atelier-card"}`
  }, "Русский"))), /*#__PURE__*/React.createElement("div", {
    className: "p-3 atelier-subtle rounded-2xl"
  }, /*#__PURE__*/React.createElement("label", {
    className: "font-semibold atelier-text-muted block mb-2"
  }, lang === "uz" ? "Mavzu va Ovoz" : "Оформление и звук"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onToggleTheme("light"),
    className: `py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1 ${theme === "light" ? "atelier-btn-primary shadow-sm" : "atelier-btn-soft"}`,
    title: "Royal Crystal Light 3D"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sun",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, lang === "uz" ? "Kun" : "День")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onToggleTheme("dark"),
    className: `py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1 ${theme === "dark" ? "atelier-btn-primary shadow-sm" : "atelier-btn-soft"}`,
    title: "Royal Indigo Glass 3D"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, lang === "uz" ? "Tun" : "Ночь")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onToggleSound,
    className: `py-2 rounded-xl font-semibold transition flex items-center justify-center ${soundEnabled ? "atelier-btn-cta" : "atelier-btn-soft atelier-text-muted"}`,
    title: lang === "uz" ? "Tovush signallari" : "Звуковые сигналы"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: soundEnabled ? 'soundOn' : 'soundOff',
    size: 15
  }))))), user?.role === 'owner' && /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-slate-800 dark:text-slate-200"
  }, "🏪 ", lang === "uz" ? "Do'konlar / Filiallar" : "Точки / Филиалы"), stores.length > 0 && /*#__PURE__*/React.createElement("select", {
    value: activeStoreId,
    onChange: e => {
      const id = e.target.value;
      setActiveStoreId(id);
      const st = stores.find(s => String(s.id) === id);
      localStorage.setItem('pos_store_id', id);
      localStorage.setItem('pos_store_name', st ? st.name : '');
    },
    className: "w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, lang === "uz" ? "Asosiy do'kon" : "Основной магазин"), stores.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.name, " (", s.store_type, ")"))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === "uz" ? "Yangi filial (masalan: Tamaki #1)" : "Новый филиал (напр: Табак #1)",
    value: newStoreName,
    onChange: e => setNewStoreName(e.target.value),
    className: "flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
  }), /*#__PURE__*/React.createElement("select", {
    value: newStoreType,
    onChange: e => setNewStoreType(e.target.value),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs"
  }, /*#__PURE__*/React.createElement("option", {
    value: "grocery"
  }, "Oziq-ovqat"), /*#__PURE__*/React.createElement("option", {
    value: "tobacco"
  }, "Tamaki"), /*#__PURE__*/React.createElement("option", {
    value: "general"
  }, "Boshqa")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: createStoreOutlet,
    className: "px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
  }, "+"))), user?.role === 'owner' && /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-indigo-950 dark:text-indigo-200"
  }, "🏛️ ", lang === "uz" ? "Soliq va Tamaki profili (STIR / KKM)" : "Налоговый профиль (ИНН / Табачка)"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-indigo-700 dark:text-indigo-400"
  }, taxProfile.inn_stir ? `STIR: ${taxProfile.inn_stir} • ${taxProfile.tax_regime} (${taxProfile.tax_rate_percent}%)` : lang === "uz" ? "STIR, soliq rejimi va Asl Belgisi sozlamalari" : "Укажите ИНН, налог и правила DataMatrix")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowTaxProfile(!showTaxProfile),
    className: "px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold"
  }, showTaxProfile ? '▲' : lang === "uz" ? "Sozlash" : "Настроить")), showTaxProfile && /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 pt-2 border-t border-indigo-200 dark:border-indigo-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === "uz" ? "YaTT / MChJ nomi" : "Название ИП / ООО",
    value: taxProfile.legal_name,
    onChange: e => setTaxProfile(p => ({
      ...p,
      legal_name: e.target.value
    })),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === "uz" ? "STIR / INN (9 raqam)" : "ИНН / СТИР (9 цифр)",
    value: taxProfile.inn_stir,
    onChange: e => setTaxProfile(p => ({
      ...p,
      inn_stir: e.target.value
    })),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("select", {
    value: taxProfile.tax_regime,
    onChange: e => {
      const r = e.target.value;
      const defRate = r === 'TURNOVER_1' ? '1' : r === 'TURNOVER_4' ? '4' : r === 'VAT_12' ? '12' : r === 'VAT_6' ? '6' : taxProfile.tax_rate_percent;
      setTaxProfile(p => ({
        ...p,
        tax_regime: r,
        tax_rate_percent: defRate
      }));
    },
    className: "flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold"
  }, /*#__PURE__*/React.createElement("option", {
    value: "TURNOVER_1"
  }, lang === "uz" ? "YaTT aylanmadan soliq (1%)" : "ИП: Налог с оборота (1%)"), /*#__PURE__*/React.createElement("option", {
    value: "TURNOVER_4"
  }, lang === "uz" ? "MChJ aylanmadan soliq (4%)" : "ООО: Налог с оборота (4%)"), /*#__PURE__*/React.createElement("option", {
    value: "TURNOVER_CUSTOM"
  }, lang === "uz" ? "Aylanmadan soliq (boshqa %)" : "Налог с оборота (свой %)"), /*#__PURE__*/React.createElement("option", {
    value: "VAT_12"
  }, lang === "uz" ? "QQS to'lovchi (12%)" : "Плательщик НДС (12%)"), /*#__PURE__*/React.createElement("option", {
    value: "VAT_6"
  }, lang === "uz" ? "Soddalashtirilgan QQS (6%)" : "Упрощённый НДС (6%)")), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.5",
    value: taxProfile.tax_rate_percent,
    onChange: e => setTaxProfile(p => ({
      ...p,
      tax_rate_percent: e.target.value
    })),
    className: "w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-center",
    title: "%"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === "uz" ? "KKM / FM seriya (ixtiyoriy)" : "Серийник ККМ / ФМ (опц.)",
    value: taxProfile.kkm_serial,
    onChange: e => setTaxProfile(p => ({
      ...p,
      kkm_serial: e.target.value
    })),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === "uz" ? "Tamaki ruxsatnomasi / yig'im" : "Сбор/разрешение на табак",
    value: taxProfile.tobacco_license_note,
    onChange: e => setTaxProfile(p => ({
      ...p,
      tobacco_license_note: e.target.value
    })),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "url",
    placeholder: lang === "uz" ? "OFD / Virtual KKM URL (ixtiyoriy)" : "URL шлюза ОФД / Virtual KKM (опц.)",
    value: taxProfile.ofd_gateway_url,
    onChange: e => setTaxProfile(p => ({
      ...p,
      ofd_gateway_url: e.target.value
    })),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono"
  }), /*#__PURE__*/React.createElement("input", {
    type: "password",
    placeholder: taxProfile.has_ofd_token ? lang === "uz" ? "🟢 Token saqlangan (almashtirish...)" : "🟢 Токен сохранён (заменить...)" : lang === "uz" ? "OFD API Token (ixtiyoriy)" : "API-токен ОФД (опц.)",
    value: taxProfile.ofd_api_token,
    onChange: e => setTaxProfile(p => ({
      ...p,
      ofd_api_token: e.target.value
    })),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono"
  })), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 cursor-pointer text-[11px] font-bold text-indigo-950 dark:text-indigo-200"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: taxProfile.strict_tobacco_marking,
    onChange: e => setTaxProfile(p => ({
      ...p,
      strict_tobacco_marking: e.target.checked
    })),
    className: "rounded text-indigo-600"
  }), /*#__PURE__*/React.createElement("span", null, "🚬 ", lang === "uz" ? "Kassada tamaki uchun DataMatrix skaneri majburiy" : "На кассе требовать скан DataMatrix для табака")), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 cursor-pointer text-[11px] font-bold text-cyan-950 dark:text-cyan-200"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: taxProfile.strict_beverage_marking,
    onChange: e => setTaxProfile(p => ({
      ...p,
      strict_beverage_marking: e.target.checked
    })),
    className: "rounded text-cyan-600"
  }), /*#__PURE__*/React.createElement("span", null, "🥤 ", lang === "uz" ? "Suv, ichimlik va pivo uchun DataMatrix skaneri majburiy (VMQ №631)" : "Требовать DataMatrix для воды, напитков и пива (ПКМ №631)")), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-indigo-700 dark:text-indigo-300 leading-snug bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900"
  }, "⚠️ ", lang === "uz" ? "VMQ №943 bo'yicha qonuniy fiskal chek uchun sertifikatlangan OFD/FM shlyuzi (E-POS, Multikassa, Arca) ulanishi shart." : "По ПКМ №943 для полной юридической фискализации подключите сертифицированный шлюз ОФД/ФМ (E-POS, Multikassa, Arca)."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: savingTax,
    onClick: saveTaxProfile,
    className: "w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
  }, savingTax ? "..." : lang === "uz" ? "Soliq profilini saqlash" : "Сохранить налоговый профиль"))), /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-slate-800 dark:text-slate-200"
  }, "🔑 ", lang === "uz" ? "Parolni almashtirish" : "Сменить пароль"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, lang === "uz" ? "Kamida 12 belgili parol" : "Пароль от 12 символов")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      onClose();
      onOpenPasswordModal();
    },
    className: "px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl font-bold"
  }, lang === "uz" ? "O'zgartirish" : "Сменить")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-slate-800 dark:text-slate-200"
  }, "📲 ", lang === "uz" ? "Boshqa telefonda ochish (QR)" : "Открыть на другом телефоне"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, lang === "uz" ? "Kassa havolasi va QR-kod" : "QR-код и ссылка для телефона")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      onClose();
      onOpenPhoneModal();
    },
    className: "px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl font-bold"
  }, "QR"))), typeof window !== 'undefined' && window.AndroidPOS && /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-emerald-900 dark:text-emerald-200"
  }, "🌐 ", lang === "uz" ? "POS Server manzili" : "Адрес сервера POS"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-emerald-700 dark:text-emerald-400"
  }, lang === "uz" ? "Bulut yoki lokal Wi-Fi serverni almashtirish" : "Сменить URL сервера")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => window.AndroidPOS.openServerSettings(),
    className: "px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
  }, lang === "uz" ? "Sozlash" : "Настроить")), user?.role === 'owner' && /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-slate-800 dark:text-slate-200"
  }, "☁️ ", lang === "uz" ? "Baza zaxirasi (Backup)" : "Резервная копия базы"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: downloading,
    onClick: downloadBackup,
    className: "px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50"
  }, /*#__PURE__*/React.createElement("span", null, "💾"), /*#__PURE__*/React.createElement("span", null, downloading ? lang === "uz" ? "Yuklanmoqda..." : "Выгрузка..." : lang === "uz" ? "Zaxira yuklash (.db)" : "Скачать бэкап (.db)")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowDangerZone(!showDangerZone),
    className: "px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
  }, "⚠️ ", lang === "uz" ? "Xizmat amallari" : "Обслуживание")), showDangerZone && /*#__PURE__*/React.createElement("div", {
    className: "mt-2 p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-slate-600 dark:text-slate-300 font-semibold"
  }, lang === "uz" ? "Faqat demo ma'lumotlarni tozalash:" : "Удалить только демо-данные:"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: purgeLoading,
    onClick: purgeDemoOnly,
    className: "px-2.5 py-1.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg font-bold"
  }, purgeLoading ? "..." : lang === "uz" ? "🧹 Tozalash" : "🧹 Очистить")), /*#__PURE__*/React.createElement("form", {
    onSubmit: clearCatalog,
    className: "space-y-1.5 pt-2 border-t border-rose-200 dark:border-rose-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-rose-700 dark:text-rose-300"
  }, "🗑️ ", lang === "uz" ? "Barcha savdo va tovarlarni o'chirish:" : "Полная очистка базы:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "DELETE ALL STORE DATA",
    value: clearConfirmText,
    onChange: e => setClearConfirmText(e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    placeholder: lang === "uz" ? "Joriy parolingiz" : "Ваш пароль",
    value: clearPassword,
    onChange: e => setClearPassword(e.target.value),
    className: "flex-1 bg-white dark:bg-slate-900 border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: clearLoading,
    className: "px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold disabled:opacity-50"
  }, clearLoading ? "..." : lang === "uz" ? "Tozalash" : "Очистить")))))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 flex items-center justify-between shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onLogout,
    className: "px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "🚪"), /*#__PURE__*/React.createElement("span", null, lang === "uz" ? "Chiqish" : "Выйти")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
  }, t.closeModal || (lang === "uz" ? "Yopish" : "Закрыть")))));
}

// ------------------- REUSABLE UZBEKISTAN TAX & TOBACCO PRODUCT FIELDS -------------------
function TaxProductFields({
  token,
  lang = 'uz',
  ikpuCode,
  setIkpuCode,
  packageCode,
  setPackageCode,
  vatRate,
  setVatRate,
  isTobacco,
  setIsTobacco,
  requiresMarking,
  setRequiresMarking,
  markingGroup = 'NONE',
  setMarkingGroup,
  productName = ''
}) {
  const [searching, setSearching] = useState(false);
  const [hints, setHints] = useState([]);
  const [showTax, setShowTax] = useState(Boolean(ikpuCode || packageCode || isTobacco || requiresMarking || markingGroup && markingGroup !== 'NONE' || Number(vatRate) > 0));
  const runMxikSearch = async () => {
    setSearching(true);
    try {
      const q = ikpuCode?.trim() || productName?.trim() || (isTobacco ? 'сигареты' : '');
      const res = await fetch(`${API_BASE}/tax/mxik-search?q=${encodeURIComponent(q)}`, {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      });
      if (res.ok) {
        const d = await res.json();
        setHints(safeArray(d.items));
      }
    } catch (e) {} finally {
      setSearching(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 dark:text-slate-200"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: Boolean(isTobacco),
    onChange: e => {
      const checked = e.target.checked;
      setIsTobacco(checked);
      if (checked) {
        setRequiresMarking(true);
        if (setMarkingGroup) setMarkingGroup('TOBACCO');
        setShowTax(true);
      } else if (markingGroup === 'TOBACCO' && setMarkingGroup) {
        setMarkingGroup('NONE');
      }
    },
    className: "w-4 h-4 rounded text-amber-600"
  }), /*#__PURE__*/React.createElement("span", null, "🚬 ", lang === 'uz' ? "Tamaki / 18+ (DataMatrix)" : "Табак / 18+ (DataMatrix)")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowTax(!showTax),
    className: "text-[11px] font-bold text-indigo-600 dark:text-indigo-400"
  }, "🏛️ ", lang === 'uz' ? "IKPU / Qadoq / QQS" : "ИКПУ / Упак. / НДС", " ", showTax ? '▲' : '▼')), showTax && /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5 items-center"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "17 xonali IKPU (MXIK)" : "17-значный ИКПУ (MXIK)",
    value: ikpuCode || '',
    onChange: e => setIkpuCode(e.target.value.replace(/\D/g, '').slice(0, 17)),
    className: "flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: searching,
    onClick: runMxikSearch,
    className: "px-2.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px]"
  }, searching ? '...' : '🔍 IKPU'), /*#__PURE__*/React.createElement("select", {
    value: String(vatRate ?? 0),
    onChange: e => setVatRate(Number(e.target.value)),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-[11px] font-bold"
  }, /*#__PURE__*/React.createElement("option", {
    value: "0"
  }, "0% QQS"), /*#__PURE__*/React.createElement("option", {
    value: "12"
  }, "12% НДС"), /*#__PURE__*/React.createElement("option", {
    value: "-1"
  }, "Без НДС"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Qadoq kodi (PackageCode)" : "Код упаковки (PackageCode)",
    value: packageCode || '',
    onChange: e => setPackageCode && setPackageCode(e.target.value.trim().slice(0, 32)),
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] font-mono"
  }), /*#__PURE__*/React.createElement("select", {
    value: markingGroup || (isTobacco ? 'TOBACCO' : 'NONE'),
    onChange: e => {
      const mg = e.target.value;
      if (setMarkingGroup) setMarkingGroup(mg);
      if (mg === 'TOBACCO') {
        setIsTobacco(true);
        setRequiresMarking(true);
      } else if (mg !== 'NONE') {
        setIsTobacco(false);
        setRequiresMarking(true);
      } else {
        setIsTobacco(false);
      }
    },
    className: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-[11px] font-bold"
  }, /*#__PURE__*/React.createElement("option", {
    value: "NONE"
  }, lang === 'uz' ? "Markirovkasiz" : "Без маркировки"), /*#__PURE__*/React.createElement("option", {
    value: "TOBACCO"
  }, "🚬 ", lang === 'uz' ? "Tamaki (18+)" : "Табак / стики"), /*#__PURE__*/React.createElement("option", {
    value: "BEVERAGES"
  }, "🥤 ", lang === 'uz' ? "Suv va ichimliklar" : "Вода и напитки"), /*#__PURE__*/React.createElement("option", {
    value: "BEER_ALCOHOL"
  }, "🍺 ", lang === 'uz' ? "Pivo / Alkogol" : "Пиво / Алкоголь"), /*#__PURE__*/React.createElement("option", {
    value: "OTHER"
  }, "🏷️ ", lang === 'uz' ? "Boshqa markirovka" : "Прочее Asl Belgisi"))), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-300"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: Boolean(requiresMarking),
    onChange: e => setRequiresMarking(e.target.checked),
    className: "rounded text-indigo-600"
  }), /*#__PURE__*/React.createElement("span", null, "🏷️ ", lang === 'uz' ? "Majburiy markirovka (Asl Belgisi DataMatrix)" : "Обязательная маркировка (Asl Belgisi DataMatrix)")), hints.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "max-h-28 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800"
  }, hints.map((h, idx) => /*#__PURE__*/React.createElement("button", {
    key: idx,
    type: "button",
    onClick: () => {
      setIkpuCode(h.mxik);
      if (setPackageCode && h.package_code) setPackageCode(h.package_code);
      if (h.marking_group && h.marking_group !== 'NONE') {
        setRequiresMarking(true);
        if (setMarkingGroup) setMarkingGroup(h.marking_group);
        setIsTobacco(h.marking_group === 'TOBACCO');
      }
      setHints([]);
    },
    className: "w-full text-left px-2 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[10px] flex justify-between gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "truncate"
  }, h.name, h.package_code ? ` [${h.package_code}]` : ''), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-bold text-indigo-600 shrink-0"
  }, h.mxik))))));
}

// ------------------- EDIT PRODUCT MODAL -------------------
function EditProductModal({
  token,
  product,
  categories: propCategories,
  onClose,
  onSuccess,
  notify,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [name, setName] = useState(product.name || "");
  const [barcode, setBarcode] = useState(product.barcode || "");
  const [categoryId, setCategoryId] = useState(product.category_id ? String(product.category_id) : "");
  const [categories, setCategories] = useState(propCategories || []);
  const [unit, setUnit] = useState(product.unit || "dona");
  const [purchasePrice, setPurchasePrice] = useState(String(product.purchase_price ?? ""));
  const [salePrice, setSalePrice] = useState(String(product.sale_price || ""));
  const [stockQuantity, setStockQuantity] = useState(String(product.stock_quantity ?? "0"));
  const [expiryDate, setExpiryDate] = useState(product.expiry_date || "");
  const [ikpuCode, setIkpuCode] = useState(product.ikpu_code || "");
  const [packageCode, setPackageCode] = useState(product.package_code || "");
  const [vatRate, setVatRate] = useState(Number(product.vat_rate ?? 0));
  const [isTobacco, setIsTobacco] = useState(Boolean(product.is_tobacco));
  const [requiresMarking, setRequiresMarking] = useState(Boolean(product.requires_marking));
  const [markingGroup, setMarkingGroup] = useState(product.marking_group || (product.is_tobacco ? "TOBACCO" : "NONE"));
  const [isQuick, setIsQuick] = useState(Boolean(product.is_quick));
  const [loading, setLoading] = useState(false);
  const pNum = Number(purchasePrice) || 0;
  const sNum = Number(salePrice) || 0;
  const marginPct = pNum > 0 && sNum > 0 ? Math.round((sNum - pNum) / pNum * 100) : 0;
  const applyMarkup = pct => {
    if (pNum > 0) setSalePrice(String(Math.round(pNum * (1 + pct / 100) / 100) * 100));
  };
  useEffect(() => {
    if (!categories || categories.length === 0) {
      fetch(`${API_BASE}/products/categories/all`, {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      }).then(r => r.json()).then(data => {
        const list = Array.isArray(data) ? data : data?.categories || data?.items || [];
        setCategories(list);
        if (list.length > 0 && !categoryId) setCategoryId(String(list[0].id));
      }).catch(() => {});
    }
  }, []);
  const submit = async e => {
    e.preventDefault();
    if (!name.trim() || !salePrice) {
      notify(lang === "uz" ? "Nom va sotish narxini to'ldiring" : "Заполните название и цену продажи", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        category_id: categoryId ? Number(categoryId) : null,
        unit: unit || "dona",
        purchase_price: purchasePrice !== "" ? Number(purchasePrice) : undefined,
        sale_price: Number(salePrice),
        stock_quantity: Number(stockQuantity) || 0,
        expiry_date: expiryDate.trim() || null,
        ikpu_code: ikpuCode.trim() || null,
        package_code: packageCode.trim() || null,
        vat_rate: Number(vatRate) || 0,
        is_tobacco: Boolean(isTobacco),
        requires_marking: Boolean(requiresMarking || isTobacco || markingGroup && markingGroup !== "NONE"),
        marking_group: isTobacco ? "TOBACCO" : markingGroup || "NONE",
        is_quick: Boolean(isQuick)
      };
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || (lang === "uz" ? "Mahsulotni yangilashda xatolik" : "Ошибка обновления товара"));
      notify(lang === "uz" ? `Tovar yangilandi: ${name}` : `Товар обновлен: ${name}`);
      onSuccess(data);
      onClose();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-4 sm:p-5 shadow-2xl text-slate-800 dark:text-slate-100 modal-mobile-safe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "✏️"), /*#__PURE__*/React.createElement("span", null, lang === "uz" ? "Tovarni tahrirlash" : "Редактировать товар")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg p-1"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === "uz" ? "Mahsulot nomi *" : "Наименование товара *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: name,
    onChange: e => setName(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === "uz" ? "Shtrixkod" : "Штрихкод"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: barcode,
    onChange: e => setBarcode(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === "uz" ? "Kategoriya" : "Категория"), /*#__PURE__*/React.createElement("select", {
    value: categoryId,
    onChange: e => setCategoryId(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 font-medium"
  }, safeArray(categories).map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name.split('/')[0].trim()))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === "uz" ? "Kirim narx" : "Закуп"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: purchasePrice,
    onChange: e => setPurchasePrice(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 font-mono"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === "uz" ? "Sotish narx *" : "Продажа *"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    required: true,
    value: salePrice,
    onChange: e => setSalePrice(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-emerald-500 rounded-xl px-2.5 py-2 font-mono font-bold text-emerald-600"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === "uz" ? "Qoldiq" : "Остаток"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: stockQuantity,
    onChange: e => setStockQuantity(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 font-mono font-bold"
  }))), pNum > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-emerald-700 dark:text-emerald-300"
  }, "💰 ", lang === "uz" ? "Foyda:" : "Маржа:", " ", formatMoney(sNum - pNum), " (", marginPct, "%)"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1"
  }, [15, 20, 25, 30].map(pct => /*#__PURE__*/React.createElement("button", {
    key: pct,
    type: "button",
    onClick: () => applyMarkup(pct),
    className: "px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 font-bold text-[11px]"
  }, "+", pct, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2 items-end"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === "uz" ? "Yaroqlilik muddati:" : "Срок годности:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: expiryDate,
    onChange: e => setExpiryDate(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === "uz" ? "Birlik" : "Ед. изм."), /*#__PURE__*/React.createElement("select", {
    value: unit,
    onChange: e => setUnit(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5"
  }, /*#__PURE__*/React.createElement("option", {
    value: "dona"
  }, "dona"), /*#__PURE__*/React.createElement("option", {
    value: "kg"
  }, "kg"), /*#__PURE__*/React.createElement("option", {
    value: "l"
  }, "l"), /*#__PURE__*/React.createElement("option", {
    value: "quti"
  }, "quti"), /*#__PURE__*/React.createElement("option", {
    value: "metr"
  }, "metr")))), /*#__PURE__*/React.createElement(TaxProductFields, {
    token: token,
    lang: lang,
    ikpuCode: ikpuCode,
    setIkpuCode: setIkpuCode,
    packageCode: packageCode,
    setPackageCode: setPackageCode,
    vatRate: vatRate,
    setVatRate: setVatRate,
    isTobacco: isTobacco,
    setIsTobacco: setIsTobacco,
    requiresMarking: requiresMarking,
    setRequiresMarking: setRequiresMarking,
    markingGroup: markingGroup,
    setMarkingGroup: setMarkingGroup,
    productName: name
  }), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 cursor-pointer pt-1"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isQuick,
    onChange: e => setIsQuick(e.target.checked),
    className: "rounded text-emerald-600"
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-slate-700 dark:text-slate-300"
  }, "⚡ ", lang === "uz" ? "Tezkor tovarlar panelida ko'rsatish" : "Показывать в быстрых товарах"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
  }, t.cancelBtn || "Bekor qilish"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
  }, loading ? "..." : lang === "uz" ? "Saqlash" : "Сохранить"))));
}

// ------------------- SUPPLIER RECONCILIATION MODAL -------------------
function SupplierReconciliationModal({
  token,
  supplierId,
  onClose,
  notify,
  lang: propLang,
  t
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API_BASE}/suppliers/${supplierId}/reconciliation`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.json()).then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => {
      notify(lang === "uz" ? "Sverka yuklashda xatolik" : "Ошибка загрузки акта сверки", "error");
      setLoading(false);
    });
  }, [supplierId]);
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "🧾"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, lang === "uz" ? "Ta'minotchi bilan hisob-kitob (Акт сверки)" : "Акт сверки расчётов с поставщиком"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, data?.supplier?.name, " ", data?.supplier?.phone ? `• 📞 ${data.supplier.phone}` : ""))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), loading || !data ? /*#__PURE__*/React.createElement("div", {
    className: "py-12 text-center text-xs text-slate-400"
  }, "Yuklanmoqda...") : /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-4 pr-1 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, lang === "uz" ? "Jami yetkazilgan" : "Всего отгружено"), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-black text-slate-800 dark:text-slate-200 font-mono"
  }, formatMoney(data.summary.total_invoiced))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, lang === "uz" ? "To'langan summa" : "Оплачено"), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono"
  }, formatMoney(data.summary.total_paid))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, lang === "uz" ? "Qarz qoldig'i" : "Остаток долга"), /*#__PURE__*/React.createElement("span", {
    className: `text-sm font-black font-mono ${data.summary.current_debt > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}`
  }, formatMoney(data.summary.current_debt)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-xs text-slate-800 dark:text-slate-200 mb-2"
  }, "📦 ", lang === "uz" ? "Yuk xatlari (Fakturalar)" : "Накладные и оплаты", " (", data.invoices.length, ")"), /*#__PURE__*/React.createElement("div", {
    className: "border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
  }, data.invoices.map(inv => /*#__PURE__*/React.createElement("div", {
    key: inv.id,
    className: "p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-mono font-bold text-slate-900 dark:text-slate-100"
  }, "№ ", inv.invoice_number), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, inv.date ? inv.date.slice(0, 10) : "")), /*#__PURE__*/React.createElement("div", {
    className: "text-right font-mono"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-slate-900 dark:text-slate-100"
  }, formatMoney(inv.total_amount)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-emerald-600"
  }, "To'landi: ", formatMoney(inv.paid_amount)), inv.debt_to_supplier > 0 && /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-amber-600 font-bold"
  }, "Qarz: ", formatMoney(inv.debt_to_supplier)))))))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
  }, t.closeModal || "Yopish"))));
}

// ------------------- DAY DETAILS MODAL (ACCOUNTING) -------------------
function DayDetailsModal({
  token,
  dateStr,
  onClose,
  notify,
  lang: propLang,
  t
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API_BASE}/analytics/day-details?date_str=${dateStr}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.json()).then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => {
      notify(lang === "uz" ? "Kunlik hisobotni yuklashda xatolik" : "Ошибка загрузки отчета за день", "error");
      setLoading(false);
    });
  }, [dateStr]);
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "📅"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, lang === "uz" ? `${data?.date_label || dateStr} hisoboti` : `Отчет за ${data?.date_label || dateStr}`), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, lang === "uz" ? "Cheklar, tushum, tannarx va foyda" : "Выручка, себестоимость, чеки и прибыль"))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), loading || !data ? /*#__PURE__*/React.createElement("div", {
    className: "py-12 text-center text-xs text-slate-400"
  }, "Yuklanmoqda...") : /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-4 pr-1 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, lang === "uz" ? "Tushum (Выручка)" : "Выручка"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono"
  }, formatMoney(data.revenue))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, lang === "uz" ? "Cheklar soni" : "Чеков"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono"
  }, data.sales_count), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block mt-0.5"
  }, "O'rtacha: ", formatMoney(data.average_receipt))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, lang === "uz" ? "Tannarx (COGS)" : "Себестоимость"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-extrabold text-slate-700 dark:text-slate-300 font-mono"
  }, formatMoney(data.cogs))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, lang === "uz" ? "Sof foyda" : "Чистая прибыль"), /*#__PURE__*/React.createElement("span", {
    className: `text-base font-extrabold font-mono ${data.net_profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`
  }, formatMoney(data.net_profit)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-2"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-xs text-slate-800 dark:text-slate-200"
  }, "🧾 ", lang === "uz" ? "Kunning barcha cheklari" : "Список чеков за день", " (", data.sales.length, ")")), data.sales.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-6 text-xs text-slate-400"
  }, lang === "uz" ? "Ushbu kunda savdo bo'lmagan" : "В этот день продаж не было") : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, data.sales.map(sale => /*#__PURE__*/React.createElement("div", {
    key: sale.id,
    className: "p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "🧾 Chek #", sale.receipt_number || sale.id), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-mono"
  }, sale.payment_method)), /*#__PURE__*/React.createElement("div", {
    className: "font-mono font-black text-emerald-600 dark:text-emerald-400"
  }, formatMoney(sale.total_amount))), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 dark:text-slate-400"
  }, sale.time ? sale.time.slice(0, 5) : "", " • ", sale.cashier_name || "Kassir"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-600 dark:text-slate-300 font-mono"
  }, sale.items_summary || safeArray(sale.items).map(i => `${i.product_name} ×${i.quantity}`).join(', '))))))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
  }, t.closeModal || "Yopish"))));
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
  const [theme, setTheme] = useState(() => localStorage.getItem('pos_theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('pos_lang') || 'uz');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('pos_sound') !== 'false');
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [cashierSwitchOpen, setCashierSwitchOpen] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const toastTimerRef = useRef(null);
  const lastVerifiedTokenRef = useRef(null);
  const loadShiftBadge = () => {
    if (!token) return;
    fetch(`${API_BASE}/pos/shift/current`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.ok ? r.json() : null).then(d => {
      if (d) setCurrentShift(d);
    }).catch(() => {});
  };
  useEffect(() => {
    loadShiftBadge();
  }, [token]);
  useEffect(() => {
    if (!token || lastVerifiedTokenRef.current === token) return;
    let cancelled = false;
    fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(async r => {
      if (cancelled || !r.ok) return;
      lastVerifiedTokenRef.current = token;
      const me = await r.json();
      if (!cancelled && me?.username) {
        const freshUser = {
          username: me.username,
          full_name: me.full_name,
          role: me.role
        };
        setUser(freshUser);
        localStorage.setItem('pos_user', JSON.stringify(freshUser));
      }
      const refRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!cancelled && refRes.ok) {
        const refData = await refRes.json();
        if (refData?.access_token) {
          lastVerifiedTokenRef.current = refData.access_token;
          if (refData.access_token !== token) {
            setToken(refData.access_token);
            localStorage.setItem('pos_token', refData.access_token);
          }
        }
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);
  useEffect(() => {
    const handlePrompt = e => {
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
    const {
      outcome
    } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      notify(lang === 'uz' ? "Ilova smartfonga o'rnatildi!" : "Приложение установлено!");
    }
    setDeferredPrompt(null);
  };
  const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;
  useEffect(() => {
    const root = document.documentElement;
    const meta = document.getElementById('meta-theme-color');
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      if (meta) meta.setAttribute('content', '#EEF2FF');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      if (meta) meta.setAttribute('content', '#0A0F24');
    }
    localStorage.setItem('pos_theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('pos_lang', lang);
    if (typeof window !== 'undefined') window.pos_lang = lang;
  }, [lang]);
  useEffect(() => {
    localStorage.setItem('pos_sound', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'uz' ? 'ru' : 'uz');
  const toggleSound = () => setSoundEnabled(prev => !prev);
  const notify = (message, type = 'success') => {
    setNotification({
      message,
      type
    });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setNotification(null), 4000);
  };
  const handleLogin = (newToken, newUser) => {
    lastVerifiedTokenRef.current = newToken;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('pos_token', newToken);
    localStorage.setItem('pos_user', JSON.stringify(newUser));
    notify(`${t.welcome}, ${newUser.full_name}!`);
  };
  const handleLogout = () => {
    lastVerifiedTokenRef.current = null;
    setToken(null);
    setUser(null);
    setCurrentShift(null);
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    try {
      localStorage.removeItem('pos_active_cart');
    } catch (e) {}
  };
  useEffect(() => {
    const onUnauthorized = () => {
      if (!localStorage.getItem('pos_token')) return;
      handleLogout();
      notify(lang === 'uz' ? 'Sessiya tugadi — tizimga qayta kiring' : 'Сессия истекла — войдите снова', 'error');
    };
    window.addEventListener('pos-unauthorized', onUnauthorized);
    return () => window.removeEventListener('pos-unauthorized', onUnauthorized);
  }, [lang]);
  const toastBanner = notification ? /*#__PURE__*/React.createElement("div", {
    className: `fixed top-3 right-3 left-3 sm:left-auto sm:min-w-[280px] sm:max-w-sm z-[80] px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${notification.type === 'error' ? 'atelier-toast-error' : 'atelier-toast-ok'}`
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: notification.type === 'error' ? '#FFFFFF' : notification.type === 'warn' ? 'var(--warm-fg)' : 'var(--cta)'
    },
    className: "shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: notification.type === 'error' ? 'alert' : 'check',
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "flex-1 leading-snug break-words"
  }, notification.message), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setNotification(null),
    className: "w-6 h-6 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 shrink-0",
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 13
  }))) : null;
  if (!token || !user) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, toastBanner, /*#__PURE__*/React.createElement(LoginScreen, {
      onLogin: handleLogin,
      notify: notify,
      t: t,
      theme: theme,
      toggleTheme: toggleTheme,
      lang: lang,
      toggleLang: toggleLang
    }));
  }
  const isOwner = user.role === 'owner';
  const navTabs = [{
    id: 'pos',
    icon: 'pos',
    label: lang === 'uz' ? 'Kassa' : 'Касса'
  }, {
    id: 'debts',
    icon: 'debts',
    label: lang === 'uz' ? 'Qarzlar' : 'Долги'
  }, {
    id: 'catalog',
    icon: 'box',
    label: lang === 'uz' ? 'Tovarlar' : 'Товары'
  }, ...(isOwner ? [{
    id: 'suppliers',
    icon: 'truck',
    label: lang === 'uz' ? 'Kirim' : 'Приход'
  }, {
    id: 'analytics',
    icon: 'chart',
    label: lang === 'uz' ? 'Hisobot' : 'Отчёты'
  }] : [])];
  return /*#__PURE__*/React.createElement("div", {
    className: "app-viewport atelier-app transition-colors duration-200"
  }, toastBanner, networkModalOpen && /*#__PURE__*/React.createElement(NetworkQrModal, {
    onClose: () => setNetworkModalOpen(false),
    t: t
  }), shiftModalOpen && /*#__PURE__*/React.createElement(CashShiftModal, {
    token: token,
    onClose: () => setShiftModalOpen(false),
    notify: notify,
    lang: lang,
    onShiftChange: loadShiftBadge
  }), cashierSwitchOpen && /*#__PURE__*/React.createElement(CashierSwitchModal, {
    token: token,
    currentUserId: user?.id || user?.username,
    onClose: () => setCashierSwitchOpen(false),
    onSwitch: (newToken, newUser) => {
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('pos_token', newToken);
      localStorage.setItem('pos_user', JSON.stringify(newUser));
    },
    notify: notify,
    t: t,
    lang: lang
  }), passwordChangeOpen && /*#__PURE__*/React.createElement(PasswordChangeModal, {
    token: token,
    lang: lang,
    notify: notify,
    onClose: () => setPasswordChangeOpen(false),
    onChanged: handleLogout
  }), settingsModalOpen && /*#__PURE__*/React.createElement(SettingsModal, {
    token: token,
    user: user,
    lang: lang,
    onLangChange: newLang => setLang(newLang),
    theme: theme,
    onToggleTheme: newTheme => setTheme(newTheme),
    soundEnabled: soundEnabled,
    onToggleSound: toggleSound,
    onOpenPasswordModal: () => setPasswordChangeOpen(true),
    onOpenPhoneModal: () => setNetworkModalOpen(true),
    onLogout: handleLogout,
    onClose: () => setSettingsModalOpen(false),
    notify: notify,
    t: t
  }), /*#__PURE__*/React.createElement("header", {
    className: "shrink-0 z-40 atelier-header px-3 py-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl atelier-btn-primary flex items-center justify-center shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bag",
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCashierSwitchOpen(true),
    className: "text-xs font-semibold px-2.5 py-1.5 rounded-full atelier-btn-soft flex items-center gap-1 min-w-0 max-w-[115px] sm:max-w-none",
    title: lang === 'uz' ? "Kassirni almashtirish" : "Смена кассира"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    className: "truncate"
  }, user ? user.full_name.split(' ')[0] : 'Kassir')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShiftModalOpen(true),
    style: {
      backgroundColor: currentShift?.is_open ? 'var(--accent-soft)' : 'var(--warm-bg)',
      color: currentShift?.is_open ? 'var(--accent-soft-fg)' : 'var(--warm-fg)',
      borderColor: 'var(--border-hair)'
    },
    className: "text-[11px] font-semibold px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 shrink-0 whitespace-nowrap",
    title: lang === 'uz' ? "Kassa smenasi va Z-hisobot" : "Кассовая смена"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      backgroundColor: currentShift?.is_open ? 'var(--cta)' : 'var(--warm-fg)'
    },
    className: "w-2 h-2 rounded-full shrink-0"
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-nums"
  }, currentShift?.is_open ? formatMoney(currentShift.shift?.expected_cash || 0) : lang === 'uz' ? 'Smena' : 'Смена +'))), /*#__PURE__*/React.createElement("nav", {
    className: "hidden lg:flex items-center gap-1 p-1 rounded-2xl atelier-subtle"
  }, navTabs.map(tab => /*#__PURE__*/React.createElement("button", {
    key: tab.id,
    type: "button",
    onClick: () => setActiveTab(tab.id),
    className: `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id ? 'atelier-btn-primary shadow-sm' : 'atelier-text-muted hover:opacity-100'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: tab.icon,
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, tab.label)))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 shrink-0"
  }, canInstall && !(typeof window !== 'undefined' && window.AndroidPOS) && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleInstallApp,
    className: "px-2.5 h-8 rounded-full text-xs font-semibold atelier-btn-cta flex items-center gap-1",
    title: t.installAppBtn
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 14
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggleTheme,
    className: "w-8 h-8 rounded-full atelier-btn-soft flex items-center justify-center",
    title: theme === 'dark' ? lang === 'uz' ? "Kunduzgi mavzu" : "Дневная тема" : lang === 'uz' ? "Tungi mavzu" : "Ночная тема"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === 'dark' ? 'sun' : 'moon',
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggleSound,
    className: "w-8 h-8 rounded-full atelier-btn-soft flex items-center justify-center",
    title: lang === 'uz' ? "Tovush signallari" : "Звук"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: soundEnabled ? 'soundOn' : 'soundOff',
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSettingsModalOpen(true),
    className: "px-3 h-8 rounded-full text-xs font-semibold atelier-btn-soft flex items-center gap-1.5",
    title: lang === "uz" ? "Sozlamalar" : "Настройки"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, lang === "uz" ? "Sozlash" : "Настройки"))))), /*#__PURE__*/React.createElement("main", {
    className: "app-main-content flex-1 min-h-0 flex flex-col overflow-hidden max-w-7xl w-full mx-auto p-2 sm:p-3"
  }, activeTab === 'pos' && /*#__PURE__*/React.createElement(PosScreen, {
    token: token,
    notify: notify,
    isOwner: isOwner,
    t: t,
    lang: lang,
    setLang: setLang,
    toggleLang: toggleLang,
    currentShift: currentShift,
    onShiftChange: loadShiftBadge,
    onOpenShift: () => setShiftModalOpen(true)
  }), activeTab === 'debts' && /*#__PURE__*/React.createElement(DebtsScreen, {
    token: token,
    notify: notify,
    t: t,
    lang: lang
  }), activeTab === 'catalog' && /*#__PURE__*/React.createElement(CatalogScreen, {
    token: token,
    notify: notify,
    isOwner: isOwner,
    t: t,
    lang: lang
  }), activeTab === 'suppliers' && isOwner && /*#__PURE__*/React.createElement(OperationsHubScreen, {
    token: token,
    notify: notify,
    t: t,
    lang: lang
  }), activeTab === 'expenses' && isOwner && /*#__PURE__*/React.createElement(OperationsHubScreen, {
    token: token,
    notify: notify,
    t: t,
    lang: lang,
    initialSection: "expenses"
  }), activeTab === 'analytics' && isOwner && /*#__PURE__*/React.createElement(AnalyticsScreen, {
    token: token,
    notify: notify,
    t: t,
    lang: lang
  })), /*#__PURE__*/React.createElement("nav", {
    className: "lg:hidden shrink-0 z-40 atelier-nav px-2 py-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-stretch justify-around gap-1"
  }, navTabs.map(tab => {
    const active = activeTab === tab.id;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.id,
      type: "button",
      onClick: () => setActiveTab(tab.id),
      className: `flex-1 min-w-0 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition ${active ? 'atelier-pill-active font-semibold' : 'atelier-text-muted'}`
    }, /*#__PURE__*/React.createElement(Icon, {
      name: tab.icon,
      size: 18
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] leading-tight truncate max-w-full"
    }, tab.label));
  }))));
}

// ------------------- LOGIN SCREEN -------------------
function LoginScreen({
  onLogin,
  notify,
  t,
  theme,
  toggleTheme,
  lang,
  toggleLang
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (u, p) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: (u || username).trim(),
          password: p || password
        })
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
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen atelier-app flex items-center justify-center p-4 transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-md atelier-card rounded-[32px] p-6 sm:p-8 transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggleLang,
    className: "px-3 py-1.5 rounded-full text-xs font-semibold atelier-btn-soft"
  }, lang === 'uz' ? "O'zbekcha" : 'Русский'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggleTheme,
    className: "px-3 py-1.5 rounded-full text-xs font-semibold atelier-btn-soft flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === 'dark' ? 'sun' : 'moon',
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, theme === 'dark' ? lang === 'uz' ? 'Kun' : 'День' : lang === 'uz' ? 'Tun' : 'Ночь'))), /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-2xl atelier-btn-primary mx-auto mb-3.5 flex items-center justify-center shadow-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bag",
    size: 26
  })), /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-bold tracking-tight"
  }, t.loginTitle), /*#__PURE__*/React.createElement("p", {
    className: "text-xs sm:text-sm atelier-text-muted mt-1"
  }, t.loginSubtitle)), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      submit();
    },
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold atelier-text-muted mb-1.5"
  }, t.usernameLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: username,
    onChange: e => setUsername(e.target.value),
    className: "w-full atelier-input rounded-2xl px-4 py-3 text-sm font-medium",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold atelier-text-muted mb-1.5"
  }, t.passwordLabel), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    className: "w-full atelier-input rounded-2xl px-4 py-3 text-sm font-medium",
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full atelier-btn-cta font-bold py-3.5 rounded-2xl shadow-sm touch-target text-sm mt-2"
  }, loading ? t.loggingIn : t.loginBtn))));
}

// ------------------- NETWORK QR / MOBILE ACCESS MODAL -------------------
function NetworkQrModal({
  onClose,
  t
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/network-info').then(res => res.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-base sm:text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
  }, /*#__PURE__*/React.createElement("span", null, "📲"), /*#__PURE__*/React.createElement("span", null, t.mobileModalTitle)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-600 dark:text-slate-400 mb-4"
  }, t.mobileModalDesc), loading ? /*#__PURE__*/React.createElement("div", {
    className: "py-12 text-center text-xs text-slate-400"
  }, t.processing) : data ? /*#__PURE__*/React.createElement("div", {
    className: "text-center space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto max-w-[240px]"
  }, data.svg_qr ? /*#__PURE__*/React.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: data.svg_qr
    },
    className: "w-48 h-48 mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
  }) : /*#__PURE__*/React.createElement("img", {
    src: "/qr.svg",
    alt: "QR Code",
    className: "w-48 h-48 mx-auto"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
  }, t.mobileModalUrlLabel), /*#__PURE__*/React.createElement("a", {
    href: data.mobile_url,
    target: "_blank",
    rel: "noreferrer",
    className: "font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 underline break-all bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 inline-block"
  }, data.mobile_url)), /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-left text-[11px] text-amber-900 dark:text-amber-200"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, "💡 PWA Maslahat: "), t.mobileModalPwaHelp)) : /*#__PURE__*/React.createElement("div", {
    className: "py-8 text-center text-xs text-rose-500"
  }, "IP manzilni aniqlab bo'lmadi"), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 pt-3 border-t border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
  }, t.closeBtn))));
}

// ------------------- TELEGRAM TEST / ZREPORT CLEANED OUT (integrated into Analytics -> Telegram) -------------------

function PasswordChangeModal({
  token,
  onClose,
  onChanged,
  notify,
  lang
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isUz = lang === 'uz';
  const submit = async event => {
    event.preventDefault();
    if (newPassword.length < 12) {
      notify(isUz ? 'Yangi parol kamida 12 belgidan iborat bo‘lsin' : 'Новый пароль должен быть не короче 12 символов', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify(isUz ? 'Parollar mos kelmadi' : 'Пароли не совпадают', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || (isUz ? 'Parolni almashtirib bo‘lmadi' : 'Не удалось сменить пароль'));
      }
      notify(isUz ? 'Parol yangilandi. Yangi parol bilan qayta kiring.' : 'Пароль изменён. Войдите с новым паролем.');
      onChanged();
      onClose();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-bold"
  }, isUz ? 'Parolni almashtirish' : 'Смена пароля'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": isUz ? 'Yopish' : 'Закрыть'
  }, "✕")), /*#__PURE__*/React.createElement("input", {
    autoComplete: "current-password",
    type: "password",
    required: true,
    value: currentPassword,
    onChange: e => setCurrentPassword(e.target.value),
    placeholder: isUz ? 'Joriy parol' : 'Текущий пароль',
    className: "w-full rounded-xl border bg-transparent p-3"
  }), /*#__PURE__*/React.createElement("input", {
    autoComplete: "new-password",
    type: "password",
    minLength: 12,
    required: true,
    value: newPassword,
    onChange: e => setNewPassword(e.target.value),
    placeholder: isUz ? 'Yangi parol (kamida 12 belgi)' : 'Новый пароль (не менее 12 символов)',
    className: "w-full rounded-xl border bg-transparent p-3"
  }), /*#__PURE__*/React.createElement("input", {
    autoComplete: "new-password",
    type: "password",
    minLength: 12,
    required: true,
    value: confirmPassword,
    onChange: e => setConfirmPassword(e.target.value),
    placeholder: isUz ? 'Yangi parolni takrorlang' : 'Повторите новый пароль',
    className: "w-full rounded-xl border bg-transparent p-3"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full rounded-xl bg-emerald-600 p-3 font-bold text-white disabled:opacity-50"
  }, loading ? isUz ? 'Saqlanmoqda…' : 'Сохранение…' : isUz ? 'Saqlash' : 'Сохранить')));
}

// ------------------- CASHIER SWITCH MODAL (3-4 CASHIERS) -------------------
function CashierSwitchModal({
  token,
  currentUserId,
  onClose,
  onSwitch,
  notify,
  t,
  lang
}) {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [password, setPassword] = useState('');
  useEffect(() => {
    fetchCashiers();
  }, []);
  const fetchCashiers = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/cashiers`, {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      });
      if (!res.ok) {
        setCashiers([]);
        return;
      }
      const data = await res.json();
      setCashiers(safeArray(data));
    } catch (e) {
      console.error(e);
      setCashiers([]);
    }
  };
  const handleSelect = async event => {
    event.preventDefault();
    if (!selectedCashier || !password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/switch-cashier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cashier_id: selectedCashier.id,
          password
        })
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "👥"), /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, t.cashierSwitchTitle || 'Kassirni tanlang (1-bosish)')), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400 mb-3"
  }, lang === 'uz' ? 'Kun davomida smenani almashtirish uchun kassir nomini bosing:' : 'Нажмите на имя кассира для мгновенного переключения смены:'), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 max-h-72 overflow-y-auto pr-1"
  }, safeArray(cashiers).map(c => {
    const isCurrent = c.id === currentUserId || c.username === currentUserId;
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: () => {
        setSelectedCashier(c);
        setPassword('');
      },
      disabled: loading,
      className: `w-full p-3 rounded-2xl flex items-center justify-between transition border text-left touch-target ${isCurrent ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xl"
    }, c.role === 'owner' ? '👑' : '👩‍💼'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold"
    }, c.full_name), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-slate-400 uppercase font-mono"
    }, c.role, " • @", c.username))), selectedCashier?.id === c.id && /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full"
    }, lang === 'uz' ? 'Tanlandi' : 'Выбран'));
  })), selectedCashier && /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSelect,
    className: "mt-3 flex gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    type: "password",
    autoComplete: "current-password",
    value: password,
    onChange: event => setPassword(event.target.value),
    placeholder: lang === 'uz' ? 'Kassir paroli' : 'Пароль кассира',
    className: "min-w-0 flex-1 rounded-xl border bg-transparent p-3 text-sm",
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "rounded-xl bg-emerald-600 px-4 font-bold text-white disabled:opacity-50"
  }, loading ? '…' : lang === 'uz' ? 'Kirish' : 'Войти'))));
}

// ------------------- CAMERA BARCODE SCANNER MODAL (MULTI-TIER SCANNER) ------------
function CameraScannerModal({
  onScan,
  onClose,
  notify,
  t,
  lang
}) {
  const [torchOn, setTorchOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canZoom, setCanZoom] = useState(false);
  const [canTorch, setCanTorch] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [engineType, setEngineType] = useState('initializing'); // 'hardware' | 'html5' | 'camera_error'
  const [manualBarcode, setManualBarcode] = useState('');
  const [showNumpad, setShowNumpad] = useState(false);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const videoRef = useRef(null);
  const html5QrRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const activeTrackRef = useRef(null);
  const animFrameRef = useRef(null);
  const isScannedRef = useRef(false);
  const fileInputRef = useRef(null);
  const triggerSuccess = code => {
    if (!code || isScannedRef.current) return;
    isScannedRef.current = true;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
    if (navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }
    onScan(code.trim());
  };
  const inspectTrack = track => {
    activeTrackRef.current = track;
    if (track && track.getCapabilities) {
      try {
        const caps = track.getCapabilities();
        if (caps.torch) setCanTorch(true);
        if (caps.zoom) setCanZoom(true);
      } catch (e) {}
    }
  };
  useEffect(() => {
    isScannedRef.current = false;
    let isMounted = true;
    let nativeDetector = null;
    let html5Instance = null;
    const stopAllStreams = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(tr => {
          try {
            tr.stop();
          } catch (e) {}
        });
        mediaStreamRef.current = null;
      }
      if (html5Instance && html5Instance.isScanning) {
        try {
          html5Instance.stop().then(() => html5Instance.clear()).catch(() => {});
        } catch (e) {}
      }
    };
    const startScanner = async () => {
      // LEVEL 1: Check Native window.BarcodeDetector
      const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
      if (hasBarcodeDetector) {
        try {
          const desiredFormats = ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code', 'data_matrix'];
          let supported = desiredFormats;
          if (window.BarcodeDetector.getSupportedFormats) {
            try {
              const avail = await window.BarcodeDetector.getSupportedFormats();
              supported = desiredFormats.filter(f => avail.includes(f));
            } catch (e) {}
          }
          nativeDetector = new window.BarcodeDetector({
            formats: supported.length ? supported : ['qr_code']
          });
          let stream = null;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: {
                  ideal: facingMode
                },
                width: {
                  ideal: 1920,
                  min: 1280
                },
                height: {
                  ideal: 1080,
                  min: 720
                },
                advanced: [{
                  focusMode: 'continuous'
                }]
              },
              audio: false
            });
          } catch (resErr) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: facingMode,
                  advanced: [{
                    focusMode: 'continuous'
                  }]
                },
                audio: false
              });
            } catch (e2) {
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: facingMode
                },
                audio: false
              });
            }
          }
          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          mediaStreamRef.current = stream;
          const track = stream.getVideoTracks()[0];
          inspectTrack(track);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setEngineType('hardware');
          const detectLoop = async () => {
            if (!isMounted || isScannedRef.current) return;
            if (videoRef.current && videoRef.current.readyState >= 2) {
              try {
                const barcodes = await nativeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  triggerSuccess(barcodes[0].rawValue);
                  return;
                }
              } catch (e) {}
            }
            animFrameRef.current = requestAnimationFrame(detectLoop);
          };
          detectLoop();
          return;
        } catch (err) {
          console.warn('Native BarcodeDetector init failed, falling back to Html5Qrcode:', err);
          stopAllStreams();
        }
      }

      // LEVEL 2: Html5Qrcode fallback
      try {
        if (window.Html5Qrcode) {
          const formats = window.Html5QrcodeSupportedFormats ? [window.Html5QrcodeSupportedFormats.EAN_13, window.Html5QrcodeSupportedFormats.EAN_8, window.Html5QrcodeSupportedFormats.CODE_128, window.Html5QrcodeSupportedFormats.CODE_39, window.Html5QrcodeSupportedFormats.UPC_A, window.Html5QrcodeSupportedFormats.UPC_E, window.Html5QrcodeSupportedFormats.QR_CODE, window.Html5QrcodeSupportedFormats.DATA_MATRIX] : undefined;
          html5Instance = new window.Html5Qrcode('qr-reader', {
            formatsToSupport: formats,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            },
            verbose: false
          });
          html5QrRef.current = html5Instance;
          const config = {
            fps: 15,
            qrbox: {
              width: 300,
              height: 140
            },
            aspectRatio: 1.333333
          };
          try {
            await html5Instance.start({
              facingMode: facingMode,
              width: {
                min: 1280,
                ideal: 1920
              },
              height: {
                min: 720,
                ideal: 1080
              },
              advanced: [{
                focusMode: 'continuous'
              }]
            }, config, decodedText => triggerSuccess(decodedText), () => {});
          } catch (strictErr) {
            await html5Instance.start({
              facingMode: facingMode
            }, config, decodedText => triggerSuccess(decodedText), () => {});
          }
          if (isMounted) {
            setEngineType('html5');
            const el = document.querySelector('#qr-reader video');
            if (el && el.srcObject) {
              const tr = el.srcObject.getVideoTracks()[0];
              inspectTrack(tr);
            }
          }
        }
      } catch (err) {
        console.error('Html5Qrcode start error:', err);
        if (isMounted) {
          setEngineType('camera_error');
          notify(lang === 'uz' ? "Kameraga ulanib bo'lmadi: " + err.message : 'Ошибка камеры: ' + err.message, 'error');
        }
      }
    };
    startScanner();
    return () => {
      isMounted = false;
      stopAllStreams();
    };
  }, [facingMode]);
  const toggleTorch = async () => {
    try {
      const next = !torchOn;
      if (activeTrackRef.current && activeTrackRef.current.applyConstraints) {
        await activeTrackRef.current.applyConstraints({
          advanced: [{
            torch: next
          }]
        });
        setTorchOn(next);
      } else if (html5QrRef.current && html5QrRef.current.applyVideoConstraints) {
        await html5QrRef.current.applyVideoConstraints({
          advanced: [{
            torch: next
          }]
        });
        setTorchOn(next);
      }
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };
  const toggleZoom = async () => {
    try {
      if (!activeTrackRef.current) return;
      const caps = activeTrackRef.current.getCapabilities ? activeTrackRef.current.getCapabilities() : {};
      if (!caps.zoom) return;
      const maxZ = Math.min(caps.zoom.max || 3, 3);
      const nextZ = zoomLevel >= maxZ ? 1 : Math.min(zoomLevel + 1, maxZ);
      await activeTrackRef.current.applyConstraints({
        advanced: [{
          zoom: nextZ
        }]
      });
      setZoomLevel(nextZ);
    } catch (e) {
      console.warn('Zoom error:', e);
    }
  };
  const flipCamera = () => {
    setTorchOn(false);
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };
  const handlePhotoUpload = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoProcessing(true);
    try {
      // Step A: Native BarcodeDetector on image
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code', 'data_matrix']
          });
          const bitmap = await createImageBitmap(file);
          const results = await detector.detect(bitmap);
          if (results && results.length > 0 && results[0].rawValue) {
            triggerSuccess(results[0].rawValue);
            setPhotoProcessing(false);
            return;
          }
        } catch (e) {}
      }

      // Step B: Html5Qrcode.scanFile
      if (window.Html5Qrcode) {
        try {
          const tempScanner = html5QrRef.current || new window.Html5Qrcode('qr-reader-temp', {
            verbose: false
          });
          const text = await tempScanner.scanFile(file, false);
          if (text) {
            triggerSuccess(text);
            setPhotoProcessing(false);
            return;
          }
        } catch (e) {}
      }

      // Step C: Server-side zxing-cpp API (/api/v1/pos/scan-image)
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/pos/scan-image`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.barcode) {
        triggerSuccess(data.barcode);
        setPhotoProcessing(false);
        return;
      }
      notify(lang === 'uz' ? "Shtrixkod rasmda aniqlanmadi. Iltimos yaqinroq va yorug'roq rasm oling yoki qo'lda kiriting." : "Штрихкод на фото не распознан. Сделайте фото ближе и четче или введите вручную.", 'warn');
    } catch (err) {
      console.error('Photo scan error:', err);
      notify(lang === 'uz' ? "Rasm skanerida xatolik" : "Ошибка обработки фото", 'error');
    } finally {
      setPhotoProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md p-4 text-white shadow-2xl relative overflow-hidden flex flex-col items-center max-h-[95vh] overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xl"
  }, "📷"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sm text-emerald-400"
  }, lang === 'uz' ? 'Shtrixkod / DataMatrix (EAN-13 / QR)' : 'Сканер (EAN-13 / DataMatrix / QR)'), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: `w-1.5 h-1.5 rounded-full ${engineType === 'hardware' ? 'bg-emerald-400 animate-pulse' : engineType === 'html5' ? 'bg-blue-400' : 'bg-amber-400'}`
  }), engineType === 'hardware' ? lang === 'uz' ? '⚡ Apparat tezlashuvi (Hardware AI)' : '⚡ Аппаратный AI сканер (60 FPS)' : engineType === 'html5' ? lang === 'uz' ? '🎥 HD Video skaner' : '🎥 HD Видео сканер' : lang === 'uz' ? "Rasm yoki qo'lda kiritish" : 'Фото или ручной ввод'))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "p-1 rounded-full text-slate-400 hover:text-white text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "relative w-full rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-slate-800"
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    playsInline: true,
    muted: true,
    autoPlay: true,
    className: `w-full h-full object-cover ${engineType === 'hardware' ? 'block' : 'hidden'}`
  }), /*#__PURE__*/React.createElement("div", {
    id: "qr-reader",
    className: `w-full h-full ${engineType !== 'hardware' ? 'block' : 'hidden'}`
  }), /*#__PURE__*/React.createElement("div", {
    id: "qr-reader-temp",
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-x-8 inset-y-12 border-2 border-emerald-400/90 rounded-2xl pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "laser-line"
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-emerald-300 font-mono absolute bottom-2 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm"
  }, lang === 'uz' ? "Shtrixkodni ramkaga to'g'rilang" : "Наведите штрихкод в рамку")), photoProcessing && /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-emerald-300"
  }, lang === 'uz' ? "Rasm tahlil qilinmoqda..." : "Распознавание штрихкода с фото..."))), /*#__PURE__*/React.createElement("div", {
    className: "w-full flex items-center justify-between gap-1.5 mt-2.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggleTorch,
    className: `flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition ${torchOn ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`
  }, /*#__PURE__*/React.createElement("span", null, "🔦"), /*#__PURE__*/React.createElement("span", null, torchOn ? lang === 'uz' ? "O'chirish" : 'Выкл свет' : lang === 'uz' ? 'Fonar' : 'Вспышка')), canZoom && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggleZoom,
    className: "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
  }, /*#__PURE__*/React.createElement("span", null, "🔍"), /*#__PURE__*/React.createElement("span", null, zoomLevel, "x Zoom")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: flipCamera,
    className: "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
  }, /*#__PURE__*/React.createElement("span", null, "🔄"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Kamera' : 'Камера'))), /*#__PURE__*/React.createElement("div", {
    className: "w-full mt-2.5"
  }, /*#__PURE__*/React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    accept: "image/*",
    capture: "environment",
    className: "hidden",
    onChange: handlePhotoUpload
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => fileInputRef.current && fileInputRef.current.click(),
    disabled: photoProcessing,
    className: "w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 touch-target active:scale-[0.98]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-base"
  }, "📸"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Shtrixkodni rasmga olish (100% aniqlik)" : "📸 Сделать фото штрихкода (100% четкость)"))), /*#__PURE__*/React.createElement("div", {
    className: "w-full mt-2.5 pt-2 border-t border-slate-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    value: manualBarcode,
    onChange: e => setManualBarcode(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter' && manualBarcode.trim()) {
        e.preventDefault();
        triggerSuccess(manualBarcode.trim());
      }
    },
    placeholder: lang === 'uz' ? "Shtrixkod (raqamlarni yozing)..." : "Штрихкод вручную (цифры)...",
    className: "flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      if (manualBarcode.trim()) triggerSuccess(manualBarcode.trim());
    },
    disabled: !manualBarcode.trim(),
    className: "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold px-3 py-2 rounded-xl text-xs transition"
  }, lang === 'uz' ? "Kiritish" : "ОК"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowNumpad(prev => !prev),
    className: `px-2.5 py-2 rounded-xl text-xs font-bold border transition ${showNumpad ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`,
    title: "Numpad"
  }, "🔢")), showNumpad && /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-1.5 mt-2 p-2 bg-slate-950/80 rounded-xl border border-slate-800 animate-fadeIn"
  }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00', '⌫'].map(btn => /*#__PURE__*/React.createElement("button", {
    key: btn,
    type: "button",
    onClick: () => {
      if (btn === '⌫') setManualBarcode(prev => prev.slice(0, -1));else setManualBarcode(prev => prev + btn);
    },
    className: "bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white font-bold font-mono py-2 rounded-lg text-sm transition touch-target"
  }, btn))))));
}

// ------------------- CREATE / EDIT PRODUCT MODAL -------------------
function CreateProductModal({
  token,
  initialBarcode = '',
  autoScanOnMount = false,
  onClose,
  onSuccess,
  notify,
  t,
  lang
}) {
  const [barcode, setBarcode] = useState(initialBarcode);
  const [noBarcode, setNoBarcode] = useState(false);
  const toggleNoBarcode = enabled => {
    setNoBarcode(enabled);
    if (enabled) {
      if (!barcode || barcode.startsWith('INT-')) {
        const randomCode = 'INT-' + Math.floor(100000 + Math.random() * 900000);
        setBarcode(randomCode);
      }
      setIsQuick(true);
    } else {
      if (barcode.startsWith('INT-')) setBarcode('');
    }
  };
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(() => {
    try {
      return localStorage.getItem('pos_last_category') || '';
    } catch (e) {
      return '';
    }
  });
  const [categories, setCategories] = useState([]);
  const [unit, setUnit] = useState(() => {
    try {
      return localStorage.getItem('pos_last_unit') || 'dona';
    } catch (e) {
      return 'dona';
    }
  });
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState('');
  const [ikpuCode, setIkpuCode] = useState('');
  const [packageCode, setPackageCode] = useState('');
  const [vatRate, setVatRate] = useState(0);
  const [isTobacco, setIsTobacco] = useState(false);
  const [requiresMarking, setRequiresMarking] = useState(false);
  const [markingGroup, setMarkingGroup] = useState('NONE');
  const [isQuick, setIsQuick] = useState(false);
  const [cameraActive, setCameraActive] = useState(Boolean(autoScanOnMount && !initialBarcode));
  const [voiceActive, setVoiceActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const pNum = Number(purchasePrice) || 0;
  const sNum = Number(salePrice) || 0;
  const marginPct = pNum > 0 && sNum > 0 ? Math.round((sNum - pNum) / pNum * 100) : 0;
  const applyMarkup = pct => {
    if (pNum > 0) setSalePrice(String(Math.round(pNum * (1 + pct / 100) / 100) * 100));
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const headers = token ? {
        Authorization: `Bearer ${token}`
      } : {};
      const res = await fetch(`${API_BASE}/products/categories/all`, {
        headers
      });
      if (!res.ok) {
        setCategories([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.categories || data?.items || [];
      setCategories(list);
      if (list.length > 0) {
        const savedCat = (() => {
          try {
            return localStorage.getItem('pos_last_category');
          } catch (e) {
            return '';
          }
        })();
        if (savedCat && list.some(c => String(c.id) === String(savedCat))) {
          setCategoryId(String(savedCat));
        } else if (!categoryId) {
          setCategoryId(list[0].id.toString());
        }
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategories([]);
    }
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
      rec.onresult = e => {
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
  const saveProduct = async (scanNext = false) => {
    if (!barcode.trim() || !name.trim() || !salePrice) {
      notify(lang === 'uz' ? "Shtrixkod, nom va sotish narxini to'ldiring" : "Заполните штрихкод, название и цену", 'error');
      return;
    }
    setLoading(true);
    try {
      try {
        if (categoryId) localStorage.setItem('pos_last_category', String(categoryId));
        if (unit) localStorage.setItem('pos_last_unit', unit);
      } catch (errStore) {}
      const pPrice = Number(purchasePrice) || 0;
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
          expiry_date: expiryDate.trim() || null,
          ikpu_code: ikpuCode.trim() || null,
          package_code: packageCode.trim() || null,
          vat_rate: Number(vatRate) || 0,
          is_tobacco: Boolean(isTobacco),
          requires_marking: Boolean(requiresMarking || isTobacco || markingGroup && markingGroup !== 'NONE'),
          marking_group: isTobacco ? 'TOBACCO' : markingGroup || 'NONE',
          is_quick: Boolean(isQuick)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Mahsulot yaratishda xatolik');
      playAudioCue('success');
      notify(lang === 'uz' ? `Qo'shildi: ${name}` : `Добавлено: ${name}`);
      onSuccess(data, {
        keepOpen: scanNext
      });
      if (scanNext) {
        setAddedCount(prev => prev + 1);
        setBarcode('');
        setNoBarcode(false);
        setName('');
        setPurchasePrice('');
        setSalePrice('');
        setStockQuantity('1');
        setExpiryDate('');
        setIkpuCode('');
        setPackageCode('');
        setIsTobacco(false);
        setRequiresMarking(false);
        setMarkingGroup('NONE');
        setIsQuick(false);
        setCameraActive(true);
      } else {
        onClose();
      }
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const submit = e => {
    e.preventDefault();
    saveProduct(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-4 sm:p-5 shadow-2xl text-slate-800 dark:text-slate-100 modal-mobile-safe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xl"
  }, "➕"), /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, t.addProductTitle || "Yangi tovar qo'shish")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg p-1"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-semibold text-slate-600 dark:text-slate-400"
  }, t.colBarcode), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => toggleNoBarcode(!noBarcode),
    className: `text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${noBarcode ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`
  }, "📦 ", lang === 'uz' ? "Shtrixkodsiz (Ichki kod)" : "Без штрихкода")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "4607000000001",
    value: barcode,
    onChange: e => setBarcode(e.target.value),
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500",
    required: true
  }), /*#__PURE__*/React.createElement(VoiceInputBtn, {
    onResult: txt => setBarcode(txt.replace(/\D/g, '')),
    lang: lang,
    title: "Shtrixkodni ovoz bilan aytish"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCameraActive(true),
    className: "bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
  }, /*#__PURE__*/React.createElement("span", null, "📷")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.productNameLabel || "Mahsulot nomi *"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Buxanka non oq / Coca-Cola 1.5L",
    value: name,
    onChange: e => setName(e.target.value),
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500",
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: startVoiceName,
    className: `px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${voiceActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'}`
  }, /*#__PURE__*/React.createElement("span", null, "🎙️")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.categoryLabel || "Kategoriya"), /*#__PURE__*/React.createElement("select", {
    value: categoryId,
    onChange: e => {
      const val = e.target.value;
      setCategoryId(val);
      const catObj = safeArray(categories).find(c => String(c.id) === String(val));
      const catName = (catObj?.name || '').toLowerCase();
      if (catName.includes('tamaki') || catName.includes('табак')) {
        setIsTobacco(true);
        setRequiresMarking(true);
      }
    },
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-medium"
  }, safeArray(categories).length === 0 ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, lang === 'uz' ? "Kategoriya yo'q" : "Без категории") : safeArray(categories).map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name ? c.name.split('/')[0].trim() : c.name)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.unitLabel || "Birlik"), /*#__PURE__*/React.createElement("select", {
    value: unit,
    onChange: e => setUnit(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-medium"
  }, /*#__PURE__*/React.createElement("option", {
    value: "dona"
  }, "dona (шт)"), /*#__PURE__*/React.createElement("option", {
    value: "kg"
  }, "kg (кг)"), /*#__PURE__*/React.createElement("option", {
    value: "l"
  }, "l (литр)"), /*#__PURE__*/React.createElement("option", {
    value: "quti"
  }, "quti (пачка)"), /*#__PURE__*/React.createElement("option", {
    value: "metr"
  }, "metr (метр)")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.purchasePriceLabel || "Kirim narxi"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "4000",
    value: purchasePrice,
    onChange: e => setPurchasePrice(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.salePriceLabel || "Sotish narxi *"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "5500",
    value: salePrice,
    onChange: e => setSalePrice(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400",
    required: true
  }))), pNum > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-xl text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-emerald-700 dark:text-emerald-300"
  }, "💰 ", lang === "uz" ? "Foyda:" : "Маржа:", " ", formatMoney(sNum - pNum), " (", marginPct, "%)"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1"
  }, [15, 20, 25, 30].map(pct => /*#__PURE__*/React.createElement("button", {
    key: pct,
    type: "button",
    onClick: () => applyMarkup(pct),
    className: "px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 font-bold text-[11px]"
  }, "+", pct, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2 items-start"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.stockQtyLabel || "Boshlang'ich qoldiq"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: stockQuantity,
    onChange: e => setStockQuantity(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1 mt-1"
  }, [1, 5, 10, 20, 50].map(q => /*#__PURE__*/React.createElement("button", {
    key: q,
    type: "button",
    onClick: () => setStockQuantity(String(q)),
    className: `px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${Number(stockQuantity) === q ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`
  }, q)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, lang === 'uz' ? "Yaroqlilik muddati:" : "Срок годности:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: expiryDate,
    onChange: e => setExpiryDate(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs"
  }), addedCount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-[10px] font-bold text-emerald-600"
  }, "✅ +", addedCount, " ", lang === 'uz' ? "ta qo'shildi" : "добавлено"))), /*#__PURE__*/React.createElement(TaxProductFields, {
    token: token,
    lang: lang,
    ikpuCode: ikpuCode,
    setIkpuCode: setIkpuCode,
    packageCode: packageCode,
    setPackageCode: setPackageCode,
    vatRate: vatRate,
    setVatRate: setVatRate,
    isTobacco: isTobacco,
    setIsTobacco: setIsTobacco,
    requiresMarking: requiresMarking,
    setRequiresMarking: setRequiresMarking,
    markingGroup: markingGroup,
    setMarkingGroup: setMarkingGroup,
    productName: name
  }), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 pt-1"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isQuick,
    onChange: e => setIsQuick(e.target.checked),
    className: "w-4 h-4 rounded text-emerald-600"
  }), /*#__PURE__*/React.createElement("span", null, "⚡ ", lang === 'uz' ? "Tezkor tovar (Kassada 1-bosish)" : "Быстрый товар на кассе"))), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
  }, t.cancelBtn), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: loading,
    onClick: () => saveProduct(true),
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 shadow transition"
  }, "🔄 ", lang === 'uz' ? "Saqlash + Skan" : "Сохр. + Скан"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
  }, loading ? t.saving : t.saveBtn))), cameraActive && /*#__PURE__*/React.createElement(CameraScannerModal, {
    onScan: scanned => {
      setBarcode(scanned);
      setCameraActive(false);
      notify((lang === 'uz' ? "Shtrixkod o'qildi: " : "Штрихкод считан: ") + scanned);
    },
    onClose: () => setCameraActive(false),
    notify: notify,
    t: t,
    lang: lang
  }));
}

// ------------------- VOICE DEBT RECORDING MODAL (HAQQIM.UZ) ----------------
function VoiceDebtModal({
  token,
  onClose,
  onSuccess,
  notify,
  t,
  lang: initialLang
}) {
  const [voiceLang, setVoiceLang] = useState(initialLang || 'ru');
  const [speechText, setSpeechText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify(voiceLang === 'uz' ? 'Brauzer mikrofon orqali tanishni qo‘llamaydi. Matn maydonidagi klaviatura mikrofonidan foydalaning.' : 'В этом браузере нет поддержки SpeechRecognition. Используйте микрофон на клавиатуре телефона.', 'info');
      return;
    }
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      playAudioCue('listen');
      const rec = new SpeechRecognition();
      rec.lang = voiceLang === 'uz' ? 'uz-UZ' : 'ru-RU';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 3;
      setIsListening(true);
      rec.onresult = event => {
        let interimText = '';
        let finalText = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript;
          } else {
            interimText += res[0].transcript;
          }
        }
        const fullText = (finalText || interimText).trim();
        if (fullText) {
          setSpeechText(fullText);
        }
        if (finalText.trim()) {
          rec.stop();
          parseVoice(finalText.trim());
        }
      };
      rec.onerror = event => {
        setIsListening(false);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          playAudioCue('error');
          notify(voiceLang === 'uz' ? 'Mikrofonni tekshiring yoki matnni klaviatura mikrofonida ayting.' : 'Проверьте микрофон или надиктуйте через микрофон клавиатуры.', 'warn');
        }
      };
      rec.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      setIsListening(false);
    }
  };
  useEffect(() => {
    startListening();
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [voiceLang]);
  const parseVoice = async textToParse => {
    const text = textToParse || speechText;
    if (!text || !text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/parse-debt-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          speech_text: text,
          language: voiceLang
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || (voiceLang === 'uz' ? 'Matn tahlil qilinmadi' : 'Не удалось разобрать фразу'));
      setParsedData(data);
      if (data.amount > 0) {
        playAudioCue('success');
      }
    } catch (e) {
      notify(e.message || (voiceLang === 'uz' ? 'Matn tahlilida xatolik' : 'Ошибка разбора фразы'), 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleConfirm = async () => {
    if (!parsedData || !parsedData.debtor_name?.trim() || !(Number(parsedData.amount) > 0)) {
      notify(voiceLang === 'uz' ? 'Mijoz ismi va summani tekshiring' : 'Проверьте имя должника и сумму', 'error');
      return;
    }
    setLoading(true);
    try {
      let debtorId = parsedData.debtor_id;
      const isPayment = parsedData.transaction_type === 'DEBT_PAYMENT';
      if (isPayment && !debtorId) {
        throw new Error(voiceLang === 'uz' ? "To'lov uchun mavjud qarzdor topilmadi. Mijoz nomini aniqlashtiring." : 'Для оплаты не найден существующий должник. Уточните имя.');
      }
      if (!debtorId) {
        const createRes = await fetch(`${API_BASE}/debts/debtors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            full_name: parsedData.debtor_name,
            phone: parsedData.phone || null,
            due_date: parsedData.due_date || null,
            note: parsedData.note || 'Ovozli yozuv',
            initial_debt: Number(parsedData.amount)
          })
        });
        const created = await createRes.json();
        if (!createRes.ok) throw new Error(created.detail || (voiceLang === 'uz' ? 'Qarzni saqlab bo‘lmadi' : 'Не удалось сохранить долг'));
        debtorId = created.id;
      } else if (isPayment) {
        const payRes = await fetch(`${API_BASE}/debts/debtors/${debtorId}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: Number(parsedData.amount),
            due_date: parsedData.due_date || null,
            note: parsedData.note || 'Ovozli qarz to\'lovi'
          })
        });
        const paid = await payRes.json();
        if (!payRes.ok) throw new Error(paid.detail || (voiceLang === 'uz' ? 'To\'lovni saqlab bo‘lmadi' : 'Не удалось сохранить оплату'));
      } else {
        const addRes = await fetch(`${API_BASE}/debts/debtors/${debtorId}/add-debt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: Number(parsedData.amount),
            due_date: parsedData.due_date || null,
            note: parsedData.note || 'Ovozli yozuv'
          })
        });
        const added = await addRes.json();
        if (!addRes.ok) throw new Error(added.detail || (voiceLang === 'uz' ? 'Qarzni saqlab bo‘lmadi' : 'Не удалось сохранить долг'));
      }
      playAudioCue('success');
      const successMsg = isPayment ? voiceLang === 'uz' ? `Qarz to'landi: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})` : `Оплата принята: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})` : voiceLang === 'uz' ? `Qarz saqlandi: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})` : `Долг сохранен: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})`;
      notify(successMsg);
      speakAloud(successMsg, voiceLang);
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-4 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[calc(100dvh-1.5rem)] flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "🎙️"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100"
  }, voiceLang === 'uz' ? 'Ovozli qarz yozish (Haqqim.uz)' : 'Голосовая запись в тетрадь долгов'), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-500"
  }, voiceLang === 'uz' ? 'Ism, summa, sabab va qaytarish muddati' : 'Имя, сумма, товар и срок возврата'))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVoiceLang('ru'),
    className: `px-2 py-0.5 rounded-lg font-bold transition ${voiceLang === 'ru' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`
  }, "RU"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVoiceLang('uz'),
    className: `px-2 py-0.5 rounded-lg font-bold transition ${voiceLang === 'uz' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`
  }, "UZ")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1"
  }, "✕"))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-3 pr-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative inline-block mb-2"
  }, isListening && /*#__PURE__*/React.createElement("div", {
    className: "absolute -inset-3 bg-emerald-500/30 rounded-full animate-ping pointer-events-none"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: startListening,
    className: `w-16 h-16 rounded-full flex items-center justify-center text-2xl transition mx-auto shadow-lg touch-target ${isListening ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white scale-105 shadow-emerald-500/40 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'}`
  }, "🎙️")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold text-slate-700 dark:text-slate-200"
  }, isListening ? voiceLang === 'uz' ? 'Eshitilmoqda... gapiring' : 'Слушаю... говорите фразу' : voiceLang === 'uz' ? 'Mikrofonni bosib gapiring' : 'Нажмите на микрофон и говорите'), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 dark:text-slate-400 mt-1"
  }, voiceLang === 'uz' ? '«Alisher 50 ming nonga, dushanbagacha» yoki «Baxodir 120 000»' : '«Алишер 50 тысяч на хлеб, до пятницы» или «Запиши на Баходира 120 000»')), /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-700 dark:text-slate-300"
  }, voiceLang === 'uz' ? 'Tanishilgan matn (tekshirish va tahrirlash):' : 'Распознанный текст (можно редактировать):'), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("textarea", {
    rows: 2,
    value: speechText,
    onChange: e => {
      setSpeechText(e.target.value);
    },
    placeholder: voiceLang === 'uz' ? 'Masalan: Alisher 50 ming nonga, juma beradi' : 'Например: Алишер 50 тысяч на хлеб, вернет в пятницу',
    className: "w-full resize-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => parseVoice(speechText),
    disabled: !speechText.trim() || loading,
    className: "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 disabled:opacity-40 transition"
  }, loading ? '...' : voiceLang === 'uz' ? '⚡ Matnni tahlil qilish' : '⚡ Разобрать фразу'))), parsedData && /*#__PURE__*/React.createElement("div", {
    className: `p-3.5 border rounded-2xl space-y-2.5 ${parsedData.transaction_type === 'DEBT_PAYMENT' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold flex items-center justify-between gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setParsedData(prev => ({
      ...prev,
      transaction_type: 'DEBT_INCREASE'
    })),
    className: `px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${parsedData.transaction_type !== 'DEBT_PAYMENT' ? 'bg-amber-500 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`
  }, "➕ ", voiceLang === 'uz' ? 'Qarz oldi (+)' : 'Взял в долг (+)'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setParsedData(prev => ({
      ...prev,
      transaction_type: 'DEBT_PAYMENT'
    })),
    className: `px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${parsedData.transaction_type === 'DEBT_PAYMENT' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`
  }, "✅ ", voiceLang === 'uz' ? "To'ladi (-)" : 'Вернул (-)')), /*#__PURE__*/React.createElement("span", {
    className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${parsedData.is_new_debtor ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' : 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-200'}`
  }, parsedData.is_new_debtor ? voiceLang === 'uz' ? 'Yangi mijoz' : 'Новый клиент' : voiceLang === 'uz' ? 'Mavjud mijoz' : 'В базе')), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-slate-600 dark:text-slate-400 font-semibold mb-0.5"
  }, voiceLang === 'uz' ? 'Mijoz F.I.Sh. *' : 'Имя должника *'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: parsedData.debtor_name || '',
    onChange: e => setParsedData(prev => ({
      ...prev,
      debtor_name: e.target.value
    })),
    className: "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-bold text-slate-900 dark:text-slate-100"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-slate-600 dark:text-slate-400 font-semibold mb-0.5"
  }, voiceLang === 'uz' ? 'Summa (so‘m) *' : 'Сумма (сум) *'), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    step: "1",
    value: parsedData.amount || '',
    onChange: e => setParsedData(prev => ({
      ...prev,
      amount: Number(e.target.value)
    })),
    className: "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-slate-600 dark:text-slate-400 font-semibold mb-0.5"
  }, voiceLang === 'uz' ? 'Telefon:' : 'Телефон:'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: parsedData.phone || '',
    onChange: e => setParsedData(prev => ({
      ...prev,
      phone: e.target.value
    })),
    placeholder: "+998 90 ...",
    className: "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 text-xs font-mono"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-slate-600 dark:text-slate-400 font-semibold mb-0.5"
  }, voiceLang === 'uz' ? 'Qaytarish muddati:' : 'Срок возврата:'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: parsedData.due_date_label || parsedData.due_date || '',
    onChange: e => setParsedData(prev => ({
      ...prev,
      due_date_label: e.target.value,
      due_date: e.target.value
    })),
    placeholder: voiceLang === 'uz' ? 'Ko‘rsatilmagan' : 'Не указан',
    className: "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 text-xs font-semibold"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sm:col-span-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-slate-600 dark:text-slate-400 font-semibold mb-0.5"
  }, voiceLang === 'uz' ? 'Izoh:' : 'Примечание:'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: parsedData.note || '',
    onChange: e => setParsedData(prev => ({
      ...prev,
      note: e.target.value
    })),
    className: "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 text-xs"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition touch-target"
  }, t.cancelBtn || 'Bekor qilish'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleConfirm,
    disabled: !parsedData || !(Number(parsedData.amount) > 0) || loading,
    className: "flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 disabled:opacity-40 transition touch-target flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "💾"), /*#__PURE__*/React.createElement("span", null, loading ? t.saving : voiceLang === 'uz' ? 'Qarzni saqlash' : 'Сохранить долг')))));
}

// ------------------- PAPER DEBT NOTEBOOK OCR MODAL ------------------------
async function enhanceOcrPhoto(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(2, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d', {
    willReadFrequently: true
  });
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const gray = 0.299 * pixels.data[i] + 0.587 * pixels.data[i + 1] + 0.114 * pixels.data[i + 2];
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.35 + 128));
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = contrasted;
  }
  context.putImageData(pixels, 0, 0);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image conversion failed')), 'image/jpeg', 0.92));
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-enhanced.jpg', {
    type: 'image/jpeg'
  });
}
async function recognizeOcrPhoto(file) {
  if (!window.Tesseract) throw new Error('OCR library is not available');
  const worker = await window.Tesseract.createWorker('eng+rus');
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: '6',
      preserve_interword_spaces: '1'
    });
    const original = await worker.recognize(file);
    const enhancedFile = await enhanceOcrPhoto(file);
    const enhanced = await worker.recognize(enhancedFile);
    const best = (enhanced.data.confidence || 0) >= (original.data.confidence || 0) ? enhanced : original;
    return {
      text: best.data.text || '',
      confidence: Math.round(best.data.confidence || 0)
    };
  } finally {
    await worker.terminate();
  }
}
function OcrDebtNotebookModal({
  token,
  onClose,
  onSuccess,
  notify,
  t,
  lang
}) {
  const [ocrText, setOcrText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await recognizeOcrPhoto(file);
      setOcrText(result.text);
      await parseText(result.text);
    } catch (err) {
      console.error(err);
      notify("Rasm matnini o'qishda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };
  const parseText = async text => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/parse-debt-ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          raw_text: text
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || (lang === 'uz' ? 'Matnni ajratib bo‘lmadi' : 'Не удалось разобрать текст'));
      setParsedRows(data.items || []);
      if (!data.items?.length) notify(lang === 'uz' ? 'Qatorlar topilmadi. Matnni qo‘lda tuzatib, qayta tahlil qiling.' : 'Строки не найдены. Исправьте распознанный текст и разберите его снова.', 'warn');
    } catch (err) {
      notify(err.message || (lang === 'uz' ? 'Matnni tahlil qilishda xatolik' : 'Ошибка анализа текста'), 'error');
    } finally {
      setLoading(false);
    }
  };
  const updateRow = (idx, field, val) => {
    setParsedRows(prev => {
      const copy = [...prev];
      copy[idx][field] = field === 'amount' ? Number(val) : val;
      if (field === 'debtor_name') copy[idx].matched_debtor_id = null;
      return copy;
    });
  };
  const removeRow = idx => {
    setParsedRows(prev => prev.filter((_, i) => i !== idx));
  };
  const handleImportAll = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    try {
      if (parsedRows.some(row => !row.debtor_name?.trim() || !(Number(row.amount) > 0))) {
        throw new Error(lang === 'uz' ? 'Har bir qatorda mijoz va musbat summa bo‘lishi kerak' : 'В каждой строке укажите должника и сумму больше нуля');
      }
      const res = await fetch(`${API_BASE}/debts/import-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: parsedRows.map(row => ({
            debtor_id: row.matched_debtor_id || null,
            debtor_name: row.debtor_name.trim(),
            amount: Number(row.amount),
            note: row.note || null,
            due_date: row.due_date || null
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || (lang === 'uz' ? 'Import xatosi' : 'Ошибка импорта'));
      notify(lang === 'uz' ? `${data.imported_rows} qator saqlandi` : `Сохранено строк: ${data.imported_rows}`);
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "📸"), /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, lang === 'uz' ? "Qog'oz daftardan rasm olish (OCR)" : 'Фото-сканер тетради долгов')), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-2 mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    capture: "environment",
    ref: fileInputRef,
    onChange: handleImageUpload,
    className: "hidden"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => fileInputRef.current?.click(),
    disabled: loading,
    className: "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
  }, /*#__PURE__*/React.createElement("span", null, "📷"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Kameradan rasmga olish / Yuklash' : 'Сделать фото / Загрузить')), loading && /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-emerald-600 font-semibold animate-pulse"
  }, t.processing)), ocrText && /*#__PURE__*/React.createElement("div", {
    className: "mb-3 space-y-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-300"
  }, lang === 'uz' ? 'Tanilgan matn — tekshiring va xohlasangiz tuzating:' : 'Распознанный текст — проверьте и при необходимости исправьте:'), /*#__PURE__*/React.createElement("textarea", {
    rows: 3,
    value: ocrText,
    onChange: e => setOcrText(e.target.value),
    className: "w-full resize-y bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs leading-relaxed"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => parseText(ocrText),
    disabled: loading,
    className: "px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
  }, lang === 'uz' ? 'Matnni qayta ajratish' : 'Повторно разобрать текст'), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-amber-700 dark:text-amber-300"
  }, lang === 'uz' ? 'Daftardagi yozuvni OCR xato o‘qishi mumkin. Saqlashdan oldin har bir ism va summani tekshiring.' : 'Распознавание рукописного текста может ошибаться. Перед сохранением проверьте каждое имя и сумму.')), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-2 mb-3 pr-1 min-h-0"
  }, parsedRows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-10 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6"
  }, lang === 'uz' ? "Daftar sahifasini yorug‘ joyda, to‘g‘ri burchakdan suratga oling. OCR matnni ajratadi, saqlashdan oldin natijalarni tekshiring." : 'Сфотографируйте страницу при хорошем освещении и прямо сверху. OCR разберёт строки, а перед сохранением вы сможете проверить результат.') : /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full min-w-[560px] text-left text-xs border-collapse"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "border-b border-slate-200 dark:border-slate-800 text-slate-400"
  }, /*#__PURE__*/React.createElement("th", {
    className: "py-2"
  }, lang === 'uz' ? 'Mijoz ismi' : 'Имя покупателя'), /*#__PURE__*/React.createElement("th", {
    className: "py-2"
  }, lang === 'uz' ? "Summa (so'm)" : 'Сумма (сум)'), /*#__PURE__*/React.createElement("th", {
    className: "py-2"
  }, lang === 'uz' ? 'Izoh' : 'Примечание'), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, lang === 'uz' ? "O'chirish" : 'Удалить'))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-100 dark:divide-slate-800"
  }, safeArray(parsedRows).map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: r.debtor_name,
    onChange: e => updateRow(i, 'debtor_name', e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
  })), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: r.amount,
    onChange: e => updateRow(i, 'amount', e.target.value),
    className: "w-28 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-600"
  })), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: r.note || '',
    onChange: e => updateRow(i, 'note', e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
  })), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 text-right"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => removeRow(i),
    className: "text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
  }, "✕")))))))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
  }, t.cancelBtn), /*#__PURE__*/React.createElement("button", {
    onClick: handleImportAll,
    disabled: parsedRows.length === 0 || loading,
    className: "px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
  }, loading ? t.saving : lang === 'uz' ? `Tekshirilgan qarzlarni saqlash (${parsedRows.length})` : `Сохранить проверенные долги (${parsedRows.length})`))));
}

// ------------------- INVOICE PHOTO SCANNER MODAL (KIRIM) -------------------
function OcrInvoiceModal({
  token,
  suppliers,
  catalogSample,
  onClose,
  onSuccess,
  notify,
  t,
  lang
}) {
  const [supplierId, setSupplierId] = useState(suppliers.length > 0 ? suppliers[0].id : '');
  const [parsedItems, setParsedItems] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await recognizeOcrPhoto(file);
      setOcrText(result.text);
      await parseInvoiceText(result.text);
    } catch (err) {
      notify(err.message || (lang === 'uz' ? "Fakturani o'qishda xatolik" : 'Не удалось распознать накладную'), 'error');
    } finally {
      setLoading(false);
    }
  };
  const parseInvoiceText = async text => {
    try {
      const res = await fetch(`${API_BASE}/ai/parse-invoice-ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          raw_text: text
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || (lang === 'uz' ? 'Qatorlarni ajratib bo‘lmadi' : 'Не удалось разобрать строки'));
      setParsedItems(data.items || []);
      if (!data.items?.length) notify(lang === 'uz' ? 'Qatorlar topilmadi. Matnni tuzatib, qayta ajrating.' : 'Строки не найдены. Исправьте текст и разберите его снова.', 'warn');
    } catch (err) {
      notify(err.message || (lang === 'uz' ? "Faktura qatorlarini ajratib bo'lmadi" : 'Не удалось разобрать накладную'), 'error');
    }
  };
  const updateItem = (idx, field, val) => {
    setParsedItems(prev => {
      const copy = [...prev];
      if (field === 'matched_product_id') {
        const selected = catalogSample.find(product => product.id === Number(val));
        copy[idx].matched_product_id = selected?.id || null;
        if (selected) copy[idx].product_name = selected.name;
      } else if (field === 'product_name') {
        copy[idx].product_name = val;
      } else {
        copy[idx][field] = Number(val);
      }
      copy[idx].total_price = Math.round(Number(copy[idx].quantity || 0) * Number(copy[idx].purchase_price || 0));
      return copy;
    });
  };
  const handleSaveInvoice = async () => {
    if (parsedItems.length === 0 || !supplierId) return;
    const invalidItem = parsedItems.find(it => !(Number(it.quantity) > 0) || !(Number(it.purchase_price) >= 0) || !it.matched_product_id && !it.product_name);
    if (invalidItem) {
      notify(lang === 'uz' ? "Barcha tovarlar miqdori va kirim narxini to'g'ri ko'rsating" : 'Проверьте название, количество и закупочную цену каждой строки', 'warn');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        supplier_id: Number(supplierId),
        items: parsedItems.map(it => ({
          product_id: it.matched_product_id || undefined,
          product_name: it.product_name,
          quantity: Number(it.quantity),
          purchase_price: Number(it.purchase_price)
        })),
        paid_amount: 0
      };
      const res = await fetch(`${API_BASE}/suppliers/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || (lang === 'uz' ? 'Kirim saqlanmadi' : 'Не удалось сохранить накладную'));
      notify(lang === 'uz' ? 'Faktura omborga muvaffaqiyatli qabul qilindi!' : 'Накладная успешно принята на склад!');
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "📸"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, lang === 'uz' ? 'Faktura / Yuk xatini skanerlash' : 'Фото-сканер накладных (Kirim)'), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, lang === 'uz' ? "Kirim qog'ozini rasmga oling va tovarlarni omborga qabul qiling" : "Сфотографируйте накладную для автоматической приемки на склад"))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-end gap-3 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[11px] font-semibold text-slate-500"
  }, lang === 'uz' ? "Ta'minotchi:" : 'Поставщик:'), /*#__PURE__*/React.createElement("select", {
    value: supplierId,
    onChange: e => setSupplierId(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, lang === 'uz' ? "Ta'minotchini tanlang" : 'Выберите поставщика'), safeArray(suppliers).map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.name)))), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    capture: "environment",
    ref: fileInputRef,
    onChange: handleImageUpload,
    className: "hidden"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => fileInputRef.current?.click(),
    className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow touch-target flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "📷"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Rasmga olish' : 'Сделать фото'))), ocrText && /*#__PURE__*/React.createElement("div", {
    className: "mb-3 space-y-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-300"
  }, lang === 'uz' ? 'Tanilgan matn — tekshiring va tuzating:' : 'Распознанный текст — проверьте и исправьте:'), /*#__PURE__*/React.createElement("textarea", {
    rows: 3,
    value: ocrText,
    onChange: e => setOcrText(e.target.value),
    className: "w-full resize-y bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs leading-relaxed font-mono"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => parseInvoiceText(ocrText),
    disabled: loading,
    className: "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
  }, lang === 'uz' ? 'Matnni qayta ajratish' : 'Повторно разобрать текст')), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-2 mb-3 pr-1"
  }, parsedItems.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-10 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6"
  }, lang === 'uz' ? "Qog'oz faktura / yuk xatini rasmga oling. Tovar nomlari, soni va kirim narxlari avtomatik jadvalga olinadi." : 'Сфотографируйте бумажную накладную. Товары, количество и цены будут извлечены.') : /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full min-w-[560px] text-left text-xs border-collapse"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold"
  }, /*#__PURE__*/React.createElement("th", {
    className: "py-2"
  }, lang === 'uz' ? 'Tovar' : 'Товар'), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, lang === 'uz' ? 'Miqdor' : 'Количество'), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, lang === 'uz' ? 'Kirim narxi' : 'Цена закупки'), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, lang === 'uz' ? 'Jami' : 'Итого'))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-100 dark:divide-slate-800"
  }, safeArray(parsedItems).map((it, idx) => /*#__PURE__*/React.createElement("tr", {
    key: idx
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: it.matched_product_id || '',
    onChange: e => updateItem(idx, 'matched_product_id', e.target.value),
    className: `w-full min-w-48 bg-slate-50 dark:bg-slate-800 border rounded-lg px-2 py-1.5 text-xs ${it.matched_product_id ? 'border-emerald-300 dark:border-emerald-700' : 'border-amber-400 dark:border-amber-600'}`
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, lang === 'uz' ? `Katalogdan tanlang (${it.product_name})` : `Выберите из каталога (${it.product_name})`), safeArray(catalogSample).map(product => /*#__PURE__*/React.createElement("option", {
    key: product.id,
    value: product.id
  }, product.name, " · ", product.barcode))), !it.matched_product_id && /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5"
  }, "✨ ", lang === 'uz' ? `Yangi tovar sifatida qo'shiladi: "${it.product_name}"` : `Будет создан новый товар: "${it.product_name}"`)), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2 text-right"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: it.quantity,
    onChange: e => updateItem(idx, 'quantity', e.target.value),
    className: "w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-right font-mono"
  })), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2 text-right"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: it.purchase_price,
    onChange: e => updateItem(idx, 'purchase_price', e.target.value),
    className: "w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right"
  })), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 font-bold font-mono text-emerald-600 text-right"
  }, formatMoney(it.total_price)))))))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
  }, t.cancelBtn), /*#__PURE__*/React.createElement("button", {
    onClick: handleSaveInvoice,
    disabled: parsedItems.length === 0 || loading || !supplierId,
    className: "px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition flex items-center gap-1.5 touch-target"
  }, /*#__PURE__*/React.createElement("span", null, "📥"), /*#__PURE__*/React.createElement("span", null, loading ? t.saving : lang === 'uz' ? 'Omborga qabul qilish' : 'Принять на склад')))));
}

// ------------------- VOICE ASSISTANT MODAL (POS & CASHIER) -------------------
function VoiceAssistantModal({
  token,
  onClose,
  onAddToCart,
  onOpenScanner,
  onOpenCheckout,
  onClearCart,
  onOpenDebt,
  notify,
  t,
  lang: initialLang
}) {
  const [voiceLang, setVoiceLang] = useState(initialLang || 'ru');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMsg, setStatusMsg] = useState(voiceLang === 'uz' ? "Gapiring (masalan: «non 2 ta», «kola», «skaner»)..." : "Говорите (например: «хлеб 2 штуки», «кола», «чек»)...");
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const startListening = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      notify(voiceLang === 'uz' ? "Brauzeringizda mikrofon orqali ovozni tanish qo'llab-quvvatlanmaydi" : "Голосовой ввод не поддерживается вашим браузером/WebView", "warn");
      return;
    }
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      playAudioCue('listen');
      const rec = new SpeechRec();
      rec.lang = voiceLang === 'uz' ? 'uz-UZ' : 'ru-RU';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      setIsListening(true);
      setStatusMsg(voiceLang === 'uz' ? "Eshitilmoqda... gapiring" : "Слушаю... говорите");
      rec.onresult = ev => {
        let interimText = '';
        let finalText = '';
        for (let i = 0; i < ev.results.length; i++) {
          const res = ev.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript;
          } else {
            interimText += res[0].transcript;
          }
        }
        const currentText = (finalText || interimText).trim();
        setTranscript(currentText);
        if (finalText.trim()) {
          rec.stop();
          dispatchVoiceCommand(finalText.trim());
        }
      };
      rec.onerror = e => {
        setIsListening(false);
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          setStatusMsg(voiceLang === 'uz' ? "Ovoz aniqlanmadi, qaytadan bosing" : "Голос не распознан, нажмите микрофон");
          playAudioCue('error');
        }
      };
      rec.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setIsListening(false);
    }
  };
  useEffect(() => {
    startListening();
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [voiceLang]);
  const dispatchVoiceCommand = async phrase => {
    if (!phrase) return;
    setLoading(true);
    setStatusMsg(voiceLang === 'uz' ? "Buyruq bajarilmoqda..." : "Обработка команды...");
    try {
      const res = await fetch(`${API_BASE}/ai/voice-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          speech_text: phrase,
          language: voiceLang,
          context: 'pos'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      if (data.action === 'add_to_cart' && data.data && data.data.product) {
        playAudioCue('add');
        onAddToCart(data.data.product, data.data.quantity || 1.0);
        speakAloud(data.voice_text, voiceLang);
        notify(data.voice_text);
        onClose();
      } else if (data.action === 'open_scanner') {
        playAudioCue('success');
        speakAloud(data.voice_text, voiceLang);
        onOpenScanner();
        onClose();
      } else if (data.action === 'checkout') {
        playAudioCue('success');
        speakAloud(data.voice_text, voiceLang);
        onOpenCheckout();
        onClose();
      } else if (data.action === 'clear_cart') {
        playAudioCue('success');
        speakAloud(data.voice_text, voiceLang);
        onClearCart();
        onClose();
      } else if (data.action === 'open_debt' && data.data) {
        playAudioCue('success');
        speakAloud(data.voice_text, voiceLang);
        onOpenDebt(data.data);
        onClose();
      } else if (data.action === 'product_not_found') {
        playAudioCue('error');
        speakAloud(data.voice_text, voiceLang);
        setStatusMsg(data.answer);
      } else {
        speakAloud(data.voice_text, voiceLang);
        setStatusMsg(data.answer);
      }
    } catch (e) {
      playAudioCue('error');
      setStatusMsg(e.message);
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col items-center text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVoiceLang('ru'),
    className: `px-2.5 py-1 rounded-lg text-xs font-bold transition ${voiceLang === 'ru' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`
  }, "🇷🇺 RU"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVoiceLang('uz'),
    className: `px-2.5 py-1 rounded-lg text-xs font-bold transition ${voiceLang === 'uz' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`
  }, "🇺🇿 UZ")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "relative my-3"
  }, isListening && /*#__PURE__*/React.createElement("div", {
    className: "absolute -inset-4 bg-emerald-500/30 rounded-full animate-ping pointer-events-none"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: startListening,
    className: `w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all duration-200 ${isListening ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white scale-105 shadow-emerald-500/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105'}`
  }, "🎙️")), /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-100 mt-2 mb-1"
  }, isListening ? voiceLang === 'uz' ? 'Eshitilmoqda... gapiring' : 'Слушаю... говорите' : voiceLang === 'uz' ? 'Mikrofonni bosing' : 'Нажмите на микрофон'), /*#__PURE__*/React.createElement("div", {
    className: "w-full min-h-[56px] max-h-24 overflow-y-auto bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 my-2 text-xs text-slate-700 dark:text-slate-200 font-medium"
  }, transcript || statusMsg), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 dark:text-slate-400 mb-3"
  }, voiceLang === 'uz' ? "Aytishingiz mumkin: «non 2 ta qo'sh», «kola 1», «to'lov», «skaner»" : 'Можно сказать: «добавь хлеб 2 штуки», «кола 1», «чек», «сканер»'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      if (transcript.trim()) {
        dispatchVoiceCommand(transcript.trim());
      } else {
        onClose();
      }
    },
    className: "w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition touch-target"
  }, transcript.trim() ? voiceLang === 'uz' ? 'Bajarish' : 'Выполнить' : voiceLang === 'uz' ? 'Yopish' : 'Закрыть')));
}

// ------------------- MISSING & PRODUCTION MODALS -------------------

const OcrDebtModal = props => {
  const fallbackLang = props.lang || typeof window !== 'undefined' && window.pos_lang || typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang') || 'uz';
  return /*#__PURE__*/React.createElement(OcrDebtNotebookModal, {
    ...props,
    lang: fallbackLang
  });
};
function CheckoutModal({
  token,
  total,
  cart,
  initialMethod = 'CASH',
  initialDiscount = 0,
  onClose,
  onSuccess,
  notify,
  t,
  lang: propLang
}) {
  const lang = propLang || 'uz';
  const [method, setMethod] = useState(initialMethod || 'CASH');
  const [discountAmount, setDiscountAmount] = useState(String(initialDiscount || 0));
  const discNum = Math.max(0, Math.min(Number(discountAmount) || 0, total));
  const finalTotal = Math.max(0, Math.round((total - discNum) * 100) / 100);
  const [cashReceived, setCashReceived] = useState(initialMethod === 'CASH' ? String(finalTotal) : '0');
  const [cardAmount, setCardAmount] = useState(initialMethod === 'CARD' ? String(finalTotal) : '0');
  const [debtAmount, setDebtAmount] = useState(initialMethod === 'DEBT' ? String(finalTotal) : '0');
  const [debtors, setDebtors] = useState([]);
  const [debtorSearch, setDebtorSearch] = useState('');
  const [selectedDebtorId, setSelectedDebtorId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [quickNewName, setQuickNewName] = useState('');
  const [quickNewPhone, setQuickNewPhone] = useState('');
  const [creatingDebtor, setCreatingDebtor] = useState(false);
  const [showNewDebtorForm, setShowNewDebtorForm] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchDebtorsList();
  }, [debtorSearch]);
  const syncMethodTotals = (m, netTotal) => {
    if (m === 'CASH') {
      setCashReceived(String(netTotal));
      setCardAmount('0');
      setDebtAmount('0');
    } else if (m === 'CARD') {
      setCashReceived('0');
      setCardAmount(String(netTotal));
      setDebtAmount('0');
    } else if (m === 'DEBT') {
      setCashReceived('0');
      setCardAmount('0');
      setDebtAmount(String(netTotal));
    } else if (m === 'MIXED') {
      setCashReceived(String(netTotal));
      setCardAmount('0');
      setDebtAmount('0');
    }
  };
  const applyDiscountVal = newDisc => {
    const clamped = Math.max(0, Math.min(Math.round(newDisc), total));
    setDiscountAmount(String(clamped));
    syncMethodTotals(method, Math.max(0, total - clamped));
  };
  const roundDownThousand = () => {
    const remainder = total % 1000;
    applyDiscountVal(remainder > 0 ? remainder : 0);
  };
  const fetchDebtorsList = async () => {
    try {
      const q = debtorSearch ? `?search=${encodeURIComponent(debtorSearch)}&limit=50` : '?limit=50';
      const res = await fetch(`${API_BASE}/debts/debtors${q}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDebtors(safeArray(data));
      }
    } catch (e) {}
  };
  const handleMethodSwitch = m => {
    setMethod(m);
    syncMethodTotals(m, finalTotal);
  };
  const handleCreateQuickDebtor = async () => {
    if (!quickNewName.trim()) {
      notify(lang === 'uz' ? 'Mijoz ismini kiriting' : 'Введите имя клиента', 'error');
      return;
    }
    setCreatingDebtor(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: quickNewName.trim(),
          phone: quickNewPhone.trim() || null,
          initial_debt: 0.0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      setDebtors(prev => [data, ...prev]);
      setSelectedDebtorId(String(data.id));
      setShowNewDebtorForm(false);
      setQuickNewName('');
      setQuickNewPhone('');
      notify(lang === 'uz' ? `Mijoz qo'shildi: ${data.full_name}` : `Клиент добавлен: ${data.full_name}`);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setCreatingDebtor(false);
    }
  };
  const setQuickDue = days => {
    const d = new Date(Date.now() + days * 86400000);
    setDueDate(d.toISOString().split('T')[0]);
  };
  const cashNum = Number(cashReceived) || 0;
  const cardNum = Number(cardAmount) || 0;
  const debtNum = Number(debtAmount) || 0;
  const cashDue = method === 'CASH' ? finalTotal : method === 'MIXED' ? Math.max(0, finalTotal - cardNum - debtNum) : 0;
  const changeAmount = method === 'CASH' || method === 'MIXED' ? Math.max(0, cashNum - cashDue) : 0;
  const submitLockRef = useRef(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (submitLockRef.current) return;
    if ((method === 'DEBT' || method === 'MIXED' && debtNum > 0) && !selectedDebtorId) {
      notify(lang === 'uz' ? "Qarzga berish uchun mijozni tanlang!" : "Выберите клиента для записи в долг!", 'error');
      return;
    }
    submitLockRef.current = true;
    setLoading(true);
    try {
      const activeStoreId = (() => {
        try {
          return localStorage.getItem('pos_store_id') || '';
        } catch (e) {
          return '';
        }
      })();
      const payload = {
        items: safeArray(cart).map(i => ({
          product_id: typeof i.product.id === 'number' ? i.product.id : null,
          barcode: i.product.barcode,
          name: i.product.name,
          marking_code: i.marking_code || null,
          price: i.product.sale_price,
          quantity: i.quantity
        })),
        store_id: activeStoreId ? Number(activeStoreId) : null,
        payment_method: method,
        discount_amount: discNum,
        cash_received: method === 'CASH' ? cashNum : method === 'MIXED' ? cashNum : 0,
        card_amount: method === 'CARD' ? finalTotal : method === 'MIXED' ? cardNum : 0,
        debt_amount: method === 'DEBT' ? finalTotal : method === 'MIXED' ? debtNum : 0,
        debtor_id: selectedDebtorId ? Number(selectedDebtorId) : null,
        due_date: dueDate || null
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
      playAudioCue('success');
      onSuccess(data);
    } catch (err) {
      playAudioCue('error');
      notify(err.message, 'error');
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-2.5 sm:p-4 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "atelier-modal rounded-[28px] w-full max-w-lg p-4 sm:p-5 modal-mobile-safe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b atelier-border mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-2xl atelier-subtle flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "card",
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, lang === 'uz' ? "To'lov qabul qilish" : "Приём оплаты"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs atelier-text-muted font-nums font-semibold"
  }, discNum > 0 && /*#__PURE__*/React.createElement("span", {
    className: "line-through mr-1.5 opacity-60"
  }, formatMoney(total)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    },
    className: "text-sm font-bold"
  }, formatMoney(finalTotal))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "w-8 h-8 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-3 pr-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-subtle p-3 rounded-2xl space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Chegirma / Yaxlitlash" : "Скидка / Округлить")), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    max: total,
    value: discountAmount,
    onChange: e => applyDiscountVal(Number(e.target.value) || 0),
    style: {
      color: 'var(--danger-fg)'
    },
    className: "w-28 atelier-input rounded-xl px-2.5 py-1 text-right font-nums font-bold text-xs"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => applyDiscountVal(0),
    className: "px-2.5 py-1 rounded-full atelier-card text-[11px] font-semibold"
  }, "0"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: roundDownThousand,
    className: "px-2.5 py-1 rounded-full atelier-pill-active text-[11px] font-semibold"
  }, lang === 'uz' ? 'Yaxlitlash (1000)' : 'Округлить до 1000'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => applyDiscountVal(total * 0.05),
    className: "px-2.5 py-1 rounded-full atelier-card text-[11px] font-semibold"
  }, "-5%"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => applyDiscountVal(total * 0.10),
    className: "px-2.5 py-1 rounded-full atelier-card text-[11px] font-semibold"
  }, "-10%"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-4 gap-1.5"
  }, [{
    id: 'CASH',
    icon: 'cash',
    label: lang === 'uz' ? 'Naqd' : 'Наличные'
  }, {
    id: 'CARD',
    icon: 'card',
    label: lang === 'uz' ? 'Karta' : 'Картой'
  }, {
    id: 'DEBT',
    icon: 'debts',
    label: lang === 'uz' ? 'Qarzga' : 'В долг'
  }, {
    id: 'MIXED',
    icon: 'split',
    label: lang === 'uz' ? 'Aralash' : 'Сплит'
  }].map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    type: "button",
    onClick: () => handleMethodSwitch(m.id),
    className: `py-2.5 px-1.5 rounded-2xl text-xs font-semibold transition flex flex-col items-center gap-1 ${method === m.id ? 'atelier-btn-primary shadow-sm' : 'atelier-btn-soft'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: m.icon,
    size: 17
  }), /*#__PURE__*/React.createElement("span", null, m.label)))), (method === 'CASH' || method === 'MIXED') && /*#__PURE__*/React.createElement("div", {
    className: "atelier-subtle p-3 rounded-2xl space-y-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold atelier-text-muted"
  }, lang === 'uz' ? "Olingan naqd pul (so'm):" : "Получено наличными (сум):"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    step: "any",
    value: cashReceived,
    onChange: e => setCashReceived(e.target.value),
    className: "w-full atelier-input rounded-2xl px-3.5 py-2.5 font-nums font-bold text-lg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, [finalTotal, 10000, 20000, 50000, 100000, 200000].map((v, idx) => /*#__PURE__*/React.createElement("button", {
    key: idx,
    type: "button",
    onClick: () => setCashReceived(String(v)),
    className: "px-2.5 py-1 rounded-full atelier-card text-xs font-nums font-semibold"
  }, idx === 0 ? lang === 'uz' ? 'Aniq' : 'Ровно' : formatMoney(v)))), changeAmount > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: 'var(--accent-soft)',
      color: 'var(--accent-soft-fg)'
    },
    className: "rounded-xl px-3 py-2 flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold"
  }, lang === 'uz' ? "Qaytim:" : "Сдача покупателю:"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-bold font-nums"
  }, formatMoney(changeAmount)))), method === 'MIXED' && /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold atelier-text-muted mb-1"
  }, lang === 'uz' ? "Karta:" : "Картой:"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: cardAmount,
    onChange: e => setCardAmount(e.target.value),
    className: "w-full atelier-input rounded-2xl px-3 py-2 font-nums font-bold text-sm"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold atelier-text-muted mb-1"
  }, lang === 'uz' ? "Qarzga:" : "В долг:"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: debtAmount,
    onChange: e => setDebtAmount(e.target.value),
    style: {
      color: 'var(--warm-fg)'
    },
    className: "w-full atelier-input rounded-2xl px-3 py-2 font-nums font-bold text-sm"
  }))), (method === 'DEBT' || method === 'MIXED' && debtNum > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: 'var(--warm-bg)'
    },
    className: "rounded-2xl p-3 space-y-2 border atelier-border"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      color: 'var(--warm-fg)'
    },
    className: "text-xs font-bold flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qarzdor mijoz *" : "Кому записываем долг *")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowNewDebtorForm(!showNewDebtorForm),
    className: "text-xs font-bold underline"
  }, showNewDebtorForm ? lang === 'uz' ? 'Yopish' : 'Скрыть' : lang === 'uz' ? '+ Yangi mijoz' : '+ Новый клиент')), showNewDebtorForm ? /*#__PURE__*/React.createElement("div", {
    className: "atelier-card p-2.5 rounded-xl space-y-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Mijoz ismi" : "Имя клиента",
    value: quickNewName,
    onChange: e => setQuickNewName(e.target.value),
    className: "w-full atelier-input rounded-xl px-3 py-2 text-xs font-semibold"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "+998 90 ...",
    value: quickNewPhone,
    onChange: e => setQuickNewPhone(e.target.value),
    className: "flex-1 atelier-input rounded-xl px-3 py-2 text-xs font-nums"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCreateQuickDebtor,
    disabled: creatingDebtor,
    className: "atelier-btn-primary px-3 py-2 rounded-xl text-xs font-semibold"
  }, creatingDebtor ? '...' : 'OK'))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Mijozni qidirish..." : "Поиск клиента...",
    value: debtorSearch,
    onChange: e => setDebtorSearch(e.target.value),
    className: "w-full atelier-input rounded-xl px-3 py-2 text-xs"
  }), /*#__PURE__*/React.createElement("select", {
    value: selectedDebtorId,
    onChange: e => setSelectedDebtorId(e.target.value),
    className: "w-full atelier-input rounded-xl px-3 py-2 text-xs font-semibold",
    required: true
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, lang === 'uz' ? "-- Mijozni tanlang --" : "-- Выберите клиента --"), safeArray(debtors).map(d => /*#__PURE__*/React.createElement("option", {
    key: d.id,
    value: d.id
  }, d.full_name, " ", d.phone ? `(${d.phone})` : '', " — ", formatMoney(d.balance))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5 mb-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQuickDue(1),
    className: "px-2.5 py-1 rounded-full atelier-card text-[11px] font-semibold"
  }, "Ertaga"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQuickDue(3),
    className: "px-2.5 py-1 rounded-full atelier-card text-[11px] font-semibold"
  }, "3 kun"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQuickDue(7),
    className: "px-2.5 py-1 rounded-full atelier-card text-[11px] font-semibold"
  }, "1 hafta"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQuickDue(30),
    className: "px-2.5 py-1 rounded-full atelier-card text-[11px] font-semibold"
  }, "1 oy")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dueDate,
    onChange: e => setDueDate(e.target.value),
    className: "w-full atelier-input rounded-xl px-3 py-1.5 text-xs"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-3 border-t atelier-border mt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-3 rounded-2xl text-xs font-semibold atelier-btn-soft"
  }, t.cancelBtn || 'Bekor qilish'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-3 rounded-2xl text-sm font-bold atelier-btn-cta shadow-sm disabled:opacity-40 flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, loading ? t.saving || '...' : lang === 'uz' ? 'Tasdiqlash' : 'Подтвердить')))));
}
function ReceiptModal({
  receipt,
  onClose,
  t
}) {
  if (!receipt) return null;
  const lang = typeof window !== 'undefined' && window.pos_lang || typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang') || 'uz';
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-2.5 sm:p-3 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-modal rounded-[28px] w-full max-w-sm p-4 sm:p-5 modal-mobile-safe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto pr-1"
  }, /*#__PURE__*/React.createElement("div", {
    id: "printable-receipt",
    className: "bg-[#FDFCF9] text-[#181C19] p-4 rounded-2xl border border-dashed border-stone-300 font-mono text-xs space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center border-b border-dashed border-stone-300 pb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sm tracking-tight"
  }, receipt.tax_profile?.legal_name || "GroceryStore POS"), receipt.tax_profile?.inn_stir && /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-stone-600"
  }, "STIR/ИНН: ", receipt.tax_profile.inn_stir), receipt.tax_profile?.kkm_serial && /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-stone-500"
  }, "KKM/FM: ", receipt.tax_profile.kkm_serial), receipt.tax_profile?.address && /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-stone-500"
  }, receipt.tax_profile.address), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-stone-700 font-semibold mt-1"
  }, receipt.receipt_number, receipt.shift_id ? ` • Smena #${receipt.shift_id}` : ''), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-stone-500"
  }, new Date(receipt.created_at || Date.now()).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-stone-500"
  }, "Kassir: ", receipt.cashier_name || 'Kassir')), /*#__PURE__*/React.createElement("div", {
    className: "divide-y divide-dashed divide-stone-200"
  }, safeArray(receipt.items).map((it, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "py-1.5 flex justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold truncate"
  }, it.product_name), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-stone-600"
  }, it.quantity, " ", it.unit || 'dona', " x ", formatMoney(it.unit_price), Number(it.vat_rate) > 0 ? ` • QQS ${it.vat_rate}% (${formatMoney(it.vat_amount)})` : ''), (it.ikpu_code || it.package_code || it.barcode) && /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-stone-400"
  }, it.ikpu_code ? `IKPU:${it.ikpu_code} ` : '', it.package_code ? `Qadoq:${it.package_code} ` : '', it.barcode ? `GTIN:${it.barcode}` : ''), (it.masked_marking_code || it.marking_code) && /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-emerald-700 font-bold"
  }, "DM: ", it.masked_marking_code || it.marking_code)), /*#__PURE__*/React.createElement("div", {
    className: "font-bold whitespace-nowrap"
  }, formatMoney(it.total_price))))), /*#__PURE__*/React.createElement("div", {
    className: "border-t border-dashed border-stone-300 pt-2 space-y-1"
  }, Number(receipt.discount_amount) > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px] text-rose-600 font-bold"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Chegirma:' : 'Скидка:'), /*#__PURE__*/React.createElement("span", null, "-", formatMoney(receipt.discount_amount))), Number(receipt.vat_amount) > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[10px] text-stone-500"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'QQS (NDS):' : 'В т.ч. НДС:'), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.vat_amount))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between font-bold text-sm"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'JAMI:' : 'ИТОГО:'), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.total_amount))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px]"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "To'lov:" : 'Оплата:'), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, receipt.payment_method)), receipt.cash_received > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px]"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Naqd:' : 'Нал:'), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.cash_received))), receipt.change_given > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px] font-bold"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Qaytim:' : 'Сдача:'), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.change_given))), receipt.debt_amount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px] font-bold text-amber-700"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Qarzga:' : 'В долг:'), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.debt_amount), " (", receipt.debtor_name, ")")), receipt.payment_method === 'DEBT' && /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-amber-800 bg-amber-50 p-1.5 rounded-lg leading-tight"
  }, lang === 'uz' ? "Nasiya cheki (to'lov vaqtida qarz so'ndirish cheki uriladi)" : "Чек отгрузки в долг / рассрочку (при оплате пробивается чек погашения)")), /*#__PURE__*/React.createElement("div", {
    className: "text-center text-[10px] text-stone-500 pt-2 border-t border-dashed border-stone-300 space-y-1"
  }, receipt.fiscal_qr_svg && /*#__PURE__*/React.createElement("img", {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(receipt.fiscal_qr_svg)}`,
    alt: "Soliq QR",
    className: "w-24 h-24 mx-auto border border-stone-200 rounded-lg p-1 bg-white"
  }), receipt.fiscal_sign && /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-stone-600 font-bold"
  }, "FM belgi: ", receipt.fiscal_sign), /*#__PURE__*/React.createElement("div", null, lang === 'uz' ? "Xaridingiz uchun rahmat!" : "Спасибо за покупку!"), /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-stone-400"
  }, receipt.fiscal_status === 'FISCALIZED' ? 'OFD / Soliq fiskal cheki' : lang === 'uz' ? 'Ichki hisob cheki (Fiskal modul / OFD ulanmagan)' : 'Внутренний учётный чек (Без ФМ / ОФД)')))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mt-3 pt-3 border-t atelier-border shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-2xl text-xs font-semibold atelier-btn-soft"
  }, lang === 'uz' ? 'Yopish' : 'Закрыть'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => window.print(),
    className: "flex-1 py-2.5 rounded-2xl text-xs font-bold atelier-btn-primary shadow-sm flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "printer",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Chop etish' : 'Печать')))));
}
function PayDebtModal({
  token,
  lang = 'uz',
  debtor,
  onClose,
  onSuccess,
  notify,
  t
}) {
  const [amount, setAmount] = useState(debtor.balance > 0 ? String(debtor.balance) : '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const submitLockRef = useRef(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (submitLockRef.current) return;
    const num = Number(amount);
    if (!(num > 0)) {
      notify(lang === 'uz' ? "To'lov summasini kiriting" : "Введите сумму оплаты", 'error');
      return;
    }
    submitLockRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: num,
          note: note.trim() || (lang === 'uz' ? "Qarz to'lovi" : "Погашение долга")
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      playAudioCue('success');
      speakAloud(lang === 'uz' ? `${debtor.full_name} ${formatMoney(num)} qarz to'ladi` : `Оплата принята: ${formatMoney(num)}`, lang);
      onSuccess();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-3 text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "✅ ", lang === 'uz' ? "Qarzni so'ndirish" : "Принять оплату долга"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sm"
  }, debtor.full_name), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500"
  }, debtor.phone || '')), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, lang === 'uz' ? 'Hozirgi qarz:' : 'Текущий долг:'), /*#__PURE__*/React.createElement("div", {
    className: "font-mono font-black text-rose-600"
  }, formatMoney(debtor.balance)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1"
  }, lang === 'uz' ? "To'lov summasi (so'm) *" : "Сумма оплаты (сум) *"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    step: "any",
    value: amount,
    onChange: e => setAmount(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-emerald-400 rounded-xl px-3 py-2.5 font-mono font-black text-lg text-emerald-600 dark:text-emerald-400",
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5 mt-2"
  }, debtor.balance > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setAmount(String(debtor.balance)),
    className: "px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs"
  }, lang === 'uz' ? "To'liq to'lash" : "Погасить всё"), [10000, 20000, 50000, 100000].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    onClick: () => setAmount(String(v)),
    className: "px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs"
  }, formatMoney(v))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? 'Izoh:' : 'Примечание:'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: note,
    onChange: e => setNote(e.target.value),
    placeholder: lang === 'uz' ? "Naqd pulda to'ladi..." : "Оплата наличными...",
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
  }, t.cancelBtn || 'Bekor qilish'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
  }, loading ? '...' : lang === 'uz' ? 'To\'lovni qabul qilish' : 'Принять оплату'))));
}
function AddDebtModal({
  token,
  lang = 'uz',
  debtor,
  onClose,
  onSuccess,
  notify,
  t
}) {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(debtor.due_date || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const submitLockRef = useRef(false);
  const setQuickDue = days => {
    const d = new Date(Date.now() + days * 86400000);
    setDueDate(d.toISOString().split('T')[0]);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (submitLockRef.current) return;
    const num = Number(amount);
    if (!(num > 0)) {
      notify(lang === 'uz' ? "Qarz summasini kiriting" : "Введите сумму долга", 'error');
      return;
    }
    submitLockRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/add-debt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: num,
          due_date: dueDate || null,
          note: note.trim() || (lang === 'uz' ? "Qo'shimcha qarz" : "Запись долга")
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      playAudioCue('success');
      onSuccess();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-3 text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "➕ ", lang === 'uz' ? "Qarz qo'shish" : "Добавить долг", " — ", debtor.full_name), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1"
  }, lang === 'uz' ? "Qarz summasi (so'm) *" : "Сумма долга (сум) *"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    step: "any",
    value: amount,
    onChange: e => setAmount(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-amber-400 rounded-xl px-3 py-2.5 font-mono font-black text-lg text-amber-600",
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5 mt-2"
  }, [5000, 10000, 20000, 50000, 100000].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    onClick: () => setAmount(String(v)),
    className: "px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs"
  }, formatMoney(v))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Nima oldi (izoh):" : "Что взял (примечание):"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: note,
    onChange: e => setNote(e.target.value),
    placeholder: lang === 'uz' ? "Masalan: 2 ta non, 1L yog'" : "Например: хлеб, масло",
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
  }), /*#__PURE__*/React.createElement(VoiceInputBtn, {
    onResult: txt => setNote(txt),
    lang: lang
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Qaytarish muddati:" : "Срок возврата:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5 mb-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQuickDue(1),
    className: "px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold"
  }, "Ertaga"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQuickDue(7),
    className: "px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold"
  }, "1 hafta"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setQuickDue(30),
    className: "px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold"
  }, "1 oy")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dueDate,
    onChange: e => setDueDate(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
  }, t.cancelBtn || 'Bekor qilish'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow"
  }, loading ? '...' : lang === 'uz' ? 'Qarzni saqlash' : 'Записать долг'))));
}
function DebtorHistoryModal({
  token,
  debtor,
  onClose,
  notify,
  t
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = typeof window !== 'undefined' && window.pos_lang || typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang') || 'uz';
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/history`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Tarixni yuklab bo\'lmadi');
        const data = await res.json();
        setHistory(safeArray(data));
      } catch (e) {
        notify(e.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [debtor.id]);
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl max-h-[85vh] flex flex-col text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "📜 ", debtor.full_name, " — ", lang === 'uz' ? 'Tarix' : 'История'), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 font-mono"
  }, lang === 'uz' ? 'Balans:' : 'Баланс:', " ", /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-rose-500"
  }, formatMoney(debtor.balance)))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-2 pr-1"
  }, loading ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-xs text-slate-400"
  }, "Yuklanmoqda...") : history.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-xs text-slate-400"
  }, lang === 'uz' ? 'Operatsiyalar topilmadi' : 'Операций нет') : history.map(tx => {
    const isPay = tx.transaction_type === 'DEBT_PAYMENT';
    return /*#__PURE__*/React.createElement("div", {
      key: tx.id,
      className: "p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-xs flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("span", null, isPay ? '✅' : '➕'), /*#__PURE__*/React.createElement("span", null, tx.note || (isPay ? "Qarz to'lovi" : "Qarz yozildi"))), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-slate-400 mt-0.5"
    }, new Date(tx.created_at).toLocaleString(), " • ", tx.created_by_name)), /*#__PURE__*/React.createElement("div", {
      className: `font-mono font-black text-sm whitespace-nowrap ${isPay ? 'text-emerald-600' : 'text-rose-600'}`
    }, isPay ? '-' : '+', formatMoney(tx.amount)));
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "w-full mt-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
  }, lang === 'uz' ? 'Yopish' : 'Закрыть')));
}
function CreateDebtorModal({
  token,
  lang = 'uz',
  onClose,
  onSuccess,
  notify,
  t
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [initialDebt, setInitialDebt] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!fullName.trim()) {
      notify(lang === 'uz' ? 'Mijoz ismini kiriting' : 'Введите имя клиента', 'error');
      return;
    }
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
          phone: phone.trim() || null,
          initial_debt: Number(initialDebt) || 0.0,
          due_date: dueDate || null,
          note: note.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      playAudioCue('success');
      onSuccess();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-3 text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "👤 ", lang === 'uz' ? "Yangi qarzdor mijoz" : "Новый клиент (должник)"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1"
  }, lang === 'uz' ? "Mijoz F.I.Sh. *" : "Имя клиента *"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: fullName,
    onChange: e => setFullName(e.target.value),
    placeholder: "Alisher aka / Dilnoza opa",
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold",
    required: true
  }), /*#__PURE__*/React.createElement(VoiceInputBtn, {
    onResult: txt => setFullName(txt),
    lang: lang
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Telefon raqami:" : "Телефон:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: phone,
    onChange: e => setPhone(e.target.value),
    placeholder: "+998 90 123 45 67",
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Boshlang'ich qarz (so'm):" : "Начальный долг:"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: initialDebt,
    onChange: e => setInitialDebt(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-600"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Qaytarish muddati:" : "Срок возврата:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dueDate,
    onChange: e => setDueDate(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Izoh:" : "Примечание:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: note,
    onChange: e => setNote(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
  }, t.cancelBtn || 'Bekor qilish'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
  }, loading ? '...' : t.saveBtn || 'Saqlash'))));
}
function CreateSupplierModal({
  token,
  lang = 'uz',
  onClose,
  onSuccess,
  notify,
  t
}) {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) return;
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
          contact_person: contactPerson.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          note: note.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      onSuccess();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-3 text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "🚚 ", lang === 'uz' ? "Yangi yetkazib beruvchi" : "Новый поставщик"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1"
  }, lang === 'uz' ? "Firma / Ta'minotchi nomi *" : "Название компании *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: name,
    onChange: e => setName(e.target.value),
    required: true,
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Aloqa shaxsi:" : "Контактное лицо:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: contactPerson,
    onChange: e => setContactPerson(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Telefon:" : "Телефон:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: phone,
    onChange: e => setPhone(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, lang === 'uz' ? "Manzil / Izoh:" : "Адрес / Примечание:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: address,
    onChange: e => setAddress(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800"
  }, t.cancelBtn || 'Bekor qilish'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
  }, loading ? '...' : t.saveBtn || 'Saqlash'))));
}
function CreateInvoiceModal({
  token,
  lang = 'uz',
  suppliers,
  catalogSample,
  onClose,
  onSuccess,
  notify,
  t
}) {
  const [supplierId, setSupplierId] = useState(suppliers?.[0]?.id ? String(suppliers[0].id) : '');
  const [paidAmount, setPaidAmount] = useState('0');
  const [note, setNote] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [items, setItems] = useState([{
    product_id: '',
    product_name: '',
    quantity: '1',
    purchase_price: ''
  }]);
  const [loading, setLoading] = useState(false);
  const submitLockRef = useRef(false);
  const filteredCatalog = useMemo(() => {
    const all = safeArray(catalogSample);
    const q = skuFilter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(p => (p.name || '').toLowerCase().includes(q) || (p.barcode || '').includes(q));
  }, [catalogSample, skuFilter]);
  const addRow = () => setItems(prev => [...prev, {
    product_id: '',
    product_name: '',
    quantity: '1',
    purchase_price: ''
  }]);
  const removeRow = idx => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateRow = (idx, field, val) => {
    setItems(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const updated = {
        ...r,
        [field]: val
      };
      if (field === 'product_id' && val) {
        const found = safeArray(catalogSample).find(p => String(p.id) === String(val));
        if (found) {
          updated.product_name = found.name;
          if (!updated.purchase_price) updated.purchase_price = String(found.purchase_price || 0);
        }
      }
      return updated;
    }));
  };
  const totalAmount = items.reduce((s, r) => s + (Number(r.quantity) || 0) * (Number(r.purchase_price) || 0), 0);
  const handleSubmit = async e => {
    e.preventDefault();
    if (submitLockRef.current) return;
    if (!supplierId) {
      notify(lang === 'uz' ? "Ta'minotchini tanlang" : "Выберите поставщика", 'error');
      return;
    }
    const validItems = items.filter(r => (r.product_id || r.product_name?.trim()) && Number(r.quantity) > 0).map(r => ({
      product_id: r.product_id ? Number(r.product_id) : null,
      product_name: r.product_name?.trim() || null,
      quantity: Number(r.quantity),
      purchase_price: Number(r.purchase_price) || 0
    }));
    if (validItems.length === 0) {
      notify(lang === 'uz' ? "Kamida 1 ta tovar kiriting" : "Добавьте хотя бы 1 товар", 'error');
      return;
    }
    submitLockRef.current = true;
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
          items: validItems,
          paid_amount: Number(paidAmount) || 0,
          note: note.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      onSuccess();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-4 sm:p-5 shadow-2xl max-h-[calc(100dvh-1.5rem)] flex flex-col text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "📦 ", lang === 'uz' ? "Yangi yuk xati (Priyom tovara)" : "Новая накладная (Приход товара)"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-3 pr-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1"
  }, lang === 'uz' ? "Ta'minotchi *" : "Поставщик *"), /*#__PURE__*/React.createElement("select", {
    value: supplierId,
    onChange: e => setSupplierId(e.target.value),
    required: true,
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "-- Tanlang --"), safeArray(suppliers).map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.name)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1"
  }, lang === 'uz' ? "To'langan summa (so'm):" : "Оплачено сразу (сум):"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    step: "any",
    value: paidAmount,
    onChange: e => setPaidAmount(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold shrink-0"
  }, lang === 'uz' ? "Tovarlar ro'yxati:" : "Список товаров:"), safeArray(catalogSample).length > 8 && /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: skuFilter,
    onChange: e => setSkuFilter(e.target.value),
    placeholder: lang === 'uz' ? "Ro'yxatdan izlash..." : "Фильтр товаров...",
    className: "flex-1 max-w-[180px] bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px]"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addRow,
    className: "text-xs font-bold text-emerald-600 hover:underline shrink-0"
  }, "+ ", lang === 'uz' ? "Qator qo'shish" : "Добавить строку")), items.map((row, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "grid grid-cols-12 gap-1.5 items-center bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-span-5"
  }, /*#__PURE__*/React.createElement("select", {
    value: row.product_id,
    onChange: e => updateRow(idx, 'product_id', e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] mb-1"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, lang === 'uz' ? '-- Yoki yangi nom --' : '-- Новый товар --'), filteredCatalog.slice(0, 200).map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name))), !row.product_id && /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Yangi tovar nomi" : "Название товара",
    value: row.product_name,
    onChange: e => updateRow(idx, 'product_name', e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px]"
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-span-3"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    min: "0.01",
    placeholder: "Soni",
    value: row.quantity,
    onChange: e => updateRow(idx, 'quantity', e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-center"
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-span-3"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    step: "any",
    placeholder: "Kirim narx",
    value: row.purchase_price,
    onChange: e => updateRow(idx, 'purchase_price', e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono"
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-span-1 text-center"
  }, items.length > 1 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => removeRow(idx),
    className: "text-rose-500 font-bold"
  }, "✕"))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl flex justify-between items-center font-mono text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Yuk xati jami:" : "Итого по накладной:"), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-600 text-base"
  }, formatMoney(totalAmount)))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800"
  }, t.cancelBtn || 'Bekor qilish'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
  }, loading ? '...' : lang === 'uz' ? 'Omborga qabul qilish' : 'Принять на склад'))));
}
function PayInvoiceModal({
  token,
  lang = 'uz',
  invoice,
  onClose,
  onSuccess,
  notify,
  t
}) {
  const [amount, setAmount] = useState(String(invoice.debt_to_supplier || 0));
  const [loading, setLoading] = useState(false);
  const submitLockRef = useRef(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (submitLockRef.current) return;
    const num = Number(amount);
    if (!(num > 0)) return;
    submitLockRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: num
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      onSuccess();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-3 text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "💸 ", invoice.invoice_number, " — ", lang === 'uz' ? "To'lov" : "Оплата"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500"
  }, invoice.supplier_name, " • ", lang === 'uz' ? 'Qolgan qarz:' : 'Остаток долга:', " ", /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-bold text-rose-600"
  }, formatMoney(invoice.debt_to_supplier))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1"
  }, lang === 'uz' ? "To'lov summasi (so'm):" : "Сумма оплаты:"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    step: "any",
    value: amount,
    onChange: e => setAmount(e.target.value),
    required: true,
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-emerald-400 rounded-xl px-3 py-2.5 font-mono font-black text-base text-emerald-600"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800"
  }, t.cancelBtn || 'Bekor qilish'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
  }, loading ? '...' : lang === 'uz' ? "To'lash" : 'Оплатить'))));
}
function CashShiftModal({
  token,
  onClose,
  notify,
  lang = 'uz',
  onShiftChange
}) {
  const [shiftInfo, setShiftInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCash, setInitialCash] = useState('0');
  const [actualCash, setActualCash] = useState('');
  const [actionAmount, setActionAmount] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionType, setActionType] = useState('CASH_OUT');
  const [zReport, setZReport] = useState(null);
  const loadShift = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pos/shift/current`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setShiftInfo(data);
        if (data?.shift) setActualCash(String(data.shift.expected_cash));
      } else {
        let msg = lang === 'uz' ? 'Smena holatini yuklab bo‘lmadi' : 'Не удалось загрузить смену';
        try {
          const err = await res.json();
          if (err?.detail) msg = err.detail;
        } catch (e) {}
        notify(msg, 'error');
      }
    } catch (e) {
      notify(lang === 'uz' ? 'Server bilan aloqa yo‘q' : 'Нет связи с сервером', 'error');
    }
    setLoading(false);
  };
  useEffect(() => {
    loadShift();
  }, []);
  const handleOpenShift = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pos/shift/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          initial_cash: Number(initialCash) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      playAudioCue('success');
      notify(lang === 'uz' ? 'Kassa smenasi ochildi!' : 'Смена открыта!');
      await loadShift();
      if (onShiftChange) onShiftChange();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleCashAction = async e => {
    e.preventDefault();
    const num = Number(actionAmount);
    if (!(num > 0) || !actionReason.trim()) {
      notify(lang === 'uz' ? "Summa va sababni kiriting" : "Введите сумму и причину", 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pos/shift/cash-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action_type: actionType,
          amount: num,
          reason: actionReason.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      notify(data.message);
      setActionAmount('');
      setActionReason('');
      await loadShift();
      if (onShiftChange) onShiftChange();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleCloseShift = async () => {
    const confirmMsg = lang === 'uz' ? "Haqiqatan ham smenani yopib Z-hisobot tuzmoqchimisiz?" : "Действительно закрыть смену и снять Z-отчет?";
    if (!confirm(confirmMsg)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pos/shift/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          actual_cash: Number(actualCash) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      playAudioCue('success');
      setZReport(data);
      await loadShift();
      if (onShiftChange) onShiftChange();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl max-h-[calc(100dvh-1.5rem)] flex flex-col text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-black text-base flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "🧾"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Kassa Smenasi & Z-Hisobot' : 'Кассовая смена и Z-Отчет')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-4 pr-1"
  }, zReport ? /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 space-y-2 text-xs font-mono"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center font-black text-sm text-emerald-700 dark:text-emerald-300"
  }, "✅ ", lang === 'uz' ? 'Z-HISOBOT (SMENA YOPILDI)' : 'Z-ОТЧЕТ (СМЕНА ЗАКРЫТА)'), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Smena:"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, zReport.shift_number)), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Kassir:"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, zReport.cashier_name)), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Cheklar soni:"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, zReport.sales_count)), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Naqd savdo:"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, formatMoney(zReport.cash_sales))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Karta savdo:"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, formatMoney(zReport.card_sales))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Qarzga berildi:"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, formatMoney(zReport.debt_sales))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between border-t pt-1"
  }, /*#__PURE__*/React.createElement("span", null, "Kutilgan naqd:"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, formatMoney(zReport.expected_cash))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Haqiqiy naqd:"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, formatMoney(zReport.actual_cash))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between font-black"
  }, /*#__PURE__*/React.createElement("span", null, "Farq (Kamomad/Ortiqcha):"), /*#__PURE__*/React.createElement("span", {
    className: zReport.difference < 0 ? 'text-rose-600' : 'text-emerald-600'
  }, formatMoney(zReport.difference)))) : loading ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-xs text-slate-400"
  }, "Yuklanmoqda...") : !shiftInfo?.is_open ? /*#__PURE__*/React.createElement("form", {
    onSubmit: handleOpenShift,
    className: "space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-3xl"
  }, "🔓"), /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-sm mt-1"
  }, lang === 'uz' ? "Hozirda smena yopiq" : "Смена сейчас закрыта"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 mt-0.5"
  }, lang === 'uz' ? "Savdoni boshlash uchun kassadagi qaytim pulini kiriting" : "Введите начальный остаток наличных в кассе")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1"
  }, lang === 'uz' ? "Kassadagi boshlang'ich naqd pul (so'm):" : "Начальный остаток (сум):"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: initialCash,
    onChange: e => setInitialCash(e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-emerald-400 rounded-xl px-3 py-2.5 font-mono font-black text-base"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg touch-target"
  }, "🟢 ", lang === 'uz' ? "Smenani ochish" : "Открыть смену")) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-slate-500 text-[11px]"
  }, lang === 'uz' ? "Kassada kutilayotgan naqd:" : "Наличных в кассе:"), /*#__PURE__*/React.createElement("div", {
    className: "text-lg font-black font-mono text-emerald-600"
  }, formatMoney(shiftInfo.shift.expected_cash))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-slate-500 text-[11px]"
  }, lang === 'uz' ? "Jami savdo:" : "Общая выручка:"), /*#__PURE__*/React.createElement("div", {
    className: "text-lg font-black font-mono"
  }, formatMoney(shiftInfo.shift.total_sales)), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, shiftInfo.shift.sales_count, " chek • Karta: ", formatMoney(shiftInfo.shift.card_sales)))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleCashAction,
    className: "bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold"
  }, lang === 'uz' ? "Kassaga pul kiritish / Inkassatsiya:" : "Внесение / Инкассация:"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setActionType('CASH_IN'),
    className: `py-1.5 rounded-xl text-xs font-bold border ${actionType === 'CASH_IN' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900'}`
  }, "➕ Kirim (Qaytim)"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setActionType('CASH_OUT'),
    className: `py-1.5 rounded-xl text-xs font-bold border ${actionType === 'CASH_OUT' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-900'}`
  }, "➖ Chiqim (Olish)")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    placeholder: "Summa",
    value: actionAmount,
    onChange: e => setActionAmount(e.target.value),
    className: "w-1/3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono font-bold"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Sababi (masalan: mayda pul)" : "Причина",
    value: actionReason,
    onChange: e => setActionReason(e.target.value),
    className: "flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-xl text-xs font-bold"
  }, "OK"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-rose-50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold text-rose-800 dark:text-rose-300"
  }, lang === 'uz' ? "Kassada sanab chiqilgan haqiqiy naqd pul (so'm):" : "Фактическая сумма в кассе при закрытии:"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: actualCash,
    onChange: e => setActualCash(e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-rose-300 rounded-xl px-3 py-2 text-sm font-mono font-black"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCloseShift,
    className: "w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow touch-target"
  }, "🔴 ", lang === 'uz' ? "Smenani yopish va Z-hisobot olish" : "Закрыть смену (Z-отчет)")))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "w-full mt-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
  }, lang === 'uz' ? 'Yopish' : 'Закрыть')));
}
function RefundModal({
  token,
  onClose,
  onPrintReceipt,
  notify,
  lang = 'uz',
  onRefunded
}) {
  const [receiptNum, setReceiptNum] = useState('');
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [returnQtys, setReturnQtys] = useState({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const loadRecent = async (q = '') => {
    try {
      const url = q.trim() ? `${API_BASE}/pos/receipts?limit=25&search=${encodeURIComponent(q.trim())}` : `${API_BASE}/pos/receipts?limit=25`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setRecentReceipts(safeArray(await res.json()));
    } catch (e) {}
  };
  useEffect(() => {
    loadRecent('');
  }, []);
  const selectReceiptByNumber = async num => {
    if (!num) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pos/receipt/${encodeURIComponent(num.trim())}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Chek topilmadi");
      setReceiptData(data);
      const initQ = {};
      safeArray(data.items).forEach(it => {
        initQ[it.product_id] = 0;
      });
      setReturnQtys(initQ);
    } catch (err) {
      notify(err.message, 'error');
      setReceiptData(null);
    } finally {
      setLoading(false);
    }
  };
  const searchReceipt = async e => {
    if (e) e.preventDefault();
    if (!receiptNum.trim()) {
      loadRecent('');
      return;
    }
    await selectReceiptByNumber(receiptNum);
  };
  const refundSubmitLockRef = useRef(false);
  const groupedRefundItems = useMemo(() => {
    const map = {};
    safeArray(receiptData?.items).forEach(it => {
      if (!map[it.product_id]) {
        map[it.product_id] = {
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: 0,
          unit_price: it.unit_price,
          refundable_quantity: 0
        };
      }
      map[it.product_id].quantity = Math.round((map[it.product_id].quantity + Number(it.quantity || 0)) * 1000) / 1000;
      map[it.product_id].refundable_quantity = Math.round((map[it.product_id].refundable_quantity + Number(it.refundable_quantity || 0)) * 1000) / 1000;
    });
    return Object.values(map);
  }, [receiptData]);
  const handleRefund = async () => {
    if (refundSubmitLockRef.current) return;
    const itemsToReturn = Object.entries(returnQtys).filter(([_, q]) => Number(q) > 0).map(([pid, q]) => ({
      product_id: Number(pid),
      quantity: Number(q),
      reason: reason || 'Mijoz qaytardi'
    }));
    if (itemsToReturn.length === 0) {
      notify(lang === 'uz' ? "Qaytariladigan tovar miqdorini kiriting" : "Укажите количество для возврата", 'error');
      return;
    }
    refundSubmitLockRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pos/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receipt_number: receiptData.receipt_number,
          items: itemsToReturn,
          reason: reason.trim() || "Mijoz qaytardi"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xatolik");
      playAudioCue('success');
      notify(data.message);
      if (onRefunded) onRefunded();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      refundSubmitLockRef.current = false;
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-4 sm:p-5 shadow-2xl modal-mobile-safe text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, receiptData && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setReceiptData(null),
    className: "px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold"
  }, "←"), /*#__PURE__*/React.createElement("h3", {
    className: "font-black text-base"
  }, "🧾 ", lang === 'uz' ? "Cheklar tarixi va Vozvrat" : "Чеки и Возврат")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg p-1"
  }, "✕")), /*#__PURE__*/React.createElement("form", {
    onSubmit: searchReceipt,
    className: "flex gap-1.5 mb-2.5 shrink-0"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Chek raqami (REC-...) yoki bo'sh" : "Номер чека (REC-...)",
    value: receiptNum,
    onChange: e => {
      setReceiptNum(e.target.value);
      if (!receiptData) loadRecent(e.target.value);
    },
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold"
  }, loading ? '...' : lang === 'uz' ? 'Topish' : 'Найти')), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-2 pr-1"
  }, !receiptData ? safeArray(recentReceipts).length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-xs text-slate-400"
  }, lang === 'uz' ? "Hozircha cheklar yo'q" : "Чеков пока нет") : safeArray(recentReceipts).map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold font-mono flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, r.receipt_number), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700"
  }, r.payment_method), r.has_refund && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700"
  }, "Vozvrat")), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 truncate"
  }, new Date(r.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }), " • ", r.items_count, " poz • ", formatMoney(r.total_amount))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 shrink-0"
  }, onPrintReceipt && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onPrintReceipt(r),
    className: "px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold",
    title: "Print"
  }, "🖨️"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => selectReceiptByNumber(r.receipt_number),
    className: "px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold"
  }, "🔄 ", lang === 'uz' ? 'Qaytarish' : 'Возврат')))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-xs flex justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold font-mono"
  }, receiptData.receipt_number), /*#__PURE__*/React.createElement("div", {
    className: "text-slate-500"
  }, new Date(receiptData.created_at).toLocaleString())), /*#__PURE__*/React.createElement("div", {
    className: "text-right font-mono font-bold"
  }, /*#__PURE__*/React.createElement("div", null, formatMoney(receiptData.total_amount)), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, receiptData.payment_method))), groupedRefundItems.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.product_id,
    className: "p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold truncate"
  }, it.product_name), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500"
  }, it.quantity, " x ", formatMoney(it.unit_price), " (", lang === 'uz' ? 'Mumkin:' : 'Дост:', " ", it.refundable_quantity, ")")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setReturnQtys(prev => ({
      ...prev,
      [it.product_id]: it.refundable_quantity
    })),
    className: "px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold"
  }, lang === 'uz' ? 'Hammasi' : 'Все'), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    max: it.refundable_quantity,
    step: "any",
    value: returnQtys[it.product_id] ?? 0,
    onChange: e => setReturnQtys(prev => ({
      ...prev,
      [it.product_id]: e.target.value
    })),
    className: "w-16 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono font-bold"
  })))), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Qaytarish sababi..." : "Причина возврата...",
    value: reason,
    onChange: e => setReason(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs mt-2"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800"
  }, lang === 'uz' ? 'Yopish' : 'Закрыть'), receiptData && !receiptData.is_fully_refunded && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleRefund,
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow"
  }, "🔄 ", lang === 'uz' ? "Qaytarishni tasdiqlash" : "Оформить возврат"))));
}

// ------------------- PRICE CHECKER MODAL -------------------
function PriceCheckModal({
  token,
  onClose,
  onAddToCart,
  notify,
  t,
  lang = 'uz'
}) {
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState(null);
  const [results, setResults] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const checkBarcodeOrName = async code => {
    const clean = (code || '').trim();
    if (!clean) return;
    try {
      const res = await fetch(`${API_BASE}/products/barcode/${encodeURIComponent(clean)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const prod = await res.json();
        setProduct(prod);
        playAudioCue('add');
        return;
      }
      const listRes = await fetch(`${API_BASE}/products?search=${encodeURIComponent(clean)}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (listRes.ok) {
        const list = safeArray(await listRes.json());
        setResults(list);
        if (list.length === 1) setProduct(list[0]);
      }
    } catch (e) {}
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl modal-mobile-safe text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-black text-base"
  }, "🏷️ ", lang === 'uz' ? "Narx tekshirish (Prays-cheker)" : "Проверка цены"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 text-lg p-1"
  }, "✕")), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      checkBarcodeOrName(query);
    },
    className: "flex gap-1.5 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    type: "text",
    placeholder: lang === 'uz' ? "Shtrixkod yoki tovar nomi..." : "Штрихкод или название...",
    value: query,
    onChange: e => setQuery(e.target.value),
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setScannerOpen(true),
    className: "px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
  }, "📷"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold"
  }, "🔍")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-2 pr-1"
  }, product ? /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 text-center space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-mono text-slate-500"
  }, product.barcode), /*#__PURE__*/React.createElement("div", {
    className: "text-lg font-black text-slate-900 dark:text-slate-100"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400"
  }, formatMoney(product.sale_price)), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500"
  }, lang === 'uz' ? 'Qoldiq:' : 'Остаток:', " ", /*#__PURE__*/React.createElement("span", {
    className: "font-bold font-mono"
  }, product.stock_quantity, " ", product.unit), product.expiry_date && ` • ⏰ ${product.expiry_date}`), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      onAddToCart(product, product.detected_weight || 1.0);
      onClose();
    },
    className: "w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow"
  }, "➕ ", lang === 'uz' ? "Savatga qo'shish" : "Добавить в чек")) : results.length > 0 ? results.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.id,
    type: "button",
    onClick: () => setProduct(r),
    className: "w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-left text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold truncate pr-2"
  }, r.name), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-black text-emerald-600 shrink-0"
  }, formatMoney(r.sale_price)))) : /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-xs text-slate-400"
  }, lang === 'uz' ? "Shtrixkodni skanerlang yoki nomini yozing" : "Отсканируйте штрихкод или введите название")), scannerOpen && /*#__PURE__*/React.createElement(CameraScannerModal, {
    onScan: code => {
      setScannerOpen(false);
      setQuery(code);
      checkBarcodeOrName(code);
    },
    onClose: () => setScannerOpen(false),
    notify: notify,
    t: t,
    lang: lang
  })));
}

// ------------------- EDIT DEBTOR & REMINDER MODALS -------------------
function EditDebtorModal({
  token,
  lang = 'uz',
  debtor,
  onClose,
  onSuccess,
  notify
}) {
  const [fullName, setFullName] = useState(debtor.full_name || '');
  const [phone, setPhone] = useState(debtor.phone || '');
  const [dueDate, setDueDate] = useState(debtor.due_date || '');
  const [note, setNote] = useState(debtor.note || '');
  const [loading, setLoading] = useState(false);
  const submit = async e => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          due_date: dueDate || null,
          note: note.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl modal-mobile-safe text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "✏️ ", lang === 'uz' ? "Mijozni tahrirlash" : "Редактировать клиента"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 text-lg p-1"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-2.5 text-xs pr-1"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-bold mb-1"
  }, lang === 'uz' ? "F.I.Sh. *" : "Имя *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: fullName,
    onChange: e => setFullName(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold mb-1"
  }, lang === 'uz' ? "Telefon:" : "Телефон:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: phone,
    onChange: e => setPhone(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold mb-1"
  }, lang === 'uz' ? "Qaytarish muddati:" : "Срок возврата:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dueDate,
    onChange: e => setDueDate(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold mb-1"
  }, lang === 'uz' ? "Izoh:" : "Примечание:"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: note,
    onChange: e => setNote(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800"
  }, lang === 'uz' ? 'Bekor qilish' : 'Отмена'), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white"
  }, loading ? '...' : lang === 'uz' ? 'Saqlash' : 'Сохранить'))));
}
function RemindDebtorModal({
  debtor,
  onClose,
  notify,
  lang = 'uz'
}) {
  const defaultMsg = lang === 'uz' ? `Assalomu alaykum, ${debtor.full_name}! Do'konimizdan ${formatMoney(debtor.balance)} qarzingiz borligini eslatib o'tamiz${debtor.due_date ? ` (muddati: ${debtor.due_date})` : ''}. Rahmat!` : `Здравствуйте, ${debtor.full_name}! Напоминаем о задолженности в магазине: ${formatMoney(debtor.balance)}${debtor.due_date ? ` (срок: ${debtor.due_date})` : ''}. Спасибо!`;
  const [msg, setMsg] = useState(defaultMsg);
  const digits = (debtor.phone || '').replace(/\D/g, '');
  const waNum = digits.startsWith('998') ? digits : digits.length === 9 ? '998' + digits : digits;
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      notify(lang === 'uz' ? "Matn nusxalandi!" : "Текст скопирован!");
    } catch (e) {
      notify(lang === 'uz' ? "Nusxalab bo'lmadi" : "Не удалось скопировать", 'error');
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl modal-mobile-safe text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "📩 ", lang === 'uz' ? "Qarz eslatmasi" : "Напоминание о долге"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 text-lg p-1"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-2.5 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold"
  }, debtor.full_name, " ", debtor.phone ? `• ${debtor.phone}` : ''), /*#__PURE__*/React.createElement("textarea", {
    rows: 4,
    value: msg,
    onChange: e => setMsg(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: copyText,
    className: "py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
  }, "📋 ", lang === 'uz' ? 'Nusxalash' : 'Копировать'), debtor.phone && /*#__PURE__*/React.createElement("a", {
    href: `sms:${debtor.phone}?body=${encodeURIComponent(msg)}`,
    className: "py-2.5 rounded-xl bg-sky-600 text-white font-bold text-center"
  }, "💬 SMS"), waNum && /*#__PURE__*/React.createElement("a", {
    href: `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`,
    target: "_blank",
    rel: "noreferrer",
    className: "py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-center"
  }, "🟢 WhatsApp"), /*#__PURE__*/React.createElement("a", {
    href: `https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encodeURIComponent(msg)}`,
    target: "_blank",
    rel: "noreferrer",
    className: "py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-center"
  }, "✈️ Telegram"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "w-full mt-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 shrink-0"
  }, lang === 'uz' ? 'Yopish' : 'Закрыть')));
}

// ------------------- POS TERMINAL SCREEN -------------------
function PosScreen({
  token,
  notify,
  isOwner,
  t,
  lang: propLang,
  setLang: propSetLang,
  toggleLang: propToggleLang,
  currentShift: propShift,
  onShiftChange,
  onOpenShift
}) {
  const lang = propLang || typeof window !== 'undefined' && window.pos_lang || typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang') || 'uz';
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(() => {
    try {
      return safeArray(JSON.parse(localStorage.getItem('pos_active_cart') || '[]'));
    } catch (e) {
      return [];
    }
  });
  const directSubmitLockRef = useRef(false);
  useEffect(() => {
    try {
      localStorage.setItem('pos_active_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutInitialMethod, setCheckoutInitialMethod] = useState('CASH');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const [priceCheckOpen, setPriceCheckOpen] = useState(false);
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [voiceDebtOpen, setVoiceDebtOpen] = useState(false);
  const [quickProducts, setQuickProducts] = useState([]);
  const [notFoundBarcode, setNotFoundBarcode] = useState(null);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [localShift, setLocalShift] = useState(null);
  const [markingScanKey, setMarkingScanKey] = useState(null);
  const currentShift = propShift !== undefined ? propShift : localShift;

  // Parked / Held Carts (MoySklad Queue)
  const [parkedCarts, setParkedCarts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pos_parked_carts') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [parkedModalOpen, setParkedModalOpen] = useState(false);
  const [selectedCashReceived, setSelectedCashReceived] = useState(null);
  const searchInputRef = useRef(null);
  const fetchCurrentShift = async () => {
    try {
      const res = await fetch(`${API_BASE}/pos/shift/current`, {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setLocalShift(data);
        if (onShiftChange) onShiftChange();
      }
    } catch (e) {}
  };
  useEffect(() => {
    fetchCategories();
    fetchQuickProducts();
    if (propShift === undefined) fetchCurrentShift();
  }, []);
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search]);
  const fetchCategories = async () => {
    try {
      const headers = token ? {
        Authorization: `Bearer ${token}`
      } : {};
      const res = await fetch(`${API_BASE}/products/categories/all`, {
        headers
      });
      if (!res.ok) {
        setCategories([]);
        return;
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data?.categories || data?.items || []);
    } catch (e) {
      setCategories([]);
    }
  };
  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        limit: '24'
      });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory) params.append('category_id', selectedCategory.toString());
      const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      });
      if (!res.ok) {
        setProducts([]);
        return;
      }
      setProducts(safeArray(await res.json()));
    } catch (e) {
      setProducts([]);
    }
  };
  const fetchQuickProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/quick`, {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      });
      if (res.ok) {
        const list = safeArray(await res.json());
        if (list.length > 0) setQuickProducts(list);
      }
    } catch (e) {}
  };
  const playBeep = () => playAudioCue('success');
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  }, [cart]);
  const cashGiven = selectedCashReceived !== null ? selectedCashReceived : cartTotal;
  const cashChange = Math.max(0, cashGiven - cartTotal);

  // Hotkeys for PC cashiers (F2, F3, F5, F6, F7, F12, Esc)
  useEffect(() => {
    const anyModalOpen = checkoutModalOpen || scannerActive || parkedModalOpen || shiftModalOpen || refundModalOpen || priceCheckOpen || voiceAssistantOpen || voiceDebtOpen || Boolean(createProductOpen) || markingScanKey !== null;
    const handleKeyDown = e => {
      if (e.key === 'F2') {
        if (anyModalOpen) return;
        e.preventDefault();
        if (searchInputRef.current) searchInputRef.current.focus();
      } else if (e.key === 'F3') {
        if (anyModalOpen) return;
        e.preventDefault();
        setVoiceAssistantOpen(true);
      } else if (e.key === 'F5') {
        if (anyModalOpen || directSubmitLockRef.current) return;
        e.preventDefault();
        if (cart.length > 0) handleDirectCheckout('CASH');
      } else if (e.key === 'F6') {
        if (anyModalOpen || directSubmitLockRef.current) return;
        e.preventDefault();
        if (cart.length > 0) handleDirectCheckout('CARD');
      } else if (e.key === 'F7') {
        if (anyModalOpen || directSubmitLockRef.current) return;
        e.preventDefault();
        if (cart.length > 0) handleDirectCheckout('DEBT');
      } else if (e.key === 'F12') {
        if (anyModalOpen) return;
        e.preventDefault();
        if (cart.length > 0) setCheckoutModalOpen(true);
      } else if (e.key === 'Escape') {
        if (checkoutModalOpen) setCheckoutModalOpen(false);else if (scannerActive) setScannerActive(false);else if (parkedModalOpen) setParkedModalOpen(false);else if (!anyModalOpen && cart.length > 0) parkCurrentCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, cartTotal, checkoutModalOpen, scannerActive, parkedModalOpen, parkedCarts, shiftModalOpen, refundModalOpen, priceCheckOpen, voiceAssistantOpen, voiceDebtOpen, createProductOpen, markingScanKey]);
  const parkCurrentCart = () => {
    if (cart.length === 0) {
      notify(lang === 'uz' ? "Savat bo'sh" : "Корзина пуста", 'warn');
      return;
    }
    const newHold = {
      id: Date.now().toString().slice(-5),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: cart,
      total: cartTotal,
      itemCount: cart.reduce((sum, it) => sum + it.quantity, 0)
    };
    const updated = [newHold, ...parkedCarts].slice(0, 10);
    setParkedCarts(updated);
    try {
      localStorage.setItem('pos_parked_carts', JSON.stringify(updated));
    } catch (e) {}
    setCart([]);
    setSelectedCashReceived(null);
    notify(lang === 'uz' ? `Chek #${newHold.id} saqlandi` : `Чек #${newHold.id} отложен`, 'info');
  };
  const resumeParkedCart = heldId => {
    const found = parkedCarts.find(h => h.id === heldId);
    if (!found) return;
    let remaining = parkedCarts.filter(h => h.id !== heldId);
    if (cart.length > 0) {
      const autoPark = {
        id: Date.now().toString().slice(-5),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        items: cart,
        total: cartTotal,
        itemCount: cart.reduce((sum, it) => sum + it.quantity, 0)
      };
      remaining = [autoPark, ...remaining];
    }
    setParkedCarts(remaining);
    try {
      localStorage.setItem('pos_parked_carts', JSON.stringify(remaining));
    } catch (e) {}
    setCart(found.items);
    setSelectedCashReceived(null);
    setParkedModalOpen(false);
    setSearch('');
    setSelectedCategory(null);
    setShowAllCatalog(false);
    notify(lang === 'uz' ? `Chek #${heldId} tiklandi` : `Чек #${heldId} восстановлен`, 'success');
  };
  const removeParkedCart = heldId => {
    const updated = parkedCarts.filter(h => h.id !== heldId);
    setParkedCarts(updated);
    try {
      localStorage.setItem('pos_parked_carts', JSON.stringify(updated));
    } catch (e) {}
  };
  const handleSearchOrBarcodeSubmit = async e => {
    if (e) e.preventDefault();
    const raw = search.trim();
    if (!raw) return;
    // Try barcode lookup first if it looks like a barcode or matches 1 product cleanly
    if (/^[0-9A-Za-z\-]{4,64}$/.test(raw) && /\d/.test(raw)) {
      await processBarcode(raw);
      return;
    }
    if (products.length === 1) {
      addToCart(products[0], 1.0);
      playAudioCue('add');
      setSearch('');
      notify(products[0].name);
    }
  };
  const processBarcode = async code => {
    try {
      const res = await fetch(`${API_BASE}/products/barcode/${encodeURIComponent(code)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        playAudioCue('listen');
        setCreateProductOpen(code);
        notify(lang === 'uz' ? `Yangi shtrixkod (${code}). Tovarni kiriting` : `Новый штрихкод (${code}). Заполните данные`, 'info');
        setSearch('');
        return;
      }
      const prod = await res.json();
      if (prod.marking_already_sold) {
        playAudioCue('error');
        notify(lang === 'uz' ? `${prod.name}: Ushbu DataMatrix markirovka kodi avval sotilgan!` : `${prod.name}: Этот DataMatrix код уже был продан!`, 'error');
        setSearch('');
        return;
      }
      playAudioCue('add');
      const qty = prod.detected_weight ? Number(prod.detected_weight) : 1.0;
      addToCart(prod, qty, prod.detected_marking_code || null);
      notify(prod.detected_marking_code ? `🚬 ${prod.name} (DataMatrix ✓)` : prod.detected_weight ? `${prod.name} (${qty} kg)` : prod.name);
      setSearch('');
      if (searchInputRef.current) searchInputRef.current.focus();
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const getCartKey = item => item.cartKey || `${item.product.id}`;
  const addToCart = (product, quantity = 1.0, markingCode = null) => {
    setCart(prev => {
      if (markingCode) {
        if (prev.some(item => item.marking_code === markingCode)) {
          notify(lang === 'uz' ? "Bu DataMatrix kodi savatda bor!" : "Этот DataMatrix уже в чеке!", 'error');
          return prev;
        }
        return [...prev, {
          cartKey: `${product.id}:${markingCode}`,
          product,
          quantity: 1,
          marking_code: markingCode
        }];
      }
      const existing = prev.find(item => item.product.id === product.id && !item.marking_code);
      if (existing) {
        return prev.map(item => getCartKey(item) === getCartKey(existing) ? {
          ...item,
          quantity: Math.round((item.quantity + quantity) * 1000) / 1000
        } : item);
      }
      return [...prev, {
        cartKey: `${product.id}`,
        product,
        quantity: Math.round(quantity * 1000) / 1000,
        marking_code: null
      }];
    });
  };
  const addQuickItem = item => {
    playAudioCue('add');
    const prod = {
      id: item.id || item.barcode,
      name: item.name,
      barcode: item.barcode,
      sale_price: item.sale_price !== undefined ? item.sale_price : item.price,
      purchase_price: item.purchase_price !== undefined ? item.purchase_price : Math.round((item.sale_price || item.price) * 0.75),
      unit: item.unit || 'dona',
      stock_quantity: item.stock_quantity !== undefined ? item.stock_quantity : 999,
      is_tobacco: Boolean(item.is_tobacco),
      requires_marking: Boolean(item.requires_marking || item.is_tobacco),
      marking_group: item.marking_group || (item.is_tobacco ? 'TOBACCO' : 'NONE')
    };
    addToCart(prod, 1.0);
    notify(`${item.name} (+1)`);
  };
  const updateQuantity = (cartKeyOrId, delta) => {
    setCart(prev => prev.map(item => {
      if (getCartKey(item) === String(cartKeyOrId) || item.product.id === cartKeyOrId) {
        const newQty = Math.round((item.quantity + delta) * 1000) / 1000;
        return newQty > 0 ? {
          ...item,
          quantity: newQty
        } : null;
      }
      return item;
    }).filter(Boolean));
  };
  const setItemExactQty = (cartKeyOrId, newQty) => {
    const parsed = parseFloat(newQty);
    if (isNaN(parsed) || parsed <= 0) return;
    setCart(prev => prev.map(item => getCartKey(item) === String(cartKeyOrId) || item.product.id === cartKeyOrId ? {
      ...item,
      quantity: parsed
    } : item));
  };
  const removeFromCart = cartKeyOrId => {
    setCart(prev => prev.filter(item => getCartKey(item) !== String(cartKeyOrId) && item.product.id !== cartKeyOrId));
  };
  const attachMarkingToCartItem = (cartKey, scannedCode) => {
    const clean = (scannedCode || '').trim();
    if (!clean) return;
    setCart(prev => {
      if (prev.some(it => it.marking_code === clean && getCartKey(it) !== cartKey)) {
        notify(lang === 'uz' ? "Bu DataMatrix kodi boshqa qatorda bor!" : "Этот DataMatrix уже привязан!", 'error');
        return prev;
      }
      return prev.map(it => getCartKey(it) === cartKey ? {
        ...it,
        marking_code: clean,
        cartKey: `${it.product.id}:${clean}`
      } : it);
    });
    playAudioCue('success');
    notify(lang === 'uz' ? "DataMatrix kod biriktirildi ✓" : "Код DataMatrix привязан ✓");
  };
  const clearCart = (askConfirm = false) => {
    if (askConfirm && cart.length > 0) {
      const msg = lang === 'uz' ? "Savatni butunlay tozalamoqchimisiz?" : "Действительно очистить весь чек?";
      if (!confirm(msg)) return;
    }
    setCart([]);
    setSelectedCashReceived(null);
  };
  const handleDirectCheckout = async paymentMethod => {
    if (cart.length === 0 || directSubmitLockRef.current) return;
    if (paymentMethod === 'DEBT' || paymentMethod === 'MIXED') {
      setCheckoutInitialMethod(paymentMethod);
      setCheckoutModalOpen(true);
      return;
    }
    directSubmitLockRef.current = true;
    setDirectLoading(true);
    try {
      const cashVal = paymentMethod === 'CASH' ? cashGiven : 0;
      const activeStoreId = (() => {
        try {
          return localStorage.getItem('pos_store_id') || '';
        } catch (e) {
          return '';
        }
      })();
      const payload = {
        items: safeArray(cart).map(i => ({
          product_id: typeof i.product.id === 'number' ? i.product.id : null,
          barcode: i.product.barcode,
          name: i.product.name,
          marking_code: i.marking_code || null,
          price: i.product.sale_price,
          quantity: i.quantity
        })),
        store_id: activeStoreId ? Number(activeStoreId) : null,
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
      fetchCurrentShift();
      setSuccessToast({
        receiptNumber: data.receipt_number,
        total: cartTotal,
        change: data.change_given,
        method: data.payment_method,
        data
      });
      setTimeout(() => setSuccessToast(null), 6000);
      const spkMsg = paymentMethod === 'CASH' ? lang === 'uz' ? `Xarid yakunlandi. Qaytim: ${formatMoney(data.change_given)}` : `Покупка завершена. Сдача: ${formatMoney(data.change_given)}` : lang === 'uz' ? "Karta orqali to'lov qabul qilindi" : "Оплата картой принята";
      speakAloud(spkMsg, lang);
    } catch (err) {
      playAudioCue('error');
      notify(err.message, 'error');
    } finally {
      directSubmitLockRef.current = false;
      setDirectLoading(false);
    }
  };
  const quickItemsList = safeArray(quickProducts).length > 0 ? safeArray(quickProducts) : safeArray(products).slice(0, 8);
  const showingCatalog = search.trim().length > 0 || showAllCatalog || selectedCategory !== null;
  return /*#__PURE__*/React.createElement("div", {
    className: "h-full flex flex-col overflow-hidden gap-2 sm:gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 atelier-card rounded-[24px] p-2.5 space-y-2"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSearchOrBarcodeSubmit,
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex items-center atelier-input rounded-2xl px-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atelier-text-muted mr-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  })), /*#__PURE__*/React.createElement("input", {
    ref: searchInputRef,
    type: "text",
    placeholder: lang === 'uz' ? "Shtrixkod yoki tovar nomi..." : "Найти товар или штрихкод...",
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "flex-1 bg-transparent py-2.5 text-xs font-medium focus:outline-none min-w-0"
  }), search && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSearch(''),
    className: "atelier-text-muted px-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 15
  }))), search.trim() && /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "px-3.5 py-2.5 atelier-btn-primary rounded-2xl text-xs font-semibold shrink-0"
  }, "OK"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setScannerActive(true),
    className: "px-4 py-2.5 atelier-btn-cta font-bold rounded-2xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scan",
    size: 17
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Skaner" : "Сканер"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVoiceAssistantOpen(true),
    className: "px-2.5 py-1 rounded-full text-[11px] font-semibold atelier-btn-soft flex items-center gap-1 whitespace-nowrap shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mic",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Ovoz" : "Голос")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPriceCheckOpen(true),
    className: "px-2.5 py-1 rounded-full text-[11px] font-semibold atelier-btn-soft flex items-center gap-1 whitespace-nowrap shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Narx?" : "Цена?")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setRefundModalOpen(true),
    className: "px-2.5 py-1 rounded-full text-[11px] font-semibold atelier-btn-soft flex items-center gap-1 whitespace-nowrap shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Vozvrat" : "Возврат")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: parkCurrentCart,
    disabled: cart.length === 0,
    className: "px-2.5 py-1 rounded-full text-[11px] font-semibold atelier-btn-soft disabled:opacity-40 flex items-center gap-1 whitespace-nowrap shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pause",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Saqlash" : "Отложить")), parkedCarts.length > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setParkedModalOpen(true),
    className: "px-2.5 py-1 rounded-full text-[11px] font-bold atelier-btn-primary flex items-center gap-1 whitespace-nowrap shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "folder",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, parkedCarts.length)), cart.length > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => clearCart(true),
    style: {
      backgroundColor: 'var(--danger-bg)',
      color: 'var(--danger-fg)'
    },
    className: "px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 ml-auto"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Tozalash" : "Очистить")))), successToast && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-fg)'
    },
    className: "shrink-0 rounded-2xl px-3.5 py-2.5 shadow-md flex items-center justify-between gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "truncate font-semibold flex items-center gap-2 font-nums"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, "#", successToast.receiptNumber, " • ", formatMoney(successToast.total)), successToast.change > 0 && /*#__PURE__*/React.createElement("span", {
    className: "opacity-85"
  }, "(", lang === 'uz' ? 'Qaytim:' : 'Сдача:', " ", formatMoney(successToast.change), ")")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setLastReceipt(successToast.data),
    className: "atelier-btn-cta px-3 py-1 rounded-full font-bold shrink-0 flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "printer",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Chek' : 'Чек'))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 lg:gap-3 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 lg:col-span-7 xl:col-span-8 flex flex-col gap-2 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      if (showingCatalog) {
        setSearch('');
        setSelectedCategory(null);
        setShowAllCatalog(false);
      } else {
        setShowAllCatalog(true);
      }
    },
    className: `px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1.5 ${showingCatalog ? 'atelier-btn-primary' : 'atelier-card'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: showingCatalog ? 'receipt' : 'box',
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, showingCatalog ? lang === 'uz' ? `Chek (${cart.length})` : `Чек (${cart.length})` : lang === 'uz' ? 'Katalog' : 'Все товары')), quickItemsList.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    type: "button",
    onClick: () => addQuickItem(item),
    className: "px-3 py-1.5 rounded-full atelier-card hover:opacity-90 text-left shrink-0 flex items-center gap-2 transition active:scale-95"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold max-w-[115px] truncate"
  }, item.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    },
    className: "text-[11px] font-bold font-nums"
  }, Math.round((item.sale_price || item.price) / 1000), "k")))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 atelier-card rounded-[24px] overflow-hidden flex flex-col"
  }, showingCatalog ? /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 flex flex-col overflow-hidden p-2.5 space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSelectedCategory(null),
    className: `px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${selectedCategory === null ? 'atelier-btn-primary' : 'atelier-btn-soft'}`
  }, lang === 'uz' ? 'Hammasi' : 'Все'), safeArray(categories).map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat.id,
    type: "button",
    onClick: () => setSelectedCategory(cat.id === selectedCategory ? null : cat.id),
    className: `px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${selectedCategory === cat.id ? 'atelier-btn-primary' : 'atelier-btn-soft'}`
  }, cat.name ? cat.name.split('/')[0].trim() : cat.name)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setSearch('');
      setSelectedCategory(null);
      setShowAllCatalog(false);
    },
    className: "w-7 h-7 rounded-full atelier-btn-soft flex items-center justify-center ml-auto shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto pr-0.5"
  }, products.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "py-10 text-center space-y-3 text-xs atelier-text-muted"
  }, /*#__PURE__*/React.createElement("div", null, lang === 'uz' ? 'Tovar topilmadi' : 'Товары не найдены'), isOwner && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateProductOpen(true),
    className: "px-4 py-2 rounded-full atelier-btn-cta font-semibold inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Yangi tovar qo'shish" : "Добавить товар"))) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
  }, safeArray(products).map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    type: "button",
    onClick: () => {
      addToCart(p, 1.0);
      playAudioCue('add');
      notify(`${p.name} (+1)`);
    },
    className: "atelier-subtle hover:opacity-90 rounded-2xl p-3 text-left transition flex flex-col justify-between gap-2 active:scale-95"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-xs line-clamp-2 leading-snug"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between w-full pt-1.5 border-t atelier-border"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    },
    className: "text-xs font-bold font-nums"
  }, formatMoney(p.sale_price)), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] atelier-text-muted font-nums"
  }, p.stock_quantity, " ", p.unit))))))) :
  /*#__PURE__*/
  /* Active Cart Container */
  React.createElement("div", {
    className: "flex-1 min-h-0 flex flex-col overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 flex items-center justify-between px-3.5 py-2 border-b atelier-border text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Savdo cheki" : "Текущий чек"), /*#__PURE__*/React.createElement("span", {
    className: "atelier-pill-active px-2 py-0.5 rounded-full font-nums text-[11px] font-bold"
  }, cart.length, " ", lang === 'uz' ? "poz" : "поз")), /*#__PURE__*/React.createElement("span", {
    className: "hidden md:inline text-[11px] atelier-text-muted font-nums"
  }, "F2 Поиск • F5 Нал • F6 Карта • F7 Долг")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto"
  }, cart.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "h-full flex flex-col items-center justify-center text-center p-5 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-2xl atelier-subtle flex items-center justify-center atelier-text-muted"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bag",
    size: 26
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs sm:text-sm font-medium atelier-text-muted max-w-xs leading-relaxed"
  }, safeArray(products).length === 0 ? lang === 'uz' ? "Baza toza. Kamerani shtrixkodga tutib birinchi tovarni qo'shing." : "База чистая. Отсканируйте первый товар, чтобы начать работу." : lang === 'uz' ? "Kamerani tovarga tuting yoki yuqoridan tanlang." : "Наведите камеру на товар или выберите быструю позицию сверху."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setScannerActive(true),
    className: "px-5 py-2.5 rounded-full atelier-btn-cta font-bold text-xs shadow-sm flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scan",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Tovarni skanerlash" : "Сканировать товар"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "md:hidden divide-y atelier-border"
  }, safeArray(cart).map(item => {
    const cKey = getCartKey(item);
    const itemTotal = item.product.sale_price * item.quantity;
    const isWeight = ['kg', 'l', 'metr'].includes((item.product.unit || '').toLowerCase());
    const needsDM = Boolean(item.product.is_tobacco || item.product.requires_marking);
    return /*#__PURE__*/React.createElement("div", {
      key: cKey,
      className: "p-3 space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "min-w-0 flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-xs truncate"
    }, item.product.name), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] atelier-text-muted font-nums flex items-center gap-1.5 flex-wrap mt-0.5"
    }, /*#__PURE__*/React.createElement("span", null, formatMoney(item.product.sale_price), " / ", item.product.unit || 'dona'), item.marking_code && /*#__PURE__*/React.createElement("span", {
      style: {
        backgroundColor: 'var(--accent-soft)',
        color: 'var(--accent-soft-fg)'
      },
      className: "px-2 py-0.5 rounded-full text-[10px] font-bold"
    }, "DM ✓"))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 shrink-0"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--accent)'
      },
      className: "font-nums font-bold text-sm"
    }, formatMoney(itemTotal)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => removeFromCart(cKey),
      className: "w-7 h-7 rounded-full atelier-btn-soft atelier-text-muted flex items-center justify-center"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close",
      size: 13
    })))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => updateQuantity(cKey, -1),
      className: "w-8 h-8 rounded-full atelier-btn-soft flex items-center justify-center"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "minus",
      size: 14
    })), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "any",
      value: item.quantity,
      onChange: e => setItemExactQty(cKey, e.target.value),
      className: "w-14 atelier-input rounded-xl text-center font-bold font-nums text-xs py-1.5"
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => updateQuantity(cKey, 1),
      className: "w-8 h-8 rounded-full atelier-btn-primary flex items-center justify-center"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14
    }))), needsDM && !item.marking_code && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setMarkingScanKey(cKey),
      style: {
        backgroundColor: 'var(--warm-bg)',
        color: 'var(--warm-fg)'
      },
      className: "px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "scan",
      size: 12
    }), /*#__PURE__*/React.createElement("span", null, "DataMatrix")), isWeight && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1"
    }, [0.25, 0.5, 1, 2].map(w => /*#__PURE__*/React.createElement("button", {
      key: w,
      type: "button",
      onClick: () => setItemExactQty(cKey, w),
      className: "px-2 py-1 rounded-full atelier-btn-soft text-[11px] font-nums font-semibold"
    }, w)))));
  })), /*#__PURE__*/React.createElement("table", {
    className: "hidden md:table w-full text-left text-xs"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "atelier-subtle atelier-text-muted font-semibold border-b atelier-border sticky top-0 z-10"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 w-8"
  }, "#"), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5"
  }, lang === 'uz' ? "Mahsulot" : "Товар"), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 text-right"
  }, lang === 'uz' ? "Narx" : "Цена"), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 text-center w-40"
  }, lang === 'uz' ? "Miqdor" : "Кол-во"), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 text-right"
  }, lang === 'uz' ? "Jami" : "Сумма"), /*#__PURE__*/React.createElement("th", {
    className: "px-2 py-2.5 w-10"
  }))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y atelier-border"
  }, safeArray(cart).map((item, idx) => {
    const cKey = getCartKey(item);
    const needsDM = Boolean(item.product.is_tobacco || item.product.requires_marking);
    return /*#__PURE__*/React.createElement("tr", {
      key: cKey
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-3.5 py-2.5 text-[11px] atelier-text-muted font-nums"
    }, idx + 1), /*#__PURE__*/React.createElement("td", {
      className: "px-3.5 py-2.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold truncate max-w-xs"
    }, item.product.name), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] atelier-text-muted font-nums flex items-center gap-2 mt-0.5"
    }, /*#__PURE__*/React.createElement("span", null, item.product.barcode), item.marking_code && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--accent)'
      },
      className: "font-bold"
    }, "DM ✓"), needsDM && !item.marking_code && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setMarkingScanKey(cKey),
      style: {
        backgroundColor: 'var(--warm-bg)',
        color: 'var(--warm-fg)'
      },
      className: "px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "scan",
      size: 11
    }), /*#__PURE__*/React.createElement("span", null, "DataMatrix")))), /*#__PURE__*/React.createElement("td", {
      className: "px-3.5 py-2.5 text-right font-nums whitespace-nowrap"
    }, formatMoney(item.product.sale_price)), /*#__PURE__*/React.createElement("td", {
      className: "px-3.5 py-2.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-center gap-1.5"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => updateQuantity(cKey, -1),
      className: "w-7 h-7 rounded-full atelier-btn-soft flex items-center justify-center"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "minus",
      size: 13
    })), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "any",
      value: item.quantity,
      onChange: e => setItemExactQty(cKey, e.target.value),
      className: "w-14 atelier-input rounded-xl text-center font-bold font-nums text-xs py-1"
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => updateQuantity(cKey, 1),
      className: "w-7 h-7 rounded-full atelier-btn-primary flex items-center justify-center"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 13
    })))), /*#__PURE__*/React.createElement("td", {
      style: {
        color: 'var(--accent)'
      },
      className: "px-3.5 py-2.5 text-right font-nums font-bold whitespace-nowrap"
    }, formatMoney(item.product.sale_price * item.quantity)), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-2.5 text-center"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => removeFromCart(cKey),
      className: "atelier-text-muted hover:opacity-100"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close",
      size: 14
    }))));
  })))))))), /*#__PURE__*/React.createElement("div", {
    className: "hidden lg:flex lg:col-span-5 xl:col-span-4 atelier-card rounded-[28px] p-4 flex-col justify-between gap-3 overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-subtle rounded-2xl p-4 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold atelier-text-muted block"
  }, lang === 'uz' ? "Jami to'lov" : "Итого к оплате"), /*#__PURE__*/React.createElement("div", {
    className: "text-3xl font-bold font-nums mt-1 tracking-tight"
  }, formatMoney(cartTotal)), /*#__PURE__*/React.createElement("div", {
    className: "text-xs atelier-text-muted mt-1"
  }, cart.length, " ", lang === 'uz' ? "ta mahsulot" : "поз.")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs font-semibold"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atelier-text-muted"
  }, lang === 'uz' ? "Olingan naqd:" : "Наличными:"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSelectedCashReceived(cartTotal),
    style: {
      color: 'var(--accent)'
    },
    className: "hover:underline text-xs font-semibold"
  }, lang === 'uz' ? "Aniq summa" : "Ровно")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-1.5"
  }, [10000, 20000, 50000, 100000, 200000].map(note => /*#__PURE__*/React.createElement("button", {
    key: note,
    type: "button",
    onClick: () => setSelectedCashReceived(note),
    className: `py-2 rounded-xl text-xs font-nums font-semibold ${selectedCashReceived === note ? 'atelier-btn-primary' : 'atelier-btn-soft'}`
  }, formatMoney(note))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSelectedCashReceived(cartTotal),
    className: `py-2 rounded-xl text-xs font-semibold ${selectedCashReceived === cartTotal ? 'atelier-btn-primary' : 'atelier-btn-soft'}`
  }, lang === 'uz' ? "Aniq" : "Ровно")), cart.length > 0 && selectedCashReceived !== null && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: 'var(--accent-soft)',
      color: 'var(--accent-soft-fg)'
    },
    className: "rounded-xl p-2.5 flex justify-between text-xs font-semibold"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qaytim:" : "Сдача:"), /*#__PURE__*/React.createElement("span", {
    className: "font-nums font-bold"
  }, formatMoney(cashChange))))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('CASH'),
    className: "atelier-btn-cta disabled:opacity-40 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cash",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Naqd (F5)" : "Наличные")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('CARD'),
    className: "atelier-btn-sky disabled:opacity-40 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "card",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Karta (F6)" : "Картой")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('DEBT'),
    className: "atelier-btn-amber disabled:opacity-40 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "debts",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qarzga (F7)" : "В долг")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0,
    onClick: () => {
      setCheckoutInitialMethod('MIXED');
      setCheckoutModalOpen(true);
    },
    className: "atelier-btn-soft disabled:opacity-40 font-semibold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "split",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Split / Chegirma" : "Сплит / Скидка")))))), /*#__PURE__*/React.createElement("div", {
    className: "lg:hidden shrink-0 atelier-card rounded-[24px] p-2.5 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2 px-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-2 min-w-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-medium atelier-text-muted"
  }, lang === 'uz' ? 'Jami:' : 'Итого:'), /*#__PURE__*/React.createElement("span", {
    className: "text-xl font-bold font-nums truncate"
  }, formatMoney(cartTotal)), /*#__PURE__*/React.createElement("span", {
    className: "text-xs atelier-text-muted font-nums"
  }, "(", cart.length, ")")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0,
    onClick: () => {
      setCheckoutInitialMethod('CASH');
      setCheckoutModalOpen(true);
    },
    className: "px-3 py-1 rounded-full text-xs font-semibold atelier-btn-soft disabled:opacity-40 shrink-0 flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Chegirma / Qaytim' : 'Скидка'))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-4 gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('CASH'),
    className: "py-2.5 rounded-2xl atelier-btn-cta disabled:opacity-40 font-bold text-[11px] flex flex-col items-center justify-center gap-0.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cash",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Naqd" : "Нал")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('CARD'),
    className: "py-2.5 rounded-2xl atelier-btn-sky disabled:opacity-40 font-bold text-[11px] flex flex-col items-center justify-center gap-0.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "card",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Karta" : "Карта")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('DEBT'),
    className: "py-2.5 rounded-2xl atelier-btn-amber disabled:opacity-40 font-bold text-[11px] flex flex-col items-center justify-center gap-0.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "debts",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qarz" : "В долг")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('MIXED'),
    className: "py-2.5 rounded-2xl atelier-btn-soft disabled:opacity-40 font-semibold text-[11px] flex flex-col items-center justify-center gap-0.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "split",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Split" : "Сплит")))), parkedModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-2.5 sm:p-3 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-modal rounded-[28px] w-full max-w-md p-4 sm:p-5 modal-mobile-safe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b atelier-border mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "folder",
    size: 18
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Saqlangan cheklar" : "Отложенные чеки")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setParkedModalOpen(false),
    className: "w-8 h-8 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 15
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 space-y-2 overflow-y-auto pr-1"
  }, safeArray(parkedCarts).map(h => /*#__PURE__*/React.createElement("div", {
    key: h.id,
    className: "atelier-subtle rounded-2xl p-3 flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-xs"
  }, "#", h.id, " (", h.timestamp, ")"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-nums"
  }, h.itemCount, " poz • ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    },
    className: "font-bold"
  }, formatMoney(h.total)))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => resumeParkedCart(h.id),
    className: "atelier-btn-cta font-bold px-3.5 py-1.5 rounded-full text-xs"
  }, lang === 'uz' ? "Tiklash" : "Открыть"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => removeParkedCart(h.id),
    className: "w-7 h-7 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 13
  })))))))), priceCheckOpen && /*#__PURE__*/React.createElement(PriceCheckModal, {
    token: token,
    onClose: () => setPriceCheckOpen(false),
    onAddToCart: (prod, qty) => {
      addToCart(prod, qty);
      notify(prod.name);
    },
    notify: notify,
    t: t,
    lang: lang
  }), voiceAssistantOpen && /*#__PURE__*/React.createElement(VoiceAssistantModal, {
    token: token,
    onClose: () => setVoiceAssistantOpen(false),
    onAddToCart: (prod, qty) => {
      addToCart(prod, qty);
      playAudioCue('add');
    },
    onOpenScanner: () => setScannerActive(true),
    onOpenCheckout: () => {
      if (cart.length > 0) setCheckoutModalOpen(true);
    },
    onClearCart: clearCart,
    onOpenDebt: () => {
      if (cart.length > 0) handleDirectCheckout('DEBT');else setVoiceDebtOpen(true);
    },
    notify: notify,
    t: t,
    lang: lang
  }), voiceDebtOpen && /*#__PURE__*/React.createElement(VoiceDebtModal, {
    token: token,
    onClose: () => setVoiceDebtOpen(false),
    onSuccess: () => {
      setVoiceDebtOpen(false);
    },
    notify: notify,
    t: t,
    lang: lang
  }), createProductOpen && /*#__PURE__*/React.createElement(CreateProductModal, {
    token: token,
    initialBarcode: typeof createProductOpen === 'string' ? createProductOpen : '',
    onClose: () => setCreateProductOpen(false),
    onSuccess: (newProd, opts) => {
      if (!opts?.keepOpen) setCreateProductOpen(false);
      if (newProd && newProd.name) addToCart(newProd, 1.0);
      fetchProducts();
      fetchQuickProducts();
    },
    notify: notify,
    t: t,
    lang: lang
  }), scannerActive && /*#__PURE__*/React.createElement(CameraScannerModal, {
    onScan: code => {
      setScannerActive(false);
      processBarcode(code);
    },
    onClose: () => setScannerActive(false),
    notify: notify,
    t: t,
    lang: lang
  }), markingScanKey !== null && /*#__PURE__*/React.createElement(CameraScannerModal, {
    onScan: code => {
      const key = markingScanKey;
      setMarkingScanKey(null);
      attachMarkingToCartItem(key, code);
    },
    onClose: () => setMarkingScanKey(null),
    notify: notify,
    t: t,
    lang: lang
  }), checkoutModalOpen && /*#__PURE__*/React.createElement(CheckoutModal, {
    token: token,
    total: cartTotal,
    cart: cart,
    initialMethod: checkoutInitialMethod,
    onClose: () => setCheckoutModalOpen(false),
    onSuccess: receipt => {
      setCheckoutModalOpen(false);
      playBeep();
      setCart([]);
      setSelectedCashReceived(null);
      fetchCurrentShift();
      setSuccessToast({
        receiptNumber: receipt.receipt_number,
        total: receipt.total_amount ?? cartTotal,
        change: receipt.change_given,
        method: receipt.payment_method,
        data: receipt
      });
      setTimeout(() => setSuccessToast(null), 6000);
    },
    notify: notify,
    t: t,
    lang: lang
  }), shiftModalOpen && /*#__PURE__*/React.createElement(CashShiftModal, {
    token: token,
    onClose: () => setShiftModalOpen(false),
    notify: notify,
    lang: lang,
    onShiftChange: fetchCurrentShift
  }), refundModalOpen && /*#__PURE__*/React.createElement(RefundModal, {
    token: token,
    onClose: () => setRefundModalOpen(false),
    onPrintReceipt: r => {
      setRefundModalOpen(false);
      setLastReceipt(r);
    },
    notify: notify,
    lang: lang,
    onRefunded: () => {
      fetchCurrentShift();
      fetchProducts();
    }
  }), lastReceipt && /*#__PURE__*/React.createElement(ReceiptModal, {
    receipt: lastReceipt,
    onClose: () => setLastReceipt(null),
    t: t
  }));
}
function DebtsScreen({
  token,
  notify,
  t,
  lang: propLang
}) {
  const [debtors, setDebtors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [onlyWithDebt, setOnlyWithDebt] = useState(false);
  const [sortBy, setSortBy] = useState('overdue');
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [addDebtModalOpen, setAddDebtModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [remindModalOpen, setRemindModalOpen] = useState(false);
  const [createDebtorModalOpen, setCreateDebtorModalOpen] = useState(false);
  const [voiceDebtOpen, setVoiceDebtOpen] = useState(false);
  const [ocrDebtOpen, setOcrDebtOpen] = useState(false);
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || typeof localStorage !== "undefined" && localStorage.getItem("pos_lang") || "uz";
  useEffect(() => {
    fetchDebtors();
    fetchSummary();
  }, [search, onlyWithDebt]);
  const fetchDebtors = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100'
      });
      if (search) params.append('search', search);
      if (onlyWithDebt) params.append('only_with_debt', 'true');
      const res = await fetch(`${API_BASE}/debts/debtors?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        setDebtors([]);
        return;
      }
      setDebtors(safeArray(await res.json()));
    } catch (e) {
      notify('Qarzdorlar ro\'yxatini yuklashda xatolik', 'error');
    }
  };
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/debts/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setSummary(await res.json());
    } catch (e) {}
  };
  const sortedDebtors = useMemo(() => {
    const list = [...safeArray(debtors)];
    if (sortBy === 'overdue') {
      return list.sort((a, b) => {
        const aOverdue = checkOverdueStatus(a.due_date, a.balance, lang);
        const bOverdue = checkOverdueStatus(b.due_date, b.balance, lang);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        return Number(b.balance) - Number(a.balance);
      });
    } else if (sortBy === 'max_debt') {
      return list.sort((a, b) => Number(b.balance) - Number(a.balance));
    } else if (sortBy === 'recent') {
      return list.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
    } else if (sortBy === 'name') {
      return list.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    }
    return list;
  }, [debtors, sortBy, lang]);
  return /*#__PURE__*/React.createElement("div", {
    className: "h-full flex flex-col overflow-hidden gap-2 sm:gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 atelier-card rounded-[24px] p-3 space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium truncate"
  }, t.totalOutstandingDebt, " (", summary ? `${summary.active_debtors_with_debt}/${summary.debtors_count}` : '0/0', ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: Number(summary?.total_outstanding_debt || 0) > 0 ? 'var(--danger-fg)' : 'var(--accent)'
    },
    className: "text-xl sm:text-2xl font-bold font-nums leading-tight mt-0.5"
  }, summary && Number(summary.total_outstanding_debt) > 0 ? `-${formatMoney(summary.total_outstanding_debt)}` : "0 so'm")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateDebtorModalOpen(true),
    className: "px-3 py-2 atelier-btn-cta font-bold rounded-2xl text-xs flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Yangi" : "Новый")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVoiceDebtOpen(true),
    "aria-label": t.voiceDebtBtn,
    className: "px-2.5 py-2 atelier-btn-primary font-semibold rounded-2xl text-xs flex items-center gap-1",
    title: t.voiceDebtBtn
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mic",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, lang === 'uz' ? "Ovoz" : "Голос")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOcrDebtOpen(true),
    "aria-label": t.scanPaperNotebookBtn,
    className: "px-2.5 py-2 atelier-btn-amber font-bold rounded-2xl text-xs flex items-center gap-1",
    title: t.scanPaperNotebookBtn
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "OCR")))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex items-center atelier-input rounded-2xl px-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atelier-text-muted mr-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14
  })), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Ism yoki telefon..." : "Имя или телефон...",
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "flex-1 min-w-0 bg-transparent py-2 text-xs focus:outline-none"
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOnlyWithDebt(!onlyWithDebt),
    className: `px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${onlyWithDebt ? 'atelier-btn-primary' : 'atelier-btn-soft'}`
  }, lang === 'uz' ? "Qarzdorlar" : "С долгом")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar"
  }, [{
    id: 'overdue',
    label: lang === 'uz' ? "Muddati o'tgan" : "Просрочка"
  }, {
    id: 'max_debt',
    label: lang === 'uz' ? "Katta" : "Крупные"
  }, {
    id: 'recent',
    label: lang === 'uz' ? "Yangi" : "Свежие"
  }, {
    id: 'name',
    label: "A-Z"
  }].map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    type: "button",
    onClick: () => setSortBy(s.id),
    className: `px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition ${sortBy === s.id ? 'atelier-pill-active' : 'atelier-btn-soft atelier-text-muted'}`
  }, s.label, sortBy === s.id ? ` (${sortedDebtors.length})` : '')))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto pr-0.5"
  }, sortedDebtors.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-12 text-xs atelier-text-muted"
  }, lang === 'uz' ? "Mijozlar topilmadi" : "Клиенты не найдены") : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-2"
  }, sortedDebtors.map(debtor => {
    const overdue = checkOverdueStatus(debtor.due_date, debtor.balance, lang);
    const hasDebt = Number(debtor.balance) > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: debtor.id,
      style: overdue?.isOverdue ? {
        borderColor: 'var(--danger-fg)'
      } : {},
      className: "atelier-card rounded-[24px] p-3.5 flex flex-col justify-between gap-2.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2.5 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-10 h-10 rounded-full atelier-subtle font-bold flex items-center justify-center text-xs font-nums shrink-0"
    }, getInitials(debtor.full_name)), /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-bold text-xs truncate"
    }, debtor.full_name), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        setSelectedDebtor(debtor);
        setEditModalOpen(true);
      },
      className: "atelier-text-muted hover:opacity-100",
      title: "Edit"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "edit",
      size: 12
    }))), debtor.phone && /*#__PURE__*/React.createElement("a", {
      href: `tel:${debtor.phone}`,
      style: {
        color: 'var(--accent)'
      },
      className: "text-[11px] font-nums inline-flex items-center gap-1 hover:underline mt-0.5"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "phone",
      size: 11
    }), /*#__PURE__*/React.createElement("span", null, debtor.phone)))), /*#__PURE__*/React.createElement("div", {
      className: "text-right shrink-0"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: hasDebt ? 'var(--danger-fg)' : 'var(--accent)'
      },
      className: "text-sm font-bold font-nums"
    }, hasDebt ? '-' : '', formatMoney(debtor.balance)), overdue ? /*#__PURE__*/React.createElement("span", {
      className: `px-2 py-0.5 rounded-full text-[10px] font-semibold border ${overdue.color}`
    }, overdue.badge) : debtor.due_date ? /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] atelier-text-muted"
    }, debtor.due_date) : null)), debtor.note && /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] atelier-text-muted atelier-subtle px-2.5 py-1.5 rounded-xl truncate italic"
    }, "\"", debtor.note, "\""), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-4 gap-1.5 pt-2 border-t atelier-border"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        setSelectedDebtor(debtor);
        setPayModalOpen(true);
      },
      className: "atelier-btn-cta py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 12
    }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "To'lash" : "Принять")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        setSelectedDebtor(debtor);
        setAddDebtModalOpen(true);
      },
      className: "atelier-btn-amber py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 12
    }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qarz" : "Долг")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        setSelectedDebtor(debtor);
        setRemindModalOpen(true);
      },
      className: "atelier-btn-sky py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bell",
      size: 12
    }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Eslat" : "Напом.")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        setSelectedDebtor(debtor);
        setHistoryModalOpen(true);
      },
      className: "atelier-btn-soft py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "history",
      size: 12
    }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Tarix" : "Ист."))));
  }))), payModalOpen && selectedDebtor && /*#__PURE__*/React.createElement(PayDebtModal, {
    token: token,
    lang: lang,
    debtor: selectedDebtor,
    onClose: () => setPayModalOpen(false),
    onSuccess: () => {
      setPayModalOpen(false);
      fetchDebtors();
      fetchSummary();
      notify(lang === 'uz' ? "Qarz to'lovi qabul qilindi!" : "Оплата долга принята!");
    },
    notify: notify,
    t: t
  }), addDebtModalOpen && selectedDebtor && /*#__PURE__*/React.createElement(AddDebtModal, {
    token: token,
    lang: lang,
    debtor: selectedDebtor,
    onClose: () => setAddDebtModalOpen(false),
    onSuccess: () => {
      setAddDebtModalOpen(false);
      fetchDebtors();
      fetchSummary();
      notify(lang === 'uz' ? "Yangi qarz yozildi!" : "Долг успешно записан!");
    },
    notify: notify,
    t: t
  }), editModalOpen && selectedDebtor && /*#__PURE__*/React.createElement(EditDebtorModal, {
    token: token,
    lang: lang,
    debtor: selectedDebtor,
    onClose: () => setEditModalOpen(false),
    onSuccess: () => {
      setEditModalOpen(false);
      fetchDebtors();
      notify(lang === 'uz' ? "Ma'lumotlar yangilandi" : "Данные обновлены");
    },
    notify: notify
  }), remindModalOpen && selectedDebtor && /*#__PURE__*/React.createElement(RemindDebtorModal, {
    debtor: selectedDebtor,
    onClose: () => setRemindModalOpen(false),
    notify: notify,
    lang: lang
  }), historyModalOpen && selectedDebtor && /*#__PURE__*/React.createElement(DebtorHistoryModal, {
    token: token,
    debtor: selectedDebtor,
    onClose: () => setHistoryModalOpen(false),
    notify: notify,
    t: t
  }), createDebtorModalOpen && /*#__PURE__*/React.createElement(CreateDebtorModal, {
    token: token,
    lang: lang,
    onClose: () => setCreateDebtorModalOpen(false),
    onSuccess: () => {
      setCreateDebtorModalOpen(false);
      fetchDebtors();
      fetchSummary();
      notify(lang === 'uz' ? "Yangi mijoz qo'shildi!" : "Клиент добавлен!");
    },
    notify: notify,
    t: t
  }), voiceDebtOpen && /*#__PURE__*/React.createElement(VoiceDebtModal, {
    token: token,
    onClose: () => setVoiceDebtOpen(false),
    onSuccess: () => {
      setVoiceDebtOpen(false);
      fetchDebtors();
      fetchSummary();
    },
    notify: notify,
    t: t
  }), ocrDebtOpen && /*#__PURE__*/React.createElement(OcrDebtModal, {
    token: token,
    onClose: () => setOcrDebtOpen(false),
    onSuccess: () => {
      setOcrDebtOpen(false);
      fetchDebtors();
      fetchSummary();
    },
    notify: notify,
    t: t
  }));
}
function PrintPriceTagModal({
  token,
  product,
  onClose,
  notify,
  lang = 'uz'
}) {
  const [price, setPrice] = useState(String(product?.sale_price || 0));
  const [quantity, setQuantity] = useState('1');
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const generateTag = async e => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/expenses/price-tag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          price: Number(price) || product.sale_price,
          quantity: Number(quantity) || 1
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      setTemplate(data.template || '');
      notify(lang === 'uz' ? "Narx yorlig'i tayyor!" : 'Ценник сформирован!');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (product?.id) generateTag();
  }, [product?.id]);
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-4 shadow-2xl modal-mobile-safe text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base"
  }, "🏷️ ", lang === 'uz' ? "Narx yorlig'i (Sennik)" : 'Ценник товара'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "text-slate-400 text-lg p-1"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-3 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white text-slate-900 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center space-y-1.5 font-mono"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-sans font-black text-base leading-tight"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500"
  }, product.barcode, " • ", product.unit), /*#__PURE__*/React.createElement("div", {
    className: "text-3xl font-black text-emerald-700 pt-1"
  }, formatMoney(Number(price) || 0))), /*#__PURE__*/React.createElement("form", {
    onSubmit: generateTag,
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold mb-1"
  }, lang === 'uz' ? 'Narx (so\'m):' : 'Цена:'), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    step: "any",
    value: price,
    onChange: e => setPrice(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 font-mono font-bold"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block font-semibold mb-1"
  }, lang === 'uz' ? 'Nusxa soni:' : 'Копий:'), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "50",
    value: quantity,
    onChange: e => setQuantity(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 font-mono font-bold"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800"
  }, lang === 'uz' ? 'Yopish' : 'Закрыть'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: loading,
    onClick: () => {
      if (template) {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(template);
          win.document.close();
          win.print();
          return;
        }
      }
      window.print();
    },
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow"
  }, "🖨️ ", lang === 'uz' ? 'Chop etish' : 'Печать'))));
}
function CatalogScreen({
  token,
  notify,
  isOwner,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || typeof localStorage !== "undefined" && localStorage.getItem("pos_lang") || "uz";
  const [subTab, setSubTab] = useState('products'); // 'products' | 'revision' | 'movements'
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [priceTagProduct, setPriceTagProduct] = useState(null);
  const [filterScannerOpen, setFilterScannerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [tobaccoOnly, setTobaccoOnly] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 30;
  const csvInputRef = useRef(null);

  // Inventory Revision State
  const [acts, setActs] = useState([]);
  const [activeAct, setActiveAct] = useState(null);
  const [actSearch, setActSearch] = useState('');
  const [actScannerOpen, setActScannerOpen] = useState(false);
  const [movements, setMovements] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/products/categories/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.ok ? r.json() : []).then(d => setCategories(safeArray(d))).catch(() => {});
  }, []);
  useEffect(() => {
    if (subTab === 'products') fetchProducts();else if (subTab === 'revision' && isOwner) fetchActs();else if (subTab === 'movements' && isOwner) fetchMovements();
  }, [subTab, search, selectedCategory, lowStockOnly, expiringOnly, tobaccoOnly, skip]);
  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(limit)
      });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory) params.append('category_id', String(selectedCategory));
      if (lowStockOnly) params.append('low_stock_only', 'true');
      if (expiringOnly) params.append('expiring_soon_only', 'true');
      if (tobaccoOnly) params.append('tobacco_only', 'true');
      const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        setProducts([]);
        setTotal(0);
        return;
      }
      const data = await res.json();
      setProducts(safeArray(data));
      setTotal(data.total || safeArray(data).length || 0);
    } catch (e) {
      notify('Katalog yuklashda xatolik', 'error');
    }
  };
  const fetchActs = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory/acts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setActs(safeArray(await res.json()));
    } catch (e) {}
  };
  const openAct = async actId => {
    try {
      const res = await fetch(`${API_BASE}/inventory/act/${actId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setActiveAct(await res.json());
    } catch (e) {}
  };
  const createAct = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory/act`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Reviziya ${new Date().toLocaleDateString()}`,
          description: 'Mobile inventory count'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      setActiveAct(data);
      fetchActs();
      notify(lang === 'uz' ? 'Yangi reviziya akti ochildi!' : 'Акт ревизии создан!');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const scanActQty = async (productId, qty) => {
    if (!activeAct) return;
    try {
      const res = await fetch(`${API_BASE}/inventory/act/${activeAct.id}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          actual_quantity: Number(qty) || 0
        })
      });
      if (!res.ok) throw new Error('Xatolik');
      playAudioCue('add');
      await openAct(activeAct.id);
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const applyAct = async () => {
    if (!activeAct) return;
    if (!confirm(lang === 'uz' ? "Ombordagi qoldiqlarni reviziya bo'yicha yangilaysizmi?" : 'Применить итоги ревизии к складу?')) return;
    try {
      const res = await fetch(`${API_BASE}/inventory/act/${activeAct.id}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Xatolik');
      playAudioCue('success');
      notify(data.message);
      setActiveAct(null);
      fetchActs();
      fetchProducts();
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const fetchMovements = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory/movements?limit=60`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setMovements(safeArray(await res.json()));
    } catch (e) {}
  };
  const toggleQuickStar = async p => {
    try {
      const res = await fetch(`${API_BASE}/products/${p.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          is_quick: !p.is_quick
        })
      });
      if (res.ok) {
        playAudioCue('add');
        fetchProducts();
      }
    } catch (e) {}
  };
  const handleCatalogBarcode = async code => {
    const clean = (code || '').trim();
    if (!clean) return;
    if (!isOwner) {
      setSearch(clean);
      setSkip(0);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/products/barcode/${encodeURIComponent(clean)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const prod = await res.json();
        playAudioCue('add');
        setEditingProduct(prod);
        setSearch(clean);
        setSkip(0);
      } else {
        playAudioCue('listen');
        setCreateProductOpen({
          barcode: clean,
          autoScan: false
        });
        notify(lang === 'uz' ? `Yangi shtrixkod (${clean}). Tovarni kiriting` : `Новый штрихкод (${clean}). Заполните данные`, 'info');
      }
    } catch (e) {
      setSearch(clean);
      setSkip(0);
    }
  };
  const deleteProduct = async p => {
    const confirmMsg = lang === 'uz' ? `Rostdan ham "${p.name}" tovarini o'chirmoqchimisiz?` : `Удалить товар "${p.name}"?`;
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch(`${API_BASE}/products/${p.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Xatolik');
      notify(lang === 'uz' ? `"${p.name}" o'chirildi` : `"${p.name}" удален`);
      fetchProducts();
    } catch (e) {
      notify(e.message, 'error');
    }
  };
  const exportCsv = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/export-csv`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Export xatoligi');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalog_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify('CSV yuklab olindi!');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const importCsvFile = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/products/import-csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || data.detail || 'CSV import xatoligi');
      notify(data.message || 'CSV import qilindi!');
      fetchProducts();
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const filteredActItems = useMemo(() => {
    if (!activeAct?.items) return [];
    if (!actSearch.trim()) return activeAct.items;
    const q = actSearch.toLowerCase();
    return activeAct.items.filter(it => (it.product_name || '').toLowerCase().includes(q) || (it.barcode || '').includes(q));
  }, [activeAct, actSearch]);
  return /*#__PURE__*/React.createElement("div", {
    className: "h-full flex flex-col overflow-hidden gap-2 sm:gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 atelier-card rounded-[24px] p-2.5 sm:p-3 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0 flex items-center gap-1 atelier-subtle p-1 rounded-2xl overflow-x-auto no-scrollbar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSubTab('products'),
    className: `px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 shrink-0 ${subTab === 'products' ? 'atelier-pill-active' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "box",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Tovarlar' : 'Товары', " (", total, ")")), isOwner && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSubTab('revision'),
    className: `px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 shrink-0 ${subTab === 'revision' ? 'atelier-pill-active' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Reviziya' : 'Ревизия')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSubTab('movements'),
    className: `px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 shrink-0 ${subTab === 'movements' ? 'atelier-pill-active' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "history",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Harakat' : 'Движение')))), subTab === 'products' && isOwner && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateProductOpen(true),
    className: "px-3.5 h-9 rounded-2xl atelier-btn-cta text-xs font-bold flex items-center gap-1.5 shrink-0"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qo'shish" : "Добавить")), subTab === 'revision' && isOwner && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: createAct,
    className: "px-3.5 h-9 rounded-2xl atelier-btn-cta text-xs font-bold shrink-0 flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Yangi akt' : 'Новый акт'))), subTab === 'products' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex items-center atelier-input rounded-2xl px-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atelier-text-muted mr-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15
  })), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Nom yoki shtrixkod..." : "Поиск товара или штрихкода...",
    value: search,
    onChange: e => {
      setSearch(e.target.value);
      setSkip(0);
    },
    onKeyDown: e => {
      if (e.key === 'Enter' && /^[0-9A-Za-z\-]{4,64}$/.test(search.trim()) && /\d/.test(search)) {
        e.preventDefault();
        handleCatalogBarcode(search.trim());
      }
    },
    className: "flex-1 min-w-0 bg-transparent py-2.5 text-xs focus:outline-none"
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setFilterScannerOpen(true),
    className: "px-3 h-9 rounded-2xl atelier-btn-primary text-xs font-bold flex items-center gap-1 shrink-0",
    title: lang === 'uz' ? "Skaner bilan izlash" : "Поиск камерой"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scan",
    size: 15
  })), isOwner && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateProductOpen({
      barcode: '',
      autoScan: true
    }),
    className: "px-3 h-9 rounded-2xl atelier-btn-sky text-xs font-bold flex items-center gap-1 shrink-0",
    title: lang === 'uz' ? 'Ketma-ket skan' : 'Поточный скан'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, lang === 'uz' ? 'Potok' : 'Поток')), /*#__PURE__*/React.createElement("input", {
    ref: csvInputRef,
    type: "file",
    accept: ".csv",
    onChange: importCsvFile,
    className: "hidden"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setLowStockOnly(!lowStockOnly);
      setSkip(0);
    },
    className: `px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 whitespace-nowrap transition ${lowStockOnly ? 'atelier-btn-amber' : 'atelier-btn-soft'}`
  }, lang === 'uz' ? 'Kam qolgan' : 'Мало'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setExpiringOnly(!expiringOnly);
      setSkip(0);
    },
    className: `px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 whitespace-nowrap transition ${expiringOnly ? 'atelier-btn-amber' : 'atelier-btn-soft'}`
  }, lang === 'uz' ? 'Muddat' : 'Срок'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setTobaccoOnly(!tobaccoOnly);
      setSkip(0);
    },
    className: `px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 whitespace-nowrap transition ${tobaccoOnly ? 'atelier-btn-primary' : 'atelier-btn-soft'}`
  }, lang === 'uz' ? 'Markirovka' : 'Маркировка'), isOwner && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: exportCsv,
    className: "px-2.5 py-1 rounded-full atelier-btn-soft text-[11px] font-semibold shrink-0 flex items-center gap-1 whitespace-nowrap",
    title: "Export CSV"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, "CSV")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => csvInputRef.current?.click(),
    className: "px-2.5 py-1 rounded-full atelier-btn-soft text-[11px] font-semibold shrink-0 flex items-center gap-1 whitespace-nowrap",
    title: "Import CSV"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "upload",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, "CSV"))), /*#__PURE__*/React.createElement("span", {
    className: "w-px h-4 atelier-border bg-current opacity-20 shrink-0"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setSelectedCategory(null);
      setSkip(0);
    },
    className: `px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 whitespace-nowrap ${selectedCategory === null ? 'atelier-pill-active' : 'atelier-btn-soft atelier-text-muted'}`
  }, lang === 'uz' ? 'Hammasi' : 'Все'), safeArray(categories).map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat.id,
    type: "button",
    onClick: () => {
      setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
      setSkip(0);
    },
    className: `px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 whitespace-nowrap ${selectedCategory === cat.id ? 'atelier-pill-active' : 'atelier-btn-soft atelier-text-muted'}`
  }, cat.name ? cat.name.split('/')[0].trim() : cat.name))))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 atelier-card rounded-[24px] overflow-hidden flex flex-col"
  }, subTab === 'products' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto"
  }, safeArray(products).length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "h-full flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[28px] p-6 w-full max-w-sm text-center space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-2xl atelier-btn-primary mx-auto flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "box",
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    className: "space-y-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sm"
  }, search || selectedCategory || lowStockOnly || expiringOnly || tobaccoOnly ? lang === 'uz' ? "Bunday tovar topilmadi" : "Товары по фильтру не найдены" : lang === 'uz' ? "Katalog bo'sh" : "Каталог пока пуст"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs atelier-text-muted leading-relaxed"
  }, search || selectedCategory || lowStockOnly || expiringOnly || tobaccoOnly ? lang === 'uz' ? "Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring." : "Попробуйте сбросить фильтр или изменить запрос." : lang === 'uz' ? "Do'kon tovarlarini kamera skaneri yoki qo'lda kiritish bilan boshlang." : "Добавьте первые товары магазина через камеру или вручную.")), isOwner && /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 pt-1"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateProductOpen({
      barcode: '',
      autoScan: true
    }),
    className: "w-full py-3 rounded-2xl atelier-btn-cta font-bold text-xs flex items-center justify-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scan",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Kamera bilan skanerlab kiritish" : "Сканировать товары камерой")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateProductOpen({
      barcode: search.trim(),
      autoScan: false
    }),
    className: "py-2.5 rounded-2xl atelier-btn-primary font-semibold text-xs flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qo'lda" : "Вручную")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => csvInputRef.current?.click(),
    className: "py-2.5 rounded-2xl atelier-btn-soft font-semibold text-xs flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "upload",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "CSV")))))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "block md:hidden divide-y atelier-border"
  }, safeArray(products).map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "p-3 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-xs flex items-center gap-1.5"
  }, isOwner && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => toggleQuickStar(p),
    style: {
      color: p.is_quick ? 'var(--accent)' : 'var(--text-muted)'
    },
    className: p.is_quick ? 'opacity-100' : 'opacity-35',
    title: "Tezkor kassa"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bolt",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    className: "truncate"
  }, p.name)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-nums atelier-text-muted mt-0.5 truncate"
  }, p.barcode, " • ", p.category_name?.split('/')[0]?.trim())), /*#__PURE__*/React.createElement("div", {
    className: "text-right shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--accent)'
    },
    className: "font-nums font-bold text-xs"
  }, formatMoney(p.sale_price)), /*#__PURE__*/React.createElement("div", {
    style: {
      color: p.is_low_stock ? 'var(--danger-fg)' : 'var(--text-muted)'
    },
    className: "font-nums text-[11px] font-semibold"
  }, p.stock_quantity, " ", p.unit))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-1.5 pt-1.5 border-t atelier-border text-[10px]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 flex-wrap"
  }, isOwner && p.purchase_price !== null && /*#__PURE__*/React.createElement("span", {
    className: "font-nums atelier-text-muted"
  }, lang === 'uz' ? 'Kirim:' : 'Зак:', " ", formatMoney(p.purchase_price)), (p.is_tobacco || p.requires_marking) && /*#__PURE__*/React.createElement("span", {
    style: {
      backgroundColor: 'var(--warm-bg)',
      color: 'var(--warm-fg)'
    },
    className: "px-2 py-0.5 rounded-full font-semibold"
  }, "DataMatrix"), /*#__PURE__*/React.createElement("span", {
    style: p.ikpu_valid ? {
      backgroundColor: 'var(--accent-soft)',
      color: 'var(--accent-soft-fg)'
    } : {},
    className: `px-2 py-0.5 rounded-full font-nums font-semibold ${p.ikpu_valid ? '' : 'atelier-subtle atelier-text-muted'}`
  }, p.ikpu_valid ? 'ИКПУ ✓' : 'Без ИКПУ'), p.expiry_date && /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full font-semibold atelier-subtle"
  }, p.expiry_date)), isOwner && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPriceTagProduct(p),
    className: "w-7 h-7 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 13
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setEditingProduct(p),
    className: "w-7 h-7 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 13
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => deleteProduct(p),
    style: {
      backgroundColor: 'var(--danger-bg)',
      color: 'var(--danger-fg)'
    },
    className: "w-7 h-7 rounded-full flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 13
  }))))))), /*#__PURE__*/React.createElement("table", {
    className: "hidden md:table w-full text-left text-xs"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "atelier-subtle atelier-text-muted font-semibold border-b atelier-border sticky top-0 z-10"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bolt",
    size: 13
  })), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5"
  }, t.colBarcode), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5"
  }, t.colName), isOwner && /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 text-right"
  }, t.colPurchasePrice), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 text-right"
  }, t.colSalePrice), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 text-right"
  }, t.colStock), /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 text-center"
  }, lang === 'uz' ? 'Muddat' : 'Срок'), isOwner && /*#__PURE__*/React.createElement("th", {
    className: "px-3.5 py-2.5 text-center"
  }, t.colActions))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y atelier-border"
  }, safeArray(products).map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.id
  }, /*#__PURE__*/React.createElement("td", {
    className: "px-3.5 py-2.5"
  }, isOwner && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => toggleQuickStar(p),
    style: {
      color: p.is_quick ? 'var(--accent)' : 'var(--text-muted)'
    },
    className: p.is_quick ? 'opacity-100' : 'opacity-30'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bolt",
    size: 14
  }))), /*#__PURE__*/React.createElement("td", {
    className: "px-3.5 py-2.5 font-nums text-[11px] atelier-text-muted"
  }, p.barcode), /*#__PURE__*/React.createElement("td", {
    className: "px-3.5 py-2.5 font-semibold"
  }, p.name), isOwner && /*#__PURE__*/React.createElement("td", {
    className: "px-3.5 py-2.5 text-right font-nums atelier-text-muted"
  }, formatMoney(p.purchase_price)), /*#__PURE__*/React.createElement("td", {
    style: {
      color: 'var(--accent)'
    },
    className: "px-3.5 py-2.5 text-right font-bold font-nums"
  }, formatMoney(p.sale_price)), /*#__PURE__*/React.createElement("td", {
    style: {
      color: p.is_low_stock ? 'var(--danger-fg)' : 'var(--text-main)'
    },
    className: "px-3.5 py-2.5 text-right font-nums font-bold"
  }, p.stock_quantity, " ", p.unit), /*#__PURE__*/React.createElement("td", {
    className: "px-3.5 py-2.5 text-center text-[11px]"
  }, p.expiry_date ? /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full font-semibold atelier-subtle"
  }, p.expiry_date) : '—'), isOwner && /*#__PURE__*/React.createElement("td", {
    className: "px-3.5 py-2.5 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPriceTagProduct(p),
    className: "w-7 h-7 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tag",
    size: 13
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setEditingProduct(p),
    className: "w-7 h-7 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit",
    size: 13
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => deleteProduct(p),
    style: {
      color: 'var(--danger-fg)'
    },
    className: "w-7 h-7 rounded-full atelier-btn-soft flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 13
  })))))))))), /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 px-3.5 py-2 border-t atelier-border flex items-center justify-between text-xs atelier-text-muted"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-nums text-[11px]"
  }, skip + 1, "–", Math.min(skip + limit, total), " / ", total), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: skip === 0,
    onClick: () => setSkip(Math.max(0, skip - limit)),
    className: "px-3 py-1 rounded-full atelier-btn-soft disabled:opacity-40 font-bold"
  }, "←"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: skip + limit >= total,
    onClick: () => setSkip(skip + limit),
    className: "px-3 py-1 rounded-full atelier-btn-soft disabled:opacity-40 font-bold"
  }, "→")))), subTab === 'revision' && /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 flex flex-col overflow-hidden p-3 space-y-2"
  }, !activeAct ? /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto space-y-2"
  }, acts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-10 text-xs atelier-text-muted"
  }, lang === 'uz' ? "Hozircha reviziya aktlari yo'q. Yangi akt oching." : "Актов ревизии пока нет.") : acts.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    onClick: () => openAct(a.id),
    className: "p-3 rounded-2xl atelier-subtle flex items-center justify-between cursor-pointer hover:opacity-90"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-xs"
  }, a.name, " (", a.act_number, ")"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-nums"
  }, a.total_products, " SKU • +", a.surpluses, " / -", a.deficits)), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 rounded-full text-[10px] font-semibold atelier-pill-active"
  }, a.status)))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 flex items-center justify-between gap-2 pb-2 border-b atelier-border"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setActiveAct(null),
    className: "px-3 py-1.5 rounded-full atelier-btn-soft text-xs font-semibold"
  }, "← ", lang === 'uz' ? 'Orqaga' : 'Назад'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Shtrixkod / nom...",
    value: actSearch,
    onChange: e => setActSearch(e.target.value),
    className: "flex-1 min-w-0 atelier-input rounded-2xl px-3 py-1.5 text-xs"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setActScannerOpen(true),
    className: "w-8 h-8 atelier-btn-primary rounded-full flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scan",
    size: 14
  })), activeAct.status !== 'APPLIED' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: applyAct,
    className: "px-3 py-1.5 atelier-btn-cta rounded-full text-xs font-bold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qo'llash" : "Применить"))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto divide-y atelier-border"
  }, filteredActItems.slice(0, 80).map(it => /*#__PURE__*/React.createElement("div", {
    key: it.product_id,
    className: "py-2 flex items-center justify-between gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold truncate"
  }, it.product_name), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-nums atelier-text-muted"
  }, lang === 'uz' ? 'Hisobda:' : 'Учет:', " ", it.recorded_quantity, " ", it.unit, " ", it.difference !== 0 && `(${it.difference > 0 ? '+' : ''}${it.difference})`)), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    disabled: activeAct.status === 'APPLIED',
    defaultValue: it.actual_quantity,
    onBlur: e => {
      if (Number(e.target.value) !== Number(it.actual_quantity)) scanActQty(it.product_id, e.target.value);
    },
    className: "w-20 atelier-input rounded-xl px-2 py-1 text-center font-nums font-bold"
  })))))), subTab === 'movements' && /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto divide-y atelier-border p-3"
  }, movements.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-10 text-xs atelier-text-muted"
  }, lang === 'uz' ? "Harakatlar tarixi bo'sh" : "История движений пуста") : movements.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    className: "py-2 flex items-center justify-between gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold truncate"
  }, m.product_name), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] atelier-text-muted"
  }, m.movement_type, " • ", m.reference_id || '', " • ", new Date(m.created_at).toLocaleString())), /*#__PURE__*/React.createElement("div", {
    className: "text-right font-nums shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: m.quantity_delta >= 0 ? 'var(--accent)' : 'var(--danger-fg)'
    },
    className: "font-bold"
  }, m.quantity_delta >= 0 ? '+' : '', m.quantity_delta), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] atelier-text-muted"
  }, m.previous_stock, " → ", m.new_stock)))))), createProductOpen && /*#__PURE__*/React.createElement(CreateProductModal, {
    token: token,
    initialBarcode: typeof createProductOpen === 'object' ? createProductOpen.barcode || '' : '',
    autoScanOnMount: typeof createProductOpen === 'object' ? Boolean(createProductOpen.autoScan) : false,
    onClose: () => setCreateProductOpen(false),
    onSuccess: (_, opts) => {
      if (!opts?.keepOpen) setCreateProductOpen(false);
      fetchProducts();
    },
    notify: notify,
    t: t,
    lang: lang
  }), editingProduct && /*#__PURE__*/React.createElement(EditProductModal, {
    token: token,
    product: editingProduct,
    onClose: () => setEditingProduct(null),
    onSuccess: () => {
      setEditingProduct(null);
      fetchProducts();
    },
    notify: notify,
    t: t,
    lang: lang
  }), priceTagProduct && /*#__PURE__*/React.createElement(PrintPriceTagModal, {
    token: token,
    product: priceTagProduct,
    onClose: () => setPriceTagProduct(null),
    notify: notify,
    lang: lang
  }), filterScannerOpen && /*#__PURE__*/React.createElement(CameraScannerModal, {
    onScan: code => {
      setFilterScannerOpen(false);
      handleCatalogBarcode(code);
    },
    onClose: () => setFilterScannerOpen(false),
    notify: notify,
    t: t,
    lang: lang
  }), actScannerOpen && /*#__PURE__*/React.createElement(CameraScannerModal, {
    onScan: code => {
      setActScannerOpen(false);
      setActSearch(code);
    },
    onClose: () => setActScannerOpen(false),
    notify: notify,
    t: t,
    lang: lang
  }));
}
function OperationsHubScreen({
  token,
  notify,
  t,
  lang: propLang,
  initialSection = 'suppliers'
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || typeof localStorage !== "undefined" && localStorage.getItem("pos_lang") || "uz";
  const [section, setSection] = useState(initialSection); // 'suppliers' | 'invoices' | 'expenses'
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [catalogSample, setCatalogSample] = useState([]);
  const [createSupplierModalOpen, setCreateSupplierModalOpen] = useState(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [payInvoiceModalOpen, setPayInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ocrInvoiceOpen, setOcrInvoiceOpen] = useState(false);
  const [reconciliationSupplier, setReconciliationSupplier] = useState(null);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);
  const [isSpoilageMode, setIsSpoilageMode] = useState(false);
  const loadAll = () => {
    fetch(`${API_BASE}/suppliers`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.ok ? r.json() : []).then(d => setSuppliers(safeArray(d))).catch(() => {});
    fetch(`${API_BASE}/suppliers/invoices`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.ok ? r.json() : []).then(d => setInvoices(safeArray(d))).catch(() => {});
    fetch(`${API_BASE}/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.ok ? r.json() : []).then(d => setExpenses(safeArray(d))).catch(() => {});
    fetch(`${API_BASE}/products?limit=2000`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.ok ? r.json() : []).then(d => setCatalogSample(safeArray(d))).catch(() => {});
  };
  useEffect(() => {
    loadAll();
  }, []);
  const filteredSuppliers = safeArray(suppliers).filter(s => {
    if (!searchSupplier.trim()) return true;
    const q = searchSupplier.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || (s.phone || '').includes(q);
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "h-full flex flex-col overflow-hidden gap-2 sm:gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 atelier-card rounded-[24px] p-2.5 sm:p-3 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 atelier-subtle p-1 rounded-2xl overflow-x-auto no-scrollbar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSection('suppliers'),
    className: `px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${section === 'suppliers' ? 'atelier-card shadow-sm' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "truck",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Ta'minotchi" : 'Поставщики', " (", suppliers.length, ")")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSection('invoices'),
    className: `px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${section === 'invoices' ? 'atelier-card shadow-sm' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "box",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Faktura' : 'Накладные', " (", invoices.length, ")")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSection('expenses'),
    className: `px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${section === 'expenses' ? 'atelier-card shadow-sm' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Xarajat' : 'Расходы', " (", expenses.length, ")")))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-1.5"
  }, section === 'suppliers' && /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex items-center atelier-input rounded-2xl px-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "atelier-text-muted mr-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14
  })), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: lang === 'uz' ? "Qidiruv..." : "Поиск...",
    value: searchSupplier,
    onChange: e => setSearchSupplier(e.target.value),
    className: "flex-1 min-w-0 bg-transparent py-2 text-xs focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 ml-auto shrink-0"
  }, section !== 'expenses' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateSupplierModalOpen(true),
    className: "px-3 py-2 rounded-full atelier-btn-soft text-xs font-semibold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Ta'minotchi" : "Поставщик")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOcrInvoiceOpen(true),
    className: "px-3 py-2 rounded-full atelier-btn-soft text-xs font-semibold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, "OCR")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateInvoiceModalOpen(true),
    className: "px-3.5 py-2 rounded-full atelier-btn-cta text-xs font-bold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Faktura' : 'Приход'))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setIsSpoilageMode(true);
      setCreateExpenseOpen(true);
    },
    style: {
      backgroundColor: 'var(--danger-bg)',
      color: 'var(--danger-fg)'
    },
    className: "px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Spisanie' : 'Списание')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setIsSpoilageMode(false);
      setCreateExpenseOpen(true);
    },
    className: "px-3.5 py-2 rounded-full atelier-btn-cta text-xs font-bold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Xarajat' : 'Расход')))))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto pr-0.5"
  }, section === 'suppliers' && /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-2"
  }, filteredSuppliers.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    className: "atelier-card rounded-[24px] p-3.5 flex flex-col justify-between gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-xs truncate"
  }, s.name), s.phone && /*#__PURE__*/React.createElement("a", {
    href: `tel:${s.phone}`,
    style: {
      color: 'var(--accent)'
    },
    className: "text-[11px] font-nums inline-flex items-center gap-1 mt-0.5 hover:underline"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "phone",
    size: 11
  }), /*#__PURE__*/React.createElement("span", null, s.phone))), /*#__PURE__*/React.createElement("span", {
    style: {
      color: s.current_debt > 0 ? 'var(--warm-fg)' : 'var(--accent)'
    },
    className: "text-xs font-bold font-nums"
  }, formatMoney(s.current_debt || 0))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5 pt-2 border-t atelier-border"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setReconciliationSupplier(s),
    className: "flex-1 atelier-btn-soft py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Sverka' : 'Сверка')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreateInvoiceModalOpen(true),
    className: "atelier-btn-cta px-3.5 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Kirim' : 'Приход')))))), section === 'invoices' && /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] overflow-hidden divide-y atelier-border"
  }, safeArray(invoices).map(inv => /*#__PURE__*/React.createElement("div", {
    key: inv.id,
    className: "p-3.5 flex items-center justify-between gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold truncate"
  }, "№ ", inv.invoice_number, " • ", inv.supplier_name), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-nums atelier-text-muted mt-0.5"
  }, lang === 'uz' ? 'Jami:' : 'Сумма:', " ", formatMoney(inv.total_amount), " • ", lang === 'uz' ? 'Qarz:' : 'Долг:', " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: inv.debt_to_supplier > 0 ? 'var(--warm-fg)' : 'var(--accent)'
    },
    className: "font-bold"
  }, formatMoney(inv.debt_to_supplier)))), inv.debt_to_supplier > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setSelectedInvoice(inv);
      setPayInvoiceModalOpen(true);
    },
    className: "px-3.5 py-1.5 rounded-full atelier-btn-cta font-bold text-[11px] shrink-0"
  }, lang === 'uz' ? "To'lash" : 'Оплатить')))), section === 'expenses' && /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] overflow-hidden divide-y atelier-border"
  }, safeArray(expenses).map(exp => /*#__PURE__*/React.createElement("div", {
    key: exp.id,
    className: "p-3.5 flex items-center justify-between gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full text-[10px] atelier-subtle"
  }, expenseCategoryName(exp.category, lang)), /*#__PURE__*/React.createElement("span", {
    className: "truncate"
  }, exp.description)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-nums mt-0.5"
  }, new Date(exp.expense_date).toLocaleDateString(), " ", exp.product_name ? `• ${exp.product_name} (${exp.spoilage_quantity})` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--danger-fg)'
    },
    className: "font-nums font-bold shrink-0"
  }, "-", formatMoney(exp.amount)))))), createSupplierModalOpen && /*#__PURE__*/React.createElement(CreateSupplierModal, {
    token: token,
    lang: lang,
    onClose: () => setCreateSupplierModalOpen(false),
    onSuccess: () => {
      setCreateSupplierModalOpen(false);
      loadAll();
      notify('Saved');
    },
    notify: notify,
    t: t
  }), ocrInvoiceOpen && /*#__PURE__*/React.createElement(OcrInvoiceModal, {
    token: token,
    suppliers: suppliers,
    catalogSample: catalogSample,
    onClose: () => setOcrInvoiceOpen(false),
    onSuccess: () => {
      setOcrInvoiceOpen(false);
      loadAll();
      notify('Saved');
    },
    notify: notify,
    t: t,
    lang: lang
  }), createInvoiceModalOpen && /*#__PURE__*/React.createElement(CreateInvoiceModal, {
    token: token,
    lang: lang,
    suppliers: suppliers,
    catalogSample: catalogSample,
    onClose: () => setCreateInvoiceModalOpen(false),
    onSuccess: () => {
      setCreateInvoiceModalOpen(false);
      loadAll();
      notify('Saved');
    },
    notify: notify,
    t: t
  }), payInvoiceModalOpen && selectedInvoice && /*#__PURE__*/React.createElement(PayInvoiceModal, {
    token: token,
    lang: lang,
    invoice: selectedInvoice,
    onClose: () => setPayInvoiceModalOpen(false),
    onSuccess: () => {
      setPayInvoiceModalOpen(false);
      loadAll();
      notify('Paid');
    },
    notify: notify,
    t: t
  }), reconciliationSupplier && /*#__PURE__*/React.createElement(SupplierReconciliationModal, {
    token: token,
    supplierId: reconciliationSupplier.id,
    onClose: () => setReconciliationSupplier(null),
    notify: notify,
    lang: lang,
    t: t
  }), createExpenseOpen && /*#__PURE__*/React.createElement(CreateExpenseModal, {
    token: token,
    lang: lang,
    catalogSample: catalogSample,
    isSpoilage: isSpoilageMode,
    onClose: () => setCreateExpenseOpen(false),
    onSuccess: () => {
      setCreateExpenseOpen(false);
      loadAll();
      notify('Saved');
    },
    notify: notify,
    t: t
  }));
}
function SuppliersScreen(props) {
  return /*#__PURE__*/React.createElement(OperationsHubScreen, {
    ...props,
    initialSection: "suppliers"
  });
}
function ExpensesScreen(props) {
  return /*#__PURE__*/React.createElement(OperationsHubScreen, {
    ...props,
    initialSection: "expenses"
  });
}

// ------------------- CREATE EXPENSE MODAL -------------------
function CreateExpenseModal({
  token,
  catalogSample,
  isSpoilage,
  onClose,
  onSuccess,
  notify,
  t,
  lang
}) {
  const [category, setCategory] = useState(isSpoilage ? 'SPOILAGE' : 'RENT');
  const [amount, setAmount] = useState(isSpoilage ? '' : 500000);
  const [description, setDescription] = useState(isSpoilage ? lang === 'ru' ? 'Товар с истёкшим сроком годности' : 'Yaroqlilik muddati o\'tgan mahsulot' : lang === 'ru' ? 'Текущие расходы' : 'Oylik xarajat');
  const [productId, setProductId] = useState(catalogSample.length > 0 ? catalogSample[0].id : '');
  const [spoilageQuantity, setSpoilageQuantity] = useState(5);
  const [loading, setLoading] = useState(false);
  const submit = async e => {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-3"
  }, isSpoilage ? t.spoilageBtn : t.addExpenseBtn), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, !isSpoilage && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.expenseCategoryLabel), /*#__PURE__*/React.createElement("select", {
    value: category,
    onChange: e => setCategory(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
  }, ['RENT', 'UTILITIES', 'SALARY', 'TAXES', 'TRANSPORT', 'OTHER'].map(value => /*#__PURE__*/React.createElement("option", {
    key: value,
    value: value
  }, expenseCategoryName(value, lang))))), isSpoilage && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.spoilageProductLabel), /*#__PURE__*/React.createElement("select", {
    value: productId,
    onChange: e => setProductId(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100",
    required: true
  }, safeArray(catalogSample).map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name, " (", p.stock_quantity, " ", p.unit, ")")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.spoilageQtyLabel), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: spoilageQuantity,
    onChange: e => setSpoilageQuantity(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100",
    required: true
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.expenseAmountLabel, " ", isSpoilage && (lang === 'ru' ? '(необязательно, рассчитывается по себестоимости)' : '(ixtiyoriy, tannarxdan avtomatik hisoblanadi)')), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: amount,
    onChange: e => setAmount(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-slate-100",
    required: !isSpoilage
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.expenseDescLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: description,
    onChange: e => setDescription(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold"
  }, t.cancelBtn), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow"
  }, loading ? t.saving : t.saveBtn))));
}

// ------------------- ACCOUNTING & ANALYTICS DASHBOARD -------------------
function AnalyticsScreen({
  token,
  notify,
  t
}) {
  const lang = typeof window !== 'undefined' && window.pos_lang || typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang') || 'uz';
  const [subView, setSubView] = useState('finance'); // 'finance' | 'insights' | 'tax' | 'telegram'
  const [period, setPeriod] = useState('today');
  const [selectedDate, setSelectedDate] = useState('');
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [taxReport, setTaxReport] = useState(null);
  const [tgStatus, setTgStatus] = useState(null);
  const [tgToken, setTgToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [tgSending, setTgSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingDayDetails, setViewingDayDetails] = useState(null);
  useEffect(() => {
    if (subView === 'finance') fetchDashboard();else if (subView === 'insights') fetchInsights();else if (subView === 'tax') fetchTaxReport();else if (subView === 'telegram') fetchTgStatus();
  }, [subView, period, selectedDate]);
  const fetchTaxReport = async () => {
    setLoading(true);
    try {
      const p = period === 'all' ? 'year' : period === 'custom' ? 'month' : period;
      const url = selectedDate ? `${API_BASE}/tax/report?period=custom&selected_date=${selectedDate}` : `${API_BASE}/tax/report?period=${p}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setTaxReport(await res.json());
    } catch (e) {
      notify(lang === 'uz' ? 'Soliq hisobotini yuklashda xatolik' : 'Ошибка загрузки налогового отчёта', 'error');
    } finally {
      setLoading(false);
    }
  };
  const downloadTaxCsv = async () => {
    try {
      const p = period === 'all' ? 'year' : period === 'custom' ? 'month' : period;
      const res = await fetch(`${API_BASE}/tax/export-csv?period=${p}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('CSV error');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soliq_tax_${p}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify(lang === 'uz' ? 'Soliq CSV yuklab olindi!' : 'Налоговый реестр CSV скачан!');
    } catch (e) {
      notify(e.message, 'error');
    }
  };
  const sendTaxToTelegram = async () => {
    setTgSending(true);
    try {
      const p = period === 'all' ? 'year' : period === 'custom' ? 'month' : period;
      const res = await fetch(`${API_BASE}/tax/send-telegram?period=${p}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || 'Xatolik');
      notify(d.message || 'Yuborildi!');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setTgSending(false);
    }
  };
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const url = selectedDate ? `${API_BASE}/analytics/dashboard?period=custom&date=${selectedDate}` : `${API_BASE}/analytics/dashboard?period=${period}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setData(await res.json());
    } catch (e) {
      notify('Hisobotni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };
  const fetchInsights = async () => {
    setLoading(true);
    try {
      const p = period === 'custom' ? 'month' : period;
      const res = await fetch(`${API_BASE}/ai/insights?period=${p}&lang=${lang}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) setInsights(await res.json());
    } catch (e) {} finally {
      setLoading(false);
    }
  };
  const fetchTgStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const d = await res.json();
        setTgStatus(d);
        if (d.owner_chat_id) setTgChatId(String(d.owner_chat_id));
      }
    } catch (e) {}
  };
  const saveTgSettings = async e => {
    e.preventDefault();
    setTgSending(true);
    try {
      const res = await fetch(`${API_BASE}/telegram/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bot_token: tgToken.trim(),
          owner_chat_id: Number(tgChatId)
        })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || 'Xatolik');
      notify(d.message);
      setTgToken('');
      fetchTgStatus();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setTgSending(false);
    }
  };
  const triggerTgAction = async endpoint => {
    setTgSending(true);
    try {
      const res = await fetch(`${API_BASE}/telegram/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || 'Xatolik');
      notify(d.message || 'Yuborildi!');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setTgSending(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "h-full flex flex-col overflow-hidden gap-2 sm:gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 atelier-card rounded-[24px] p-2.5 sm:p-3 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 atelier-subtle p-1 rounded-2xl overflow-x-auto no-scrollbar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSubView('finance'),
    className: `px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${subView === 'finance' ? 'atelier-card shadow-sm' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chart",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Moliya' : 'Финансы')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSubView('insights'),
    className: `px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${subView === 'insights' ? 'atelier-card shadow-sm' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, "AI")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSubView('tax'),
    className: `px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${subView === 'tax' ? 'atelier-card shadow-sm' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Soliq' : 'Налог')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSubView('telegram'),
    className: `px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 ${subView === 'telegram' ? 'atelier-card shadow-sm' : 'atelier-text-muted'}`
  }, /*#__PURE__*/React.createElement("span", null, "TG"))), subView === 'tax' && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: downloadTaxCsv,
    className: "px-3 py-1.5 rounded-full atelier-btn-soft text-[11px] font-semibold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, "CSV")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: tgSending,
    onClick: sendTaxToTelegram,
    className: "px-3 py-1.5 rounded-full atelier-btn-primary text-[11px] font-semibold"
  }, "TG")), subView === 'finance' && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 atelier-input rounded-2xl px-2.5 py-1 shrink-0"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: selectedDate,
    onChange: e => setSelectedDate(e.target.value),
    className: "bg-transparent text-[11px] font-semibold outline-none"
  }), selectedDate && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSelectedDate(''),
    style: {
      color: 'var(--danger-fg)'
    },
    className: "text-xs font-bold"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 12
  })))), subView !== 'telegram' && /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5 overflow-x-auto no-scrollbar"
  }, [{
    id: 'today',
    label: t.periodToday
  }, {
    id: 'week',
    label: t.periodWeek
  }, {
    id: 'month',
    label: t.periodMonth
  }, ...(subView === 'tax' ? [{
    id: 'quarter',
    label: lang === 'uz' ? 'Kvartal' : 'Квартал'
  }] : []), {
    id: 'all',
    label: t.periodAll
  }].map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    type: "button",
    onClick: () => {
      setSelectedDate('');
      setPeriod(item.id);
    },
    className: `px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition ${period === item.id && !selectedDate ? 'atelier-pill-active' : 'atelier-btn-soft atelier-text-muted'}`
  }, item.label)))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-h-0 overflow-y-auto pr-0.5 space-y-2.5 pb-2"
  }, subView === 'finance' && (loading || !data ? /*#__PURE__*/React.createElement("div", {
    className: "py-16 text-center text-xs atelier-text-muted"
  }, t.processing) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 lg:grid-cols-4 gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium"
  }, t.kpiRevenue), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--accent)'
    },
    className: "text-lg sm:text-xl font-bold font-nums mt-0.5"
  }, formatMoney(data.revenue)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-nums mt-0.5"
  }, data.sales_count, " ", t.kpiReceiptsCount, " • ", formatMoney(data.average_receipt))), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium"
  }, t.kpiNetProfit), /*#__PURE__*/React.createElement("div", {
    style: {
      color: data.net_profit >= 0 ? 'var(--accent)' : 'var(--danger-fg)'
    },
    className: "text-lg sm:text-xl font-bold font-nums mt-0.5"
  }, formatMoney(data.net_profit)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-nums mt-0.5"
  }, t.kpiMarginPct, " ", data.margin_percentage, "%")), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium"
  }, t.kpiCogs), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold font-nums mt-0.5"
  }, formatMoney(data.cogs)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-nums mt-0.5"
  }, t.kpiGrossMargin, ": ", formatMoney(data.gross_margin))), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium"
  }, t.kpiCustomerDebt), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--warm-fg)'
    },
    className: "text-base sm:text-lg font-bold font-nums mt-0.5"
  }, formatMoney(data.customer_debt_outstanding)), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--danger-fg)'
    },
    className: "text-[11px] font-semibold mt-0.5"
  }, data.low_stock_count, " ", lang === 'uz' ? 'kam tovar' : 'мало на складе'))), !selectedDate && (period === 'week' || period === 'month') && data.daily_breakdown?.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-xs mb-2"
  }, lang === 'uz' ? 'Kunlik hisobot (bosing)' : 'По дням (нажмите для деталей)'), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 overflow-x-auto no-scrollbar pb-1"
  }, safeArray(data.daily_breakdown).map(day => /*#__PURE__*/React.createElement("button", {
    key: day.date,
    type: "button",
    onClick: () => setViewingDayDetails(day.date),
    className: "shrink-0 p-2.5 rounded-2xl atelier-subtle text-left min-w-[110px] hover:opacity-90"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-semibold atelier-text-muted font-nums"
  }, day.date.slice(5), " (", day.sales_count, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--accent)'
    },
    className: "text-xs font-bold font-nums mt-0.5"
  }, formatMoney(day.revenue)))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5 space-y-2 text-xs"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold"
  }, t.paymentsBreakdownTitle), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between p-2.5 rounded-2xl atelier-subtle"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cash",
    size: 14
  }), t.methodCash), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    },
    className: "font-nums font-bold"
  }, formatMoney(data.cash_total))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between p-2.5 rounded-2xl atelier-subtle"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "card",
    size: 14
  }), t.methodCard), /*#__PURE__*/React.createElement("span", {
    className: "font-nums font-bold"
  }, formatMoney(data.card_total))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between p-2.5 rounded-2xl atelier-subtle"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "debts",
    size: 14
  }), t.methodDebt), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--warm-fg)'
    },
    className: "font-nums font-bold"
  }, formatMoney(data.debt_total)))), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5 space-y-2 text-xs"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold"
  }, t.topSellingTitle), safeArray(data?.top_selling_products).length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "atelier-text-muted py-4 text-center"
  }, lang === 'uz' ? "Savdolar yo'q" : 'Нет продаж') : safeArray(data?.top_selling_products).map((item, idx) => /*#__PURE__*/React.createElement("div", {
    key: item.product_id,
    className: "flex justify-between p-2.5 rounded-2xl atelier-subtle"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-medium truncate pr-2"
  }, idx + 1, ". ", item.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    },
    className: "font-nums font-bold shrink-0"
  }, item.quantity_sold, " • ", formatMoney(item.revenue)))))))), subView === 'insights' && (loading || !insights ? /*#__PURE__*/React.createElement("div", {
    className: "py-16 text-center text-xs atelier-text-muted"
  }, t.processing) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5 space-y-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Do'kon egasiga AI tavsiyalar" : 'Рекомендации по магазину')), safeArray(insights.owner_recommendations).map((rec, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "p-3 rounded-2xl atelier-subtle"
  }, rec))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5 space-y-2"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--danger-fg)'
    },
    className: "font-bold"
  }, lang === 'uz' ? 'Tez tugayotgan (Zakaz)' : 'Срочный закуп', " (", safeArray(insights.low_stock_items).length, ")"), safeArray(insights.low_stock_items).slice(0, 8).map(it => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    className: "flex justify-between p-2 rounded-xl atelier-subtle"
  }, /*#__PURE__*/React.createElement("span", {
    className: "truncate"
  }, it.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--danger-fg)'
    },
    className: "font-nums font-bold"
  }, it.stock_quantity, " ", it.unit)))), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5 space-y-2"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--warm-fg)'
    },
    className: "font-bold"
  }, lang === 'uz' ? 'Sekin aylanayotgan tovarlar' : 'Медленный сбыт', " (", safeArray(insights.slow_turnover_items).length, ")"), safeArray(insights.slow_turnover_items).slice(0, 8).map(it => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    className: "flex justify-between p-2 rounded-xl atelier-subtle"
  }, /*#__PURE__*/React.createElement("span", {
    className: "truncate"
  }, it.name), /*#__PURE__*/React.createElement("span", {
    className: "font-nums atelier-text-muted"
  }, it.stock_quantity, " ", it.unit))))))), subView === 'tax' && (loading || !taxReport ? /*#__PURE__*/React.createElement("div", {
    className: "py-16 text-center text-xs atelier-text-muted"
  }, t.processing) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5 text-xs"
  }, safeArray(taxReport.compliance_checklist).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-semibold atelier-text-muted mb-2 flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? 'Soliq va Asl Belgisi tayyorlik tekshiruvi' : 'Чек-лист соответствия закону РУз (ПКМ №943 / №631)')), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5"
  }, safeArray(taxReport.compliance_checklist).map(chk => /*#__PURE__*/React.createElement("div", {
    key: chk.key,
    style: {
      backgroundColor: chk.ok ? 'var(--accent-soft)' : 'var(--warm-bg)',
      color: chk.ok ? 'var(--accent-soft-fg)' : 'var(--warm-fg)'
    },
    className: "flex items-center justify-between gap-2 px-3 py-2 rounded-2xl text-[11px]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold truncate flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: chk.ok ? 'check' : 'alert',
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? chk.label_uz : chk.label_ru)), /*#__PURE__*/React.createElement("span", {
    className: "font-nums text-[10px] shrink-0 opacity-85"
  }, chk.detail))))), safeArray(taxReport.warnings).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5"
  }, safeArray(taxReport.warnings).map((w, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      backgroundColor: w.level === 'danger' ? 'var(--danger-bg)' : w.level === 'warn' ? 'var(--warm-bg)' : 'var(--accent-soft)',
      color: w.level === 'danger' ? 'var(--danger-fg)' : w.level === 'warn' ? 'var(--warm-fg)' : 'var(--accent-soft-fg)'
    },
    className: "p-3 rounded-2xl border atelier-border"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold"
  }, lang === 'uz' ? w.title_uz : w.title_ru), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] opacity-90 mt-0.5"
  }, lang === 'uz' ? w.detail_uz : w.detail_ru)))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 lg:grid-cols-4 gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium"
  }, lang === 'uz' ? 'Soliq bazasi (Sof savdo)' : 'Налоговая база'), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--accent)'
    },
    className: "text-base sm:text-lg font-bold font-nums mt-0.5"
  }, formatMoney(taxReport.summary.net_taxable_revenue)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-nums"
  }, taxReport.summary.receipts_count, " ", lang === 'uz' ? 'chek' : 'чеков', " • ", Number(taxReport.summary.refunds_total) > 0 ? `-${formatMoney(taxReport.summary.refunds_total)}` : "0 so'm", " ", lang === 'uz' ? 'qaytarish' : 'возвр.')), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium"
  }, lang === 'uz' ? 'Hisoblangan soliq' : 'К уплате налог', " (", taxReport.summary.tax_rate_percent, "%)"), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold font-nums mt-0.5"
  }, formatMoney(taxReport.summary.estimated_tax_due)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted"
  }, lang === 'uz' ? `Topshirish: ${taxReport.summary.filing_deadline_day}-sanagacha` : `Срок сдачи: до ${taxReport.summary.filing_deadline_day}-го`)), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium"
  }, "IKPU & ", lang === 'uz' ? 'Qadoq' : 'Упаковка'), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold font-nums mt-0.5"
  }, taxReport.catalog_compliance.with_valid_ikpu, " / ", taxReport.catalog_compliance.total_active_sku), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--warm-fg)'
    },
    className: "text-[11px] font-semibold"
  }, taxReport.catalog_compliance.missing_ikpu_count, " ", lang === 'uz' ? 'IKPUsiz' : 'без ИКПУ', " • Qadoq ", taxReport.catalog_compliance.with_package_code ?? 0)), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted font-medium"
  }, lang === 'uz' ? 'Markirovka (Asl Belgisi)' : 'Маркировка (DataMatrix)'), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold font-nums mt-0.5"
  }, taxReport.tobacco_and_marking.tobacco_units_sold, " ", lang === 'uz' ? 'dona' : 'шт/пач'), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--accent)'
    },
    className: "text-[11px] font-semibold font-nums"
  }, taxReport.tobacco_and_marking.datamatrix_coverage_pct, "% DM • ", formatMoney(taxReport.tobacco_and_marking.tobacco_revenue)))), safeArray(taxReport.catalog_compliance.missing_ikpu_sample).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3 space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--warm-fg)'
    },
    className: "text-[11px] font-semibold"
  }, lang === 'uz' ? "IKPU (17 raqam) kiritilmagan tovarlar (223-modda 1% jarima xavfi):" : "Товары без 17-значного ИКПУ (риск штрафа 1% по ст. 223 НК):"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, safeArray(taxReport.catalog_compliance.missing_ikpu_sample).map(p => /*#__PURE__*/React.createElement("span", {
    key: p.id,
    className: "px-2.5 py-1 rounded-full atelier-subtle text-[10px] font-medium"
  }, p.name, " (", p.barcode, ")")))), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold"
  }, lang === 'uz' ? 'Asl Belgisi DataMatrix (Tamaki • Suv • Ichimlik • Pivo)' : 'Маркировка Asl Belgisi (Табак • Вода • Напитки • Пиво)'), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-nums atelier-text-muted"
  }, "DM ✓ ", taxReport.tobacco_and_marking.marked_with_datamatrix_count, " / ✗ ", taxReport.tobacco_and_marking.missing_datamatrix_count)), safeArray(taxReport.tobacco_and_marking.marking_ledger).length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-4 atelier-text-muted"
  }, lang === 'uz' ? "Tanlangan davrda markirovkali tovar sotuvi yo'q" : 'За период продаж маркированных товаров нет') : /*#__PURE__*/React.createElement("div", {
    className: "divide-y atelier-border max-h-60 overflow-y-auto"
  }, safeArray(taxReport.tobacco_and_marking.marking_ledger).slice(0, 50).map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "py-2 flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold truncate"
  }, m.product_name, " ", m.is_returned ? '↩' : '', m.marking_group_label && /*#__PURE__*/React.createElement("span", {
    className: "ml-1.5 text-[10px] px-2 py-0.5 rounded-full atelier-subtle font-semibold"
  }, m.marking_group_label)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-nums atelier-text-muted truncate"
  }, m.sold_at, " • ", m.receipt_number, " • ", m.has_datamatrix ? `DM: ${m.masked_code}` : 'БЕЗ DATAMATRIX')), /*#__PURE__*/React.createElement("div", {
    className: "text-right font-nums shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--accent)'
    },
    className: "font-bold"
  }, formatMoney(m.total_price)), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] atelier-text-muted"
  }, m.quantity, " sht")))))), /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5 space-y-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold"
  }, lang === 'uz' ? 'IKPU (MXIK) bo‘yicha sotuvlar' : 'Продажи в разрезе ИКПУ (MXIK)'), safeArray(taxReport.ikpu_breakdown).length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-4 atelier-text-muted"
  }, lang === 'uz' ? "Sotuvlar yo'q" : 'Продаж за период нет') : /*#__PURE__*/React.createElement("div", {
    className: "divide-y atelier-border max-h-56 overflow-y-auto"
  }, safeArray(taxReport.ikpu_breakdown).map((row, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "py-2 flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-nums font-bold text-[11px]"
  }, row.ikpu_code || 'BEZ IKPU'), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] atelier-text-muted truncate"
  }, row.sample_name, " (", row.quantity_sold, " poz)")), /*#__PURE__*/React.createElement("div", {
    className: "text-right font-nums shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--accent)'
    },
    className: "font-bold"
  }, formatMoney(row.net_revenue)), row.vat_amount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] atelier-text-muted"
  }, "QQS: ", formatMoney(row.vat_amount))))))))), subView === 'telegram' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atelier-card rounded-[24px] p-3.5 space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold"
  }, lang === 'uz' ? 'Telegram Bot Hisobotlar' : 'Отчёты в Telegram'), /*#__PURE__*/React.createElement("span", {
    style: {
      backgroundColor: tgStatus?.configured ? 'var(--accent-soft)' : 'var(--warm-bg)',
      color: tgStatus?.configured ? 'var(--accent-soft-fg)' : 'var(--warm-fg)'
    },
    className: "px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
  }, tgStatus?.configured ? lang === 'uz' ? 'Ulangan' : 'Подключён' : lang === 'uz' ? 'Sozlanmagan' : 'Не настроен')), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-3 gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: tgSending,
    onClick: () => triggerTgAction('test-send'),
    className: "py-2.5 rounded-2xl atelier-btn-soft font-semibold"
  }, lang === 'uz' ? 'Test xabar' : 'Тест-сообщение'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: tgSending,
    onClick: () => triggerTgAction('z-report'),
    className: "py-2.5 rounded-2xl atelier-btn-cta font-bold"
  }, lang === 'uz' ? 'Z-Hisobot yuborish' : 'Отправить Z-отчёт'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: tgSending,
    onClick: () => triggerTgAction('alert-low-stock'),
    className: "py-2.5 rounded-2xl atelier-btn-primary font-semibold"
  }, lang === 'uz' ? 'Kam qoldiq alert' : 'Срочные остатки'))), /*#__PURE__*/React.createElement("form", {
    onSubmit: saveTgSettings,
    className: "atelier-card rounded-[24px] p-3.5 space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold"
  }, lang === 'uz' ? 'Bot sozlamalarini ulash:' : 'Настройка Telegram бота:'), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    placeholder: "Bot Token (123456:ABC...)",
    value: tgToken,
    onChange: e => setTgToken(e.target.value),
    className: "w-full atelier-input rounded-2xl px-3.5 py-2.5 font-nums text-xs"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    required: true,
    placeholder: "Owner Chat ID (masalan: 123456789)",
    value: tgChatId,
    onChange: e => setTgChatId(e.target.value),
    className: "flex-1 atelier-input rounded-2xl px-3.5 py-2.5 font-nums text-xs"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: tgSending,
    className: "px-5 py-2.5 rounded-2xl atelier-btn-primary font-semibold"
  }, tgSending ? '...' : lang === 'uz' ? 'Saqlash' : 'Сохранить'))))), viewingDayDetails && /*#__PURE__*/React.createElement(DayDetailsModal, {
    dateStr: viewingDayDetails,
    token: token,
    onClose: () => setViewingDayDetails(null),
    notify: notify,
    lang: lang,
    t: t
  }));
}

// ------------------- ERROR BOUNDARY -------------------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error('GroceryPOS Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /*#__PURE__*/React.createElement("div", {
        className: "min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-3xl p-6 max-w-md text-center shadow-2xl"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-4xl mb-3"
      }, "⚠️"), /*#__PURE__*/React.createElement("h2", {
        className: "text-lg font-bold text-rose-500 mb-2"
      }, "Interfeysda xatolik yuz berdi / Произошла ошибка"), /*#__PURE__*/React.createElement("p", {
        className: "text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono"
      }, this.state.error ? this.state.error.message : 'Noma\'lum xatolik'), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          localStorage.clear();
          window.location.reload();
        },
        className: "bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
      }, "Keshni tozalash va qayta yuklash / Сбросить кэш")));
    }
    return this.props.children;
  }
}
const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));
}