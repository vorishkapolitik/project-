// Переводы платформы мониторинга цен Detox: українська, русский, English.

export const LANGS = [
  ["uk", "UA"],
  ["ru", "RU"],
  ["en", "EN"],
];

const DICT = {
  uk: {
    locale: "uk-UA",
    title: "Моніторинг цін — Aqua Миргород Detox",
    product: "Aqua Миргород Detox",
    tagline: "Мінеральна лікувально-столова вода, сильногазована. Ціни в мережах і інтернет-магазинах по всій Україні.",
    updated: "Оновлено {d}",
    brandShop: "Сайт бренду ↗",
    loading: "Завантаження…",
    loadFail: "Не вдалося завантажити дані ({s}). Перевірте інтернет і оновіть сторінку.",
    noBase:
      "Еталонні ціни сайту бренду ще не задані, тому порівняння «дешевше за сайт» вимкнене. Їх можна вписати в файл detox/config.json або підключити XML-фід товарів магазину (Horoshop → Маркетинг → Експорт).",
    overview: "Огляд за обсягами",
    siteAt: "На сайті",
    notSet: "не задано",
    marketMin: "Мінімум на ринку",
    marketAvg: "Середня",
    marketMax: "Максимум",
    sellers: "Пропозицій: {n}",
    minPerL: "Мін. за літр",
    nStores: "{c} ({n} маг.)",
    colAddr: "Адреса",
    colOld: "Стара ціна",
    below: "Дешевше за сайт: {n}",
    belowNone: "Ніхто не продає дешевше за сайт",
    offers: "Усі пропозиції",
    all: "Усі",
    allCities: "Усі міста",
    allChains: "Усі мережі",
    onlyBelow: "Тільки дешевше за сайт",
    onlyStock: "Тільки в наявності",
    exportCsv: "⬇ Завантажити CSV (Excel)",
    shown: "Показано: {n}",
    colChain: "Мережа",
    colStore: "Магазин / місто",
    colVol: "Обсяг",
    colPrice: "Ціна",
    colDisc: "Знижка",
    colDiff: "Різниця з сайтом",
    colStock: "Наявність",
    colLink: "Посилання",
    inStock: "є",
    outStock: "немає",
    until: "до {d}",
    online: "онлайн-ціна",
    nothing: "Немає пропозицій за цими фільтрами.",
    matrix: "Мінімальна ціна по мережах",
    matrixNote: "Червоним — дешевше, ніж на сайті бренду.",
    history: "Динаміка цін",
    histMin: "мінімум",
    histAvg: "середня",
    histBase: "сайт",
    histFew: "Графік з'явиться, коли накопичиться кілька днів даних (оновлення — щодня).",
    sources: "Джерела даних",
    srcOk: "пропозицій: {n}",
    srcFail: "помилка: {e}",
    srcBlocked: "закритий захистом від роботів — ціни можна додавати вручну",
    srcInternal: "ціни доступні лише через внутрішній API сайту",
    srcBrand: "еталон: {how}",
    howFeed: "XML-фід магазину",
    howManual: "ціни вписані вручну",
    howNone: "ще не задано",
    footer: "Ціни оновлюються щодня автоматично з відкритих джерел. Ціни в магазинах можуть відрізнятися від онлайн-цін.",
    langLabel: "Мова",
    sortHint: "Натисніть на заголовок, щоб відсортувати",
  },

  ru: {
    locale: "ru-RU",
    title: "Мониторинг цен — Aqua Миргород Detox",
    product: "Aqua Миргород Detox",
    tagline: "Минеральная лечебно-столовая вода, сильногазированная. Цены в сетях и интернет-магазинах по всей Украине.",
    updated: "Обновлено {d}",
    brandShop: "Сайт бренда ↗",
    loading: "Загрузка…",
    loadFail: "Не удалось загрузить данные ({s}). Проверьте интернет и обновите страницу.",
    noBase:
      "Эталонные цены сайта бренда ещё не заданы, поэтому сравнение «дешевле сайта» выключено. Их можно вписать в файл detox/config.json или подключить XML-фид товаров магазина (Horoshop → Маркетинг → Экспорт).",
    overview: "Обзор по объёмам",
    siteAt: "На сайте",
    notSet: "не задано",
    marketMin: "Минимум на рынке",
    marketAvg: "Средняя",
    marketMax: "Максимум",
    sellers: "Предложений: {n}",
    minPerL: "Мин. за литр",
    nStores: "{c} ({n} маг.)",
    colAddr: "Адрес",
    colOld: "Старая цена",
    below: "Дешевле сайта: {n}",
    belowNone: "Никто не продаёт дешевле сайта",
    offers: "Все предложения",
    all: "Все",
    allCities: "Все города",
    allChains: "Все сети",
    onlyBelow: "Только дешевле сайта",
    onlyStock: "Только в наличии",
    exportCsv: "⬇ Скачать CSV (Excel)",
    shown: "Показано: {n}",
    colChain: "Сеть",
    colStore: "Магазин / город",
    colVol: "Объём",
    colPrice: "Цена",
    colDisc: "Скидка",
    colDiff: "Разница с сайтом",
    colStock: "Наличие",
    colLink: "Ссылка",
    inStock: "есть",
    outStock: "нет",
    until: "до {d}",
    online: "онлайн-цена",
    nothing: "Нет предложений по этим фильтрам.",
    matrix: "Минимальная цена по сетям",
    matrixNote: "Красным — дешевле, чем на сайте бренда.",
    history: "Динамика цен",
    histMin: "минимум",
    histAvg: "средняя",
    histBase: "сайт",
    histFew: "График появится, когда накопится несколько дней данных (обновление — ежедневно).",
    sources: "Источники данных",
    srcOk: "предложений: {n}",
    srcFail: "ошибка: {e}",
    srcBlocked: "закрыт защитой от роботов — цены можно добавлять вручную",
    srcInternal: "цены доступны только через внутренний API сайта",
    srcBrand: "эталон: {how}",
    howFeed: "XML-фид магазина",
    howManual: "цены вписаны вручную",
    howNone: "ещё не задан",
    footer: "Цены обновляются ежедневно автоматически из открытых источников. Цены в магазинах могут отличаться от онлайн-цен.",
    langLabel: "Язык",
    sortHint: "Нажмите на заголовок, чтобы отсортировать",
  },

  en: {
    locale: "en-GB",
    title: "Price monitor — Aqua Myrgorod Detox",
    product: "Aqua Myrgorod Detox",
    tagline: "Medicinal table mineral water, sparkling. Prices across retail chains and online stores in Ukraine.",
    updated: "Updated {d}",
    brandShop: "Brand shop ↗",
    loading: "Loading…",
    loadFail: "Couldn't load data ({s}). Check your connection and reload.",
    noBase:
      "The brand shop's reference prices aren't set yet, so the “cheaper than the shop” check is off. Add them to detox/config.json or connect the shop's XML product feed (Horoshop → Marketing → Export).",
    overview: "Overview by bottle size",
    siteAt: "Brand shop",
    notSet: "not set",
    marketMin: "Lowest on the market",
    marketAvg: "Average",
    marketMax: "Highest",
    sellers: "Offers: {n}",
    minPerL: "Lowest per litre",
    nStores: "{c} ({n} stores)",
    colAddr: "Address",
    colOld: "Old price",
    below: "Cheaper than shop: {n}",
    belowNone: "Nobody sells below the shop price",
    offers: "All offers",
    all: "All",
    allCities: "All cities",
    allChains: "All chains",
    onlyBelow: "Only cheaper than shop",
    onlyStock: "Only in stock",
    exportCsv: "⬇ Download CSV (Excel)",
    shown: "Showing: {n}",
    colChain: "Chain",
    colStore: "Store / city",
    colVol: "Size",
    colPrice: "Price",
    colDisc: "Discount",
    colDiff: "vs shop",
    colStock: "Stock",
    colLink: "Link",
    inStock: "yes",
    outStock: "no",
    until: "until {d}",
    online: "online price",
    nothing: "No offers match these filters.",
    matrix: "Lowest price by chain",
    matrixNote: "Red: cheaper than the brand shop.",
    history: "Price history",
    histMin: "lowest",
    histAvg: "average",
    histBase: "shop",
    histFew: "The chart appears once a few days of data have built up (updated daily).",
    sources: "Data sources",
    srcOk: "offers: {n}",
    srcFail: "error: {e}",
    srcBlocked: "protected against bots — prices can be added manually",
    srcInternal: "prices only available through the site's internal API",
    srcBrand: "reference: {how}",
    howFeed: "shop XML feed",
    howManual: "entered manually",
    howNone: "not set yet",
    footer: "Prices are collected daily and automatically from public sources. In-store prices may differ from online prices.",
    langLabel: "Language",
    sortHint: "Click a column header to sort",
  },
};

const CITIES = {
  Київ: ["Киев", "Kyiv"], Харків: ["Харьков", "Kharkiv"], Одеса: ["Одесса", "Odesa"], Львів: ["Львов", "Lviv"],
  "Львів Сокільники": ["Львов (Сокольники)", "Lviv (Sokilnyky)"], Дніпро: ["Днепр", "Dnipro"],
  Вінниця: ["Винница", "Vinnytsia"], Житомир: ["Житомир", "Zhytomyr"], Рівне: ["Ровно", "Rivne"],
  "Івано-Франківськ": ["Ивано-Франковск", "Ivano-Frankivsk"], Чернівці: ["Черновцы", "Chernivtsi"],
  "Кривий Ріг": ["Кривой Рог", "Kryvyi Rih"], Полтава: ["Полтава", "Poltava"], Татарів: ["Татаров", "Tatariv"],
  Запоріжжя: ["Запорожье", "Zaporizhzhia"],
};

const CHAINS = {
  auchan: ["Ашан", "Ашан", "Auchan"], epicentr: ["Епіцентр", "Эпицентр", "Epicentr"], cosmos: ["Космос", "Космос", "Kosmos"],
  tavriav: ["Таврія В", "Таврия В", "Tavria V"], vostorg: ["Восторг", "Восторг", "Vostorg"],
  chudomarket: ["Чудо Маркет", "Чудо Маркет", "Chudo Market"], kharkiv: ["Харків", "Харьков", "Kharkiv"],
  torba: ["Торба", "Торба", "Torba"], zaraz: ["За Раз", "За Раз", "Za Raz"], ekomarket: ["ЕкоМаркет", "ЭкоМаркет", "EkoMarket"],
  atb: ["АТБ", "АТБ", "ATB"],
};

const KEY = "detox-lang";

function detect() {
  try {
    const saved = localStorage.getItem(KEY);
    if (DICT[saved]) return saved;
  } catch {}
  for (const l of navigator.languages || [navigator.language || ""]) {
    const code = l.slice(0, 2).toLowerCase();
    if (DICT[code]) return code;
  }
  return "uk";
}

export let lang = detect();

export function setLang(l) {
  if (!DICT[l]) return;
  lang = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {}
}

export function t(key, vars) {
  let s = DICT[lang][key] ?? DICT.uk[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  return s;
}

const pos = () => ({ uk: 0, ru: 1, en: 2 })[lang];

export const cityName = (c) => (!c || lang === "uk" ? c : CITIES[c]?.[pos() - 1] || c);
export const chainName = (id, fallback) => CHAINS[id]?.[pos()] || fallback || id;
export const locale = () => DICT[lang].locale;
