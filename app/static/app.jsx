const { useState, useEffect, useMemo, useRef } = React;

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
      {zReportOpen && <ZReportModal onClose={() => setZReportOpen(false)} t={t} />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 py-2.5 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          {/* Logo & Shop Info */}
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🛒</span>
            <div>
              <div className="font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span>{t.appName}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                  {isOwner ? t.ownerRole : t.cashierRole}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.appSubtitle} • UZS (so'm)
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-full">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${
                activeTab === 'pos'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.tabPos}
            </button>
            <button
              onClick={() => setActiveTab('debts')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${
                activeTab === 'debts'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.tabDebts}
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${
                activeTab === 'catalog'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.tabCatalog}
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => setActiveTab('suppliers')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${
                    activeTab === 'suppliers'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.tabSuppliers}
                </button>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${
                    activeTab === 'expenses'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.tabExpenses}
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${
                    activeTab === 'analytics'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.tabAnalytics}
                </button>
                <button
                  onClick={() => setActiveTab('telegram')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap touch-target ${
                    activeTab === 'telegram'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  🤖 Telegram
                </button>
              </>
            )}
          </nav>

          {/* Controls: Theme, Language, Mobile QR, User info */}
          <div className="flex items-center gap-2">
            {/* Backup Button for Owner */}
            {isOwner && (
              <button
                onClick={() => window.open('/api/backup?token=' + encodeURIComponent(token), '_blank')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900 transition flex items-center gap-1 shadow-sm"
                title={lang === 'uz' ? "Baza zaxira nusxasini yuklab olish" : "Скачать резервную копию базы данных"}
              >
                <span>💾</span>
                <span className="hidden md:inline">{t.backupBtn}</span>
              </button>
            )}
            {/* Mobile QR Button */}
            <button
              onClick={() => setNetworkModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900 transition flex items-center gap-1 shadow-sm"
              title="Mobil telefon orqali ochish (QR kod)"
            >
              <span>📲</span>
              <span className="hidden md:inline">{t.mobileQrBtn}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition flex items-center gap-1 shadow-sm"
              title={lang === 'uz' ? 'Русский язык' : "O'zbek tili"}
            >
              <span>{lang === 'uz' ? '🇺🇿' : '🇷🇺'}</span>
              <span>{lang === 'uz' ? "O'zbek" : 'Рус'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-xs bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-amber-300 dark:border-slate-700 dark:hover:bg-slate-700 transition shadow-sm"
              title={theme === 'dark' ? t.themeLight : t.themeDark}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* User & Logout */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden lg:inline">
                {user.full_name}
              </span>
              <button
                onClick={handleLogout}
                className="px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition font-medium"
                title={t.logout}
              >
                🚪 <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4">
        {activeTab === 'pos' && <PosScreen token={token} notify={notify} isOwner={isOwner} t={t} />}
        {activeTab === 'debts' && <DebtsScreen token={token} notify={notify} t={t} />}
        {activeTab === 'catalog' && <CatalogScreen token={token} notify={notify} isOwner={isOwner} t={t} />}
        {activeTab === 'suppliers' && isOwner && <SuppliersScreen token={token} notify={notify} t={t} />}
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

// ------------------- POS TERMINAL SCREEN -------------------
function PosScreen({ token, notify, isOwner, t }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [holdingCart, setHoldingCart] = useState(false);

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
      const params = new URLSearchParams({ limit: '30' });
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

  // Web Audio API beep function
  const playBeep = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Barcode Scanner via camera / BarcodeDetector API
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState('');

  const startScanner = async () => {
    setScannerError('');
    try {
      // Use BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        const detector = new BarcodeDetector({ formats: ['ean_13', 'upc_e', 'code_128'] });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facing: 'environment', facingMode: { exact: 'environment' } }
        });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.plays = true;
        video.style.display = 'none';
        document.body.appendChild(video);

        const canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const config = { color: 'rgb(0, 0, 0)', width: 640, height: 480 };
        const tick = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const result = detector.detect(canvas);
          result.forEach((barcode) => {
            const code = barcode.raw_value;
            if (code) {
              const prodRes = await fetch(`${API_BASE}/products/barcode/${code}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (prodRes.ok) {
                const prod = await prodRes.json();
                addToCart(prod);
                playBeep();
                // Stop stream and cleanup
                stream.getTracks().forEach(t => t.stop());
                document.body.removeChild(video);
                document.body.removeChild(canvas);
                setScannerActive(false);
                notify(`Shtrixkod qabul qilindi: ${code} / Штрихкод распознан: ${code}`);
              }
            }
          });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } else {
        // Fallback: prompt manual entry since no BarcodeDetector support
        notify('Sizning brauzeringiz BarcodeDetector API yordamida kamera skanerini qo\'llab-quvvatlaymiga emas / Ваш браузер не поддерживает BarcodeDetector API для камерного сканирования', 'error');
      }
    } catch (err) {
      console.error(err);
      setScannerError(err.message);
      notify('Skanerda xatolik yuz berdi / Произошла ошибка в сканере', 'error');
    }
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeQuery.trim();
    if (!code) return;

    try {
      const res = await fetch(`${API_BASE}/products/barcode/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        notify(`Shtrixkod topilmadi: ${code} / Штрихкод не найден`, 'error');
        setBarcodeQuery('');
        return;
      }
      const prod = await res.json();
      addToCart(prod);
      playBeep();
      setBarcodeQuery('');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const holdCurrentCart = async () => {
    setHoldingCart(true);
    try {
      const res = await fetch(`${API_BASE}/pos/hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cart_items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity
        })) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Hold xatolik');
      notify(data.message || 'Chek saqlandi');
      setCart([]);
      setHoldingCart(false);
    } catch (err) {
      notify(err.message, 'error');
      setHoldingCart(false);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.round((item.quantity + 1) * 100) / 100 }
            : item
        );
      }
      return [...prev, { product, quantity: 1.0 }];
    });
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

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  }, [cart]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      {/* Products & Fast Selection (8 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-3">
        {/* Search & Barcode Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row gap-2 transition-colors duration-200">
          <form onSubmit={handleBarcodeSubmit} className="flex-1 flex gap-2">
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder={t.barcodeScanPlaceholder}
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition"
            >
              ↵
            </button>
          </form>

          {/* Scanner Button */}
          {isOwner ? (
            <>
              <button
                onClick={startScanner}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition"
                disabled={scannerActive}
                title={lang === 'uz' ? 'Kameradan shtrixkod skanerish' : 'Сканер через камеру'}
              >
                <span>{scannerActive ? '⏺️' : '📷'}</span>
                <span className="hidden md:inline">{scannerActive ? ' Skaner yo\'q' : 'Skaner'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => notify('Kassada skaner avtomatik emas / В кассе нет автоматического сканера', 'info')}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition"
              title="Cashier mode: manual barcode entry only"
            >
              <span>📷</span>
              <span className="hidden md:inline">Manuel</span>
            </button>
          )}

          <input
            type="text"
            placeholder={t.searchProductPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedCategory === null
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedCategory === c.id
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {c.name.split('/')[0].trim()}
            </button>
          ))}
        </div>

        {/* Quick Items Grid - Popular & Weight Items */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pb-2">
          {/* Weight items (no barcode needed) - Uz locale */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => lookupAndAddQuickItem('uz', 'bread')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Bread / Хлеб"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🍞</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('uz', 'tandyr_lepeshka')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Tandyr Lepeshka / Тандыр лепешка"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🫓</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('uz', 'sugar')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Sugar / Сахар"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🍚</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('uz', 'potatoes')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Potatoes / Картофель"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🥔</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => lookupAndAddQuickItem('uz', 'onions')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Onions / Лук"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🧅</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('uz', 'eggs')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Eggs / Яйца"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🥚</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('oz', 'bread')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Bread / Хлеб"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🍞</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('oz', 'tandyr_lepeshka')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Tandyr Lepeshka / Тандыр лепешка"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🫓</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('oz', 'sugar')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Sugar / Сахар"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🍚</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('oz', 'potatoes')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Potatoes / Картофель"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🥔</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('oz', 'onions')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Onions / Лук"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🧅</span>
            </button>
            <button
              onClick={() => lookupAndAddQuickItem('oz', 'eggs')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition text-center touch-target"
              title="Eggs / Яйца"
            >
              {t.quickDemo}{' '}
              <span className="text-[10px]">🥚</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {products.map((p) => {
            const low = p.stock_quantity <= p.min_stock_alert;
            return (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition shadow-sm active:scale-95 touch-target select-none"
              >
                <div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{p.barcode}</span>
                    {low && <span className="text-amber-500 font-bold">⚠️</span>}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 mt-1">
                    {p.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {p.stock_quantity} {p.unit}
                  </span>
                  <span className="font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatMoney(p.sale_price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout Panel (4-5 cols) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm h-full max-h-[calc(100vh-140px)] sticky top-20 transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-2">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🛒</span>
            <span>{t.cartTitle}</span>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              {cart.length}
            </span>
          </h3>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
            >
              {t.clearCart}
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
          {cart.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
              <span className="text-3xl mb-2">🧺</span>
              <p>{t.cartEmpty}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-2.5 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {formatMoney(item.product.sale_price)} × {item.quantity} ={' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(item.product.sale_price * item.quantity)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 text-sm"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs w-6 text-center text-slate-900 dark:text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center hover:bg-emerald-500 text-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 text-xs flex items-center justify-center ml-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.totalToPay}</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatMoney(cartTotal)}
            </span>
          </div>

          {/* Hold Cart Button */}
          {cart.length > 0 && !holdingCart && (
            <button
              onClick={() => holdCurrentCart()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition touch-target text-sm sm:text-base flex items-center justify-center gap-2"
              title={lang === 'uz' ? 'Hozirgi chekni saqlash va Keyingi mijozga o'tish / Сохранить текущий чек и перевести следующего клиента' : 'Сохранить текущий чек и перевести следующего клиента'}
            >
              <span>📌</span>
              <span>Hold ({formatMoney(cartTotal)})</span>
            </button>
          )}

          <button
            onClick={() => setCheckoutModalOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition touch-target text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <span>💳</span>
            <span>{t.checkoutBtn} ({formatMoney(cartTotal)})</span>
          </button>
        </div>

        {/* Checkout Payment Modal */}
        {checkoutModalOpen && (
          <CheckoutModal
            token={token}
            total={cartTotal}
            cart={cart}
            onClose={() => setCheckoutModalOpen(false)}
            onSuccess={(receipt) => {
              setCheckoutModalOpen(false);
              setCart([]);
              setLastReceipt(receipt);
              notify(`Chek muvaffaqiyatli saqlandi / Чек успешно сохранен: ${receipt.receipt_number}`);
            }}
            notify={notify}
            t={t}
          />
        )}

        {/* Receipt Modal */}
        {lastReceipt && (
          <ReceiptModal receipt={lastReceipt} onClose={() => setLastReceipt(null)} t={t} />
        )}
      </div>
    </div>
  );
}

// ------------------- CHECKOUT MODAL (UZS DENOMINATIONS) -------------------
function CheckoutModal({ token, total, cart, onClose, onSuccess, notify, t }) {
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
        headers: { Authorization: `Bearer ${token}` }
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
  const UZS_QUICK_BILLS = [
    { label: t.exactAmount, value: total },
    { label: '10 000', value: 10000 },
    { label: '20 000', value: 20000 },
    { label: '50 000', value: 50000 },
    { label: '100 000', value: 100000 },
    { label: '200 000', value: 200000 }
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
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

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <span>💳 {t.checkoutTitle}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">
              {formatMoney(total)}
            </span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">
            ✕
          </button>
        </div>

        {/* Method Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMethod('CASH')}
            className={`py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition border ${
              method === 'CASH'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            💵 {t.methodCash}
          </button>
          <button
            type="button"
            onClick={() => setMethod('CARD')}
            className={`py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition border ${
              method === 'CARD'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            💳 {t.methodCard}
          </button>
          <button
            type="button"
            onClick={() => setMethod('DEBT')}
            className={`py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition border ${
              method === 'DEBT'
                ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📓 {t.methodDebt}
          </button>
        </div>

        {/* CASH FORM */}
        {method === 'CASH' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.cashReceivedLabel}
              </label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-lg font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick cash bill buttons (UZS) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {UZS_QUICK_BILLS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCashReceived(item.value)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3.5 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.changeLabel}</span>
              <span
                className={`text-xl font-black font-mono ${
                  cashReceived >= total ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}
              >
                {formatMoney(change)}
              </span>
            </div>
          </div>
        )}

        {/* CARD FORM */}
        {method === 'CARD' && (
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2">
            <div className="text-4xl">💳</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.cardSwipePrompt}</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatMoney(total)}
            </div>
          </div>
        )}

        {/* DEBT FORM */}
        {method === 'DEBT' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t.selectDebtorLabel}
                </label>
                <button
                  type="button"
                  onClick={() => setCreatingDebtor(!creatingDebtor)}
                  className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
                >
                  {creatingDebtor ? t.cancelBtn : t.newDebtorBtn}
                </button>
              </div>

              {!creatingDebtor ? (
                <select
                  value={selectedDebtor}
                  onChange={(e) => setSelectedDebtor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {debtors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({formatMoney(d.balance)} qarz) {d.phone || ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
                  <input
                    type="text"
                    placeholder={t.debtorNameLabel}
                    value={newDebtorName}
                    onChange={(e) => setNewDebtorName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="+998 (90) 000-00-00"
                    value={newDebtorPhone}
                    onChange={(e) => setNewDebtorPhone(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleCreateDebtor}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded-xl text-xs"
                  >
                    {t.saveBtn}
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex justify-between items-center">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t.debtRecorded}</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                {formatMoney(total)}
              </span>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-2xl text-xs font-semibold transition"
          >
            {t.cancelBtn}
          </button>
          <button
            type="button"
            disabled={loading || (method === 'CASH' && cashReceived < total) || (method === 'DEBT' && !selectedDebtor)}
            onClick={handleSubmit}
            className="flex-2 w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition"
          >
            {loading ? t.processing : t.confirmPayBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- RECEIPT MODAL -------------------
function ReceiptModal({ receipt, onClose, t }) {
  const print = () => window.print();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">✅ {t.receiptHeader}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
        </div>

        {/* Printable thermal receipt view (80mm) */}
        <div id="printable-receipt" className="font-mono text-xs bg-white text-black p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="text-center pb-2 border-b border-dashed border-slate-400">
            <div className="font-bold text-base">*** GROCERY STORE ***</div>
            <div className="text-[10px]">Toshkent sh., Savdo markazi</div>
            <div className="text-[10px]">Tel: +998 (71) 200-00-00</div>
          </div>

          <div className="space-y-0.5 text-[11px]">
            <div>{t.receiptNumber} {receipt.receipt_number}</div>
            <div>{t.dateLabel} {new Date(receipt.created_at).toLocaleString()}</div>
            <div>{t.cashierLabel} {receipt.cashier_name}</div>
            <div>{t.paymentMethodLabel} {receipt.payment_method}</div>
            {receipt.debtor_name && <div>{t.clientName} {receipt.debtor_name}</div>}
          </div>

          <div className="py-2 border-y border-dashed border-slate-400 space-y-1">
            {receipt.items && receipt.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="truncate pr-2">{it.product_name}</span>
                <span className="whitespace-nowrap font-bold">
                  {it.quantity} × {it.unit_price} = {it.total_price}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-1 font-bold text-[12px]">
            <div className="flex justify-between text-sm">
              <span>{t.totalToPay}</span>
              <span>{formatMoney(receipt.total_amount)}</span>
            </div>
            {receipt.payment_method === 'CASH' && (
              <>
                <div className="flex justify-between text-[11px] text-slate-600 font-normal">
                  <span>{t.cashReceivedLabel}</span>
                  <span>{formatMoney(receipt.cash_received)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 font-normal">
                  <span>{t.changeLabel}</span>
                  <span>{formatMoney(receipt.change_given)}</span>
                </div>
              </>
            )}
            {receipt.debt_amount > 0 && (
              <div className="flex justify-between text-[11px] text-amber-700">
                <span>{t.debtRecorded}</span>
                <span>{formatMoney(receipt.debt_amount)}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[10px] text-slate-500">
            Xaridingiz uchun rahmat! / Спасибо за покупку!
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={print}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
          >
            <span>🖨️</span>
            <span>{t.printReceipt}</span>
          </button>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- DEBTS NOTEBOOK (QARZLAR DAFTARI) -------------------
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

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center">
          <button
            onClick={() => setCreateDebtorModalOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl shadow transition text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <span>➕</span>
            <span>{t.addDebtorModalTitle}</span>
          </button>
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
function CatalogScreen({ token, notify, isOwner, t }) {
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

        <div className="flex items-center gap-2 w-full md:w-auto">
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

          {/* Telegram Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm mt-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">🤖 Telegram</h3>
            <div className="space-y-3">
              <button
                onClick={() => setTestSendOpen(true)}
                className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition"
              >
                📤 Test xabir yuborish / Отправить тестовое сообщение
              </button>
              <button
                onClick={() => setZReportOpen(true)}
                className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 py-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-300 transition"
              >
                📊 Z-gesini yuborish / Отправить Z-отчет
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bot Token va Owner Chat ID avtomatik .env faylidan oqiladi.
              </p>
            </div>
          </div>

        </>
      )}
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
