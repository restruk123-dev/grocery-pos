const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;
const API_BASE = '/api/v1';

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
      notify(lang === 'uz' ? "Ilova smartfonga o'rnatildi!" : "Приложение успешно установлено!");
    }
    setDeferredPrompt(null);
  };
  const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;

  // Multilingual quick items (popular & weight items for 1-click add to cart)
  const quickItems = {
    uz: {
      bread: {
        name: "Tandir nona",
        barcode: "20000101001",
        price: 5000,
        unit: "dona"
      },
      tandyr_lepeshka: {
        name: "Тандыр лепешка",
        barcode: "20000101002",
        price: 3000,
        unit: "dona"
      },
      sugar: {
        name: "Сахар",
        barcode: "20000101003",
        price: 8000,
        unit: "kg"
      },
      potatoes: {
        name: "Картофель",
        barcode: "20000101004",
        price: 4000,
        unit: "kg"
      },
      onions: {
        name: "Лук",
        barcode: "20000101005",
        price: 3500,
        unit: "kg"
      },
      eggs: {
        name: "Яйца",
        barcode: "20000101006",
        price: 12000,
        unit: "dona"
      }
    },
    oz: {
      bread: {
        name: "Bread",
        barcode: "20000101001",
        price: 5000,
        unit: "dona"
      },
      tandyr_lepeshka: {
        name: "Tandyr Lavash",
        barcode: "20000101002",
        price: 3000,
        unit: "dona"
      },
      sugar: {
        name: "Sugar",
        barcode: "20000101003",
        price: 8000,
        unit: "kg"
      },
      potatoes: {
        name: "Potatoes",
        barcode: "20000101004",
        price: 4000,
        unit: "kg"
      },
      onions: {
        name: "Onions",
        barcode: "20000101005",
        price: 3500,
        unit: "kg"
      },
      eggs: {
        name: "Eggs",
        barcode: "20000101006",
        price: 12000,
        unit: "dona"
      }
    }
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
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  const toggleLang = () => {
    setLang(prev => prev === 'uz' ? 'ru' : 'uz');
  };
  const notify = (message, type = 'success') => {
    setNotification({
      message,
      type
    });
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
    return /*#__PURE__*/React.createElement(LoginScreen, {
      onLogin: handleLogin,
      notify: notify,
      t: t,
      theme: theme,
      toggleTheme: toggleTheme,
      lang: lang,
      toggleLang: toggleLang
    });
  }
  const isOwner = user.role === 'owner';
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200"
  }, notification && /*#__PURE__*/React.createElement("div", {
    className: `fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border text-sm font-semibold transition-all duration-300 ${notification.type === 'error' ? 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950/90 dark:border-rose-600 dark:text-rose-200' : 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-600 dark:text-emerald-200'}`
  }, /*#__PURE__*/React.createElement("span", null, notification.type === 'error' ? '⚠️' : '✅'), /*#__PURE__*/React.createElement("span", null, notification.message)), networkModalOpen && /*#__PURE__*/React.createElement(NetworkQrModal, {
    onClose: () => setNetworkModalOpen(false),
    t: t
  }), testSendOpen && /*#__PURE__*/React.createElement(TestSendModal, {
    onClose: () => setTestSendOpen(false),
    t: t
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
  }), zReportOpen && /*#__PURE__*/React.createElement(ZReportModal, {
    onClose: () => setZReportOpen(false),
    t: t
  }), /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-header-top max-w-7xl mx-auto flex items-center justify-between gap-2 px-3 py-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-header-identity flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "🛒"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400"
  }, t.appName), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCashierSwitchOpen(true),
    className: "text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 hover:bg-emerald-200 transition",
    title: lang === 'uz' ? "Smenani almashtirish (1-bosish)" : "Быстрая смена кассира"
  }, /*#__PURE__*/React.createElement("span", null, "👤 ", user ? user.full_name.split(' ')[0] : 'Kassir'), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px]"
  }, "🔄")))), /*#__PURE__*/React.createElement("div", {
    className: "app-header-actions flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPasswordChangeOpen(true),
    className: "p-1.5 rounded-xl text-xs bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    title: lang === 'uz' ? 'Parolni almashtirish' : 'Сменить пароль',
    "aria-label": lang === 'uz' ? 'Parolni almashtirish' : 'Сменить пароль'
  }, /*#__PURE__*/React.createElement("span", null, "🔑")), canInstall && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleInstallApp,
    className: "px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow flex items-center gap-1 transition animate-bounce",
    title: lang === 'uz' ? "Ilovani smartfoningizga o'rnatish" : "Установить на рабочий стол"
  }, /*#__PURE__*/React.createElement("span", null, "📲"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, lang === 'uz' ? "O'rnatish" : "Установить")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setNetworkModalOpen(true),
    className: "p-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 transition shadow-sm",
    title: "Mobil telefon orqali ochish"
  }, /*#__PURE__*/React.createElement("span", null, "📱")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggleLang,
    className: "px-2 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 transition"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? '🇺🇿 UZ' : '🇷🇺 RU')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: toggleTheme,
    className: "p-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("span", null, theme === 'dark' ? '☀️' : '🌙')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleLogout,
    className: "p-1.5 rounded-xl text-xs bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    title: t.logout
  }, /*#__PURE__*/React.createElement("span", null, "🚪")))), /*#__PURE__*/React.createElement("div", {
    className: "border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 bg-slate-50/80 dark:bg-slate-900/80"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "app-tab-nav max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar py-0.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('pos'),
    className: `px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${activeTab === 'pos' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`
  }, t.tabPos), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('debts'),
    className: `px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${activeTab === 'debts' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`
  }, t.tabDebts), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('catalog'),
    className: `px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${activeTab === 'catalog' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`
  }, t.tabCatalog), isOwner && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('suppliers'),
    className: `px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${activeTab === 'suppliers' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`
  }, t.tabSuppliers), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('expenses'),
    className: `px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${activeTab === 'expenses' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`
  }, t.tabExpenses), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('analytics'),
    className: `px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap touch-target ${activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`
  }, t.tabAnalytics))))), !pwaBannerDismissed && /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-3 py-2 text-xs flex items-center justify-between shadow-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 max-w-4xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-base"
  }, "📲"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "font-bold mr-1"
  }, t.pwaBannerTitle || "Ilovani to'liq ekranga o'rnatish:"), /*#__PURE__*/React.createElement("span", {
    className: "opacity-95"
  }, t.pwaBannerDesc || "Brauzer manzil qatorisiz ishlash uchun brauzer menyusida (3 nuqta) «Bosh ekranga qo'shish» tugmasini bosing."))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setPwaBannerDismissed(true);
      try {
        localStorage.setItem('pwa_banner_dismissed', 'true');
      } catch (e) {}
    },
    className: "ml-2 bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-0.5 rounded-lg text-[11px] whitespace-nowrap transition"
  }, "✕ ", t.pwaBannerClose || "Tushunarli")), /*#__PURE__*/React.createElement("main", {
    className: "app-main-content flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4"
  }, activeTab === 'pos' && /*#__PURE__*/React.createElement(PosScreen, {
    token: token,
    notify: notify,
    isOwner: isOwner,
    t: t,
    lang: lang,
    setLang: setLang,
    toggleLang: toggleLang
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
  }), activeTab === 'suppliers' && isOwner && /*#__PURE__*/React.createElement(SuppliersScreen, {
    token: token,
    notify: notify,
    t: t,
    lang: lang
  }), activeTab === 'expenses' && isOwner && /*#__PURE__*/React.createElement(ExpensesScreen, {
    token: token,
    notify: notify,
    t: t
  }), activeTab === 'analytics' && isOwner && /*#__PURE__*/React.createElement(AnalyticsScreen, {
    token: token,
    notify: notify,
    t: t
  })));
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
    className: "min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: toggleLang,
    className: "px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
  }, lang === 'uz' ? "🇺🇿 O'zbek" : '🇷🇺 Русский'), /*#__PURE__*/React.createElement("button", {
    onClick: toggleTheme,
    className: "p-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
  }, theme === 'dark' ? '☀️' : '🌙')), /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-5xl mb-2"
  }, "🛒"), /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-black text-emerald-600 dark:text-emerald-400"
  }, t.loginTitle), /*#__PURE__*/React.createElement("p", {
    className: "text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1"
  }, t.loginSubtitle)), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      submit();
    },
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
  }, t.usernameLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: username,
    onChange: e => setUsername(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition text-sm",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
  }, t.passwordLabel), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition text-sm",
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition touch-target text-sm"
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

// ------------------- TELEGRAM MODALS -------------------

function TestSendModal({
  onClose,
  t
}) {
  const [customMessage, setCustomMessage] = useState('');
  const handleSend = async e => {
    e.preventDefault();
    try {
      const message = customMessage || '🧪 Test xabari: GroceryStore POS / Test from GroceryStore POS';
      await fetch('/api/v1/telegram/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message
        })
      });
      notify('Test xabari yuborildi!');
      setTestSendOpen(false);
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSend,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-3"
  }, "🧪 Test xabari"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400 mb-4"
  }, "Xabaringizni kiriting / Enter your message"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("textarea", {
    value: customMessage,
    onChange: e => setCustomMessage(e.target.value),
    placeholder: "Xabar matni...",
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 resize-none py-3",
    rows: 3,
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold"
  }, "Bekor qilish / Cancel"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow"
  }, "Yuborish / Send"))));
}
function ZReportModal({
  onClose,
  t
}) {
  const [loading, setLoading] = useState(false);
  const handleSend = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/v1/telegram/z-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSend,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-3"
  }, "📊 Z-gesi"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400 mb-4"
  }, "Kutilgina yaxlit Z-gesini yuborish"), /*#__PURE__*/React.createElement("div", {
    className: "mt-3"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition"
  }, loading ? 'Yuborilmoqda...' : 'Yuborish'))));
}
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
          const desiredFormats = ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'];
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
          const formats = window.Html5QrcodeSupportedFormats ? [window.Html5QrcodeSupportedFormats.EAN_13, window.Html5QrcodeSupportedFormats.EAN_8, window.Html5QrcodeSupportedFormats.CODE_128, window.Html5QrcodeSupportedFormats.CODE_39, window.Html5QrcodeSupportedFormats.UPC_A, window.Html5QrcodeSupportedFormats.UPC_E, window.Html5QrcodeSupportedFormats.QR_CODE] : undefined;
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
  }, lang === 'uz' ? 'Shtrixkod skaneri (EAN-13 / QR / 1D)' : 'Сканер штрихкодов (EAN-13 / QR / 1D)'), /*#__PURE__*/React.createElement("div", {
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
  onClose,
  onSuccess,
  notify,
  t,
  lang
}) {
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
  const submit = async e => {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "➕"), /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, t.addProductTitle || "Yangi tovar qo'shish")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "flex-1 overflow-y-auto space-y-3 pr-1"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.barcodeLabel || "Shtrixkod *"), /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("span", null, "📷"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, lang === 'uz' ? "Kamera" : "Скан")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
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
    className: `px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${voiceActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'}`,
    title: "Ovoz bilan aytish"
  }, /*#__PURE__*/React.createElement("span", null, "🎙️")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.categoryLabel || "Kategoriya"), /*#__PURE__*/React.createElement("select", {
    value: categoryId,
    onChange: e => setCategoryId(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium"
  }, (Array.isArray(categories) ? categories : categories?.categories || []).length === 0 ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, lang === 'uz' ? "Kategoriya yo'q" : "Без категории") : (Array.isArray(categories) ? categories : categories?.categories || []).map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name ? c.name.split('/')[0].trim() : c.name)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.unitLabel || "Birlik"), /*#__PURE__*/React.createElement("select", {
    value: unit,
    onChange: e => setUnit(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium"
  }, /*#__PURE__*/React.createElement("option", {
    value: "dona"
  }, "dona (шт)"), /*#__PURE__*/React.createElement("option", {
    value: "kg"
  }, "kg (кг)"), /*#__PURE__*/React.createElement("option", {
    value: "l"
  }, "l (литр)"), /*#__PURE__*/React.createElement("option", {
    value: "quti"
  }, "quti (пачка/коробка)"), /*#__PURE__*/React.createElement("option", {
    value: "metr"
  }, "metr (метр)")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.purchasePriceLabel || "Kirim narxi (so'm)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "4000",
    value: purchasePrice,
    onChange: e => setPurchasePrice(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.salePriceLabel || "Sotish narxi (so'm) *"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "5500",
    value: salePrice,
    onChange: e => setSalePrice(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2 items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.stockQtyLabel || "Boshlang'ich qoldiq"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: stockQuantity,
    onChange: e => setStockQuantity(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
  })), /*#__PURE__*/React.createElement("div", {
    className: "pt-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isQuick,
    onChange: e => setIsQuick(e.target.checked),
    className: "w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
  }), /*#__PURE__*/React.createElement("span", null, "⚡ Tezkor tovar (Kassa)")))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
  }, t.cancelBtn), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
  }, loading ? t.saving : t.saveBtn)))), cameraActive && /*#__PURE__*/React.createElement(CameraScannerModal, {
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
      if (!debtorId) {
        const createRes = await fetch(`${API_BASE}/debts/debtors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
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
      notify(voiceLang === 'uz' ? `Qarz saqlandi: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})` : `Долг сохранен: ${parsedData.debtor_name} (${formatMoney(parsedData.amount)})`);
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
    className: "p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "✨"), /*#__PURE__*/React.createElement("span", null, voiceLang === 'uz' ? "Aniqlangan qarz ma'lumotlari:" : 'Распознанные данные:')), /*#__PURE__*/React.createElement("span", {
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
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
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
      } else {
        copy[idx][field] = Number(val);
      }
      copy[idx].total_price = Math.round(Number(copy[idx].quantity) * Number(copy[idx].purchase_price));
      return copy;
    });
  };
  const handleSaveInvoice = async () => {
    if (parsedItems.length === 0 || !supplierId || parsedItems.some(it => !it.matched_product_id || !(Number(it.quantity) > 0) || !(Number(it.purchase_price) >= 0))) return;
    setLoading(true);
    try {
      const payload = {
        supplier_id: Number(supplierId),
        items: parsedItems.map(it => ({
          product_id: it.matched_product_id,
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
  }, "📑"), /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, lang === 'uz' ? 'Faktura / Yuk xatini skanerlash' : 'Фото-сканер накладных (Kirim)')), /*#__PURE__*/React.createElement("button", {
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
    className: "px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow touch-target"
  }, "📷 ", lang === 'uz' ? 'Rasmga olish' : 'Сделать фото')), ocrText && /*#__PURE__*/React.createElement("div", {
    className: "mb-3 space-y-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-300"
  }, lang === 'uz' ? 'Tanilgan matn — tekshiring va tuzating:' : 'Распознанный текст — проверьте и исправьте:'), /*#__PURE__*/React.createElement("textarea", {
    rows: 3,
    value: ocrText,
    onChange: e => setOcrText(e.target.value),
    className: "w-full resize-y bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs leading-relaxed"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => parseInvoiceText(ocrText),
    disabled: loading,
    className: "px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
  }, lang === 'uz' ? 'Matnni qayta ajratish' : 'Повторно разобрать текст'), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-amber-700 dark:text-amber-300"
  }, lang === 'uz' ? 'Qabul qilishdan oldin har bir tovar, miqdor va kirim narxini tekshiring.' : 'Перед приёмкой проверьте товар, количество и закупочную цену каждой строки.')), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-2 mb-3 pr-1"
  }, parsedItems.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-10 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6"
  }, lang === 'uz' ? "Qog'oz faktura / yuk xatini rasmga oling. Tovar nomlari, soni va kirim narxlari avtomatik jadvalga olinadi." : 'Сфотографируйте бумажную накладную. Товары, количество и цены будут извлечены.') : /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full min-w-[560px] text-left text-xs border-collapse"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "border-b border-slate-200 dark:border-slate-800 text-slate-400"
  }, /*#__PURE__*/React.createElement("th", {
    className: "py-2"
  }, lang === 'uz' ? 'Tovar' : 'Товар'), /*#__PURE__*/React.createElement("th", {
    className: "py-2"
  }, lang === 'uz' ? 'Miqdor' : 'Количество'), /*#__PURE__*/React.createElement("th", {
    className: "py-2"
  }, lang === 'uz' ? 'Kirim narxi' : 'Цена закупки'), /*#__PURE__*/React.createElement("th", {
    className: "py-2"
  }, lang === 'uz' ? 'Jami' : 'Итого'))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-100 dark:divide-slate-800"
  }, safeArray(parsedItems).map((it, idx) => /*#__PURE__*/React.createElement("tr", {
    key: idx
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: it.matched_product_id || '',
    onChange: e => updateItem(idx, 'matched_product_id', e.target.value),
    className: `w-full min-w-48 bg-slate-50 dark:bg-slate-800 border rounded-lg px-2 py-2 text-xs ${it.matched_product_id ? 'border-emerald-300 dark:border-emerald-700' : 'border-amber-400 dark:border-amber-600'}`
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, lang === 'uz' ? `Katalogdan tanlang: ${it.product_name}` : `Выберите товар: ${it.product_name}`), safeArray(catalogSample).map(product => /*#__PURE__*/React.createElement("option", {
    key: product.id,
    value: product.id
  }, product.name, " · ", product.barcode))), !it.matched_product_id && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-amber-600 dark:text-amber-300"
  }, lang === 'uz' ? 'Aniq moslik topilmadi — katalogdan tanlang' : 'Нет точного совпадения — выберите из каталога')), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: it.quantity,
    onChange: e => updateItem(idx, 'quantity', e.target.value),
    className: "w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 text-xs"
  })), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 pr-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: it.purchase_price,
    onChange: e => updateItem(idx, 'purchase_price', e.target.value),
    className: "w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 text-xs font-mono"
  })), /*#__PURE__*/React.createElement("td", {
    className: "py-1.5 font-bold font-mono text-emerald-600"
  }, formatMoney(it.total_price)))))))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
  }, t.cancelBtn), /*#__PURE__*/React.createElement("button", {
    onClick: handleSaveInvoice,
    disabled: parsedItems.length === 0 || loading || !supplierId || parsedItems.some(it => !it.matched_product_id || !(Number(it.quantity) > 0) || !(Number(it.purchase_price) >= 0)),
    className: "px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow transition"
  }, loading ? t.saving : lang === 'uz' ? 'Tekshirilgan qatorlarni qabul qilish' : 'Принять проверенные строки'))));
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

// ------------------- POS TERMINAL SCREEN -------------------
function PosScreen({
  token,
  notify,
  isOwner,
  t,
  lang: propLang,
  setLang: propSetLang,
  toggleLang: propToggleLang
}) {
  const lang = propLang || typeof window !== 'undefined' && window.pos_lang || typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang') || 'uz';
  const setLang = propSetLang || typeof window !== 'undefined' && window.setPosLang || (val => {
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
  const QUICK_ITEMS = [{
    id: 'q_tandir',
    name: "Tandir non",
    price: 4000,
    icon: '🫓',
    barcode: 'NON_TANDIR'
  }, {
    id: 'q_buxanka',
    name: "Buxanka non",
    price: 3000,
    icon: '🍞',
    barcode: 'NON_BUXANKA'
  }, {
    id: 'q_paket_katta',
    name: "Paket (katta)",
    price: 1000,
    icon: '🛍️',
    barcode: 'PAKET_KAT'
  }, {
    id: 'q_paket_kichik',
    name: "Paket (kichik)",
    price: 500,
    icon: '🛍️',
    barcode: 'PAKET_KICH'
  }, {
    id: 'q_tuxum',
    name: "Tuxum (1 dona)",
    price: 2000,
    icon: '🥚',
    barcode: 'TUXUM_1'
  }, {
    id: 'q_lavash',
    name: "Lavash xamiri",
    price: 5000,
    icon: '🌯',
    barcode: 'LAVASH'
  }, {
    id: 'q_suv',
    name: "Gazsiz suv 0.5L",
    price: 3000,
    icon: '💧',
    barcode: 'SUV_05'
  }, {
    id: 'q_shakar',
    name: "Shakar (1 kg)",
    price: 9000,
    icon: '🍚',
    barcode: 'SHAKAR_1'
  }, {
    id: 'q_sigaret',
    name: "Sigaret (Winston)",
    price: 22000,
    icon: '🚬',
    barcode: 'SIG_WINSTON'
  }, {
    id: 'q_zajigalka',
    name: "Zajigalka (Chaqmoq)",
    price: 3000,
    icon: '🔥',
    barcode: 'ZAJIGALKA'
  }];
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchQuickProducts();
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
      console.error('Error fetching categories:', e);
      setCategories([]);
    }
  };
  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        limit: '24'
      });
      if (search) params.append('search', search);
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
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
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
    const handleKeyDown = e => {
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
        if (checkoutModalOpen) setCheckoutModalOpen(false);else if (scannerActive) setScannerActive(false);else if (parkedModalOpen) setParkedModalOpen(false);else if (cart.length > 0) parkCurrentCart();
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
    speakAloud(lang === 'uz' ? "Chek saqlandi" : "Чек отложен", lang);
  };
  const resumeParkedCart = heldId => {
    const found = parkedCarts.find(h => h.id === heldId);
    if (!found) return;
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
      const updated = [autoPark, ...parkedCarts.filter(h => h.id !== heldId)];
      setParkedCarts(updated);
      try {
        localStorage.setItem('pos_parked_carts', JSON.stringify(updated));
      } catch (e) {}
    } else {
      const updated = parkedCarts.filter(h => h.id !== heldId);
      setParkedCarts(updated);
      try {
        localStorage.setItem('pos_parked_carts', JSON.stringify(updated));
      } catch (e) {}
    }
    setCart(found.items);
    setSelectedCashReceived(null);
    setParkedModalOpen(false);
    notify(lang === 'uz' ? `Chek #${heldId} tiklandi` : `Чек #${heldId} восстановлен`, 'success');
    speakAloud(lang === 'uz' ? "Chek tiklandi" : "Чек восстановлен", lang);
  };
  const removeParkedCart = heldId => {
    const updated = parkedCarts.filter(h => h.id !== heldId);
    setParkedCarts(updated);
    try {
      localStorage.setItem('pos_parked_carts', JSON.stringify(updated));
    } catch (e) {}
  };
  const handleBarcodeSubmit = async e => {
    if (e) e.preventDefault();
    const code = barcodeQuery.trim();
    if (!code) return;
    await processBarcode(code);
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
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? {
          ...item,
          quantity: Math.round((item.quantity + quantity) * 100) / 100
        } : item);
      }
      return [...prev, {
        product,
        quantity: Math.round(quantity * 100) / 100
      }];
    });
  };
  const addQuickItem = item => {
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
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.round((item.quantity + delta) * 100) / 100;
        return newQty > 0 ? {
          ...item,
          quantity: newQty
        } : null;
      }
      return item;
    }).filter(Boolean));
  };
  const setItemExactQty = (productId, newQty) => {
    const parsed = parseFloat(newQty);
    if (isNaN(parsed) || parsed <= 0) return;
    setCart(prev => prev.map(item => item.product.id === productId ? {
      ...item,
      quantity: parsed
    } : item));
  };
  const removeFromCart = productId => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };
  const clearCart = () => {
    setCart([]);
    setSelectedCashReceived(null);
  };

  // Direct 1-Click Checkout Handler
  const handleDirectCheckout = async paymentMethod => {
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
        items: safeArray(cart).map(i => ({
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
      const spkMsg = paymentMethod === 'CASH' ? lang === 'uz' ? `Xarid yakunlandi. Qaytim: ${formatMoney(data.change_given)}` : `Покупка завершена. Сдача: ${formatMoney(data.change_given)}` : lang === 'uz' ? "Karta orqali to'lov qabul qilindi" : "Оплата картой принята";
      speakAloud(spkMsg, lang);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDirectLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, successToast && /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-600 text-white rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 animate-fade-in border border-emerald-400"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "✅"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-extrabold text-xs sm:text-sm"
  }, lang === 'uz' ? "Xarid muvaffaqiyatli yakunlandi!" : "Покупка успешно завершена!", " #", successToast.receiptNumber), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] opacity-90 font-mono"
  }, formatMoney(successToast.total), " (", successToast.method, ")", successToast.change > 0 && /*#__PURE__*/React.createElement("span", {
    className: "ml-2 font-black text-amber-200"
  }, lang === 'uz' ? "Qaytim:" : "Сдача:", " ", formatMoney(successToast.change))))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setLastReceipt(successToast.data),
    className: "bg-white text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "🖨️"), /*#__PURE__*/React.createElement("span", null, t.printReceiptOptional || "Chekni chop etish"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-7 xl:col-span-8 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-col sm:flex-row gap-2 transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleBarcodeSubmit,
    className: "flex-1 flex gap-1.5 items-center"
  }, /*#__PURE__*/React.createElement("input", {
    ref: barcodeInputRef,
    type: "text",
    placeholder: t.barcodeScanPlaceholder || "Shtrixkodni kiriting (F2)...",
    value: barcodeQuery,
    onChange: e => setBarcodeQuery(e.target.value),
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition",
    title: "Shtrixkodni qidirish"
  }, "↵")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(VoiceInputBtn, {
    onResult: txt => setBarcodeQuery(txt.replace(/\D/g, '')),
    lang: lang,
    title: "Shtrixkodni ovoz bilan aytish"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVoiceAssistantOpen(true),
    className: "bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5 touch-target",
    title: lang === 'uz' ? "Ovozli boshqaruv va qidiruv (F3)" : "Голосовой помощник и поиск (F3)"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "🎙️"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, lang === 'uz' ? "Ovoz" : "Голос")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setScannerActive(true),
    className: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5 touch-target",
    title: lang === 'uz' ? "Kamera orqali shtrixkod skaneri" : "Сканер через камеру"
  }, /*#__PURE__*/React.createElement("span", null, "📷"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, lang === 'uz' ? "Skaner" : "Скан"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 w-full sm:w-44"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: t.searchProductPlaceholder || "Tovar nomi...",
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  }), /*#__PURE__*/React.createElement(VoiceInputBtn, {
    onResult: txt => setSearch(txt),
    lang: lang,
    title: "Tovar nomini ovoz bilan qidirish"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "⚡"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Tezkor tovarlar (Shtrixkodsiz 1-bosish):" : "Быстрые товары (без штрихкода):")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowAllCatalog(!showAllCatalog),
    className: "text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
  }, showAllCatalog ? lang === 'uz' ? "Yashirish" : "Скрыть каталог" : lang === 'uz' ? "Barcha tovarlar (2000+)" : "Показать все товары")), showAllCatalog && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSelectedCategory(null),
    className: `px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCategory === null ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
  }, t.allCategories || (lang === 'uz' ? "Barcha toifalar" : "Все категории")), (Array.isArray(categories) ? categories : categories?.categories || []).map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat.id,
    type: "button",
    onClick: () => setSelectedCategory(cat.id === selectedCategory ? null : cat.id),
    className: `px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCategory === cat.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
  }, cat.name ? cat.name.split('/')[0].trim() : cat.name))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-5 gap-1.5"
  }, (safeArray(quickProducts).length > 0 ? safeArray(quickProducts) : QUICK_ITEMS).map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    type: "button",
    onClick: () => addQuickItem(item),
    className: "bg-emerald-50/80 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-emerald-200 dark:border-slate-700 rounded-xl p-2 text-left transition flex items-center gap-2 touch-target shadow-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xl"
  }, item.icon || '⚡'), /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate"
  }, item.name), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 font-mono"
  }, formatMoney(item.sale_price || item.price))))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "🧾"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Faol savdo cheki" : "Текущий чек")), /*#__PURE__*/React.createElement("span", {
    className: "text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full font-mono"
  }, cart.length, " ", lang === 'uz' ? "pozitsiya" : "поз")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: parkCurrentCart,
    disabled: cart.length === 0,
    className: "px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition disabled:opacity-40 flex items-center gap-1",
    title: "Xaridorni navbatga qo'yib boshqasiga o'tish (Esc)"
  }, /*#__PURE__*/React.createElement("span", null, "⏸️"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Chekni saqlash (Esc)" : "Отложить чек (Esc)")), parkedCarts.length > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setParkedModalOpen(true),
    className: "px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1 animate-pulse"
  }, /*#__PURE__*/React.createElement("span", null, "📂"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? `Saqlanganlar (${parkedCarts.length})` : `Отложенные (${parkedCarts.length})`)), cart.length > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: clearCart,
    className: "text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded-lg",
    title: "Savatni tozalash"
  }, "🗑️ ", t.clearCart || "Tozalash"))), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto max-h-80 overflow-y-auto"
  }, cart.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "h-44 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-3xl mb-1.5 opacity-60"
  }, "🛒"), /*#__PURE__*/React.createElement("p", {
    className: "font-semibold text-slate-600 dark:text-slate-400"
  }, lang === 'uz' ? "Chek bo'sh. Mahsulot shtrixkodini skanerlang yoki tezkor tovarlardan tanlang." : "Чек пуст. Отсканируйте штрихкод или выберите товар."), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-400 mt-1"
  }, "Hotkeys: ", /*#__PURE__*/React.createElement("span", {
    className: "font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded"
  }, "F2"), " Qidiruv | ", /*#__PURE__*/React.createElement("span", {
    className: "font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded"
  }, "F5"), " Naqd | ", /*#__PURE__*/React.createElement("span", {
    className: "font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded"
  }, "F6"), " Karta | ", /*#__PURE__*/React.createElement("span", {
    className: "font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded"
  }, "Esc"), " Saqlash")) : /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-xs"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 backdrop-blur"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-2 w-8"
  }, "#"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-2"
  }, lang === 'uz' ? "Mahsulot nomi" : "Наименование"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-2 text-right"
  }, lang === 'uz' ? "Narxi" : "Цена"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-2 text-center w-32"
  }, lang === 'uz' ? "Miqdor" : "Кол-во"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-2 text-right"
  }, lang === 'uz' ? "Jami" : "Сумма"), /*#__PURE__*/React.createElement("th", {
    className: "px-2 py-2 text-center w-8"
  }))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium"
  }, safeArray(cart).map((item, idx) => {
    const itemTotal = item.product.sale_price * item.quantity;
    return /*#__PURE__*/React.createElement("tr", {
      key: item.product.id,
      className: "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2 text-[11px] text-slate-400 font-mono"
    }, idx + 1), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs"
    }, item.product.name), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-slate-400 font-mono"
    }, item.product.barcode)), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap"
    }, formatMoney(item.product.sale_price)), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-center gap-1"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => updateQuantity(item.product.id, -1),
      className: "w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black flex items-center justify-center text-xs"
    }, "-"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      step: "any",
      value: item.quantity,
      onChange: e => setItemExactQty(item.product.id, e.target.value),
      className: "w-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold font-mono text-xs py-0.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => updateQuantity(item.product.id, 1),
      className: "w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center text-xs"
    }, "+"))), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
    }, formatMoney(itemTotal)), /*#__PURE__*/React.createElement("td", {
      className: "px-2 py-2 text-center"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => removeFromCart(item.product.id),
      className: "text-slate-400 hover:text-rose-600 text-xs p-1",
      title: "O'chirish"
    }, "✕")));
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors duration-200 sticky top-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1"
  }, lang === 'uz' ? "Jami to'lov miqdori" : "Итого к оплате"), /*#__PURE__*/React.createElement("div", {
    className: "text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono"
  }, formatMoney(cartTotal)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, cart.length, " ", lang === 'uz' ? "ta mahsulot" : "товаров"), /*#__PURE__*/React.createElement("span", null, "•"), /*#__PURE__*/React.createElement("span", null, cart.reduce((sum, it) => sum + it.quantity, 0), " ", lang === 'uz' ? "dona" : "шт"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300"
  }, /*#__PURE__*/React.createElement("span", null, "💵 ", lang === 'uz' ? "Xaridordan olingan naqd pul:" : "Получено наличными:"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSelectedCashReceived(cartTotal),
    className: "text-emerald-600 hover:underline font-extrabold text-[11px]"
  }, lang === 'uz' ? "Aniq (Qaytimsiz)" : "Без сдачи")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-1.5"
  }, [10000, 20000, 50000, 100000, 200000].map(note => /*#__PURE__*/React.createElement("button", {
    key: note,
    type: "button",
    onClick: () => setSelectedCashReceived(note),
    className: `py-2 rounded-xl text-xs font-mono font-bold transition border ${selectedCashReceived === note ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`
  }, formatMoney(note))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSelectedCashReceived(cartTotal),
    className: `py-2 rounded-xl text-xs font-mono font-bold transition border ${selectedCashReceived === cartTotal ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`
  }, lang === 'uz' ? "Aniq" : "Ровно")), cart.length > 0 && selectedCashReceived !== null && /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 flex items-center justify-between animate-fade-in"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-emerald-800 dark:text-emerald-200"
  }, lang === 'uz' ? "Mijozga qaytim:" : "Сдача клиенту:"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-black text-emerald-700 dark:text-emerald-300 font-mono"
  }, formatMoney(cashChange)))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 pt-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('CASH'),
    className: "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold py-3 px-3 rounded-2xl shadow transition flex flex-col items-center justify-center gap-0.5 touch-target text-xs sm:text-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-base"
  }, "💵"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Naqd pul" : "Наличные")), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] opacity-80 font-mono font-normal"
  }, "Hotkey: F5")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('CARD'),
    className: "bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-extrabold py-3 px-3 rounded-2xl shadow transition flex flex-col items-center justify-center gap-0.5 touch-target text-xs sm:text-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-base"
  }, "💳"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Karta (Humo/Uz)" : "Карта")), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] opacity-80 font-mono font-normal"
  }, "Hotkey: F6"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('DEBT'),
    className: "bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-extrabold py-2.5 px-3 rounded-2xl shadow transition flex flex-col items-center justify-center gap-0.5 touch-target text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "📓"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Qarzga berish" : "В долг")), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] opacity-80 font-mono font-normal"
  }, "Hotkey: F7")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0,
    onClick: () => setCheckoutModalOpen(true),
    className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-extrabold py-2.5 px-3 rounded-2xl transition flex flex-col items-center justify-center gap-0.5 touch-target text-xs border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "⚙️"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Boshqa to'lov" : "Сплит / Сдача")), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] opacity-80 font-mono font-normal"
  }, "F12")))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: cart.length === 0 || directLoading,
    onClick: () => handleDirectCheckout('CASH'),
    className: "w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base border border-emerald-400"
  }, /*#__PURE__*/React.createElement("span", null, "✅"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Chekni tasdiqlash (Enter / F12)" : "Пробить чек (Enter / F12)")))), parkedModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "📂"), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "Saqlangan (otlojenny) cheklar" : "Отложенные чеки")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setParkedModalOpen(false),
    className: "text-slate-400 hover:text-slate-600 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 max-h-72 overflow-y-auto pr-1"
  }, safeArray(parkedCarts).map(h => /*#__PURE__*/React.createElement("div", {
    key: h.id,
    className: "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-xs"
  }, "Chek #", h.id, " (", h.timestamp, ")"), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 font-mono"
  }, h.itemCount, " ta tovar • ", /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-emerald-600"
  }, formatMoney(h.total)))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => resumeParkedCart(h.id),
    className: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow transition"
  }, lang === 'uz' ? "Davom etish" : "Восстановить"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => removeParkedCart(h.id),
    className: "text-slate-400 hover:text-rose-500 px-2 py-1.5 text-xs"
  }, "✕"))))))), notFoundBarcode && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-4xl mb-2 inline-block"
  }, "🔍"), /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-1"
  }, lang === 'uz' ? "Mahsulot topilmadi" : "Товар не найден"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400 font-mono mb-3 bg-slate-100 dark:bg-slate-800 py-1.5 px-2 rounded-lg font-bold"
  }, notFoundBarcode), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-600 dark:text-slate-300 mb-4"
  }, lang === 'uz' ? "Ushbu shtrixkod bazada yo'q. Uni hoziroq bazaga qo'shasizmi?" : "Этого штрихкода нет в базе. Добавить его прямо сейчас?"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setNotFoundBarcode(null),
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
  }, t.cancelBtn || "Bekor qilish"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      const b = notFoundBarcode;
      setNotFoundBarcode(null);
      setCreateProductOpen(b);
    },
    className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
  }, "➕ ", lang === 'uz' ? "Qo'shish" : "Добавить")))), voiceAssistantOpen && /*#__PURE__*/React.createElement(VoiceAssistantModal, {
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
      if (cart.length > 0) handleDirectCheckout('DEBT');
    },
    notify: notify,
    t: t,
    lang: lang
  }), createProductOpen && /*#__PURE__*/React.createElement(CreateProductModal, {
    token: token,
    initialBarcode: typeof createProductOpen === 'string' ? createProductOpen : '',
    onClose: () => setCreateProductOpen(false),
    onSuccess: newProd => {
      setCreateProductOpen(false);
      if (newProd && newProd.name) {
        addToCart(newProd, 1.0);
      }
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
      setSuccessToast({
        receiptNumber: receipt.receipt_number,
        total: cartTotal,
        change: receipt.change_given,
        method: receipt.payment_method,
        data: receipt
      });
      setTimeout(() => setSuccessToast(null), 6000);
    },
    notify: notify,
    t: t,
    lang: lang
  }), lastReceipt && /*#__PURE__*/React.createElement(ReceiptModal, {
    receipt: lastReceipt,
    onClose: () => setLastReceipt(null),
    t: t
  }));
}
function DebtsScreen({
  token,
  notify,
  t
}) {
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
  const lang = typeof window !== "undefined" && window.pos_lang || typeof localStorage !== "undefined" && localStorage.getItem("pos_lang") || "uz";
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
      const data = await res.json();
      setDebtors(safeArray(data));
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
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      console.error(e);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 dark:text-slate-400 font-semibold"
  }, t.totalOutstandingDebt), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono"
  }, summary ? formatMoney(summary.total_outstanding_debt) : '0 so\'m')), /*#__PURE__*/React.createElement("span", {
    className: "text-3xl"
  }, "📓")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 dark:text-slate-400 font-semibold"
  }, t.debtorsWithDebt || (lang === 'uz' ? "Qarzdor mijozlar:" : "Клиенты с долгом:")), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black text-slate-800 dark:text-slate-100 mt-1"
  }, summary ? summary.active_debtors_with_debt : 0, ' ', /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-normal text-slate-400"
  }, "/ ", summary ? summary.debtors_count : 0))), /*#__PURE__*/React.createElement("span", {
    className: "text-3xl"
  }, "👥")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm flex flex-col justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCreateDebtorModalOpen(true),
    className: "w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "➕"), /*#__PURE__*/React.createElement("span", null, t.addDebtorModalTitle || "Yangi mijoz")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setVoiceDebtOpen(true),
    className: "bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 rounded-xl shadow transition text-[11px] flex items-center justify-center gap-1",
    title: "Ovozli qarz yozish"
  }, /*#__PURE__*/React.createElement("span", null, "🎙️"), /*#__PURE__*/React.createElement("span", null, t.voiceDebtPrompt || (lang === 'uz' ? "Ovozli" : "Голосом"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOcrDebtOpen(true),
    className: "bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded-xl shadow transition text-[11px] flex items-center justify-center gap-1",
    title: "Daftardan rasm olish"
  }, /*#__PURE__*/React.createElement("span", null, "📸"), /*#__PURE__*/React.createElement("span", null, t.ocrDebtTitle || (lang === 'uz' ? "Daftar OCR" : "Фото тетради")))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: t.searchDebtorPlaceholder,
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "w-full sm:w-80 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOnlyWithDebt(!onlyWithDebt),
    className: `px-3 py-2 rounded-xl text-xs font-bold transition border ${onlyWithDebt ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
  }, t.onlyWithDebtFilter)), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
  }, safeArray(debtors).map(debtor => /*#__PURE__*/React.createElement("div", {
    key: debtor.id,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-100"
  }, debtor.full_name), debtor.phone && /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5"
  }, "📞 ", debtor.phone), debtor.note && /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400 mt-1 italic"
  }, "\"", debtor.note, "\""), debtor.due_date && /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1 flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "⏳"), /*#__PURE__*/React.createElement("span", null, t.dueDateLabel || "Muddati", ": ", debtor.due_date))), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, t.currentDebtBalance), /*#__PURE__*/React.createElement("span", {
    className: `text-base font-black font-mono ${debtor.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`
  }, formatMoney(debtor.balance)))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSelectedDebtor(debtor);
      setPayModalOpen(true);
    },
    className: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 py-1.5 rounded-xl text-xs font-bold transition text-center"
  }, "💵 ", t.payDebtBtn), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSelectedDebtor(debtor);
      setAddDebtModalOpen(true);
    },
    className: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 py-1.5 rounded-xl text-xs font-bold transition text-center"
  }, "➕ ", t.addDebtBtn), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSelectedDebtor(debtor);
      setHistoryModalOpen(true);
    },
    className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-1.5 rounded-xl text-xs font-bold transition text-center"
  }, "📜 ", t.historyBtn))))), payModalOpen && selectedDebtor && /*#__PURE__*/React.createElement(PayDebtModal, {
    token: token,
    lang: lang,
    debtor: selectedDebtor,
    onClose: () => setPayModalOpen(false),
    onSuccess: () => {
      setPayModalOpen(false);
      fetchDebtors();
      fetchSummary();
      notify('Qarz to\'lovi qabul qilindi / Оплата долга принята');
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
      notify('Qo\'shimcha qarz yozildi / Долг записан');
    },
    notify: notify,
    t: t
  }), historyModalOpen && selectedDebtor && /*#__PURE__*/React.createElement(DebtorHistoryModal, {
    token: token,
    lang: lang,
    debtor: selectedDebtor,
    onClose: () => setHistoryModalOpen(false),
    t: t
  }), voiceDebtOpen && /*#__PURE__*/React.createElement(VoiceDebtModal, {
    token: token,
    onClose: () => setVoiceDebtOpen(false),
    onSuccess: () => {
      setVoiceDebtOpen(false);
      fetchDebtors();
      fetchSummary();
      notify(lang === 'uz' ? "Ovozli qarz muvaffaqiyatli saqlandi!" : "Голосовой долг сохранен!");
    },
    notify: notify,
    t: t,
    lang: lang
  }), ocrDebtOpen && /*#__PURE__*/React.createElement(OcrDebtNotebookModal, {
    token: token,
    onClose: () => setOcrDebtOpen(false),
    onSuccess: () => {
      setOcrDebtOpen(false);
      fetchDebtors();
      fetchSummary();
      notify(lang === 'uz' ? "Daftar yozuvlari kiritildi!" : "Записи из тетради распознаны и внесены!");
    },
    notify: notify,
    t: t,
    lang: lang
  }), createDebtorModalOpen && /*#__PURE__*/React.createElement(CreateDebtorModal, {
    token: token,
    lang: lang,
    onClose: () => setCreateDebtorModalOpen(false),
    onSuccess: () => {
      setCreateDebtorModalOpen(false);
      fetchDebtors();
      fetchSummary();
      notify('Yangi mijoz qo\'shildi / Новый клиент зарегистрирован');
    },
    notify: notify,
    t: t
  }));
}

// ------------------- PAY DEBT MODAL -------------------
function PayDebtModal({
  token,
  debtor,
  onClose,
  onSuccess,
  notify,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [amount, setAmount] = useState(debtor.balance > 0 ? debtor.balance : 10000);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(amount),
          note: note.trim() || undefined
        })
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-1"
  }, "💵 ", t.payDebtModalTitle), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400 mb-4"
  }, debtor.full_name, " (", t.currentDebtBalance, " ", formatMoney(debtor.balance), ")"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.paymentAmountLabel), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: amount,
    onChange: e => setAmount(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.noteLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Qarz to'lovi / Погашение",
    value: note,
    onChange: e => setNote(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
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

// ------------------- ADD DEBT MODAL -------------------
function AddDebtModal({
  token,
  debtor,
  onClose,
  onSuccess,
  notify,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [amount, setAmount] = useState(25000);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/add-debt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(amount),
          note: note.trim() || undefined
        })
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-1"
  }, "📓 ", t.addDebtModalTitle), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400 mb-4"
  }, debtor.full_name, " (", t.currentDebtBalance, " ", formatMoney(debtor.balance), ")"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.debtAmountLabel), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: amount,
    onChange: e => setAmount(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.noteLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Masalan: Yog' va guruch oldi",
    value: note,
    onChange: e => setNote(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold"
  }, t.cancelBtn), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold shadow"
  }, loading ? t.saving : t.saveBtn))));
}

// ------------------- DEBTOR HISTORY MODAL -------------------
function DebtorHistoryModal({
  token,
  debtor,
  onClose,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchHistory();
  }, []);
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/debts/debtors/${debtor.id}/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        setHistory([]);
        return;
      }
      const data = await res.json();
      setHistory(safeArray(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[85vh]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100"
  }, t.historyModalTitle), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400"
  }, debtor.full_name, " • ", t.currentDebtBalance, ' ', /*#__PURE__*/React.createElement("span", {
    className: "font-bold font-mono text-amber-600 dark:text-amber-400"
  }, formatMoney(debtor.balance)))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-2 py-2 pr-1"
  }, loading ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-xs text-slate-400"
  }, t.processing) : history.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-xs text-slate-400"
  }, "Tarix bo'sh") : safeArray(history).map(tx => {
    const isIncrease = tx.transaction_type === 'DEBT_INCREASE';
    return /*#__PURE__*/React.createElement("div", {
      key: tx.id,
      className: "bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 text-xs font-bold"
    }, /*#__PURE__*/React.createElement("span", {
      className: isIncrease ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
    }, isIncrease ? '➕ Qarz qo\'shildi' : '💵 To\'lov qabul qilindi')), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] text-slate-500 dark:text-slate-400 mt-0.5"
    }, tx.note || '-'), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-slate-400 font-mono mt-0.5"
    }, new Date(tx.created_at).toLocaleString(), " • ", tx.created_by_name)), /*#__PURE__*/React.createElement("div", {
      className: `font-mono font-bold text-sm ${isIncrease ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`
    }, isIncrease ? '+' : '-', formatMoney(tx.amount)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 pt-3 border-t border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 rounded-xl text-xs transition"
  }, t.closeBtn))));
}

// ------------------- CREATE DEBTOR MODAL -------------------
function CreateDebtorModal({
  token,
  onClose,
  onSuccess,
  notify,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [initialDebt, setInitialDebt] = useState(0);
  const [loading, setLoading] = useState(false);
  const submit = async e => {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-3"
  }, t.addDebtorModalTitle), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.debtorNameLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Alisher Rahimov (qo'shni)",
    value: fullName,
    onChange: e => setFullName(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.phoneLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "+998 (90) 123-45-67",
    value: phone,
    onChange: e => setPhone(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.noteLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "44-xonadon",
    value: note,
    onChange: e => setNote(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.debtAmountLabel), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: initialDebt,
    onChange: e => setInitialDebt(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
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
  }, loading ? t.creating : t.createBtn))));
}

// ------------------- CATALOG SCREEN (2000 SKU) -------------------
function CatalogScreen({
  token,
  notify,
  isOwner,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || typeof localStorage !== "undefined" && localStorage.getItem("pos_lang") || "uz";
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
  const reseed = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/reseed-catalog?target_count=2000`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      notify(data.message || "Baza tozalandi!");
      fetchProducts();
    } catch (e) {
      notify('Tozalashda xatolik', 'error');
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "📦"), /*#__PURE__*/React.createElement("span", null, t.catalogTitle), /*#__PURE__*/React.createElement("span", {
    className: "text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold"
  }, total, " SKU")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400"
  }, "Shtrixkodlar, tovar narxlari va qoldiq monitoringi")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-2 w-full md:w-auto"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: clearCatalog,
    className: "bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1 touch-target",
    title: "Test tovarlar va savdolarni tozalash"
  }, /*#__PURE__*/React.createElement("span", null, "🗑️"), /*#__PURE__*/React.createElement("span", null, t.clearCatalogBtn || "Toza varaqdan boshlash")), /*#__PURE__*/React.createElement("button", {
    onClick: reseed,
    className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition border border-slate-300 dark:border-slate-700 flex items-center gap-1 touch-target",
    title: "2000 ta demo tovarlarni qaytarish"
  }, /*#__PURE__*/React.createElement("span", null, "🔄"), /*#__PURE__*/React.createElement("span", null, t.reseedCatalogBtn || "2000 ta tovar")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: t.searchProductPlaceholder,
    value: search,
    onChange: e => {
      setSearch(e.target.value);
      setSkip(0);
    },
    className: "flex-1 md:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setLowStockOnly(!lowStockOnly);
      setSkip(0);
    },
    className: `px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${lowStockOnly ? 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
  }, t.lowStockFilter), isOwner && /*#__PURE__*/React.createElement("button", {
    onClick: reseed,
    className: "bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition whitespace-nowrap shadow"
  }, t.syncCatalogBtn))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "block md:hidden divide-y divide-slate-100 dark:divide-slate-800"
  }, safeArray(products).map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "p-3 flex flex-col gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-100"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5"
  }, "🏷️ ", p.barcode, " • ", p.category_name)), /*#__PURE__*/React.createElement("div", null, p.is_low_stock ? /*#__PURE__*/React.createElement("span", {
    className: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap"
  }, t.statusOrderMore) : /*#__PURE__*/React.createElement("span", {
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
  }, t.statusInNorm))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 text-[10px] block"
  }, t.colStock), /*#__PURE__*/React.createElement("span", {
    className: `font-mono font-bold ${p.is_low_stock ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`
  }, p.stock_quantity, " ", p.unit)), isOwner && /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 text-[10px] block"
  }, t.colPurchasePrice), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-slate-500 dark:text-slate-400"
  }, formatMoney(p.purchase_price))), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 text-[10px] block"
  }, t.colSalePrice), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm"
  }, formatMoney(p.sale_price))))))), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:block overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-xs"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3"
  }, t.colBarcode), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3"
  }, t.colName), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3"
  }, t.colCategory), isOwner && /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-right"
  }, t.colPurchasePrice), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-right"
  }, t.colSalePrice), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-right"
  }, t.colStock), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-center"
  }, t.colStatus))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200"
  }, safeArray(products).map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.id,
    className: "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
  }, /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400"
  }, p.barcode), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100"
  }, p.name), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-slate-500 dark:text-slate-400"
  }, p.category_name), isOwner && /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-right font-mono text-slate-500 dark:text-slate-400"
  }, formatMoney(p.purchase_price)), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono"
  }, formatMoney(p.sale_price)), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-right font-mono"
  }, /*#__PURE__*/React.createElement("span", {
    className: p.is_low_stock ? 'text-rose-500 font-bold' : 'text-slate-800 dark:text-slate-200'
  }, p.stock_quantity, " ", p.unit)), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-center"
  }, p.is_low_stock ? /*#__PURE__*/React.createElement("span", {
    className: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold"
  }, t.statusOrderMore) : /*#__PURE__*/React.createElement("span", {
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold"
  }, t.statusInNorm))))))), /*#__PURE__*/React.createElement("div", {
    className: "p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
  }, /*#__PURE__*/React.createElement("div", null, t.paginationShown, " ", products.length, " ", t.paginationOf, " ", total, " SKU"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    disabled: skip === 0,
    onClick: () => setSkip(Math.max(0, skip - limit)),
    className: "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-semibold"
  }, t.prevBtn), /*#__PURE__*/React.createElement("button", {
    disabled: skip + limit >= total,
    onClick: () => setSkip(skip + limit),
    className: "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-semibold"
  }, t.nextBtn)))));
}

// ------------------- SUPPLIERS & INCOMING INVOICES -------------------
function SuppliersScreen({
  token,
  notify,
  t
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [catalogSample, setCatalogSample] = useState([]);
  const [createSupplierModalOpen, setCreateSupplierModalOpen] = useState(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [payInvoiceModalOpen, setPayInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ocrInvoiceOpen, setOcrInvoiceOpen] = useState(false);
  const lang = typeof window !== "undefined" && window.pos_lang || typeof localStorage !== "undefined" && localStorage.getItem("pos_lang") || "uz";
  useEffect(() => {
    fetchSuppliers();
    fetchInvoices();
    fetchCatalogSample();
  }, []);
  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "🚚"), /*#__PURE__*/React.createElement("span", null, t.suppliersTitle)), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400"
  }, lang === 'uz' ? "Tovarlarni qabul qilish, omborni to'ldirish va hisob-kitob" : 'Приёмка товаров, пополнение склада и расчёты')), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCreateSupplierModalOpen(true),
    className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm"
  }, t.addSupplierBtn), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOcrInvoiceOpen(true),
    className: "bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md flex items-center gap-1.5 touch-target"
  }, /*#__PURE__*/React.createElement("span", null, "📸"), /*#__PURE__*/React.createElement("span", null, t.scanInvoiceBtn || "Faktura OCR")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCreateInvoiceModalOpen(true),
    className: "bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md"
  }, t.addInvoiceBtn))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "block md:hidden divide-y divide-slate-100 dark:divide-slate-800"
  }, safeArray(invoices).map(inv => /*#__PURE__*/React.createElement("div", {
    key: inv.id,
    className: "p-3 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-xs text-slate-900 dark:text-slate-100"
  }, "📦 № ", inv.invoice_number), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5"
  }, inv.supplier_name)), /*#__PURE__*/React.createElement("div", null, inv.debt_to_supplier > 0 ? /*#__PURE__*/React.createElement("span", {
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold"
  }, t.statusHasDebt || "Qarz bor") : /*#__PURE__*/React.createElement("span", {
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold"
  }, t.statusFullyPaid || "To'langan"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-center font-mono text-[11px]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, t.totalToPay), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-slate-800 dark:text-slate-200"
  }, formatMoney(inv.total_amount))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, t.paidAmountLabel), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-emerald-600 dark:text-emerald-400"
  }, formatMoney(inv.paid_amount))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, t.debtToSupplierLabel), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-amber-600 dark:text-amber-400"
  }, formatMoney(inv.debt_to_supplier)))), inv.debt_to_supplier > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSelectedInvoice(inv);
      setPayInvoiceModalOpen(true);
    },
    className: "w-full mt-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
  }, "💵 ", t.payInvoiceBtn)))), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:block overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-xs"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3"
  }, t.invoiceNumberLabel), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3"
  }, t.supplierNameLabel), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-right"
  }, t.totalToPay), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-right"
  }, t.paidAmountLabel), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-right"
  }, t.debtToSupplierLabel), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-center"
  }, t.colStatus), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-center"
  }, t.colActions || (lang === 'uz' ? 'Amal' : 'Действие')))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200"
  }, safeArray(invoices).map(inv => /*#__PURE__*/React.createElement("tr", {
    key: inv.id,
    className: "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
  }, /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100"
  }, inv.invoice_number), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-medium"
  }, inv.supplier_name), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-right font-mono font-bold"
  }, formatMoney(inv.total_amount)), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400"
  }, formatMoney(inv.paid_amount)), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-right font-mono text-amber-600 dark:text-amber-400"
  }, formatMoney(inv.debt_to_supplier)), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: `px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : inv.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'}`
  }, inv.status === 'PAID' ? t.invoiceStatusPaid : inv.status === 'PARTIAL' ? t.invoiceStatusPartial : t.invoiceStatusPending)), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-center"
  }, inv.debt_to_supplier > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSelectedInvoice(inv);
      setPayInvoiceModalOpen(true);
    },
    className: "bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold transition"
  }, t.payInvoiceBtn)))))))), createSupplierModalOpen && /*#__PURE__*/React.createElement(CreateSupplierModal, {
    token: token,
    lang: lang,
    onClose: () => setCreateSupplierModalOpen(false),
    onSuccess: () => {
      setCreateSupplierModalOpen(false);
      fetchSuppliers();
      notify(lang === 'uz' ? 'Yetkazib beruvchi qo\'shildi' : 'Поставщик добавлен');
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
      fetchInvoices();
      notify(lang === 'uz' ? 'Nakladnaya omborga qabul qilindi' : 'Накладная принята на склад');
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
      fetchInvoices();
      notify(lang === 'uz' ? 'Yuk xati qabul qilindi va ombor yangilandi' : 'Накладная принята, остатки обновлены');
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
      fetchInvoices();
      notify(lang === 'uz' ? 'Ta\'minotchiga to\'lov saqlandi' : 'Оплата поставщику сохранена');
    },
    notify: notify,
    t: t
  }));
}

// ------------------- CREATE SUPPLIER MODAL -------------------
function CreateSupplierModal({
  token,
  onClose,
  onSuccess,
  notify,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async e => {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-3"
  }, t.addSupplierBtn), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.supplierNameLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "MCHJ 'Musaffo Sut Alyansi'",
    value: name,
    onChange: e => setName(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.contactPersonLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Akmal Karimov",
    value: contactPerson,
    onChange: e => setContactPerson(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.phoneLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "+998 (71) 200-11-22",
    value: phone,
    onChange: e => setPhone(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.addressLabel), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Toshkent sh.",
    value: address,
    onChange: e => setAddress(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
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
  }, loading ? t.creating : t.createBtn))));
}

// ------------------- CREATE INVOICE MODAL -------------------
function CreateInvoiceModal({
  token,
  suppliers,
  catalogSample,
  onClose,
  onSuccess,
  notify,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [supplierId, setSupplierId] = useState(suppliers.length > 0 ? suppliers[0].id : '');
  const [items, setItems] = useState([{
    product_id: catalogSample.length > 0 ? catalogSample[0].id : '',
    quantity: 50,
    purchase_price: catalogSample.length > 0 && catalogSample[0].purchase_price ? catalogSample[0].purchase_price : 10000
  }]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const addItem = () => {
    setItems(prev => [...prev, {
      product_id: catalogSample.length > 0 ? catalogSample[0].id : '',
      quantity: 10,
      purchase_price: 10000
    }]);
  };
  const updateItem = (index, field, value) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index][field] = Number(value);
      return copy;
    });
  };
  const removeItem = index => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };
  const total = items.reduce((sum, it) => sum + it.quantity * it.purchase_price, 0);
  const submit = async e => {
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
          items: safeArray(items).map(it => ({
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-3"
  }, t.addInvoiceBtn), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 flex-1 overflow-y-auto pr-1"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.supplierNameLabel), /*#__PURE__*/React.createElement("select", {
    value: supplierId,
    onChange: e => setSupplierId(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
  }, safeArray(suppliers).map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.name)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-semibold text-slate-600 dark:text-slate-400"
  }, t.invoiceItemsLabel), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: addItem,
    className: "text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
  }, t.addItemBtn || (lang === 'uz' ? "+ Tovar qo'shish" : "+ Добавить товар"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, safeArray(items).map((it, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: it.product_id,
    onChange: e => updateItem(idx, 'product_id', e.target.value),
    className: "flex-2 w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
  }, safeArray(catalogSample).map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name))), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "Miqdor",
    value: it.quantity,
    onChange: e => updateItem(idx, 'quantity', e.target.value),
    className: "w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 text-center"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "Tannarx",
    value: it.purchase_price,
    onChange: e => updateItem(idx, 'purchase_price', e.target.value),
    className: "w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 text-right"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => removeItem(idx),
    className: "text-rose-500 font-bold px-1.5"
  }, "✕"))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3 pt-2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.paidAmountLabel), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: paidAmount,
    onChange: e => setPaidAmount(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100"
  })), /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col justify-center text-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-slate-500 dark:text-slate-400"
  }, t.totalToPay), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-black text-emerald-600 dark:text-emerald-400 font-mono"
  }, formatMoney(total))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"
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

// ------------------- PAY INVOICE MODAL -------------------
function PayInvoiceModal({
  token,
  invoice,
  onClose,
  onSuccess,
  notify,
  t,
  lang: propLang
}) {
  const lang = propLang || typeof window !== "undefined" && window.pos_lang || "uz";
  const [amount, setAmount] = useState(invoice.debt_to_supplier);
  const [loading, setLoading] = useState(false);
  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(amount)
        })
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-1"
  }, t.payInvoiceBtn), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400 mb-4"
  }, "Yuk xati № ", invoice.invoice_number, " (", t.debtToSupplierLabel, " ", formatMoney(invoice.debt_to_supplier), ")"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, "To'lov summasi (so'm) *"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: amount,
    onChange: e => setAmount(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-slate-100",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
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

// ------------------- OPERATIONAL EXPENSES & SPOILAGE -------------------
function ExpensesScreen({
  token,
  notify,
  t
}) {
  const lang = typeof window !== 'undefined' && window.pos_lang || typeof localStorage !== 'undefined' && localStorage.getItem('pos_lang') || 'uz';
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "💸"), /*#__PURE__*/React.createElement("span", null, t.expensesTitle)), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400"
  }, lang === 'ru' ? 'Аренда, зарплата, коммунальные услуги и списание испорченных товаров' : 'Ijara, maosh, kommunal xizmatlar va yaroqsiz tovarlarni hisobdan chiqarish')), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setIsSpoilageMode(true);
      setCreateModalOpen(true);
    },
    className: "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm"
  }, t.spoilageBtn), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setIsSpoilageMode(false);
      setCreateModalOpen(true);
    },
    className: "bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md"
  }, t.addExpenseBtn))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "block md:hidden divide-y divide-slate-100 dark:divide-slate-800"
  }, safeArray(expenses).map(exp => /*#__PURE__*/React.createElement("div", {
    key: exp.id,
    className: "p-3 space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, expenseCategoryName(exp.category, lang)), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[11px] text-slate-400"
  }, new Date(exp.expense_date).toLocaleDateString())), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-medium text-slate-800 dark:text-slate-200"
  }, exp.description, exp.product_name && /*#__PURE__*/React.createElement("span", {
    className: "block text-[11px] text-rose-500 font-mono mt-0.5"
  }, "⚠️ ", lang === 'ru' ? 'Товар' : 'Mahsulot', ": ", exp.product_name, " (", exp.spoilage_quantity, " ", lang === 'ru' ? 'шт. списано' : 'dona hisobdan chiqarildi', ")")), /*#__PURE__*/React.createElement("div", {
    className: "text-right font-mono font-bold text-sm text-rose-600 dark:text-rose-400"
  }, "-", formatMoney(exp.amount))))), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:block overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-xs"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3"
  }, t.dateLabel), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3"
  }, t.expenseCategoryLabel), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3"
  }, t.expenseDescLabel), /*#__PURE__*/React.createElement("th", {
    className: "px-4 py-3 text-right"
  }, lang === 'ru' ? 'Сумма' : 'Summa'))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200"
  }, safeArray(expenses).map(exp => /*#__PURE__*/React.createElement("tr", {
    key: exp.id,
    className: "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
  }, /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400"
  }, new Date(exp.expense_date).toLocaleDateString()), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-semibold"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, expenseCategoryName(exp.category, lang))), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-medium"
  }, exp.description, exp.product_name && /*#__PURE__*/React.createElement("span", {
    className: "block text-[11px] text-rose-500 font-mono"
  }, "⚠️ ", lang === 'ru' ? 'Товар' : 'Mahsulot', ": ", exp.product_name, " (", exp.spoilage_quantity, " ", lang === 'ru' ? 'шт. списано' : 'dona hisobdan chiqarildi', ")")), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400"
  }, "-", formatMoney(exp.amount)))))))), createModalOpen && /*#__PURE__*/React.createElement(CreateExpenseModal, {
    token: token,
    lang: lang,
    catalogSample: catalogSample,
    isSpoilage: isSpoilageMode,
    onClose: () => setCreateModalOpen(false),
    onSuccess: () => {
      setCreateModalOpen(false);
      fetchExpenses();
      notify(lang === 'ru' ? 'Расход сохранён' : 'Xarajat muvaffaqiyatli qayd etildi');
    },
    notify: notify,
    t: t,
    lang: lang
  }));
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
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await res.json();
      setData(resData);
    } catch (e) {
      notify('Hisobotni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sm text-slate-800 dark:text-slate-200"
  }, t.periodLabel), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1"
  }, [{
    id: 'today',
    label: t.periodToday
  }, {
    id: 'week',
    label: t.periodWeek
  }, {
    id: 'month',
    label: t.periodMonth
  }, {
    id: 'all',
    label: t.periodAll
  }].map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    onClick: () => setPeriod(item.id),
    className: `px-3 py-1.5 rounded-xl text-xs font-bold transition border ${period === item.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
  }, item.label)))), loading || !data ? /*#__PURE__*/React.createElement("div", {
    className: "py-20 text-center text-xs text-slate-400"
  }, t.processing) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 dark:text-slate-400 font-semibold"
  }, t.kpiRevenue), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono"
  }, formatMoney(data.revenue)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400 mt-1"
  }, data.sales_count, " ", t.kpiReceiptsCount, " (", t.kpiAvgReceipt, " ", formatMoney(data.average_receipt), ")")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 dark:text-slate-400 font-semibold"
  }, t.kpiCogs), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black text-slate-700 dark:text-slate-200 mt-1 font-mono"
  }, formatMoney(data.cogs)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400 mt-1"
  }, t.cogsDesc || (lang === 'uz' ? "Sotilgan tovarlar tannarxi" : "Себестоимость проданных товаров"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 dark:text-slate-400 font-semibold"
  }, t.kpiGrossMargin), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1 font-mono"
  }, formatMoney(data.gross_margin)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-cyan-600 dark:text-cyan-500 mt-1 font-bold"
  }, t.kpiMarginPct, " ", data.margin_percentage, "%")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 dark:text-slate-400 font-semibold"
  }, t.kpiNetProfit), /*#__PURE__*/React.createElement("div", {
    className: `text-2xl font-black mt-1 font-mono ${data.net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`
  }, formatMoney(data.net_profit)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400 mt-1"
  }, lang === 'uz' ? 'Xarajatlar ayirilgandan so‘ng' : 'После вычета расходов'))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-100 mb-3"
  }, t.paymentsBreakdownTitle), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-700 dark:text-slate-300"
  }, "💵 ", t.methodCash), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-bold text-emerald-600 dark:text-emerald-400"
  }, formatMoney(data.cash_total))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-700 dark:text-slate-300"
  }, "💳 ", t.methodCard), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-bold text-cyan-600 dark:text-cyan-400"
  }, formatMoney(data.card_total))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-700 dark:text-slate-300"
  }, "📓 ", t.methodDebt), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-bold text-amber-600 dark:text-amber-400"
  }, formatMoney(data.debt_total))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-100 mb-3"
  }, t.expensesBreakdownTitle), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, Object.entries(data?.expenses_by_category || {}).length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400 text-center py-4"
  }, lang === 'uz' ? 'Xarajatlar mavjud emas' : 'Расходов пока нет') : Object.entries(data?.expenses_by_category || {}).map(([cat, amt]) => /*#__PURE__*/React.createElement("div", {
    key: cat,
    className: "flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-700 dark:text-slate-300"
  }, expenseCategoryName(cat, lang)), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-bold text-rose-600 dark:text-rose-400"
  }, "-", formatMoney(amt))))))), data.top_selling_products && data.top_selling_products.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-100 mb-3"
  }, t.topSellingTitle), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, safeArray(data?.top_selling_products).map((item, idx) => /*#__PURE__*/React.createElement("div", {
    key: item.product_id,
    className: "flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center justify-center"
  }, idx + 1), /*#__PURE__*/React.createElement("span", {
    className: "font-medium text-xs text-slate-800 dark:text-slate-200"
  }, item.name)), /*#__PURE__*/React.createElement("div", {
    className: "font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400"
  }, item.quantity_sold, " ", lang === 'uz' ? 'dona' : 'шт.', " • ", formatMoney(item.revenue))))))));
}

// ------------------- PRICE TAG MODAL -------------------
function PriceTagModal({
  onClose,
  t,
  sessionLocal
}) {
  const [productId, setProductId] = useState(0);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState('');
  const handleGenerate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/expenses/price-tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          price,
          quantity
        })
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleGenerate,
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-800 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 mb-3"
  }, "🏷️ Fiyatka generatori"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, "Mahsulot ID"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: productId,
    onChange: e => setProductId(Number(e.target.value)),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, "Sotish narxi (so'm)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: price,
    onChange: e => setPrice(Number(e.target.value)),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, "Miqdar"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "any",
    value: quantity,
    onChange: e => setQuantity(Number(e.target.value)),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, "Shblash uchun narx"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 dark:text-slate-400 mt-1"
  }, "Barcha mahsulotlar uchun bir xil narx kiriting")), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition touch-target text-sm sm:text-base flex items-center justify-center gap-2"
  }, loading ? 'Yuborilmoqda...' : 'Generatsiya qilish'))));
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