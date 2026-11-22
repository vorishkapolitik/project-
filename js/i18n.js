// Переводы интерфейса: українська, русский, English.
// Названия пива и состав остаются как в магазинах (на украинском).

export const LANGS = [
  ["uk", "UA"],
  ["ru", "RU"],
  ["en", "EN"],
];

const DICT = {
  uk: {
    locale: "uk-UA",
    appName: "Пивомер",
    appTitle: "Пивомер — ціни на пиво в Україні",
    loading: "Завантаження…",
    loadFail: "Не вдалося завантажити ціни ({s})",
    checkNet: "Перевірте інтернет і оновіть сторінку.",
    scanBtn: "Сканувати штрихкод",
    photoBtn: "Фото етикетки",
    searchPh: "Назва: Оболонь, Heineken, IPA…",
    tabDeals: "🔥 Знижки",
    tabCheap: "💸 Дешевше за літр",
    tabStrong: "💪 Міцне",
    tabZero: "🚗 Безалкогольне",
    country: "Країна",
    allCountries: "🌍 Усі країни",
    showMore: "Показати ще ({n})",
    nothing: "Нічого не знайшлося. Спробуйте інше написання або відскануйте штрихкод.",
    footStats: "Видів пива: {n} · мереж: {m}: {list}.",
    footSrc: "Ціни оновлюються щодня за даними zakaz.ua (на {d}); у магазині можуть відрізнятися. Опис за штрихкодом — Open Food Facts.",
    footInstall: "Додайте на головний екран: iPhone — «Поділитися → На екран „Додому“», Android — меню ⋮ → «Встановити застосунок».",
    perL: "/л",
    back: "‹ Назад",
    home: "‹ На головну",
    minPrice: "мін. ціна · {c}",
    avgPrice: "середня (мереж: {n})",
    perLitre: "за літр",
    dealNote: "🔥 Зараз є знижка до <b>{n}%</b> — дивіться список нижче.",
    whereBuy: "Де купити",
    inStock: "в наявності",
    outStock: "немає в наявності",
    until: "до {d}",
    openStore: "Відкрити в магазині",
    priceNoteCity: "Ціни інтернет-магазинів мереж у місті {c} (оновлено {d}). У звичайних магазинах ціна може трохи відрізнятися.",
    priceNoteAll: "Мінімальна ціна кожної мережі по всій Україні, місто вказано поруч із мережею (оновлено {d}). Оберіть місто на головній, щоб бачити ціни тільки в ньому.",
    allUkraine: "🇺🇦 Уся Україна",
    cityLabel: "Місто",
    nStores: "{n} маг.",
    inCity: "у місті {c}",
    notInCity: "У місті {c} цього пива немає в інтернет-магазинах мереж — показано ціни по всій Україні.",
    trendAll: "по Україні",
    priceTrend: "Динаміка ціни",
    trendAria: "Динаміка мінімальної ціни",
    since: "З {d}:",
    about: "Про пиво",
    beer: "пиво",
    abv: "міцність {n}%",
    brand: "Марка: {v}.",
    countryIs: "Країна: {v}.",
    producer: "Виробник: {v}.",
    ingredients: "Склад:",
    barcode: "Штрихкод: {v}",
    otherOf: "Інші варіанти {v}",
    offName: "Назва у світовій базі: {v}",
    offOrigin: "Походження: {v}",
    barcodeTitle: "Штрихкод {v}",
    searchingWorld: "Шукаю у світовій базі пива…",
    noName: "Без назви",
    notBeer: "Схоже, це не пиво 🙂",
    openOff: "Відкрити в Open Food Facts ↗",
    notInStores: "Цього штрихкоду немає в інтернет-магазинах мереж, тому точної ціни немає.",
    notInOff: "У світовій базі Open Food Facts його теж поки немає (або немає інтернету).",
    maybe: "Можливо, ви шукали",
    findByName: "Знайти за назвою",
    orFindByName: "Або знайдіть за назвою",
    examplePh: "Наприклад: Оболонь Преміум",
    find: "Знайти",
    close: "✕ Закрити",
    torch: "🔦 Ліхтарик",
    aimHint: "Наведіть камеру на штрихкод на банці чи пляшці",
    typeCode: "або введіть цифри штрихкода",
    noCamera: "Камера недоступна в цьому браузері",
    camDenied: "Немає доступу до камери. Дозвольте його в налаштуваннях браузера",
    typeManually: "Можна ввести цифри штрихкода вручну.",
    yourPhoto: "Ваше фото",
    preparing: "Готуюся…",
    ocrLoading: "Завантажую розпізнавання…",
    ocrReading: "Читаю етикетку…",
    ocrDone: "Готово",
    firstTime: "Перший раз завантаження триває до хвилини, далі швидше — усе працює прямо на телефоні.",
    ocrFail: "Не вдалося розпізнати: {v}",
    ocrLibFail: "не вдалося завантажити розпізнавання тексту",
    looksLike: "Схоже на",
    noMatch: "Не вдалося впізнати пиво за фото. Сфотографуйте етикетку ближче й рівніше, при доброму світлі — або відскануйте штрихкод: це точніше.",
    anotherPhoto: "📷 Інше фото",
    barcodeBtn: "▥ Штрихкод",
    ocrText: "Розпізнаний текст",
    empty: "(порожньо)",
    langLabel: "Мова",
    style: {
      nonalc: "Безалкогольне", neipa: "NEIPA", ipa: "IPA", pale: "Пейл-ель", stout: "Стаут",
      porter: "Портер", wheat: "Пшеничне", pils: "Пілснер", sour: "Кисле", flavored: "Зі смаком",
      bock: "Бок", dark: "Темне", ale: "Ель", light: "Світле", unfiltered: "Нефільтроване",
      trappist: "Трапістське", abbey: "Абатське", amber: "Бурштинове", red: "Червоне",
      brown: "Браун-ель", lager: "Лагер", craft: "Крафтове",
    },
  },

  ru: {
    locale: "ru-RU",
    appName: "Пивомер",
    appTitle: "Пивомер — цены на пиво в Украине",
    loading: "Загрузка…",
    loadFail: "Не удалось загрузить цены ({s})",
    checkNet: "Проверьте интернет и обновите страницу.",
    scanBtn: "Сканировать штрихкод",
    photoBtn: "Фото этикетки",
    searchPh: "Название: Оболонь, Heineken, IPA…",
    tabDeals: "🔥 Скидки",
    tabCheap: "💸 Дешевле за литр",
    tabStrong: "💪 Крепкое",
    tabZero: "🚗 Безалкогольное",
    country: "Страна",
    allCountries: "🌍 Все страны",
    showMore: "Показать ещё ({n})",
    nothing: "Ничего не нашлось. Попробуйте другое написание или отсканируйте штрихкод.",
    footStats: "Видов пива: {n} · сетей: {m}: {list}.",
    footSrc: "Цены обновляются раз в день по данным zakaz.ua (на {d}); в магазине могут отличаться. Описание по штрихкоду — Open Food Facts.",
    footInstall: "Добавьте на главный экран: iPhone — «Поделиться → На экран „Домой“», Android — меню ⋮ → «Установить приложение».",
    perL: "/л",
    back: "‹ Назад",
    home: "‹ На главную",
    minPrice: "мин. цена · {c}",
    avgPrice: "средняя (сетей: {n})",
    perLitre: "за литр",
    dealNote: "🔥 Сейчас есть скидка до <b>{n}%</b> — смотрите список ниже.",
    whereBuy: "Где купить",
    inStock: "в наличии",
    outStock: "нет в наличии",
    until: "до {d}",
    openStore: "Открыть в магазине",
    priceNoteCity: "Цены интернет-магазинов сетей в городе {c} (обновлено {d}). В обычных магазинах цена может немного отличаться.",
    priceNoteAll: "Минимальная цена каждой сети по всей Украине, город указан рядом с сетью (обновлено {d}). Выберите город на главной, чтобы видеть цены только в нём.",
    allUkraine: "🇺🇦 Вся Украина",
    cityLabel: "Город",
    nStores: "{n} маг.",
    inCity: "в городе {c}",
    notInCity: "В городе {c} этого пива нет в интернет-магазинах сетей — показаны цены по всей Украине.",
    trendAll: "по Украине",
    priceTrend: "Динамика цены",
    trendAria: "Динамика минимальной цены",
    since: "С {d}:",
    about: "О пиве",
    beer: "пиво",
    abv: "крепость {n}%",
    brand: "Марка: {v}.",
    countryIs: "Страна: {v}.",
    producer: "Производитель: {v}.",
    ingredients: "Состав:",
    barcode: "Штрихкод: {v}",
    otherOf: "Другие варианты {v}",
    offName: "Название в мировой базе: {v}",
    offOrigin: "Происхождение: {v}",
    barcodeTitle: "Штрихкод {v}",
    searchingWorld: "Ищу в мировой базе пива…",
    noName: "Без названия",
    notBeer: "Похоже, это не пиво 🙂",
    openOff: "Открыть в Open Food Facts ↗",
    notInStores: "Этого штрихкода нет в интернет-магазинах сетей, поэтому точной цены нет.",
    notInOff: "В мировой базе Open Food Facts его тоже пока нет (или нет интернета).",
    maybe: "Возможно, вы искали",
    findByName: "Найти по названию",
    orFindByName: "Или найдите по названию",
    examplePh: "Например: Оболонь Премиум",
    find: "Найти",
    close: "✕ Закрыть",
    torch: "🔦 Фонарик",
    aimHint: "Наведите камеру на штрихкод на банке или бутылке",
    typeCode: "или введите цифры штрихкода",
    noCamera: "Камера недоступна в этом браузере",
    camDenied: "Нет доступа к камере. Разрешите его в настройках браузера",
    typeManually: "Можно ввести цифры штрихкода вручную.",
    yourPhoto: "Ваше фото",
    preparing: "Готовлюсь…",
    ocrLoading: "Загружаю распознавание…",
    ocrReading: "Читаю этикетку…",
    ocrDone: "Готово",
    firstTime: "Первый раз загрузка занимает до минуты, дальше быстрее — всё работает прямо на телефоне.",
    ocrFail: "Не получилось распознать: {v}",
    ocrLibFail: "не удалось загрузить распознавание текста",
    looksLike: "Похоже на",
    noMatch: "Не удалось узнать пиво по фото. Сфотографируйте этикетку ближе и ровнее, при хорошем свете — или отсканируйте штрихкод: это точнее.",
    anotherPhoto: "📷 Другое фото",
    barcodeBtn: "▥ Штрихкод",
    ocrText: "Распознанный текст",
    empty: "(пусто)",
    langLabel: "Язык",
    style: {
      nonalc: "Безалкогольное", neipa: "NEIPA", ipa: "IPA", pale: "Пейл-эль", stout: "Стаут",
      porter: "Портер", wheat: "Пшеничное", pils: "Пилснер", sour: "Кислое", flavored: "Со вкусом",
      bock: "Бок", dark: "Тёмное", ale: "Эль", light: "Светлое", unfiltered: "Нефильтрованное",
      trappist: "Траппистское", abbey: "Аббатское", amber: "Янтарное", red: "Красное",
      brown: "Браун-эль", lager: "Лагер", craft: "Крафтовое",
    },
  },

  en: {
    locale: "en-GB",
    appName: "Pivomer",
    appTitle: "Pivomer — beer prices in Ukraine",
    loading: "Loading…",
    loadFail: "Couldn't load prices ({s})",
    checkNet: "Check your connection and reload the page.",
    scanBtn: "Scan barcode",
    photoBtn: "Label photo",
    searchPh: "Name: Obolon, Heineken, IPA…",
    tabDeals: "🔥 Deals",
    tabCheap: "💸 Cheapest per litre",
    tabStrong: "💪 Strongest",
    tabZero: "🚗 Alcohol-free",
    country: "Country",
    allCountries: "🌍 All countries",
    showMore: "Show more ({n})",
    nothing: "Nothing found. Try a different spelling or scan the barcode.",
    footStats: "Beers: {n} · chains: {m}: {list}.",
    footSrc: "Prices are updated daily from zakaz.ua (as of {d}); in-store prices may differ. Barcode info from Open Food Facts.",
    footInstall: "Add to your home screen: iPhone — “Share → Add to Home Screen”, Android — menu ⋮ → “Install app”.",
    perL: "/L",
    back: "‹ Back",
    home: "‹ Home",
    minPrice: "lowest · {c}",
    avgPrice: "average ({n} chains)",
    perLitre: "per litre",
    dealNote: "🔥 Discount of up to <b>{n}%</b> right now — see the list below.",
    whereBuy: "Where to buy",
    inStock: "in stock",
    outStock: "out of stock",
    until: "until {d}",
    openStore: "Open in store",
    priceNoteCity: "Online prices of retail chains in {c} (updated {d}). Prices in regular stores may differ slightly.",
    priceNoteAll: "Each chain's lowest price anywhere in Ukraine, with the city next to the chain (updated {d}). Pick a city on the home screen to see prices there only.",
    allUkraine: "🇺🇦 All of Ukraine",
    cityLabel: "City",
    nStores: "{n} stores",
    inCity: "in {c}",
    notInCity: "This beer isn't sold online in {c} — showing prices across Ukraine.",
    trendAll: "across Ukraine",
    priceTrend: "Price history",
    trendAria: "Lowest price over time",
    since: "Since {d}:",
    about: "About this beer",
    beer: "beer",
    abv: "{n}% ABV",
    brand: "Brand: {v}.",
    countryIs: "Country: {v}.",
    producer: "Producer: {v}.",
    ingredients: "Ingredients:",
    barcode: "Barcode: {v}",
    otherOf: "More from {v}",
    offName: "Name in the world database: {v}",
    offOrigin: "Origin: {v}",
    barcodeTitle: "Barcode {v}",
    searchingWorld: "Searching the world beer database…",
    noName: "Unnamed",
    notBeer: "This doesn't look like beer 🙂",
    openOff: "Open in Open Food Facts ↗",
    notInStores: "This barcode isn't sold in the chains' online stores, so there's no exact price.",
    notInOff: "It's not in the Open Food Facts database yet either (or you're offline).",
    maybe: "Did you mean",
    findByName: "Search by name",
    orFindByName: "Or search by name",
    examplePh: "e.g. Obolon Premium",
    find: "Search",
    close: "✕ Close",
    torch: "🔦 Torch",
    aimHint: "Point the camera at the barcode on the can or bottle",
    typeCode: "or type the barcode digits",
    noCamera: "Camera isn't available in this browser",
    camDenied: "No camera access. Allow it in your browser settings",
    typeManually: "You can type the barcode digits instead.",
    yourPhoto: "Your photo",
    preparing: "Getting ready…",
    ocrLoading: "Loading text recognition…",
    ocrReading: "Reading the label…",
    ocrDone: "Done",
    firstTime: "The first run takes up to a minute to load, then it's faster — everything runs on your phone.",
    ocrFail: "Couldn't read the photo: {v}",
    ocrLibFail: "couldn't load text recognition",
    looksLike: "Looks like",
    noMatch: "Couldn't recognise the beer. Take the photo closer and straighter in good light — or scan the barcode, it's more accurate.",
    anotherPhoto: "📷 Another photo",
    barcodeBtn: "▥ Barcode",
    ocrText: "Recognised text",
    empty: "(empty)",
    langLabel: "Language",
    style: {
      nonalc: "Alcohol-free", neipa: "NEIPA", ipa: "IPA", pale: "Pale ale", stout: "Stout",
      porter: "Porter", wheat: "Wheat", pils: "Pilsner", sour: "Sour", flavored: "Flavoured",
      bock: "Bock", dark: "Dark", ale: "Ale", light: "Light", unfiltered: "Unfiltered",
      trappist: "Trappist", abbey: "Abbey", amber: "Amber", red: "Red", brown: "Brown ale",
      lager: "Lager", craft: "Craft",
    },
  },
};

// Названия стран: в данных магазинов — на украинском
const COUNTRIES = {
  Україна: ["Украина", "Ukraine"], Німеччина: ["Германия", "Germany"], Литва: ["Литва", "Lithuania"],
  Чехія: ["Чехия", "Czechia"], Бельгія: ["Бельгия", "Belgium"], Нідерланди: ["Нидерланды", "Netherlands"],
  Іспанія: ["Испания", "Spain"], Італія: ["Италия", "Italy"], Франція: ["Франция", "France"],
  Австрія: ["Австрия", "Austria"], Польща: ["Польша", "Poland"], Ірландія: ["Ирландия", "Ireland"],
  Мексика: ["Мексика", "Mexico"], "Велика Британія": ["Великобритания", "United Kingdom"],
  Шотландія: ["Шотландия", "Scotland"], Данія: ["Дания", "Denmark"], Японія: ["Япония", "Japan"],
  Латвія: ["Латвия", "Latvia"], Естонія: ["Эстония", "Estonia"], США: ["США", "USA"],
  Грузія: ["Грузия", "Georgia"], Словаччина: ["Словакия", "Slovakia"], Угорщина: ["Венгрия", "Hungary"],
  Молдова: ["Молдова", "Moldova"], Китай: ["Китай", "China"], Таїланд: ["Таиланд", "Thailand"],
  Швеція: ["Швеция", "Sweden"], Фінляндія: ["Финляндия", "Finland"], Норвегія: ["Норвегия", "Norway"],
  Хорватія: ["Хорватия", "Croatia"], Сербія: ["Сербия", "Serbia"], Словенія: ["Словения", "Slovenia"],
  Португалія: ["Португалия", "Portugal"], Греція: ["Греция", "Greece"], Румунія: ["Румыния", "Romania"],
  Англія: ["Англия", "England"], "Шрі-Ланка": ["Шри-Ланка", "Sri Lanka"], Вʼєтнам: ["Вьетнам", "Vietnam"],
  Канада: ["Канада", "Canada"], Бразилія: ["Бразилия", "Brazil"], Аргентина: ["Аргентина", "Argentina"],
  Індія: ["Индия", "India"], Сінгапур: ["Сингапур", "Singapore"], Перу: ["Перу", "Peru"],
  Швейцарія: ["Швейцария", "Switzerland"], Кіпр: ["Кипр", "Cyprus"], Ізраїль: ["Израиль", "Israel"],
  "Південна Корея": ["Южная Корея", "South Korea"], Туреччина: ["Турция", "Turkey"],
};

// Названия сетей по языкам (остальные — латиницей, одинаково везде)
const CHAINS = {
  auchan: ["Ашан", "Ашан", "Auchan"],
  epicentr: ["Епіцентр", "Эпицентр", "Epicentr"],
  cosmos: ["Космос", "Космос", "Kosmos"],
  tavriav: ["Таврія В", "Таврия В", "Tavria V"],
  vostorg: ["Восторг", "Восторг", "Vostorg"],
  chudomarket: ["Чудо Маркет", "Чудо Маркет", "Chudo Market"],
  kharkiv: ["Харків", "Харьков", "Kharkiv"],
  torba: ["Торба", "Торба", "Torba"],
  zaraz: ["За Раз", "За Раз", "Za Raz"],
  ekomarket: ["ЕкоМаркет", "ЭкоМаркет", "EkoMarket"],
};

// Города: в данных — на украинском
const CITIES = {
  Київ: ["Киев", "Kyiv"], Харків: ["Харьков", "Kharkiv"], Одеса: ["Одесса", "Odesa"], Львів: ["Львов", "Lviv"],
  Дніпро: ["Днепр", "Dnipro"], Вінниця: ["Винница", "Vinnytsia"], Житомир: ["Житомир", "Zhytomyr"],
  Рівне: ["Ровно", "Rivne"], "Івано-Франківськ": ["Ивано-Франковск", "Ivano-Frankivsk"], Чернівці: ["Черновцы", "Chernivtsi"],
  "Кривий Ріг": ["Кривой Рог", "Kryvyi Rih"], Полтава: ["Полтава", "Poltava"], Запоріжжя: ["Запорожье", "Zaporizhzhia"],
};

export function cityName(c) {
  if (!c || lang === "uk") return c;
  return CITIES[c]?.[idx()] || c;
}

const KEY = "pivomer-lang";

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

const idx = () => ({ uk: -1, ru: 0, en: 1 })[lang];

export function t(key, vars) {
  let s = DICT[lang][key] ?? DICT.uk[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  return s;
}

export const styleName = (key) => DICT[lang].style[key] || key;

export function countryName(c) {
  if (!c || lang === "uk") return c;
  return COUNTRIES[c]?.[idx()] || c;
}

export function chainName(id, fallback) {
  const names = CHAINS[id];
  if (!names) return fallback || id;
  return names[{ uk: 0, ru: 1, en: 2 }[lang]];
}

export const locale = () => DICT[lang].locale;
