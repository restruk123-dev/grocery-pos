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
    pwaBannerDesc: "Brauzer manzil qatorisiz, qulay ilova ko'rinishida ochish uchun: brauzer menyusida (3 nuqta) «Bosh ekranga qo'shish» tugmasini bosing.",
    pwaBannerClose: "Tushunarli",
    clearCatalogBtn: "Test tovarlarni tozalash / Toza varaqdan boshlash",
    clearCatalogWarning: "Rostdan ham barcha test tovarlar va cheklarni tozalamoqchimisiz? Kechki savdo uchun toza baza tayyorlanadi.",
    reseedCatalogBtn: "2000 ta demo tovarlarni qaytarish",
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
    quick_eggs: "Tuxum",
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
    clearCatalogBtn: "Очистить демо-товары / Начать с чистого листа",
    clearCatalogWarning: "Вы действительно хотите удалить все демо-товары и чеки? База будет подготовлена к реальной торговле.",
    reseedCatalogBtn: "Вернуть 2000 демо-товаров",
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
    quick_eggs: "Яйца",
  }
};

const EXPENSE_CATEGORY_NAMES = {
  uz: { RENT: 'Ijara', UTILITIES: 'Kommunal to‘lovlar', SALARY: 'Ish haqi', SPOILAGE: 'Buzilgan tovarni hisobdan chiqarish', TAXES: 'Soliqlar', TRANSPORT: 'Transport', OTHER: 'Boshqa' },
  ru: { RENT: 'Аренда', UTILITIES: 'Коммунальные услуги', SALARY: 'Зарплата', SPOILAGE: 'Порча и списание товара', TAXES: 'Налоги', TRANSPORT: 'Транспорт', OTHER: 'Прочее' },
};
const expenseCategoryName = (category, language) => EXPENSE_CATEGORY_NAMES[language]?.[category] || String(category).replace(/_/g, ' ').toLocaleLowerCase(language === 'ru' ? 'ru' : 'uz');

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

// ------------------- WEB AUDIO SOUND EFFECTS -------------------
function playAudioCue(type = 'success') {
  if (typeof window === 'undefined') return;
  try {
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
    setTimeout(() => { try { ctx.close(); } catch(e){} }, 400);
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

// ------------------- UNIFIED SETTINGS MODAL -------------------
function SettingsModal({
  token,
  user,
  lang,
  onLangChange,
  theme,
  onToggleTheme,
  onOpenPasswordModal,
  onOpenPhoneModal,
  onLogout,
  onClose,
  notify,
  t
}) {
  const [downloading, setDownloading] = useState(false);
  const [reseedLoading, setReseedLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const downloadBackup = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/backup/dump`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(lang === "uz" ? "Zaxira nusxa yaratib bo'lmadi" : "Не удалось создать бэкап");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grocery_pos_backup_${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      notify(lang === "uz" ? "Zaxira nusxa yuklab olindi!" : "Резервная копия скачана!");
    } catch (e) {
      notify(lang === "uz" ? "Yuklab olishda xatolik" : "Ошибка скачивания бэкапа", "error");
    } finally {
      setDownloading(false);
    }
  };

  const reseedCatalog = async () => {
    if (!confirm(lang === "uz" ? "2000 ta demo tovarlarni qayta tiklamoqchimisiz?" : "Восстановить 2000 демо-товаров?")) return;
    setReseedLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/reseed-catalog?target_count=2000`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      notify(data.message || (lang === "uz" ? "Katalog yangilandi!" : "Каталог обновлен!"));
    } catch (e) {
      notify(lang === "uz" ? "Sinxronlashda xatolik" : "Ошибка синхронизации", "error");
    } finally {
      setReseedLoading(false);
    }
  };

  const clearCatalog = async () => {
    if (!confirm(lang === "uz" ? "Barcha test tovarlar va cheklar tozalanadi. Tasdiqlaysizmi?" : "Очистить все тестовые чеки и товары?")) return;
    setClearLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/clear-catalog`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      notify(data.message || (lang === "uz" ? "Baza tozalandi!" : "База очищена!"));
    } catch (e) {
      notify(lang === "uz" ? "Tozalashda xatolik" : "Ошибка очистки", "error");
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {lang === "uz" ? "Tizim sozlamalari" : "Настройки системы"}
              </h3>
              <p className="text-xs text-slate-400">
                {user?.full_name || user?.username} ({user?.role || "Kassir"})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Language selection */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              🌐 {lang === "uz" ? "Tilni tanlash / Язык интерфейса" : "Язык интерфейса / Til"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onLangChange("uz")}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  lang === "uz"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>🇺🇿</span>
                <span>O'zbekcha</span>
              </button>
              <button
                type="button"
                onClick={() => onLangChange("ru")}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  lang === "ru"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>🇷🇺</span>
                <span>Русский</span>
              </button>
            </div>
          </div>

          {/* Theme selection */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              🌓 {lang === "uz" ? "Tungi / Kunduzgi mavzu" : "Тема оформления"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onToggleTheme("light")}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  theme === "light"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>☀️</span>
                <span>{lang === "uz" ? "Yorug'" : "Светлая"}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleTheme("dark")}
                className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  theme === "dark"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>🌙</span>
                <span>{lang === "uz" ? "Qorong'i" : "Темная"}</span>
              </button>
            </div>
          </div>

          {/* Account Security */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  🔑 {lang === "uz" ? "Parolni almashtirish" : "Сменить пароль"}
                </div>
                <div className="text-[11px] text-slate-400">
                  {lang === "uz" ? "Kassir yoki do'kon egasi paroli" : "Безопасность учетной записи"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { onClose(); onOpenPasswordModal(); }}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-bold transition text-slate-800 dark:text-slate-200"
              >
                {lang === "uz" ? "O'zgartirish" : "Сменить"}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  📱 {lang === "uz" ? "Telefon raqami" : "Номер телефона"}
                </div>
                <div className="text-[11px] text-slate-400">
                  {user?.phone || (lang === "uz" ? "Kiritilmagan" : "Не указан")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { onClose(); onOpenPhoneModal(); }}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-bold transition text-slate-800 dark:text-slate-200"
              >
                {lang === "uz" ? "Bog'lash" : "Привязать"}
              </button>
            </div>
          </div>

          {/* Database Backup & Cloud Sync */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ☁️ {lang === "uz" ? "Baza va Zaxira (Backup)" : "База данных и Синхронизация"}
            </div>
            <div className="text-[11px] text-slate-400">
              {lang === "uz"
                ? "PostgreSQL bulutli bazasi faol. Istalgan vaqtda SQL formatida zaxira nusxa olishingiz mumkin."
                : "База данных PostgreSQL активна в облаке Render. Выгрузка полного дампа."}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={downloading}
                onClick={downloadBackup}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>💾</span>
                <span>{downloading ? (lang === "uz" ? "Yuklanmoqda..." : "Выгрузка...") : (lang === "uz" ? "Zaxira nusxa yuklash (SQL)" : "Скачать бэкап (SQL)")}</span>
              </button>
              <button
                type="button"
                disabled={reseedLoading}
                onClick={reseedCatalog}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>🔄</span>
                <span>{reseedLoading ? "..." : (lang === "uz" ? "2000 ta demo tovar" : "2000 демо-товаров")}</span>
              </button>
              <button
                type="button"
                disabled={clearLoading}
                onClick={clearCatalog}
                className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>🗑️</span>
                <span>{clearLoading ? "..." : (lang === "uz" ? "Baza tozalash" : "Очистить базу")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <span>🚪</span>
            <span>{lang === "uz" ? "Tizimdan chiqish" : "Выйти из системы"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
          >
            {t.closeModal || "Yopish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- EDIT PRODUCT MODAL -------------------
function EditProductModal({ token, product, categories: propCategories, onClose, onSuccess, notify, t, lang: propLang }) {
  const lang = propLang || (typeof window !== "undefined" && window.pos_lang) || "uz";
  const [name, setName] = useState(product.name || "");
  const [barcode, setBarcode] = useState(product.barcode || "");
  const [categoryId, setCategoryId] = useState(product.category_id ? String(product.category_id) : "");
  const [categories, setCategories] = useState(propCategories || []);
  const [unit, setUnit] = useState(product.unit || "dona");
  const [purchasePrice, setPurchasePrice] = useState(String(product.purchase_price ?? ""));
  const [salePrice, setSalePrice] = useState(String(product.sale_price || ""));
  const [stockQuantity, setStockQuantity] = useState(String(product.stock_quantity ?? "0"));
  const [isQuick, setIsQuick] = useState(Boolean(product.is_quick));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      fetch(`${API_BASE}/products/categories/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(r => r.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data?.categories || data?.items || []);
          setCategories(list);
          if (list.length > 0 && !categoryId) setCategoryId(String(list[0].id));
        })
        .catch(() => {});
    }
  }, []);

  const submit = async (e) => {
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
        is_quick: Boolean(isQuick)
      };
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {lang === "uz" ? "Tovarni tahrirlash" : "Редактировать товар"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {lang === "uz" ? "Mahsulot nomi *" : "Наименование товара *"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {lang === "uz" ? "Shtrixkod" : "Штрихкод"}
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {lang === "uz" ? "Kategoriya" : "Категория"}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium"
              >
                {safeArray(categories).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {lang === "uz" ? "Kirim narxi (so'm)" : "Закупочная цена (сум)"}
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {lang === "uz" ? "Sotish narxi (so'm) *" : "Цена продажи (сум) *"}
              </label>
              <input
                type="number"
                required
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {lang === "uz" ? "Qoldiq" : "Остаток"}
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isQuick}
                onChange={(e) => setIsQuick(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                ⚡ {lang === "uz" ? "Tezkor tovarlar panelida ko'rsatish" : "Показывать в панели быстрых товаров"}
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300"
            >
              {t.cancelBtn || "Bekor qilish"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {loading ? (lang === "uz" ? "Saqlanmoqda..." : "Сохранение...") : (lang === "uz" ? "Saqlash" : "Сохранить")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------- SUPPLIER RECONCILIATION MODAL -------------------
function SupplierReconciliationModal({ token, supplierId, onClose, notify, lang: propLang, t }) {
  const lang = propLang || (typeof window !== "undefined" && window.pos_lang) || "uz";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/suppliers/${supplierId}/reconciliation`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => { setData(res); setLoading(false); })
      .catch(() => { notify(lang === "uz" ? "Sverka yuklashda xatolik" : "Ошибка загрузки акта сверки", "error"); setLoading(false); });
  }, [supplierId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {lang === "uz" ? "Ta'minotchi bilan hisob-kitob (Акт сверки)" : "Акт сверки расчётов с поставщиком"}
              </h3>
              <p className="text-xs text-slate-400">
                {data?.supplier?.name} {data?.supplier?.phone ? `• 📞 ${data.supplier.phone}` : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        {loading || !data ? (
          <div className="py-12 text-center text-xs text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">{lang === "uz" ? "Jami yetkazilgan" : "Всего отгружено"}</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 font-mono">{formatMoney(data.summary.total_invoiced)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">{lang === "uz" ? "To'langan summa" : "Оплачено"}</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatMoney(data.summary.total_paid)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">{lang === "uz" ? "Qarz qoldig'i" : "Остаток долга"}</span>
                <span className={`text-sm font-black font-mono ${data.summary.current_debt > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}`}>
                  {formatMoney(data.summary.current_debt)}
                </span>
              </div>
            </div>

            {/* Invoices list */}
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
                📦 {lang === "uz" ? "Yuk xatlari (Fakturalar)" : "Накладные и оплаты"} ({data.invoices.length})
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {data.invoices.map((inv) => (
                  <div key={inv.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div>
                      <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        № {inv.invoice_number}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {inv.date ? inv.date.slice(0, 10) : ""}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{formatMoney(inv.total_amount)}</div>
                      <div className="text-[11px] text-emerald-600">To'landi: {formatMoney(inv.paid_amount)}</div>
                      {inv.debt_to_supplier > 0 && (
                        <div className="text-[11px] text-amber-600 font-bold">Qarz: {formatMoney(inv.debt_to_supplier)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
          >
            {t.closeModal || "Yopish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- DAY DETAILS MODAL (ACCOUNTING) -------------------
function DayDetailsModal({ token, dateStr, onClose, notify, lang: propLang, t }) {
  const lang = propLang || (typeof window !== "undefined" && window.pos_lang) || "uz";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/analytics/day-details?date_str=${dateStr}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => { setData(res); setLoading(false); })
      .catch(() => { notify(lang === "uz" ? "Kunlik hisobotni yuklashda xatolik" : "Ошибка загрузки отчета за день", "error"); setLoading(false); });
  }, [dateStr]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {lang === "uz" ? `${data?.date_label || dateStr} hisoboti` : `Отчет за ${data?.date_label || dateStr}`}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === "uz" ? "Cheklar, tushum, tannarx va foyda" : "Выручка, себестоимость, чеки и прибыль"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        {loading || !data ? (
          <div className="py-12 text-center text-xs text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">{lang === "uz" ? "Tushum (Выручка)" : "Выручка"}</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{formatMoney(data.revenue)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">{lang === "uz" ? "Cheklar soni" : "Чеков"}</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono">{data.sales_count}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">O'rtacha: {formatMoney(data.average_receipt)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">{lang === "uz" ? "Tannarx (COGS)" : "Себестоимость"}</span>
                <span className="text-base font-extrabold text-slate-700 dark:text-slate-300 font-mono">{formatMoney(data.cogs)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">{lang === "uz" ? "Sof foyda" : "Чистая прибыль"}</span>
                <span className={`text-base font-extrabold font-mono ${data.net_profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                  {formatMoney(data.net_profit)}
                </span>
              </div>
            </div>

            {/* Sales breakdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  🧾 {lang === "uz" ? "Kunning barcha cheklari" : "Список чеков за день"} ({data.sales.length})
                </h4>
              </div>
              {data.sales.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  {lang === "uz" ? "Ushbu kunda savdo bo'lmagan" : "В этот день продаж не было"}
                </div>
              ) : (
                <div className="space-y-2">
                  {data.sales.map((sale) => (
                    <div key={sale.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>🧾 Chek #{sale.receipt_number || sale.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-mono">
                            {sale.payment_method}
                          </span>
                        </div>
                        <div className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {formatMoney(sale.total_amount)}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {sale.time ? sale.time.slice(0, 5) : ""} • {sale.cashier_name || "Kassir"}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                        {sale.items_summary}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
          >
            {t.closeModal || "Yopish"}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
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
      {passwordChangeOpen && (
        <PasswordChangeModal
          token={token}
          lang={lang}
          notify={notify}
          onClose={() => setPasswordChangeOpen(false)}
          onChanged={handleLogout}
        />
      )}

      {zReportOpen && <ZReportModal onClose={() => setZReportOpen(false)} t={t} />}
      {settingsModalOpen && (
        <SettingsModal
          token={token}
          user={user}
          lang={lang}
          onLangChange={(newLang) => setLang(newLang)}
          theme={theme}
          onToggleTheme={(newTheme) => setTheme(newTheme)}
          onOpenPasswordModal={() => setPasswordChangeOpen(true)}
          onOpenPhoneModal={() => setNetworkModalOpen(true)}
          onLogout={handleLogout}
          onClose={() => setSettingsModalOpen(false)}
          notify={notify}
          t={t}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        {/* Top Control Bar */}
        <div className="app-header-top max-w-7xl mx-auto flex items-center justify-between gap-2 px-3 py-2">
          {/* Logo & Active Cashier Switcher */}
          <div className="app-header-identity flex items-center gap-2">
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

          {/* Unified Header Settings Action */}
          <div className="app-header-actions flex items-center gap-1.5">
            {canInstall && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow flex items-center gap-1 transition"
                title={lang === "uz" ? "Ilovani o'rnatish" : "Установить"}
              >
                <span>📲</span>
                <span className="hidden sm:inline">{lang === "uz" ? "O'rnatish" : "Установить"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="px-3 py-1.5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-1.5 touch-target"
              title={lang === "uz" ? "Sozlamalar" : "Настройки"}
            >
              <span className="text-sm">⚙️</span>
              <span className="font-bold">{lang === "uz" ? "Sozlamalar" : "Настройки"}</span>
            </button>
          </div>
        </div>

        {/* Dedicated Horizontal Scrolling Tab Bar */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 bg-slate-50/80 dark:bg-slate-900/80">
          <nav className="app-tab-nav max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar py-0.5">
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

      <main className="app-main-content flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4">
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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


function PasswordChangeModal({ token, onClose, onChanged, notify, lang }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isUz = lang === 'uz';

  const submit = async (event) => {
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{isUz ? 'Parolni almashtirish' : 'Смена пароля'}</h2>
          <button type="button" onClick={onClose} aria-label={isUz ? 'Yopish' : 'Закрыть'}>✕</button>
        </div>
        <input autoComplete="current-password" type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={isUz ? 'Joriy parol' : 'Текущий пароль'} className="w-full rounded-xl border bg-transparent p-3" />
        <input autoComplete="new-password" type="password" minLength={12} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={isUz ? 'Yangi parol (kamida 12 belgi)' : 'Новый пароль (не менее 12 символов)'} className="w-full rounded-xl border bg-transparent p-3" />
        <input autoComplete="new-password" type="password" minLength={12} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={isUz ? 'Yangi parolni takrorlang' : 'Повторите новый пароль'} className="w-full rounded-xl border bg-transparent p-3" />
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-600 p-3 font-bold text-white disabled:opacity-50">{loading ? (isUz ? 'Saqlanmoqda…' : 'Сохранение…') : (isUz ? 'Saqlash' : 'Сохранить')}</button>
      </form>
    </div>
  );
}

// ------------------- CASHIER SWITCH MODAL (3-4 CASHIERS) -------------------
function CashierSwitchModal({ token, currentUserId, onClose, onSwitch, notify, t, lang }) {
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
        headers: token ? { Authorization: `Bearer ${token}` } : {}
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

  const handleSelect = async (event) => {
    event.preventDefault();
    if (!selectedCashier || !password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/switch-cashier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cashier_id: selectedCashier.id, password })
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
          {safeArray(cashiers).map((c) => {
            const isCurrent = (c.id === currentUserId || c.username === currentUserId);
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedCashier(c); setPassword(''); }}
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
                {selectedCashier?.id === c.id && (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    {lang === 'uz' ? 'Tanlandi' : 'Выбран'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedCashier && (
          <form onSubmit={handleSelect} className="mt-3 flex gap-2">
            <input autoFocus type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={lang === 'uz' ? 'Kassir paroli' : 'Пароль кассира'} className="min-w-0 flex-1 rounded-xl border bg-transparent p-3 text-sm" required />
            <button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 px-4 font-bold text-white disabled:opacity-50">{loading ? '…' : (lang === 'uz' ? 'Kirish' : 'Войти')}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ------------------- CAMERA BARCODE SCANNER MODAL (MULTI-TIER SCANNER) ------------
function CameraScannerModal({ onScan, onClose, notify, t, lang }) {
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

  const triggerSuccess = (code) => {
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
      try { navigator.vibrate([100, 50, 100]); } catch (e) {}
    }
    onScan(code.trim());
  };

  const inspectTrack = (track) => {
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
          try { tr.stop(); } catch (e) {}
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
          const desiredFormats = ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'];
          let supported = desiredFormats;
          if (window.BarcodeDetector.getSupportedFormats) {
            try {
              const avail = await window.BarcodeDetector.getSupportedFormats();
              supported = desiredFormats.filter(f => avail.includes(f));
            } catch (e) {}
          }
          nativeDetector = new window.BarcodeDetector({ formats: supported.length ? supported : ['qr_code'] });

          let stream = null;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: facingMode },
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 },
                advanced: [{ focusMode: 'continuous' }]
              },
              audio: false
            });
          } catch (resErr) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: facingMode,
                  advanced: [{ focusMode: 'continuous' }]
                },
                audio: false
              });
            } catch (e2) {
              stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode },
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
          const formats = window.Html5QrcodeSupportedFormats ? [
            window.Html5QrcodeSupportedFormats.EAN_13,
            window.Html5QrcodeSupportedFormats.EAN_8,
            window.Html5QrcodeSupportedFormats.CODE_128,
            window.Html5QrcodeSupportedFormats.CODE_39,
            window.Html5QrcodeSupportedFormats.UPC_A,
            window.Html5QrcodeSupportedFormats.UPC_E,
            window.Html5QrcodeSupportedFormats.QR_CODE
          ] : undefined;

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
            qrbox: { width: 300, height: 140 },
            aspectRatio: 1.333333
          };

          try {
            await html5Instance.start(
              {
                facingMode: facingMode,
                width: { min: 1280, ideal: 1920 },
                height: { min: 720, ideal: 1080 },
                advanced: [{ focusMode: 'continuous' }]
              },
              config,
              (decodedText) => triggerSuccess(decodedText),
              () => {}
            );
          } catch (strictErr) {
            await html5Instance.start(
              { facingMode: facingMode },
              config,
              (decodedText) => triggerSuccess(decodedText),
              () => {}
            );
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
        await activeTrackRef.current.applyConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
      } else if (html5QrRef.current && html5QrRef.current.applyVideoConstraints) {
        await html5QrRef.current.applyVideoConstraints({ advanced: [{ torch: next }] });
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
      await activeTrackRef.current.applyConstraints({ advanced: [{ zoom: nextZ }] });
      setZoomLevel(nextZ);
    } catch (e) {
      console.warn('Zoom error:', e);
    }
  };

  const flipCamera = () => {
    setTorchOn(false);
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoProcessing(true);

    try {
      // Step A: Native BarcodeDetector on image
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code']
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
          const tempScanner = html5QrRef.current || new window.Html5Qrcode('qr-reader-temp', { verbose: false });
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

      notify(
        lang === 'uz'
          ? "Shtrixkod rasmda aniqlanmadi. Iltimos yaqinroq va yorug'roq rasm oling yoki qo'lda kiriting."
          : "Штрихкод на фото не распознан. Сделайте фото ближе и четче или введите вручную.",
        'warn'
      );
    } catch (err) {
      console.error('Photo scan error:', err);
      notify(lang === 'uz' ? "Rasm skanerida xatolik" : "Ошибка обработки фото", 'error');
    } finally {
      setPhotoProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md p-4 text-white shadow-2xl relative overflow-hidden flex flex-col items-center max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <div>
              <div className="font-bold text-sm text-emerald-400">
                {lang === 'uz' ? 'Shtrixkod skaneri (EAN-13 / QR / 1D)' : 'Сканер штрихкодов (EAN-13 / QR / 1D)'}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${engineType === 'hardware' ? 'bg-emerald-400 animate-pulse' : engineType === 'html5' ? 'bg-blue-400' : 'bg-amber-400'}`}></span>
                {engineType === 'hardware'
                  ? (lang === 'uz' ? '⚡ Apparat tezlashuvi (Hardware AI)' : '⚡ Аппаратный AI сканер (60 FPS)')
                  : engineType === 'html5'
                  ? (lang === 'uz' ? '🎥 HD Video skaner' : '🎥 HD Видео сканер')
                  : (lang === 'uz' ? "Rasm yoki qo'lda kiritish" : 'Фото или ручной ввод')}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        {/* Viewfinder Camera Box */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-slate-800">
          {/* Native BarcodeDetector Video Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${engineType === 'hardware' ? 'block' : 'hidden'}`}
          />
          {/* Html5Qrcode Reader Container */}
          <div
            id="qr-reader"
            className={`w-full h-full ${engineType !== 'hardware' ? 'block' : 'hidden'}`}
          />

          {/* Hidden helper for Html5Qrcode scanFile fallback */}
          <div id="qr-reader-temp" style={{ display: 'none' }} />

          {/* Target Reticle (Horizontal Barcode Viewfinder) */}
          <div className="absolute inset-x-8 inset-y-12 border-2 border-emerald-400/90 rounded-2xl pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <div className="laser-line"></div>
            <div className="text-[10px] text-emerald-300 font-mono absolute bottom-2 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
              {lang === 'uz' ? "Shtrixkodni ramkaga to'g'rilang" : "Наведите штрихкод в рамку"}
            </div>
          </div>

          {/* Photo processing overlay */}
          {photoProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-20">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-emerald-300">
                {lang === 'uz' ? "Rasm tahlil qilinmoqda..." : "Распознавание штрихкода с фото..."}
              </span>
            </div>
          )}
        </div>

        {/* Quick Camera Controls: Torch, Zoom, Flip */}
        <div className="w-full flex items-center justify-between gap-1.5 mt-2.5">
          <button
            type="button"
            onClick={toggleTorch}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
              torchOn
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🔦</span>
            <span>{torchOn ? (lang === 'uz' ? "O'chirish" : 'Выкл свет') : (lang === 'uz' ? 'Fonar' : 'Вспышка')}</span>
          </button>

          {canZoom && (
            <button
              type="button"
              onClick={toggleZoom}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              <span>🔍</span>
              <span>{zoomLevel}x Zoom</span>
            </button>
          )}

          <button
            type="button"
            onClick={flipCamera}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            <span>🔄</span>
            <span>{lang === 'uz' ? 'Kamera' : 'Камера'}</span>
          </button>
        </div>

        {/* LEVEL 3: 📸 High-Definition Photo Snapshot Button */}
        <div className="w-full mt-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={photoProcessing}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 touch-target active:scale-[0.98]"
          >
            <span className="text-base">📸</span>
            <span>{lang === 'uz' ? "Shtrixkodni rasmga olish (100% aniqlik)" : "📸 Сделать фото штрихкода (100% четкость)"}</span>
          </button>
        </div>

        {/* LEVEL 4: Manual Barcode Input & Touch Numpad */}
        <div className="w-full mt-2.5 pt-2 border-t border-slate-800">
          <div className="flex gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualBarcode.trim()) {
                  e.preventDefault();
                  triggerSuccess(manualBarcode.trim());
                }
              }}
              placeholder={lang === 'uz' ? "Shtrixkod (raqamlarni yozing)..." : "Штрихкод вручную (цифры)..."}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => {
                if (manualBarcode.trim()) triggerSuccess(manualBarcode.trim());
              }}
              disabled={!manualBarcode.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold px-3 py-2 rounded-xl text-xs transition"
            >
              {lang === 'uz' ? "Kiritish" : "ОК"}
            </button>
            <button
              type="button"
              onClick={() => setShowNumpad(prev => !prev)}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition ${
                showNumpad
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Numpad"
            >
              🔢
            </button>
          </div>

          {/* Quick Touch Numpad */}
          {showNumpad && (
            <div className="grid grid-cols-3 gap-1.5 mt-2 p-2 bg-slate-950/80 rounded-xl border border-slate-800 animate-fadeIn">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00', '⌫'].map(btn => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => {
                    if (btn === '⌫') setManualBarcode(prev => prev.slice(0, -1));
                    else setManualBarcode(prev => prev + btn);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white font-bold font-mono py-2 rounded-lg text-sm transition touch-target"
                >
                  {btn}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------- CREATE / EDIT PRODUCT MODAL -------------------
function CreateProductModal({ token, initialBarcode = '', onClose, onSuccess, notify, t, lang }) {
  const [barcode, setBarcode] = useState(initialBarcode);
  const [noBarcode, setNoBarcode] = useState(false);

  const toggleNoBarcode = (enabled) => {
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
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/products/categories/all`, { headers });
      if (!res.ok) {
        setCategories([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.categories || data?.items || []);
      setCategories(list);
      if (list.length > 0 && !categoryId) {
        setCategoryId(list[0].id.toString());
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t.colBarcode}
              </label>
              <button
                type="button"
                onClick={() => toggleNoBarcode(!noBarcode)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                  noBarcode
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                📦 {lang === 'uz' ? "Shtrixkodsiz (Ichki kod)" : "Без штрихкода"}
              </button>
            </div>
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
                {(Array.isArray(categories) ? categories : (categories?.categories || [])).length === 0 ? (
                  <option value="">{lang === 'uz' ? "Kategoriya yo'q" : "Без категории"}</option>
                ) : (
                  (Array.isArray(categories) ? categories : (categories?.categories || [])).map((c) => (
                    <option key={c.id} value={c.id}>{c.name ? c.name.split('/')[0].trim() : c.name}</option>
                  ))
                )}
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
function VoiceDebtModal({ token, onClose, onSuccess, notify, t, lang: initialLang }) {
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
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      playAudioCue('listen');
      const rec = new SpeechRecognition();
      rec.lang = voiceLang === 'uz' ? 'uz-UZ' : 'ru-RU';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 3;
      setIsListening(true);

      rec.onresult = (event) => {
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

      rec.onerror = (event) => {
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
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [voiceLang]);

  const parseVoice = async (textToParse) => {
    const text = textToParse || speechText;
    if (!text || !text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/parse-debt-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ speech_text: text, language: voiceLang })
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
        if (!createRes.ok) throw new Error(created.detail || (voiceLang === 'uz' ? 'Qarzni saqlab bo‘lmadi' : 'Не удалось сохранить долг'));
        debtorId = created.id;
      } else {
        const addRes = await fetch(`${API_BASE}/debts/debtors/${debtorId}/add-debt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      notify(voiceLang === 'uz' ? `Qarz saqlandi: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})` : `Долг сохранен: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})`);
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-4 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[calc(100dvh-1.5rem)] flex flex-col">
        {/* Header with Language selector */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {voiceLang === 'uz' ? 'Ovozli qarz yozish (Haqqim.uz)' : 'Голосовая запись в тетрадь долгов'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {voiceLang === 'uz' ? 'Ism, summa, sabab va qaytarish muddati' : 'Имя, сумма, товар и срок возврата'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setVoiceLang('ru')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${voiceLang === 'ru' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setVoiceLang('uz')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${voiceLang === 'uz' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                UZ
              </button>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Pulsing Mic Control Card */}
          <div className="text-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="relative inline-block mb-2">
              {isListening && (
                <div className="absolute -inset-3 bg-emerald-500/30 rounded-full animate-ping pointer-events-none"></div>
              )}
              <button
                type="button"
                onClick={startListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition mx-auto shadow-lg touch-target ${
                  isListening
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white scale-105 shadow-emerald-500/40 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                🎙️
              </button>
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isListening
                ? (voiceLang === 'uz' ? 'Eshitilmoqda... gapiring' : 'Слушаю... говорите фразу')
                : (voiceLang === 'uz' ? 'Mikrofonni bosib gapiring' : 'Нажмите на микрофон и говорите')}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {voiceLang === 'uz'
                ? '«Alisher 50 ming nonga, dushanbagacha» yoki «Baxodir 120 000»'
                : '«Алишер 50 тысяч на хлеб, до пятницы» или «Запиши на Баходира 120 000»'}
            </div>
          </div>

          {/* Speech Textarea with manual edit */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {voiceLang === 'uz' ? 'Tanishilgan matn (tekshirish va tahrirlash):' : 'Распознанный текст (можно редактировать):'}
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={speechText}
                onChange={(e) => { setSpeechText(e.target.value); }}
                placeholder={voiceLang === 'uz' ? 'Masalan: Alisher 50 ming nonga, juma beradi' : 'Например: Алишер 50 тысяч на хлеб, вернет в пятницу'}
                className="w-full resize-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => parseVoice(speechText)}
                disabled={!speechText.trim() || loading}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 disabled:opacity-40 transition"
              >
                {loading ? '...' : (voiceLang === 'uz' ? '⚡ Matnni tahlil qilish' : '⚡ Разобрать фразу')}
              </button>
            </div>
          </div>

          {/* Parsed Result Card */}
          {parsedData && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2.5">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>✨</span>
                  <span>{voiceLang === 'uz' ? "Aniqlangan qarz ma'lumotlari:" : 'Распознанные данные:'}</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  parsedData.is_new_debtor
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                    : 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-200'
                }`}>
                  {parsedData.is_new_debtor
                    ? (voiceLang === 'uz' ? 'Yangi mijoz' : 'Новый клиент')
                    : (voiceLang === 'uz' ? 'Mavjud mijoz' : 'В базе')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                    {voiceLang === 'uz' ? 'Mijoz F.I.Sh. *' : 'Имя должника *'}
                  </label>
                  <input
                    type="text"
                    value={parsedData.debtor_name || ''}
                    onChange={(e) => setParsedData(prev => ({ ...prev, debtor_name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                    {voiceLang === 'uz' ? 'Summa (so‘m) *' : 'Сумма (сум) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={parsedData.amount || ''}
                    onChange={(e) => setParsedData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                    {voiceLang === 'uz' ? 'Qaytarish muddati:' : 'Срок возврата:'}
                  </label>
                  <input
                    type="text"
                    value={parsedData.due_date_label || parsedData.due_date || ''}
                    onChange={(e) => setParsedData(prev => ({ ...prev, due_date_label: e.target.value, due_date: e.target.value }))}
                    placeholder={voiceLang === 'uz' ? 'Ko‘rsatilmagan' : 'Не указан'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                    {voiceLang === 'uz' ? 'Izoh:' : 'Примечание:'}
                  </label>
                  <input
                    type="text"
                    value={parsedData.note || ''}
                    onChange={(e) => setParsedData(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition touch-target"
          >
            {t.cancelBtn || 'Bekor qilish'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!parsedData || !(Number(parsedData.amount) > 0) || loading}
            className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 disabled:opacity-40 transition touch-target flex items-center justify-center gap-1.5"
          >
            <span>💾</span>
            <span>{loading ? t.saving : (voiceLang === 'uz' ? 'Qarzni saqlash' : 'Сохранить долг')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- PAPER DEBT NOTEBOOK OCR MODAL ------------------------
async function enhanceOcrPhoto(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(2, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
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
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-enhanced.jpg', { type: 'image/jpeg' });
}

async function recognizeOcrPhoto(file) {
  if (!window.Tesseract) throw new Error('OCR library is not available');
  const worker = await window.Tesseract.createWorker('eng+rus');
  try {
    await worker.setParameters({ tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' });
    const original = await worker.recognize(file);
    const enhancedFile = await enhanceOcrPhoto(file);
    const enhanced = await worker.recognize(enhancedFile);
    const best = (enhanced.data.confidence || 0) >= (original.data.confidence || 0) ? enhanced : original;
    return { text: best.data.text || '', confidence: Math.round(best.data.confidence || 0) };
  } finally {
    await worker.terminate();
  }
}

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

  const parseText = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/parse-debt-ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ raw_text: text })
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

  const removeRow = (idx) => {
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: parsedRows.map(row => ({ debtor_id: row.matched_debtor_id || null, debtor_name: row.debtor_name.trim(), amount: Number(row.amount), note: row.note || null, due_date: row.due_date || null })) })
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

        <div className="flex flex-wrap items-center gap-2 mb-3">
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

        {ocrText && (
          <div className="mb-3 space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {lang === 'uz' ? 'Tanilgan matn — tekshiring va xohlasangiz tuzating:' : 'Распознанный текст — проверьте и при необходимости исправьте:'}
            </label>
            <textarea rows={3} value={ocrText} onChange={(e) => setOcrText(e.target.value)} className="w-full resize-y bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs leading-relaxed" />
            <button type="button" onClick={() => parseText(ocrText)} disabled={loading} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50">
              {lang === 'uz' ? 'Matnni qayta ajratish' : 'Повторно разобрать текст'}
            </button>
            <p className="text-[11px] text-amber-700 dark:text-amber-300">{lang === 'uz' ? 'Daftardagi yozuvni OCR xato o‘qishi mumkin. Saqlashdan oldin har bir ism va summani tekshiring.' : 'Распознавание рукописного текста может ошибаться. Перед сохранением проверьте каждое имя и сумму.'}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 min-h-0">
          {parsedRows.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6">
              {lang === 'uz' ? "Daftar sahifasini yorug‘ joyda, to‘g‘ri burchakdan suratga oling. OCR matnni ajratadi, saqlashdan oldin natijalarni tekshiring." : 'Сфотографируйте страницу при хорошем освещении и прямо сверху. OCR разберёт строки, а перед сохранением вы сможете проверить результат.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2">{lang === 'uz' ? 'Mijoz ismi' : 'Имя покупателя'}</th>
                  <th className="py-2">{lang === 'uz' ? "Summa (so'm)" : 'Сумма (сум)'}</th>
                  <th className="py-2">{lang === 'uz' ? 'Izoh' : 'Примечание'}</th>
                  <th className="py-2 text-right">{lang === 'uz' ? "O'chirish" : 'Удалить'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {safeArray(parsedRows).map((r, i) => (
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
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">{t.cancelBtn}</button>
          <button
            onClick={handleImportAll}
            disabled={parsedRows.length === 0 || loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
          >
            {loading ? t.saving : (lang === 'uz' ? `Tekshirilgan qarzlarni saqlash (${parsedRows.length})` : `Сохранить проверенные долги (${parsedRows.length})`)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- INVOICE PHOTO SCANNER MODAL (KIRIM) -------------------
function OcrInvoiceModal({ token, suppliers, catalogSample, onClose, onSuccess, notify, t, lang }) {
  const [supplierId, setSupplierId] = useState(suppliers.length > 0 ? suppliers[0].id : '');
  const [parsedItems, setParsedItems] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
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

  const parseInvoiceText = async (text) => {
    try {
      const res = await fetch(`${API_BASE}/ai/parse-invoice-ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ raw_text: text })
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
    const invalidItem = parsedItems.find(it => !(Number(it.quantity) > 0) || !(Number(it.purchase_price) >= 0) || (!it.matched_product_id && !it.product_name));
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {lang === 'uz' ? 'Faktura / Yuk xatini skanerlash' : 'Фото-сканер накладных (Kirim)'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'uz' ? "Kirim qog'ozini rasmga oling va tovarlarni omborga qabul qiling" : "Сфотографируйте накладную для автоматической приемки на склад"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-slate-500">{lang === 'uz' ? "Ta'minotchi:" : 'Поставщик:'}</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
            >
              <option value="">{lang === 'uz' ? "Ta'minotchini tanlang" : 'Выберите поставщика'}</option>
              {safeArray(suppliers).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow touch-target flex items-center gap-1.5"
          >
            <span>📷</span>
            <span>{lang === 'uz' ? 'Rasmga olish' : 'Сделать фото'}</span>
          </button>
        </div>

        {ocrText && (
          <div className="mb-3 space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{lang === 'uz' ? 'Tanilgan matn — tekshiring va tuzating:' : 'Распознанный текст — проверьте и исправьте:'}</label>
            <textarea rows={3} value={ocrText} onChange={(e) => setOcrText(e.target.value)} className="w-full resize-y bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs leading-relaxed font-mono" />
            <button type="button" onClick={() => parseInvoiceText(ocrText)} disabled={loading} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold disabled:opacity-50">{lang === 'uz' ? 'Matnni qayta ajratish' : 'Повторно разобрать текст'}</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
          {parsedItems.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6">
              {lang === 'uz' ? "Qog'oz faktura / yuk xatini rasmga oling. Tovar nomlari, soni va kirim narxlari avtomatik jadvalga olinadi." : 'Сфотографируйте бумажную накладную. Товары, количество и цены будут извлечены.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="py-2">{lang === 'uz' ? 'Tovar' : 'Товар'}</th>
                  <th className="py-2 text-right">{lang === 'uz' ? 'Miqdor' : 'Количество'}</th>
                  <th className="py-2 text-right">{lang === 'uz' ? 'Kirim narxi' : 'Цена закупки'}</th>
                  <th className="py-2 text-right">{lang === 'uz' ? 'Jami' : 'Итого'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {safeArray(parsedItems).map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 pr-2">
                      <select value={it.matched_product_id || ''} onChange={(e) => updateItem(idx, 'matched_product_id', e.target.value)} className={`w-full min-w-48 bg-slate-50 dark:bg-slate-800 border rounded-lg px-2 py-1.5 text-xs ${it.matched_product_id ? 'border-emerald-300 dark:border-emerald-700' : 'border-amber-400 dark:border-amber-600'}`}>
                        <option value="">{lang === 'uz' ? `Katalogdan tanlang (${it.product_name})` : `Выберите из каталога (${it.product_name})`}</option>
                        {safeArray(catalogSample).map(product => <option key={product.id} value={product.id}>{product.name} · {product.barcode}</option>)}
                      </select>
                      {!it.matched_product_id && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                          ✨ {lang === 'uz' ? `Yangi tovar sifatida qo'shiladi: "${it.product_name}"` : `Будет создан новый товар: "${it.product_name}"`}
                        </div>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-right font-mono"
                      />
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      <input
                        type="number"
                        value={it.purchase_price}
                        onChange={(e) => updateItem(idx, 'purchase_price', e.target.value)}
                        className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right"
                      />
                    </td>
                    <td className="py-1.5 font-bold font-mono text-emerald-600 text-right">{formatMoney(it.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">{t.cancelBtn}</button>
          <button
            onClick={handleSaveInvoice}
            disabled={parsedItems.length === 0 || loading || !supplierId}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition flex items-center gap-1.5 touch-target"
          >
            <span>📥</span>
            <span>{loading ? t.saving : (lang === 'uz' ? 'Omborga qabul qilish' : 'Принять на склад')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- VOICE ASSISTANT MODAL (POS & CASHIER) -------------------
function VoiceAssistantModal({ token, onClose, onAddToCart, onOpenScanner, onOpenCheckout, onClearCart, onOpenDebt, notify, t, lang: initialLang }) {
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
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      playAudioCue('listen');
      const rec = new SpeechRec();
      rec.lang = voiceLang === 'uz' ? 'uz-UZ' : 'ru-RU';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 3;

      setIsListening(true);
      setStatusMsg(voiceLang === 'uz' ? "Eshitilmoqda... gapiring" : "Слушаю... говорите");

      rec.onresult = (ev) => {
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

      rec.onerror = (e) => {
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
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [voiceLang]);

  const dispatchVoiceCommand = async (phrase) => {
    if (!phrase) return;
    setLoading(true);
    setStatusMsg(voiceLang === 'uz' ? "Buyruq bajarilmoqda..." : "Обработка команды...");
    try {
      const res = await fetch(`${API_BASE}/ai/voice-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ speech_text: phrase, language: voiceLang, context: 'pos' })
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col items-center text-center">
        {/* Header & Lang Selector */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setVoiceLang('ru')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${voiceLang === 'ru' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              🇷🇺 RU
            </button>
            <button
              type="button"
              onClick={() => setVoiceLang('uz')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${voiceLang === 'uz' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              🇺🇿 UZ
            </button>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg">✕</button>
        </div>

        {/* Pulsing Animated Mic Button */}
        <div className="relative my-3">
          {isListening && (
            <div className="absolute -inset-4 bg-emerald-500/30 rounded-full animate-ping pointer-events-none"></div>
          )}
          <button
            type="button"
            onClick={startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all duration-200 ${
              isListening
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white scale-105 shadow-emerald-500/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105'
            }`}
          >
            🎙️
          </button>
        </div>

        {/* Status text */}
        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2 mb-1">
          {isListening ? (voiceLang === 'uz' ? 'Eshitilmoqda... gapiring' : 'Слушаю... говорите') : (voiceLang === 'uz' ? 'Mikrofonni bosing' : 'Нажмите на микрофон')}
        </div>

        {/* Real-time transcribed text */}
        <div className="w-full min-h-[56px] max-h-24 overflow-y-auto bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 my-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
          {transcript || statusMsg}
        </div>

        {/* Quick Voice Hints */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          {voiceLang === 'uz'
            ? "Aytishingiz mumkin: «non 2 ta qo'sh», «kola 1», «to'lov», «skaner»"
            : 'Можно сказать: «добавь хлеб 2 штуки», «кола 1», «чек», «сканер»'}
        </div>

        <button
          type="button"
          onClick={() => {
            if (transcript.trim()) {
              dispatchVoiceCommand(transcript.trim());
            } else {
              onClose();
            }
          }}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition touch-target"
        >
          {transcript.trim() ? (voiceLang === 'uz' ? 'Bajarish' : 'Выполнить') : (voiceLang === 'uz' ? 'Yopish' : 'Закрыть')}
        </button>
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
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
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
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/products/categories/all`, { headers });
      if (!res.ok) {
        setCategories([]);
        return;
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : (data?.categories || data?.items || []));
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({ limit: '24' });
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory.toString());

      const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        setProducts([]);
        return;
      }
      const data = await res.json();
      setProducts(safeArray(data));
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  };

  const fetchQuickProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/quick`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const list = safeArray(data);
        if (list.length > 0) setQuickProducts(list);
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
      } else if (e.key === 'F3') {
        e.preventDefault();
        setVoiceAssistantOpen(true);
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
        playAudioCue('listen');
        setCreateProductOpen(code);
        notify(lang === 'uz' ? `Yangi shtrixkod (${code}). Tovarni kiriting` : `Новый штрихкод (${code}). Заполните данные товара`, 'info');
        setBarcodeQuery('');
        return;
      }
      const prod = await res.json();
      playAudioCue('add');
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
        items: safeArray(cart).map((i) => ({
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
          
          {/* Barcode and product search controls */}
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

            <div className="flex items-center gap-2">
              {/* Prominent Large Camera Scanner Button */}
              <button
                type="button"
                onClick={() => setScannerActive(true)}
                className="h-11 sm:h-12 px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-2xl text-sm sm:text-base shadow-lg shadow-emerald-600/30 active:scale-95 transition flex items-center justify-center gap-2 touch-target"
                title={lang === 'uz' ? "Kamera orqali shtrixkod skaneri" : "Сканер через камеру"}
              >
                <span className="text-xl">📷</span>
                <span className="font-extrabold">{lang === 'uz' ? "Skaner" : "Сканер"}</span>
              </button>
            </div>

            {/* Fast Product Search Input */}
            <div className="flex items-center gap-1 w-full sm:w-48">
              <input
                type="text"
                placeholder={t.searchProductPlaceholder || "Tovar nomi..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
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

            {showAllCatalog && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === null
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.allCategories || (lang === 'uz' ? "Barcha toifalar" : "Все категории")}
                </button>
                {(Array.isArray(categories) ? categories : (categories?.categories || [])).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name ? cat.name.split('/')[0].trim() : cat.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(safeArray(quickProducts).length > 0 ? safeArray(quickProducts) : QUICK_ITEMS).map((item) => (
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
                    {safeArray(cart).map((item, idx) => {
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
              {safeArray(parkedCarts).map((h) => (
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

      {/* Voice Assistant Modal */}
      {voiceAssistantOpen && (
        <VoiceAssistantModal
          token={token}
          onClose={() => setVoiceAssistantOpen(false)}
          onAddToCart={(prod, qty) => {
            addToCart(prod, qty);
            playAudioCue('add');
          }}
          onOpenScanner={() => setScannerActive(true)}
          onOpenCheckout={() => {
            if (cart.length > 0) setCheckoutModalOpen(true);
          }}
          onClearCart={clearCart}
          onOpenDebt={() => {
            if (cart.length > 0) handleDirectCheckout('DEBT');
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
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
  const [sortBy, setSortBy] = useState('overdue'); // 'overdue' | 'max_debt' | 'recent' | 'name'
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
      const params = new URLSearchParams({ limit: '150' });
      if (search) params.append('search', search);
      if (onlyWithDebt) params.append('only_with_debt', 'true');

      const res = await fetch(`${API_BASE}/debts/debtors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setDebtors([]);
        return;
      }
      const data = await res.json();
      setDebtors(safeArray(data));
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

  return (
    <div className="space-y-4">
      {/* Summary KPI Cards & Haqqim.uz Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.totalOutstandingDebt}</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
              -{summary ? formatMoney(summary.total_outstanding_debt) : '0 so\'m'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              haqqim.uz qarz daftari
            </div>
          </div>
          <span className="text-3xl">📓</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {lang === 'uz' ? "Qarzdor mijozlar soni:" : "Клиенты с задолженностью:"}
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 font-mono">
              {summary ? summary.active_debtors_with_debt : 0}{' '}
              <span className="text-xs font-normal text-slate-400">/ {summary ? summary.debtors_count : 0} mijoz</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Faol hisob-kitob
            </div>
          </div>
          <span className="text-3xl">👥</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm flex flex-col justify-center gap-2">
          <button
            onClick={() => setCreateDebtorModalOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-2xl shadow transition text-xs flex items-center justify-center gap-1.5 touch-target"
          >
            <span>➕</span>
            <span>{lang === 'uz' ? "Yangi mijoz qo'shish" : "Новый клиент"}</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setVoiceDebtOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl shadow transition text-[11px] flex items-center justify-center gap-1 touch-target"
              title="Ovozli qarz yozish"
            >
              <span>🎙️</span>
              <span>{lang === 'uz' ? "Ovozli qarz" : "Голосовой ввод"}</span>
            </button>
            <button
              onClick={() => setOcrDebtOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl shadow transition text-[11px] flex items-center justify-center gap-1 touch-target"
              title="Daftardan rasm olish"
            >
              <span>📸</span>
              <span>{lang === 'uz' ? "Daftar OCR" : "Фото тетради"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search, Sorting & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <input
            type="text"
            placeholder={lang === 'uz' ? "Ism yoki telefon bo'yicha qidiruv..." : "Поиск по имени или телефону..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => setOnlyWithDebt(!onlyWithDebt)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition border whitespace-nowrap ${
              onlyWithDebt
                ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'uz' ? "Faqat qarzi borlar" : "Только с долгом"}
          </button>
        </div>

        {/* Sorting selection */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
            {lang === 'uz' ? "Saralash:" : "Сортировка:"}
          </span>
          {[
            { id: 'overdue', label: lang === 'uz' ? "Muddati o'tganlar" : "Просроченные" },
            { id: 'max_debt', label: lang === 'uz' ? "Katta qarzlar" : "По сумме" },
            { id: 'recent', label: lang === 'uz' ? "Yangi" : "Свежие" },
            { id: 'name', label: lang === 'uz' ? "A-Z" : "Имя" }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                sortBy === s.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client Counter Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400">
          {lang === 'uz' ? `Mijozlar (${sortedDebtors.length})` : `Клиенты (${sortedDebtors.length})`}
        </h3>
      </div>

      {/* Redesigned Debtors Cards (Haqqim.uz style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedDebtors.map((debtor) => {
          const overdue = checkOverdueStatus(debtor.due_date, debtor.balance, lang);
          const hasDebt = Number(debtor.balance) > 0;

          return (
            <div
              key={debtor.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 ${
                overdue?.isOverdue
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Round Avatar with Initials */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 font-extrabold flex items-center justify-center text-sm font-mono shrink-0 shadow-inner">
                      {getInitials(debtor.full_name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        {debtor.full_name}
                      </h4>
                      {debtor.phone && (
                        <a
                          href={`tel:${debtor.phone}`}
                          className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 inline-flex items-center gap-1 hover:underline"
                        >
                          <span>📞</span>
                          <span>{debtor.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Overdue / Due Date Badge */}
                  <div>
                    {overdue ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${overdue.color}`}>
                        {overdue.badge}
                      </span>
                    ) : debtor.due_date ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        ⏳ {debtor.due_date}
                      </span>
                    ) : null}
                  </div>
                </div>

                {debtor.note && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl italic">
                    "{debtor.note}"
                  </div>
                )}

                {/* Prominent Debt Amount */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {lang === 'uz' ? "Haqqimiz (Qarz):" : "Сумма долга:"}
                    </span>
                    <span
                      className={`text-lg font-black font-mono tracking-tight ${
                        hasDebt ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {hasDebt ? '-' : ''}{formatMoney(debtor.balance)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">
                      {lang === 'uz' ? "Oxirgi o'zgarish:" : "Обновлено:"}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {formatRelativeDate(debtor.updated_at || debtor.created_at, lang) || (lang === 'uz' ? "Yaqinda" : "Недавно")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { setSelectedDebtor(debtor); setPayModalOpen(true); }}
                  className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold transition text-center touch-target"
                >
                  💵 {lang === 'uz' ? "To'lash" : "Оплата"}
                </button>
                <button
                  onClick={() => { setSelectedDebtor(debtor); setAddDebtModalOpen(true); }}
                  className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 py-2 rounded-xl text-xs font-bold transition text-center touch-target"
                >
                  ➕ {lang === 'uz' ? "Qarz yozish" : "Записать"}
                </button>
                <button
                  onClick={() => { setSelectedDebtor(debtor); setHistoryModalOpen(true); }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold transition text-center touch-target"
                >
                  📜 {lang === 'uz' ? "Tarix" : "История"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {payModalOpen && selectedDebtor && (
        <PayDebtModal
          token={token}
          lang={lang}
          debtor={selectedDebtor}
          onClose={() => setPayModalOpen(false)}
          onSuccess={() => {
            setPayModalOpen(false);
            fetchDebtors();
            fetchSummary();
            notify(lang === 'uz' ? "Qarz to'lovi qabul qilindi!" : "Оплата долга принята!");
          }}
          notify={notify}
          t={t}
        />
      )}

      {addDebtModalOpen && selectedDebtor && (
        <AddDebtModal
          token={token}
          lang={lang}
          debtor={selectedDebtor}
          onClose={() => setAddDebtModalOpen(false)}
          onSuccess={() => {
            setAddDebtModalOpen(false);
            fetchDebtors();
            fetchSummary();
            notify(lang === 'uz' ? "Yangi qarz yozildi!" : "Долг успешно записан!");
          }}
          notify={notify}
          t={t}
        />
      )}

      {historyModalOpen && selectedDebtor && (
        <DebtorHistoryModal
          token={token}
          debtor={selectedDebtor}
          onClose={() => setHistoryModalOpen(false)}
          notify={notify}
          t={t}
        />
      )}

      {createDebtorModalOpen && (
        <CreateDebtorModal
          token={token}
          lang={lang}
          onClose={() => setCreateDebtorModalOpen(false)}
          onSuccess={() => {
            setCreateDebtorModalOpen(false);
            fetchDebtors();
            fetchSummary();
            notify(lang === 'uz' ? "Yangi mijoz qo'shildi!" : "Клиент успешно добавлен!");
          }}
          notify={notify}
          t={t}
        />
      )}

      {voiceDebtOpen && (
        <VoiceDebtModal
          token={token}
          onClose={() => setVoiceDebtOpen(false)}
          onSuccess={() => {
            setVoiceDebtOpen(false);
            fetchDebtors();
            fetchSummary();
          }}
          notify={notify}
          t={t}
        />
      )}

      {ocrDebtOpen && (
        <OcrDebtModal
          token={token}
          onClose={() => setOcrDebtOpen(false)}
          onSuccess={() => {
            setOcrDebtOpen(false);
            fetchDebtors();
            fetchSummary();
          }}
          notify={notify}
          t={t}
        />
      )}
    </div>
  );
}

function CatalogScreen({ token, notify, isOwner, t, lang: propLang }) {
  const lang = propLang || (typeof window !== "undefined" && window.pos_lang) || (typeof localStorage !== "undefined" && localStorage.getItem("pos_lang")) || "uz";
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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

  const deleteProduct = async (p) => {
    const confirmMsg = lang === 'uz'
      ? `Rostdan ham "${p.name}" tovarini o'chirmoqchimisiz?`
      : `Действительно удалить товар "${p.name}"?`;
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch(`${API_BASE}/products/${p.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'O\'chirishda xatolik');
      }
      notify(lang === 'uz' ? `"${p.name}" muvaffaqiyatli o'chirildi` : `Товар "${p.name}" удален`);
      fetchProducts();
    } catch (e) {
      notify(e.message, 'error');
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
            <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
              {total} SKU
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'uz' ? "Shtrixkodlar, tovar narxlari va qoldiq monitoringi" : "Штрихкоды, цены и управление складскими остатками"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
          <button
            onClick={() => setCreateProductOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 touch-target whitespace-nowrap"
          >
            <span>➕</span>
            <span>{lang === 'uz' ? 'Yangi tovar' : 'Новый товар'}</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-200">
        {/* Mobile Product Cards (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {safeArray(products).map((p) => (
            <div key={p.id} className="p-3.5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    🏷️ {p.barcode} • {p.category_name}
                  </div>
                </div>
                <div>
                  {p.is_low_stock ? (
                    <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                      {t.statusOrderMore}
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
                      {t.statusInNorm}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">{t.colStock}</span>
                  <span className={`font-mono font-bold ${p.is_low_stock ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {p.stock_quantity} {p.unit}
                  </span>
                </div>
                {isOwner && (
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">{t.colPurchasePrice}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{formatMoney(p.purchase_price)}</span>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">{t.colSalePrice}</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatMoney(p.sale_price)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setEditingProduct(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
                >
                  <span>✏️</span>
                  <span>{lang === 'uz' ? 'Tahrirlash' : 'Редактировать'}</span>
                </button>
                <button
                  onClick={() => deleteProduct(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition flex items-center gap-1"
                >
                  <span>🗑️</span>
                  <span>{lang === 'uz' ? "O'chirish" : 'Удалить'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
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
                <th className="px-4 py-3 text-center">{lang === 'uz' ? 'Amallar' : 'Действия'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {safeArray(products).map((p) => (
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
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
                        title={lang === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteProduct(p)}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg text-rose-600 dark:text-rose-400 transition"
                        title={lang === 'uz' ? "O'chirish" : 'Удалить'}
                      >
                        🗑️
                      </button>
                    </div>
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

      {/* Modals */}
      {createProductOpen && (
        <CreateProductModal
          token={token}
          onClose={() => setCreateProductOpen(false)}
          onSuccess={() => {
            setCreateProductOpen(false);
            fetchProducts();
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}

      {editingProduct && (
        <EditProductModal
          token={token}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            fetchProducts();
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}
    </div>
  );
}

function SuppliersScreen({ token, notify, t }) {
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'invoices'
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [catalogSample, setCatalogSample] = useState([]);
  const [createSupplierModalOpen, setCreateSupplierModalOpen] = useState(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [payInvoiceModalOpen, setPayInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ocrInvoiceOpen, setOcrInvoiceOpen] = useState(false);
  const [reconciliationSupplier, setReconciliationSupplier] = useState(null);
  const [searchSupplier, setSearchSupplier] = useState('');
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
      if (!res.ok) {
        setSuppliers([]);
        return;
      }
      const data = await res.json();
      setSuppliers(safeArray(data));
    } catch (e) {
      console.error(e);
      setSuppliers([]);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setInvoices([]);
        return;
      }
      const data = await res.json();
      setInvoices(safeArray(data));
    } catch (e) {
      console.error(e);
      setInvoices([]);
    }
  };

  const fetchCatalogSample = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?limit=2000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setCatalogSample([]);
        return;
      }
      const data = await res.json();
      setCatalogSample(safeArray(data));
    } catch (e) {
      console.error(e);
      setCatalogSample([]);
    }
  };

  const filteredSuppliers = safeArray(suppliers).filter(s => {
    if (!searchSupplier.trim()) return true;
    const q = searchSupplier.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || (s.phone || '').includes(q) || (s.contact_person || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Top Actions & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🚚</span>
            <span>{t.suppliersTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'uz' ? "Tovarlarni qabul qilish, omborni to'ldirish va hisob-kitob" : 'Приёмка товаров, пополнение склада и расчёты'}
          </p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'suppliers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            🏢 {lang === 'uz' ? "Ta'minotchilar" : 'Поставщики'} ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'invoices'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📦 {lang === 'uz' ? 'Kirim fakturalari' : 'Накладные'} ({invoices.length})
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCreateSupplierModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            {t.addSupplierBtn}
          </button>
          <button
            onClick={() => setOcrInvoiceOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 touch-target"
          >
            <span>📸</span>
            <span>{t.scanInvoiceBtn || "Faktura OCR"}</span>
          </button>
          <button
            onClick={() => setCreateInvoiceModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md"
          >
            {t.addInvoiceBtn}
          </button>
        </div>
      </div>

      {/* TAB 1: SUPPLIERS LIST / CARDS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={lang === 'uz' ? "Ta'minotchi nomi yoki telefon..." : "Поиск по имени или телефону..."}
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
              className="w-full md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSuppliers.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm font-mono shrink-0">
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.name}</h3>
                        {s.contact_person && (
                          <div className="text-[11px] text-slate-400">{s.contact_person}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      {s.current_debt > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          {lang === 'uz' ? 'Qarz bor' : 'Задолженность'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          {lang === 'uz' ? "Qarz yo'q" : 'Расчёт закрыт'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone link */}
                  <div className="mt-2 text-xs">
                    {s.phone ? (
                      <a
                        href={`tel:${s.phone}`}
                        className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                        title={lang === 'uz' ? "Qo'ng'iroq qilish" : "Позвонить"}
                      >
                        <span>📞</span>
                        <span>{s.phone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px]">{lang === 'uz' ? 'Telefon kiritilmagan' : 'Телефон не указан'}</span>
                    )}
                  </div>

                  {/* Debt amount */}
                  <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">
                      {lang === 'uz' ? "Ta'minotchi oldidagi qarz:" : 'Долг перед поставщиком:'}
                    </div>
                    <div className={`text-base font-black font-mono mt-0.5 ${s.current_debt > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {formatMoney(s.current_debt || 0)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{lang === 'uz' ? 'Oxirgi yetkazish:' : 'Поставка:'} {s.last_delivery_date ? formatRelativeDate(s.last_delivery_date, lang) : (lang === 'uz' ? "Mavjud emas" : "Нет")}</span>
                      <span>{s.invoices_count || 0} {lang === 'uz' ? 'faktura' : 'накладных'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setReconciliationSupplier(s)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <span>🧾</span>
                    <span>{lang === 'uz' ? 'Sverka akti' : 'Акт сверки'}</span>
                  </button>
                  <button
                    onClick={() => setCreateInvoiceModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1"
                    title={lang === 'uz' ? 'Yangi kirim qilish' : 'Принять накладную'}
                  >
                    <span>➕</span>
                    <span>{lang === 'uz' ? 'Kirim' : 'Прием'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES LIST */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {/* Mobile Invoice Cards (< 768px) */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {safeArray(invoices).map((inv) => (
              <div key={inv.id} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      📦 № {inv.invoice_number}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                      {inv.supplier_name}
                    </div>
                  </div>
                  <div>
                    {inv.debt_to_supplier > 0 ? (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {t.statusHasDebt || "Qarz bor"}
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {t.statusFullyPaid || "To'langan"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-center font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t.totalToPay}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatMoney(inv.total_amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t.paidAmountLabel}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(inv.paid_amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t.debtToSupplierLabel}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{formatMoney(inv.debt_to_supplier)}</span>
                  </div>
                </div>
                {inv.debt_to_supplier > 0 && (
                  <button
                    onClick={() => { setSelectedInvoice(inv); setPayInvoiceModalOpen(true); }}
                    className="w-full mt-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
                  >
                    💵 {t.payInvoiceBtn}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">{t.invoiceNumberLabel}</th>
                  <th className="px-4 py-3">{t.supplierNameLabel}</th>
                  <th className="px-4 py-3 text-right">{t.totalToPay}</th>
                  <th className="px-4 py-3 text-right">{t.paidAmountLabel}</th>
                  <th className="px-4 py-3 text-right">{t.debtToSupplierLabel}</th>
                  <th className="px-4 py-3 text-center">{t.colStatus}</th>
                  <th className="px-4 py-3 text-center">{t.colActions || (lang === 'uz' ? 'Amal' : 'Действие')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {safeArray(invoices).map((inv) => (
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
      )}

      {/* Modals */}
      {createSupplierModalOpen && (
        <CreateSupplierModal
          token={token}
          lang={lang}
          onClose={() => setCreateSupplierModalOpen(false)}
          onSuccess={() => {
            setCreateSupplierModalOpen(false);
            fetchSuppliers();
            notify(lang === 'uz' ? "Yetkazib beruvchi qo'shildi" : 'Поставщик добавлен');
          }}
          notify={notify}
          t={t}
        />
      )}

      {ocrInvoiceOpen && (
        <OcrInvoiceModal
          token={token}
          suppliers={suppliers}
          catalogSample={catalogSample}
          onClose={() => setOcrInvoiceOpen(false)}
          onSuccess={() => {
            setOcrInvoiceOpen(false);
            fetchInvoices();
            fetchSuppliers();
            notify(lang === 'uz' ? 'Nakladnaya omborga qabul qilindi' : 'Накладная принята на склад');
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}

      {createInvoiceModalOpen && (
        <CreateInvoiceModal
          token={token}
          lang={lang}
          suppliers={suppliers}
          catalogSample={catalogSample}
          onClose={() => setCreateInvoiceModalOpen(false)}
          onSuccess={() => {
            setCreateInvoiceModalOpen(false);
            fetchInvoices();
            fetchSuppliers();
            notify(lang === 'uz' ? 'Yuk xati qabul qilindi va ombor yangilandi' : 'Накладная принята, остатки обновлены');
          }}
          notify={notify}
          t={t}
        />
      )}

      {payInvoiceModalOpen && selectedInvoice && (
        <PayInvoiceModal
          token={token}
          lang={lang}
          invoice={selectedInvoice}
          onClose={() => setPayInvoiceModalOpen(false)}
          onSuccess={() => {
            setPayInvoiceModalOpen(false);
            fetchInvoices();
            fetchSuppliers();
            notify(lang === 'uz' ? "Ta'minotchiga to'lov saqlandi" : 'Оплата поставщику сохранена');
          }}
          notify={notify}
          t={t}
        />
      )}

      {reconciliationSupplier && (
        <SupplierReconciliationModal
          token={token}
          supplierId={reconciliationSupplier.id}
          onClose={() => setReconciliationSupplier(null)}
          notify={notify}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
}

function ExpensesScreen({ token, notify, t }) {
  const lang = (typeof window !== 'undefined' && window.pos_lang) || (typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang')) || 'uz';
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
      if (!res.ok) {
        setExpenses([]);
        return;
      }
      const data = await res.json();
      setExpenses(safeArray(data));
    } catch (e) {
      console.error(e);
      setExpenses([]);
    }
  };

  const fetchCatalogSample = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setCatalogSample([]);
        return;
      }
      const data = await res.json();
      setCatalogSample(safeArray(data));
    } catch (e) {
      console.error(e);
      setCatalogSample([]);
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
            {lang === 'ru' ? 'Аренда, зарплата, коммунальные услуги и списание испорченных товаров' : 'Ijara, maosh, kommunal xizmatlar va yaroqsiz tovarlarni hisobdan chiqarish'}
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
        {/* Mobile Expenses Cards (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {safeArray(expenses).map((exp) => (
            <div key={exp.id} className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {expenseCategoryName(exp.category, lang)}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(exp.expense_date).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {exp.description}
                {exp.product_name && (
                  <span className="block text-[11px] text-rose-500 font-mono mt-0.5">
                    ⚠️ {lang === 'ru' ? 'Товар' : 'Mahsulot'}: {exp.product_name} ({exp.spoilage_quantity} {lang === 'ru' ? 'шт. списано' : 'dona hisobdan chiqarildi'})
                  </span>
                )}
              </div>
              <div className="text-right font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                -{formatMoney(exp.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t.dateLabel}</th>
                <th className="px-4 py-3">{t.expenseCategoryLabel}</th>
                <th className="px-4 py-3">{t.expenseDescLabel}</th>
                <th className="px-4 py-3 text-right">{lang === 'ru' ? 'Сумма' : 'Summa'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {safeArray(expenses).map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(exp.expense_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 font-semibold">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {expenseCategoryName(exp.category, lang)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium">
                    {exp.description}
                    {exp.product_name && (
                      <span className="block text-[11px] text-rose-500 font-mono">
                        ⚠️ {lang === 'ru' ? 'Товар' : 'Mahsulot'}: {exp.product_name} ({exp.spoilage_quantity} {lang === 'ru' ? 'шт. списано' : 'dona hisobdan chiqarildi'})
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
          lang={lang}
          catalogSample={catalogSample}
          isSpoilage={isSpoilageMode}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchExpenses();
            notify(lang === 'ru' ? 'Расход сохранён' : 'Xarajat muvaffaqiyatli qayd etildi');
          }}
          notify={notify}
          t={t}
          lang={lang}
        />
      )}
    </div>
  );
}

// ------------------- CREATE EXPENSE MODAL -------------------
function CreateExpenseModal({ token, catalogSample, isSpoilage, onClose, onSuccess, notify, t, lang }) {
  const [category, setCategory] = useState(isSpoilage ? 'SPOILAGE' : 'RENT');
  const [amount, setAmount] = useState(isSpoilage ? '' : 500000);
  const [description, setDescription] = useState(isSpoilage ? (lang === 'ru' ? 'Товар с истёкшим сроком годности' : 'Yaroqlilik muddati o\'tgan mahsulot') : (lang === 'ru' ? 'Текущие расходы' : 'Oylik xarajat'));
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
                {['RENT', 'UTILITIES', 'SALARY', 'TAXES', 'TRANSPORT', 'OTHER'].map((value) => <option key={value} value={value}>{expenseCategoryName(value, lang)}</option>)}
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
                  {safeArray(catalogSample).map((p) => (
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
              {t.expenseAmountLabel} {isSpoilage && (lang === 'ru' ? '(необязательно, рассчитывается по себестоимости)' : '(ixtiyoriy, tannarxdan avtomatik hisoblanadi)')}
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
  const lang = (typeof window !== 'undefined' && window.pos_lang) || (typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang')) || 'uz';
  const [period, setPeriod] = useState('today');
  const [selectedDate, setSelectedDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingDayDetails, setViewingDayDetails] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [period, selectedDate]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const url = selectedDate
        ? `${API_BASE}/analytics/dashboard?period=custom&date=${selectedDate}`
        : `${API_BASE}/analytics/dashboard?period=${period}`;
      const res = await fetch(url, {
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

  const handlePeriodChange = (newPeriod) => {
    setSelectedDate('');
    setPeriod(newPeriod);
  };

  return (
    <div className="space-y-4">
      {/* Period Toggles & Date Picker Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
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
                onClick={() => handlePeriodChange(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  period === item.id && !selectedDate
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 shadow-inner">
          <span className="text-xs">📅</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {lang === 'uz' ? 'Kunni tanlash:' : 'Выбрать дату:'}
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-rose-500 hover:text-rose-700 font-bold ml-1 px-1 rounded"
              title={lang === 'uz' ? 'Tozalash' : 'Сбросить дату'}
            >
              ✕
            </button>
          )}
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
              <div className="text-[11px] text-slate-400 mt-1">{t.cogsDesc || (lang === 'uz' ? "Sotilgan tovarlar tannarxi" : "Себестоимость проданных товаров")}</div>
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
                {lang === 'uz' ? 'Xarajatlar ayirilgandan so‘ng' : 'После вычета расходов'}
              </div>
            </div>
          </div>

          {/* Interactive Daily Breakdown (for Week and Month periods) */}
          {!selectedDate && (period === 'week' || period === 'month') && data.daily_breakdown && data.daily_breakdown.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>📅</span>
                  <span>{lang === 'uz' ? "Kunlik srez va taqvim (Har bir kun bo'yicha hisobot)" : 'Разбивка по дням (кликните на день для полного среза)'}</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {lang === 'uz' ? 'Kunni tanlang' : 'Нажмите для деталей дня'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {safeArray(data.daily_breakdown).map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setViewingDayDetails(day.date)}
                    className="p-3 rounded-2xl border text-left transition hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between bg-slate-50 hover:bg-emerald-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 group shadow-sm"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition">
                        {day.date}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {day.sales_count} {lang === 'uz' ? 'ta chek' : 'чеков'}
                      </div>
                    </div>
                    <div className="mt-2.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatMoney(day.revenue)}
                      </div>
                      <div className={`text-[10px] font-mono mt-0.5 font-semibold ${day.net_profit >= 0 ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500'}`}>
                        {day.net_profit >= 0 ? '+' : ''}{formatMoney(day.net_profit)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                {Object.entries(data?.expenses_by_category || {}).length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4">{lang === 'uz' ? 'Xarajatlar mavjud emas' : 'Расходов пока нет'}</div>
                ) : (
                  Object.entries(data?.expenses_by_category || {}).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{expenseCategoryName(cat, lang)}</span>
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
                {safeArray(data?.top_selling_products).map((item, idx) => (
                  <div key={item.product_id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-xs text-slate-800 dark:text-slate-200">{item.name}</span>
                    </div>
                    <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {item.quantity_sold} {lang === 'uz' ? 'dona' : 'шт.'} • {formatMoney(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Day Details Modal */}
      {viewingDayDetails && (
        <DayDetailsModal
          dateStr={viewingDayDetails}
          token={token}
          onClose={() => setViewingDayDetails(null)}
          notify={notify}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
}

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
