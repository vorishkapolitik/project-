// Збирає ціни на пиво з усіх магазинів на zakaz.ua в усіх містах.
// Пише:
//   data/beers.json           — уся Україна: для кожної мережі мінімальна ціна (з містом)
//   data/city/<місто>.json     — ціни в конкретному місті (той самий формат)
//   data/cities.json          — список міст
//   data/history.json         — історія мінімальної ціни по Україні
// Запуск: node scripts/fetch-prices.mjs   (Node 18+, без залежностей)

import { writeFile, mkdir, readFile } from "node:fs/promises";

const API = "https://stores-api.zakaz.ua";
const HEADERS = { "Accept-Language": "uk", "User-Agent": "beer-prices-pwa/1.0" };
const PER_PAGE = 100;
const OUT_DIR = new URL("../data/", import.meta.url);

// Назви мереж для показу в застосунку
const CHAIN_NAMES = {
  novus: "NOVUS", metro: "METRO", auchan: "Ашан", epicentr: "Епіцентр", megamarket: "MEGAMARKET",
  ultramarket: "Ultramarket", cosmos: "Космос", winetime: "WineTime", okwine: "OKWINE", alcohub: "AlcoHub",
  zaraz: "За Раз", ekomarket: "ЕкоМаркет", tavriav: "Таврія В", vostorg: "Восторг", chudomarket: "Чудо Маркет",
  grono: "Grono", ideal: "Ideal", onde: "Onde", kharkiv: "Харків", torba: "Торба",
};
const SKIP_CHAINS = new Set(["masterzoo", "biotus"]);

// Назва міста за кодом (у магазинів бувають передмістя: "Львів Сокільники", "Татарів")
const CITY_NAMES = {
  kiev: "Київ", odesa: "Одеса", kharkiv: "Харків", lviv: "Львів", ivanofrankivsk: "Івано-Франківськ",
  rivne: "Рівне", chernivtsi: "Чернівці", dnipro: "Дніпро", vinnytsia: "Вінниця", zhytomyr: "Житомир",
  kryvyyrig: "Кривий Ріг", poltava: "Полтава", zaporizhzhia: "Запоріжжя",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(path, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(API + path, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);
      return await res.json();
    } catch (e) {
      if (i >= tries) throw e;
      await sleep(1000 * 2 ** i);
    }
  }
}

// Шукаємо категорію "Пиво" у дереві категорій магазину
function findBeerCategory(tree) {
  const stack = [...tree];
  while (stack.length) {
    const c = stack.shift();
    const t = (c.title || "").trim().toLowerCase();
    if (t === "пиво" || /^beer(-|$)/.test(c.id)) return c.id;
    if (c.children) stack.push(...c.children);
  }
  return null;
}

export const normEan = (e) => String(e || "").replace(/\D/g, "").replace(/^0+/, "");

function parseAbv(title) {
  // "4,4%" / "0.5 %" / "8%"
  const m = title.match(/(\d{1,2}(?:[.,]\d{1,2})?)\s*%/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}

function parseVolumeMl(p) {
  if (p.unit === "pcs" && p.volume) return Math.round(p.volume);
  const m = p.title.match(/(\d+(?:[.,]\d+)?)\s*(мл|л)(?![а-яіїєґa-z])/i);
  if (!m) return null;
  const v = parseFloat(m[1].replace(",", "."));
  return Math.round(m[2].toLowerCase() === "л" ? v * 1000 : v);
}

async function fetchCategory(storeId, cat) {
  const out = [];
  for (let page = 1; page < 100; page++) {
    const data = await getJSON(`/stores/${storeId}/categories/${cat}/products/?page=${page}&per_page=${PER_PAGE}`);
    out.push(...data.results);
    if (data.results.length < PER_PAGE || out.length >= data.count) break;
    await sleep(250);
  }
  return out;
}

function beerInfo(p, ean) {
  return {
    ean,
    title: p.title,
    brand: p.producer?.trademark || null,
    producer: p.producer?.name || null,
    country: p.country || null,
    abv: parseAbv(p.title),
    ml: parseVolumeMl(p),
    img: p.img?.s350x350 || p.img?.s200x200 || null,
    ingredients: (p.ingredients?.[0] || "").replace(/<[^>]+>/g, "").trim() || null,
  };
}

function offer(p, chain, city) {
  return {
    chain,
    city,
    price: p.price / 100,
    old: p.discount?.status && p.discount.old_price ? p.discount.old_price / 100 : null,
    until: p.discount?.status ? p.discount.due_date || null : null,
    stock: !!p.in_stock,
    url: p.web_url,
    n: 1, // скільки магазинів мережі мають цю ціну
  };
}

// Краща пропозиція мережі: спершу ті, що в наявності, потім дешевші
const better = (a, b) => (a.stock !== b.stock ? a.stock : a.price < b.price);

// Збирає ціни: Map<місто, Map<ean, Map<мережа, пропозиція>>>
function addOffer(store, city, ean, o) {
  let byEan = store.get(city);
  if (!byEan) store.set(city, (byEan = new Map()));
  let byChain = byEan.get(ean);
  if (!byChain) byEan.set(ean, (byChain = new Map()));
  const cur = byChain.get(o.chain);
  if (!cur) byChain.set(o.chain, o);
  else {
    const n = cur.n + 1;
    byChain.set(o.chain, better(o, cur) ? { ...o, n } : { ...cur, n });
  }
}

function buildList(info, byEan) {
  const list = [];
  for (const [ean, byChain] of byEan) {
    const prices = [...byChain.values()].sort((a, b) => a.price - b.price);
    const avail = prices.filter((p) => p.stock);
    const pool = avail.length ? avail : prices;
    list.push({
      ...info.get(ean),
      prices,
      min: Math.min(...pool.map((p) => p.price)),
      avg: Math.round((pool.reduce((s, p) => s + p.price, 0) / pool.length) * 100) / 100,
    });
  }
  return list.sort((a, b) => a.title.localeCompare(b.title, "uk"));
}

async function main() {
  const stores = (await getJSON("/stores/")).filter((s) => s.is_active && !SKIP_CHAINS.has(s.retail_chain));
  console.log(`Магазинів: ${stores.length}`);

  const info = new Map(); // ean -> опис пива
  const byCity = new Map(); // місто -> ean -> мережа -> пропозиція
  const categories = new Map(); // мережа -> id категорії пива
  const chainsSeen = new Map(); // мережа -> назва
  const cityStores = new Map(); // місто -> кількість магазинів
  let failed = 0;

  for (const s of stores) {
    const chain = s.retail_chain;
    const city = s.city;
    try {
      let cat = categories.get(chain);
      if (cat === undefined) {
        cat = findBeerCategory(await getJSON(`/stores/${s.id}/categories/`));
        categories.set(chain, cat);
      }
      if (!cat) continue;
      const products = await fetchCategory(s.id, cat);
      let n = 0;
      for (const p of products) {
        const ean = normEan(p.ean);
        if (!ean || !p.price) continue;
        if (!info.has(ean)) info.set(ean, beerInfo(p, ean));
        addOffer(byCity, city, ean, offer(p, chain, city));
        n++;
      }
      if (n) {
        chainsSeen.set(chain, CHAIN_NAMES[chain] || s.name);
        cityStores.set(city, (cityStores.get(city) || 0) + 1);
      }
      console.log(`+ ${s.name} (${city}): ${n}`);
    } catch (e) {
      failed++;
      console.log(`! ${s.name}: ${e.message}`);
    }
    await sleep(300);
  }

  // Уся Україна: для кожної мережі — найкраща пропозиція серед усіх міст
  const all = new Map();
  for (const byEan of byCity.values()) {
    for (const [ean, byChain] of byEan) {
      for (const o of byChain.values()) addOffer(all, "all", ean, { ...o });
    }
  }
  // n у "всій Україні" рахує міста, а не магазини — нам це не потрібно
  for (const byChain of all.get("all")?.values() || []) for (const o of byChain.values()) delete o.n;

  const allList = buildList(info, all.get("all") || new Map());
  if (allList.length < 100) throw new Error(`Замало товарів (${allList.length}) — не перезаписую дані`);

  const updated = new Date().toISOString();
  const chainList = (ids) =>
    [...ids].map((id) => ({ id, name: chainsSeen.get(id) || id })).sort((a, b) => a.name.localeCompare(b.name, "uk"));

  await mkdir(new URL("city/", OUT_DIR), { recursive: true });
  await writeFile(
    new URL("beers.json", OUT_DIR),
    JSON.stringify({ updated, city: null, chains: chainList(chainsSeen.keys()), beers: allList })
  );

  const cities = [];
  for (const [city, byEan] of byCity) {
    const list = buildList(info, byEan);
    const ids = new Set(list.flatMap((b) => b.prices.map((p) => p.chain)));
    for (const b of list) for (const p of b.prices) delete p.city;
    await writeFile(new URL(`city/${city}.json`, OUT_DIR), JSON.stringify({ updated, city, chains: chainList(ids), beers: list }));
    cities.push({ id: city, name: CITY_NAMES[city] || city, stores: cityStores.get(city) || 0, chains: ids.size, beers: list.length });
  }
  cities.sort((a, b) => b.stores - a.stores || a.name.localeCompare(b.name, "uk"));
  await writeFile(new URL("cities.json", OUT_DIR), JSON.stringify({ updated, cities }));

  // Коротка історія мінімальних цін по Україні: ean -> [[дата, мін.ціна], ...] (до 180 днів)
  const histUrl = new URL("history.json", OUT_DIR);
  let hist = {};
  try {
    hist = JSON.parse(await readFile(histUrl, "utf8"));
  } catch {}
  const day = updated.slice(0, 10);
  for (const b of allList) {
    const h = (hist[b.ean] ||= []);
    if (h.length && h[h.length - 1][0] === day) h[h.length - 1][1] = b.min;
    else h.push([day, b.min]);
    if (h.length > 180) h.splice(0, h.length - 180);
  }
  await writeFile(histUrl, JSON.stringify(hist));

  console.log(
    `Готово: ${allList.length} видів пива, ${chainsSeen.size} мереж, міст: ${cities.length} (${cities.map((c) => `${c.id}:${c.beers}`).join(", ")}), помилок: ${failed}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
