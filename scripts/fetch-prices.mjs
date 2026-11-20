// Збирає ціни на пиво з магазинів на zakaz.ua і зберігає їх у data/beers.json.
// Запуск: node scripts/fetch-prices.mjs   (Node 18+, без залежностей)

import { writeFile, mkdir, readFile } from "node:fs/promises";

const API = "https://stores-api.zakaz.ua";
const HEADERS = { "Accept-Language": "uk", "User-Agent": "beer-prices-pwa/1.0" };
const CITY = "kiev"; // ціни в мережі зазвичай однакові по країні, беремо Київ
const PER_PAGE = 100;
const OUT_DIR = new URL("../data/", import.meta.url);

// Назви мереж для показу в застосунку
const CHAIN_NAMES = {
  novus: "NOVUS",
  metro: "METRO",
  auchan: "Ашан",
  epicentr: "Епіцентр",
  megamarket: "MEGAMARKET",
  ultramarket: "Ultramarket",
  cosmos: "Космос",
  winetime: "WineTime",
  okwine: "OKWINE",
  alcohub: "AlcoHub",
  zaraz: "За Раз",
  ekomarket: "ЕкоМаркет",
  tavriav: "Таврія В",
  vostorg: "Восторг",
  chudomarket: "Чудо Маркет",
  grono: "Grono",
  ideal: "Ideal",
  onde: "Onde",
  kharkiv: "Харків",
  torba: "Торба",
};
const SKIP_CHAINS = new Set(["masterzoo", "biotus"]);

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

// Один магазин на мережу: спершу в CITY, інакше будь-який активний
function pickStores(stores) {
  const byChain = new Map();
  for (const s of stores) {
    if (!s.is_active || SKIP_CHAINS.has(s.retail_chain)) continue;
    const cur = byChain.get(s.retail_chain);
    if (!cur || (cur.city !== CITY && s.city === CITY)) byChain.set(s.retail_chain, s);
  }
  return [...byChain.values()];
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
  const m = p.title.match(/(\d+(?:[.,]\d+)?)\s*(мл|л)\b/i);
  if (!m) return null;
  const v = parseFloat(m[1].replace(",", "."));
  return Math.round(m[2].toLowerCase() === "л" ? v * 1000 : v);
}

async function fetchCategory(storeId, cat) {
  const out = [];
  for (let page = 1; page < 100; page++) {
    const data = await getJSON(
      `/stores/${storeId}/categories/${cat}/products/?page=${page}&per_page=${PER_PAGE}`
    );
    out.push(...data.results);
    if (data.results.length < PER_PAGE || out.length >= data.count) break;
    await sleep(300);
  }
  return out;
}

async function main() {
  const stores = pickStores(await getJSON("/stores/"));
  console.log(`Мереж: ${stores.length}`);

  const beers = new Map(); // ean -> beer
  const chains = [];

  for (const store of stores) {
    const chain = store.retail_chain;
    try {
      const cat = findBeerCategory(await getJSON(`/stores/${store.id}/categories/`));
      if (!cat) {
        console.log(`- ${chain}: немає категорії пива`);
        continue;
      }
      const products = await fetchCategory(store.id, cat);
      let n = 0;
      for (const p of products) {
        const ean = normEan(p.ean);
        if (!ean || !p.price) continue;
        let b = beers.get(ean);
        if (!b) {
          b = {
            ean,
            title: p.title,
            brand: p.producer?.trademark || null,
            producer: p.producer?.name || null,
            country: p.country || null,
            abv: parseAbv(p.title),
            ml: parseVolumeMl(p),
            img: p.img?.s350x350 || p.img?.s200x200 || null,
            ingredients: (p.ingredients?.[0] || "").replace(/<[^>]+>/g, "").trim() || null,
            prices: [],
          };
          beers.set(ean, b);
        }
        b.prices.push({
          chain,
          price: p.price / 100,
          old: p.discount?.status && p.discount.old_price ? p.discount.old_price / 100 : null,
          until: p.discount?.status ? p.discount.due_date || null : null,
          stock: !!p.in_stock,
          url: p.web_url,
        });
        n++;
      }
      chains.push({ id: chain, name: CHAIN_NAMES[chain] || store.name, store: store.name });
      console.log(`+ ${chain}: ${n} товарів (${cat})`);
    } catch (e) {
      console.log(`! ${chain}: ${e.message}`);
    }
    await sleep(500);
  }

  // Мінімальна ціна серед наявних — для сортування і пошуку
  const list = [...beers.values()].map((b) => {
    b.prices.sort((a, b2) => a.price - b2.price);
    const avail = b.prices.filter((p) => p.stock);
    const pool = avail.length ? avail : b.prices;
    b.min = Math.min(...pool.map((p) => p.price));
    b.avg = Math.round((pool.reduce((s, p) => s + p.price, 0) / pool.length) * 100) / 100;
    return b;
  });
  list.sort((a, b) => a.title.localeCompare(b.title, "uk"));

  if (list.length < 100) throw new Error(`Замало товарів (${list.length}) — не перезаписую дані`);

  await mkdir(OUT_DIR, { recursive: true });
  const updated = new Date().toISOString();
  await writeFile(new URL("beers.json", OUT_DIR), JSON.stringify({ updated, chains, beers: list }));

  // Коротка історія мінімальних цін: ean -> [[дата, мін.ціна], ...] (до 180 днів)
  const histUrl = new URL("history.json", OUT_DIR);
  let hist = {};
  try {
    hist = JSON.parse(await readFile(histUrl, "utf8"));
  } catch {}
  const day = updated.slice(0, 10);
  for (const b of list) {
    const h = (hist[b.ean] ||= []);
    if (h.length && h[h.length - 1][0] === day) h[h.length - 1][1] = b.min;
    else h.push([day, b.min]);
    if (h.length > 180) h.splice(0, h.length - 180);
  }
  await writeFile(histUrl, JSON.stringify(hist));

  console.log(`Готово: ${list.length} видів пива з ${chains.length} мереж`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
