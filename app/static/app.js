const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;
const API_BASE = '/api/v1';

// ------------------- I18N TRANSLATIONS -------------------
const TRANSLATIONS = {
  uz: {
    appName: "GroceryStore POS",
    appSubtitle: "Do'kon savdosi & Buxgalteriya",
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
    cardSwipePrompt: "Bank kartasini to'lov terminaliga tekkizing",
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
    payDebtModalTitle: "Qarz to'lovini qabul qilish",
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
    themeDark: "Qorong'i mavzu",
    themeLight: "Yorug' mavzu",
    currency: "so'm"
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
    currency: "сум"
  }
};

// Formats number to Uzbek sum with space separators: e.g. "12 500 so'm"
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
  const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;

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
  }), /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 py-2.5 shadow-sm transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl sm:text-3xl"
  }, "🛒"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, t.appName), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
  }, isOwner ? t.ownerRole : t.cashierRole)), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block"
  }, t.appSubtitle, " • UZS (so'm)"))), /*#__PURE__*/React.createElement("nav", {
    className: "flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-full"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('pos'),
    className: `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${activeTab === 'pos' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`
  }, t.tabPos), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('debts'),
    className: `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${activeTab === 'debts' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`
  }, t.tabDebts), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('catalog'),
    className: `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${activeTab === 'catalog' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`
  }, t.tabCatalog), isOwner && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('suppliers'),
    className: `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${activeTab === 'suppliers' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`
  }, t.tabSuppliers), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('expenses'),
    className: `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${activeTab === 'expenses' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`
  }, t.tabExpenses), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActiveTab('analytics'),
    className: `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`
  }, t.tabAnalytics))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, isOwner && /*#__PURE__*/React.createElement("button", {
    onClick: () => window.open('/api/backup?token=' + encodeURIComponent(token), '_blank'),
    className: "px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900 transition flex items-center gap-1 shadow-sm",
    title: lang === 'uz' ? "Baza zaxira nusxasini yuklab olish" : "Скачать резервную копию базы данных"
  }, /*#__PURE__*/React.createElement("span", null, "💾"), /*#__PURE__*/React.createElement("span", {
    className: "hidden md:inline"
  }, t.backupBtn)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setNetworkModalOpen(true),
    className: "px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900 transition flex items-center gap-1 shadow-sm",
    title: "Mobil telefon orqali ochish (QR kod)"
  }, /*#__PURE__*/React.createElement("span", null, "📲"), /*#__PURE__*/React.createElement("span", {
    className: "hidden md:inline"
  }, t.mobileQrBtn)), /*#__PURE__*/React.createElement("button", {
    onClick: toggleLang,
    className: "px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition flex items-center gap-1 shadow-sm",
    title: lang === 'uz' ? 'Русский язык' : "O'zbek tili"
  }, /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? '🇺🇿' : '🇷🇺'), /*#__PURE__*/React.createElement("span", null, lang === 'uz' ? "O'zbek" : 'Рус')), /*#__PURE__*/React.createElement("button", {
    onClick: toggleTheme,
    className: "p-1.5 rounded-xl text-xs bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-amber-300 dark:border-slate-700 dark:hover:bg-slate-700 transition shadow-sm",
    title: theme === 'dark' ? t.themeLight : t.themeDark
  }, theme === 'dark' ? '☀️' : '🌙'), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-700 dark:text-slate-300 hidden lg:inline"
  }, user.full_name), /*#__PURE__*/React.createElement("button", {
    onClick: handleLogout,
    className: "px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition font-medium",
    title: t.logout
  }, "🚪 ", /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, t.logout)))))), /*#__PURE__*/React.createElement("main", {
    className: "flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4"
  }, activeTab === 'pos' && /*#__PURE__*/React.createElement(PosScreen, {
    token: token,
    notify: notify,
    isOwner: isOwner,
    t: t
  }), activeTab === 'debts' && /*#__PURE__*/React.createElement(DebtsScreen, {
    token: token,
    notify: notify,
    t: t
  }), activeTab === 'catalog' && /*#__PURE__*/React.createElement(CatalogScreen, {
    token: token,
    notify: notify,
    isOwner: isOwner,
    t: t
  }), activeTab === 'suppliers' && isOwner && /*#__PURE__*/React.createElement(SuppliersScreen, {
    token: token,
    notify: notify,
    t: t
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
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('owner123');
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
  }, loading ? t.loggingIn : t.loginBtn)), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 pt-5 border-t border-slate-200 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 dark:text-slate-400 text-center mb-3"
  }, t.quickDemo), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setUsername('owner');
      setPassword('owner123');
      submit('owner', 'owner123');
    },
    className: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-xl transition text-center font-medium"
  }, t.ownerBtn), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setUsername('cashier');
      setPassword('cashier123');
      submit('cashier', 'cashier123');
    },
    className: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-xl transition text-center font-medium"
  }, t.cashierBtn)))));
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

// ------------------- POS TERMINAL SCREEN -------------------
function PosScreen({
  token,
  notify,
  isOwner,
  t
}) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const barcodeInputRef = useRef(null);
  useEffect(() => {
    fetchCategories();
    fetchProducts();
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
      const params = new URLSearchParams({
        limit: '30'
      });
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory.toString());
      const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setProducts(data.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  // ------------------- Voice Input (Web Speech API) -------------------
  const toggleVoiceInput = () => {
    setIsVoiceRecording(prev => !prev);
    if (isVoiceRecording) {
      // Stop recognition
      if (window.speechRecognition) {
        window.speechRecognition.stop();
      } else if (window.webkitSpeechRecognition) {
        window.webkitSpeechRecognition.stop();
      }
      setVoiceText('');
    } else {
      // Start recognition
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        const langCode = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
        recognition.lang = langCode;
        recognition.interimResults = false;
        continuous = false;

        recognition.onresult = e => {
          const transcript = e.results[0][0].transcript;
          setVoiceText(transcript);
          // Process the speech text for quick matching
          processVoiceText(transcript);
          setIsVoiceRecording(false);
        };

        recognition.onerror = e => {
          setIsVoiceRecording(false);
          notify(lang === 'uz' ? 'Sovg\'a ovoz olish xatoni / Ошибка распознавания голоса' : 'Ошибка распознавания речи', 'error');
        };

        recognition.onend = () => {
          if (isVoiceRecording) {
            recognition.start();
          }
        };

        setIsVoiceRecording(true);
        recognition.start();
      } else {
        notify(lang === 'uz' ? 'Bu brauzer Web Speech API ni qo\'llab-quvvatlamayapti / Этот браузер не поддерживает Web Speech API' : 'Этот браузер не поддерживает Web Speech API', 'error');
      }
    }
  };

  const processVoiceText = async (text) => {
    setVoiceText(text);
    try {
      const res = await fetch(`${API_BASE}/ai/voice-parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          speech_text: text,
          language: lang
        })
      });
      if (!res.ok) {
        const err = await res.json();
        notify(err.detail || 'Voice parse xatolik', 'error');
        return;
      }
      const result = await res.json();
      
      // Act on the parsed result
      if (result.detected_type === 'product' && result.suggested_sku) {
        // Find product by barcode and add to cart
        try {
          const prodRes = await fetch(`${API_BASE}/products/barcode/${result.suggested_sku}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (prodRes.ok) {
            const prod = await prodRes.json();
            addToCart(prod);
            notify(`Savatga qo'shildi: ${prod.name} (${result.quantity || 1} ta)`);
          }
        } catch (e) {
          console.error(e);
        }
      } else if (result.detected_type === 'debtor' && result.entity) {
        // Find debtor and record debt
        try {
          const debtorRes = await fetch(`${API_BASE}/debts/debtors?full_name=${encodeURIComponent(result.entity)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (debtorRes.ok) {
            const debtors = await debtorRes.json();
            if (debtors.items && debtors.items.length > 0) {
              const debtor = debtors.items[0];
              // Add debt to checkout
              const cartTotal = cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
              const payload = {
                items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
                payment_method: 'DEBT',
                debtor_id: debtor.id,
                note: `${result.entity} uchun savdo`
              };
              const checkoutRes = await fetch(`${API_BASE}/pos/checkout`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
              });
              if (checkoutRes.ok) {
                const data = await checkoutRes.json();
                notify(`Qarzga yozildi: ${data.debtor_name} uchun ${data.debt_amount} so'm`);
                setCheckoutModalOpen(false);
                setCart([]);
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        notify(`Sovg\'a ovoz: "${text}" / Голосовое ввод: "${text}"`, 'info');
      }
    } catch (err) {
      console.error(err);
      notify(lang === 'uz' ? 'AI parse xatoligi' : 'Ошибка AI parse', 'error');
    }
  };

  // Barcode Instant Lookup / Add to Cart
  const handleBarcodeSubmit = async e => {
    e.preventDefault();
    const code = barcodeQuery.trim();
    if (!code) return;
    try {
      const res = await fetch(`${API_BASE}/products/barcode/${code}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        notify(`Shtrixkod topilmadi: ${code} / Штрихкод не найден`, 'error');
        setBarcodeQuery('');
        return;
      }
      const prod = await res.json();
      addToCart(prod);
      setBarcodeQuery('');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const addToCart = product => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? {
          ...item,
          quantity: Math.round((item.quantity + 1) * 100) / 100
        } : item);
      }
      return [...prev, {
        product,
        quantity: 1.0
      }];
    });
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
  const removeFromCart = productId => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };
  const clearCart = () => setCart([]);
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  }, [cart]);
  return /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-7 xl:col-span-8 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row gap-2 transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleBarcodeSubmit,
    className: "flex-1 flex gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    ref: barcodeInputRef,
    type: "text",
    placeholder: t.barcodeScanPlaceholder,
    value: barcodeQuery,
    onChange: e => setBarcodeQuery(e.target.value),
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    id: "voice-input-btn",
    className: `bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition ${isVoiceRecording ? 'animate-pulse text-rose-600' : ''}`,
    onClick: () => toggleVoiceInput(),
    title: lang === 'uz' ? 'Voice input / Ovoz kirish' : 'Голосовой ввод'
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs"
  }, isVoiceRecording ? "🎤 Ovoz e'lon" : "🎤 Голос")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ml-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-900 transition rounded-xl py-1 px-2 text-xs font-medium",
    onClick: () => setLang(prev => prev === 'uz' ? 'ru' : 'uz'),
    title: lang === 'uz' ? 'Russian / O\'zbek' : "O'zbek / Русский"
  }, lang === 'uz' ? '🇷🇺' : '🇺🇿')), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: t.searchProductPlaceholder,
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSelectedCategory(null),
    className: `px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedCategory === null ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`
  }, t.allCategories), categories.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    onClick: () => setSelectedCategory(c.id),
    className: `px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${selectedCategory === c.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`
  }, c.name.split('/')[0].trim()))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1"
  }, products.map(p => {
    const low = p.stock_quantity <= p.min_stock_alert;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      onClick: () => addToCart(p),
      className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition shadow-sm active:scale-95 touch-target select-none"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-slate-400 font-mono flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", null, p.barcode), low && /*#__PURE__*/React.createElement("span", {
      className: "text-amber-500 font-bold"
    }, "⚠️")), /*#__PURE__*/React.createElement("h4", {
      className: "font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 mt-1"
    }, p.name)), /*#__PURE__*/React.createElement("div", {
      className: "mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] text-slate-500 dark:text-slate-400"
    }, p.stock_quantity, " ", p.unit), /*#__PURE__*/React.createElement("span", {
      className: "font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-mono"
    }, formatMoney(p.sale_price))));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-5 xl:col-span-4 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm h-full max-h-[calc(100vh-140px)] sticky top-20 transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "🛒"), /*#__PURE__*/React.createElement("span", null, t.cartTitle), /*#__PURE__*/React.createElement("span", {
    className: "text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold"
  }, cart.length)), cart.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: clearCart,
    className: "text-xs text-rose-500 hover:text-rose-600 font-semibold"
  }, t.clearCart)), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-2 py-2 pr-1"
  }, cart.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-3xl mb-2"
  }, "🧺"), /*#__PURE__*/React.createElement("p", null, t.cartEmpty)) : cart.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.product.id,
    className: "bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-2.5 flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold text-slate-900 dark:text-slate-100 truncate"
  }, item.product.name), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 dark:text-slate-400 font-mono"
  }, formatMoney(item.product.sale_price), " × ", item.quantity, " =", ' ', /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-emerald-600 dark:text-emerald-400"
  }, formatMoney(item.product.sale_price * item.quantity)))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => updateQuantity(item.product.id, -1),
    className: "w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 text-sm"
  }, "-"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-xs w-6 text-center text-slate-900 dark:text-slate-100"
  }, item.quantity), /*#__PURE__*/React.createElement("button", {
    onClick: () => updateQuantity(item.product.id, 1),
    className: "w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center hover:bg-emerald-500 text-sm"
  }, "+"), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeFromCart(item.product.id),
    className: "w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 text-xs flex items-center justify-center ml-1"
  }, "✕"))))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-500 dark:text-slate-400"
  }, t.totalToPay), /*#__PURE__*/React.createElement("span", {
    className: "text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono"
  }, formatMoney(cartTotal))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCheckoutModalOpen(true),
    disabled: cart.length === 0,
    className: "w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition touch-target text-sm sm:text-base flex items-center justify-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "💳"), /*#__PURE__*/React.createElement("span", null, t.checkoutBtn, " (", formatMoney(cartTotal), ")"))), checkoutModalOpen && /*#__PURE__*/React.createElement(CheckoutModal, {
    token: token,
    total: cartTotal,
    cart: cart,
    onClose: () => setCheckoutModalOpen(false),
    onSuccess: receipt => {
      setCheckoutModalOpen(false);
      setCart([]);
      setLastReceipt(receipt);
      notify(`Chek muvaffaqiyatli saqlandi / Чек успешно сохранен: ${receipt.receipt_number}`);
    },
    notify: notify,
    t: t
  }), lastReceipt && /*#__PURE__*/React.createElement(ReceiptModal, {
    receipt: lastReceipt,
    onClose: () => setLastReceipt(null),
    t: t
  })));
}

// ------------------- CHECKOUT MODAL (UZS DENOMINATIONS) -------------------
function CheckoutModal({
  token,
  total,
  cart,
  onClose,
  onSuccess,
  notify,
  t
}) {
  const [method, setMethod] = useState('CASH'); // CASH, CARD, DEBT
  const [cashReceived, setCashReceived] = useState(total);
  const [debtors, setDebtors] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState('');
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const [creatingDebtor, setCreatingDebtor] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchDebtors();
  }, []);
  const fetchDebtors = async () => {
    try {
      const res = await fetch(`${API_BASE}/debts/debtors?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setDebtors(data.items || []);
      if (data.items && data.items.length > 0) {
        setSelectedDebtor(data.items[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleCreateDebtor = async () => {
    if (!newDebtorName.trim()) {
      notify('Mijoz ismini kiriting / Введите имя клиента', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/debts/debtors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: newDebtorName.trim(),
          phone: newDebtorPhone.trim() || null,
          initial_debt: 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Mijoz yaratishda xatolik');
      notify(`Mijoz ${data.full_name} ro'yxatdan o'tdi`);
      await fetchDebtors();
      setSelectedDebtor(data.id);
      setCreatingDebtor(false);
      setNewDebtorName('');
      setNewDebtorPhone('');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const change = Math.max(0, Math.round(Number(cashReceived) - total));

  // Quick bills for Uzbek so'm (UZS): 10 000, 20 000, 50 000, 100 000, 200 000, plus exact total
  const UZS_QUICK_BILLS = [{
    label: t.exactAmount,
    value: total
  }, {
    label: '10 000',
    value: 10000
  }, {
    label: '20 000',
    value: 20000
  }, {
    label: '50 000',
    value: 50000
  }, {
    label: '100 000',
    value: 100000
  }, {
    label: '200 000',
    value: 200000
  }];
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        items: cart.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity
        })),
        payment_method: method,
        cash_received: method === 'CASH' ? Number(cashReceived) : 0,
        card_amount: method === 'CARD' ? total : 0,
        debt_amount: method === 'DEBT' ? total : 0,
        debtor_id: method === 'DEBT' ? Number(selectedDebtor) : null
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
      if (!res.ok) throw new Error(data.detail || 'To\'lovda xatolik yuz berdi');
      onSuccess(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 transition-colors duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-base sm:text-lg font-bold flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "💳 ", t.checkoutTitle), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-600 dark:text-emerald-400 font-extrabold font-mono"
  }, formatMoney(total))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2 mb-4"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setMethod('CASH'),
    className: `py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition border ${method === 'CASH' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
  }, "💵 ", t.methodCash), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setMethod('CARD'),
    className: `py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition border ${method === 'CARD' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
  }, "💳 ", t.methodCard), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setMethod('DEBT'),
    className: `py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition border ${method === 'DEBT' ? 'bg-amber-600 border-amber-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`
  }, "📓 ", t.methodDebt)), method === 'CASH' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.cashReceivedLabel), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: cashReceived,
    onChange: e => setCashReceived(Number(e.target.value)),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-lg font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 sm:grid-cols-6 gap-1.5"
  }, UZS_QUICK_BILLS.map((item, idx) => /*#__PURE__*/React.createElement("button", {
    key: idx,
    type: "button",
    onClick: () => setCashReceived(item.value),
    className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition"
  }, item.label))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3.5 flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-semibold text-slate-600 dark:text-slate-400"
  }, t.changeLabel), /*#__PURE__*/React.createElement("span", {
    className: `text-xl font-black font-mono ${cashReceived >= total ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`
  }, formatMoney(change)))), method === 'CARD' && /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-4xl"
  }, "💳"), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold text-slate-800 dark:text-slate-200"
  }, t.cardSwipePrompt), /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono"
  }, formatMoney(total))), method === 'DEBT' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-semibold text-slate-600 dark:text-slate-400"
  }, t.selectDebtorLabel), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCreatingDebtor(!creatingDebtor),
    className: "text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
  }, creatingDebtor ? t.cancelBtn : t.newDebtorBtn)), !creatingDebtor ? /*#__PURE__*/React.createElement("select", {
    value: selectedDebtor,
    onChange: e => setSelectedDebtor(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
  }, debtors.map(d => /*#__PURE__*/React.createElement("option", {
    key: d.id,
    value: d.id
  }, d.full_name, " (", formatMoney(d.balance), " qarz) ", d.phone || ''))) : /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: t.debtorNameLabel,
    value: newDebtorName,
    onChange: e => setNewDebtorName(e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "+998 (90) 000-00-00",
    value: newDebtorPhone,
    onChange: e => setNewDebtorPhone(e.target.value),
    className: "w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCreateDebtor,
    className: "w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded-xl text-xs"
  }, t.saveBtn))), /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-slate-600 dark:text-slate-400 font-semibold"
  }, t.debtRecorded), /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-black text-amber-600 dark:text-amber-400 font-mono"
  }, formatMoney(total)))), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-2xl text-xs font-semibold transition"
  }, t.cancelBtn), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: loading || method === 'CASH' && cashReceived < total || method === 'DEBT' && !selectedDebtor,
    onClick: handleSubmit,
    className: "flex-2 w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition"
  }, loading ? t.processing : t.confirmPayBtn))));
}

// ------------------- RECEIPT MODAL -------------------
function ReceiptModal({
  receipt,
  onClose,
  t
}) {
  const print = () => window.print();
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-900 dark:text-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-sm text-emerald-600 dark:text-emerald-400"
  }, "✅ ", t.receiptHeader), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    id: "printable-receipt",
    className: "font-mono text-xs bg-white text-black p-4 rounded-xl border border-slate-200 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center pb-2 border-b border-dashed border-slate-400"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-base"
  }, "*** GROCERY STORE ***"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px]"
  }, "Toshkent sh., Savdo markazi"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px]"
  }, "Tel: +998 (71) 200-00-00")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-0.5 text-[11px]"
  }, /*#__PURE__*/React.createElement("div", null, t.receiptNumber, " ", receipt.receipt_number), /*#__PURE__*/React.createElement("div", null, t.dateLabel, " ", new Date(receipt.created_at).toLocaleString()), /*#__PURE__*/React.createElement("div", null, t.cashierLabel, " ", receipt.cashier_name), /*#__PURE__*/React.createElement("div", null, t.paymentMethodLabel, " ", receipt.payment_method), receipt.debtor_name && /*#__PURE__*/React.createElement("div", null, t.clientName, " ", receipt.debtor_name)), /*#__PURE__*/React.createElement("div", {
    className: "py-2 border-y border-dashed border-slate-400 space-y-1"
  }, receipt.items && receipt.items.map((it, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "flex justify-between text-[11px]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "truncate pr-2"
  }, it.product_name), /*#__PURE__*/React.createElement("span", {
    className: "whitespace-nowrap font-bold"
  }, it.quantity, " × ", it.unit_price, " = ", it.total_price)))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-1 pt-1 font-bold text-[12px]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-sm"
  }, /*#__PURE__*/React.createElement("span", null, t.totalToPay), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.total_amount))), receipt.payment_method === 'CASH' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px] text-slate-600 font-normal"
  }, /*#__PURE__*/React.createElement("span", null, t.cashReceivedLabel), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.cash_received))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px] text-slate-600 font-normal"
  }, /*#__PURE__*/React.createElement("span", null, t.changeLabel), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.change_given)))), receipt.debt_amount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[11px] text-amber-700"
  }, /*#__PURE__*/React.createElement("span", null, t.debtRecorded), /*#__PURE__*/React.createElement("span", null, formatMoney(receipt.debt_amount)))), /*#__PURE__*/React.createElement("div", {
    className: "text-center pt-3 border-t border-dashed border-slate-400 text-[10px] text-slate-500"
  }, "Xaridingiz uchun rahmat! / Спасибо за покупку!")), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: print,
    className: "flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
  }, /*#__PURE__*/React.createElement("span", null, "🖨️"), /*#__PURE__*/React.createElement("span", null, t.printReceipt)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
  }, t.closeBtn))));
}

// ------------------- DEBTS NOTEBOOK (QARZLAR DAFTARI) -------------------
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
      const data = await res.json();
      setDebtors(data.items || []);
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
  }, "Qarzdor mijozlar:"), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black text-slate-800 dark:text-slate-100 mt-1"
  }, summary ? summary.active_debtors_with_debt : 0, ' ', /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-normal text-slate-400"
  }, "/ ", summary ? summary.debtors_count : 0))), /*#__PURE__*/React.createElement("span", {
    className: "text-3xl"
  }, "👥")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCreateDebtorModalOpen(true),
    className: "w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl shadow transition text-xs sm:text-sm flex items-center justify-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "➕"), /*#__PURE__*/React.createElement("span", null, t.addDebtorModalTitle)))), /*#__PURE__*/React.createElement("div", {
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
  }, debtors.map(debtor => /*#__PURE__*/React.createElement("div", {
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
  }, "\"", debtor.note, "\"")), /*#__PURE__*/React.createElement("div", {
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
    debtor: selectedDebtor,
    onClose: () => setHistoryModalOpen(false),
    t: t
  }), createDebtorModalOpen && /*#__PURE__*/React.createElement(CreateDebtorModal, {
    token: token,
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
  t
}) {
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
  t
}) {
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
  t
}) {
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
      const data = await res.json();
      setHistory(data || []);
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
  }, "Tarix bo'sh") : history.map(tx => {
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
  t
}) {
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
  t
}) {
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
    className: "flex items-center gap-2 w-full md:w-auto"
  }, /*#__PURE__*/React.createElement("input", {
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
    className: "overflow-x-auto"
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
  }, products.map(p => /*#__PURE__*/React.createElement("tr", {
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
      const data = await res.json();
      setSuppliers(data || []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setCatalogSample(data.items || []);
    } catch (e) {
      console.error(e);
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
  }, "Tovarlar qabuli, omborni to'ldirish va hisob-kitoblar")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCreateSupplierModalOpen(true),
    className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm"
  }, t.addSupplierBtn), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCreateInvoiceModalOpen(true),
    className: "bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md"
  }, t.addInvoiceBtn))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
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
  }, "Amal"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200"
  }, invoices.map(inv => /*#__PURE__*/React.createElement("tr", {
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
    onClose: () => setCreateSupplierModalOpen(false),
    onSuccess: () => {
      setCreateSupplierModalOpen(false);
      fetchSuppliers();
      notify('Yetkazib beruvchi qo\'shildi');
    },
    notify: notify,
    t: t
  }), createInvoiceModalOpen && /*#__PURE__*/React.createElement(CreateInvoiceModal, {
    token: token,
    suppliers: suppliers,
    catalogSample: catalogSample,
    onClose: () => setCreateInvoiceModalOpen(false),
    onSuccess: () => {
      setCreateInvoiceModalOpen(false);
      fetchInvoices();
      notify('Yuk xati muvaffaqiyatli qabul qilindi va ombor to\'ldirildi');
    },
    notify: notify,
    t: t
  }), payInvoiceModalOpen && selectedInvoice && /*#__PURE__*/React.createElement(PayInvoiceModal, {
    token: token,
    invoice: selectedInvoice,
    onClose: () => setPayInvoiceModalOpen(false),
    onSuccess: () => {
      setPayInvoiceModalOpen(false);
      fetchInvoices();
      notify('Ta\'minotchiga to\'lov amalga oshirildi');
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
  t
}) {
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
  t
}) {
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
          items: items.map(it => ({
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
  }, suppliers.map(s => /*#__PURE__*/React.createElement("option", {
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
  }, "+ Tovar qo'shish")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, items.map((it, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: it.product_id,
    onChange: e => updateItem(idx, 'product_id', e.target.value),
    className: "flex-2 w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"
  }, catalogSample.map(p => /*#__PURE__*/React.createElement("option", {
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
  t
}) {
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
      const data = await res.json();
      setExpenses(data || []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchCatalogSample = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setCatalogSample(data.items || []);
    } catch (e) {
      console.error(e);
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
  }, "Ijara, maosh, kommunal xizmatlar va yaroqsiz tovarlarni hisobdan chiqarish")), /*#__PURE__*/React.createElement("div", {
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
    className: "overflow-x-auto"
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
  }, "Summa"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200"
  }, expenses.map(exp => /*#__PURE__*/React.createElement("tr", {
    key: exp.id,
    className: "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
  }, /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400"
  }, new Date(exp.expense_date).toLocaleDateString()), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-semibold"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, exp.category)), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 font-medium"
  }, exp.description, exp.product_name && /*#__PURE__*/React.createElement("span", {
    className: "block text-[11px] text-rose-500 font-mono"
  }, "⚠️ Mahsulot: ", exp.product_name, " (", exp.spoilage_quantity, " dona hisobdan chiqarildi)")), /*#__PURE__*/React.createElement("td", {
    className: "px-4 py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400"
  }, "-", formatMoney(exp.amount)))))))), createModalOpen && /*#__PURE__*/React.createElement(CreateExpenseModal, {
    token: token,
    catalogSample: catalogSample,
    isSpoilage: isSpoilageMode,
    onClose: () => setCreateModalOpen(false),
    onSuccess: () => {
      setCreateModalOpen(false);
      fetchExpenses();
      notify('Xarajat muvaffaqiyatli qayd etildi');
    },
    notify: notify,
    t: t
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
  t
}) {
  const [category, setCategory] = useState(isSpoilage ? 'SPOILAGE' : 'RENT');
  const [amount, setAmount] = useState(isSpoilage ? '' : 500000);
  const [description, setDescription] = useState(isSpoilage ? 'Yaroqlilik muddati o\'tgan mahsulot' : 'Oylik xarajat');
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
  }, /*#__PURE__*/React.createElement("option", {
    value: "RENT"
  }, "RENT (Ijara)"), /*#__PURE__*/React.createElement("option", {
    value: "UTILITIES"
  }, "UTILITIES (Kommunal xizmatlar)"), /*#__PURE__*/React.createElement("option", {
    value: "SALARY"
  }, "SALARY (Ish haqi)"), /*#__PURE__*/React.createElement("option", {
    value: "TAXES"
  }, "TAXES (Soliqlar)"), /*#__PURE__*/React.createElement("option", {
    value: "TRANSPORT"
  }, "TRANSPORT (Logistika)"), /*#__PURE__*/React.createElement("option", {
    value: "OTHER"
  }, "OTHER (Boshqa)"))), isSpoilage && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
  }, t.spoilageProductLabel), /*#__PURE__*/React.createElement("select", {
    value: productId,
    onChange: e => setProductId(e.target.value),
    className: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100",
    required: true
  }, catalogSample.map(p => /*#__PURE__*/React.createElement("option", {
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
  }, t.expenseAmountLabel, " ", isSpoilage && "(ixtiyoriy, tannarxdan avtomatik hisoblanadi)"), /*#__PURE__*/React.createElement("input", {
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
  }, "Sotilgan tovarlar tannarxi")), /*#__PURE__*/React.createElement("div", {
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
  }, "Xarajatlar ayirilgandan so'ng"))), /*#__PURE__*/React.createElement("div", {
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
  }, Object.entries(data.expenses_by_category).length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400 text-center py-4"
  }, "Xarajatlar mavjud emas") : Object.entries(data.expenses_by_category).map(([cat, amt]) => /*#__PURE__*/React.createElement("div", {
    key: cat,
    className: "flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-700 dark:text-slate-300"
  }, cat), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-bold text-rose-600 dark:text-rose-400"
  }, "-", formatMoney(amt))))))), data.top_selling_products && data.top_selling_products.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-sm text-slate-900 dark:text-slate-100 mb-3"
  }, t.topSellingTitle), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, data.top_selling_products.map((item, idx) => /*#__PURE__*/React.createElement("div", {
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
  }, item.quantity_sold, " dona • ", formatMoney(item.revenue))))))));
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