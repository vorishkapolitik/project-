// Мониторинг цен на воду Aqua Миргород Detox.
// Собирает цены из открытых источников и сохраняет data/detox.json и data/detox-history.json.
// Запуск: node scripts/fetch-detox.mjs   (Node 18+, без зависимостей)
//
// Источники:
//  - zakaz.ua — интернет-магазины 14+ сетей, каждый магазин в каждом городе
//  - АТБ (atbmarket.com) — страница поиска
//  - сайт бренда — эталонные цены: из XML-фида товаров (feedUrl) или вручную (detox/config.json)

import { writeFile, mkdir, readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const OUT_DIR = new URL("data/", ROOT);
const CONFIG = new URL("detox/config.json", ROOT);
const UA = "Mozilla/5.0 (compatible; detox-price-monitor/1.0)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, { json = true, headers = {}, tries = 3 } = {}) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "uk", ...headers } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return json ? await res.json() : await res.text();
    } catch (e) {
      if (i >= tries) throw new Error(`${url}: ${e.message}`);
      await sleep(1000 * 2 ** i);
    }
  }
}

// Объём в мл из названия: "0,33л", "1,2 л", "1л", "500 мл"
export function volumeMl(title, fallback) {
  const m = String(title).match(/(\d+(?:[.,]\d+)?)\s*(мл|л|ml|l)(?![a-zа-яіїєґ])/i);
  if (m) {
    const v = parseFloat(m[1].replace(",", "."));
    return Math.round(/^м|^m/i.test(m[2]) ? v : v * 1000);
  }
  return fallback ? Math.round(fallback) : null;
}

const isDetox = (title) => /detox|детокс/i.test(title) && !/шампун|маск|гель|крем|бомбоч|набір|скраб|засіб|добавк/i.test(title);

/* ---------- zakaz.ua: все магазины всех сетей ---------- */

const ZAKAZ = "https://stores-api.zakaz.ua";
const CHAIN_NAMES = {
  novus: "NOVUS", metro: "METRO", auchan: "Ашан", epicentr: "Епіцентр", megamarket: "MEGAMARKET",
  ultramarket: "Ultramarket", cosmos: "Космос", winetime: "WineTime", okwine: "OKWINE", alcohub: "AlcoHub",
  zaraz: "За Раз", ekomarket: "ЕкоМаркет", tavriav: "Таврія В", vostorg: "Восторг", chudomarket: "Чудо Маркет",
  grono: "Grono", ideal: "Ideal", onde: "Onde", kharkiv: "Харків", torba: "Торба",
};

async function fromZakaz(log) {
  const stores = (await get(`${ZAKAZ}/stores/`)).filter((s) => s.is_active);
  const offers = [];
  let ok = 0;
  for (const s of stores) {
    try {
      const q = encodeURIComponent("Aqua Миргород Detox");
      const data = await get(`${ZAKAZ}/stores/${s.id}/products/search/?q=${q}&per_page=30`);
      ok++;
      for (const p of data.results || []) {
        if (!isDetox(p.title) || !/миргород/i.test(p.title) || !p.price) continue;
        offers.push({
          source: "zakaz",
          chain: s.retail_chain,
          chainName: CHAIN_NAMES[s.retail_chain] || s.name.replace(/\s+DRIVE$/i, ""),
          store: s.name,
          city: s.address?.city || s.city,
          address: [s.address?.street, s.address?.building].filter(Boolean).join(", ") || null,
          ean: String(p.ean || "").replace(/^0+/, ""),
          title: p.title,
          ml: volumeMl(p.title, p.volume),
          price: p.price / 100,
          old: p.discount?.status && p.discount.old_price ? p.discount.old_price / 100 : null,
          until: p.discount?.status ? p.discount.due_date || null : null,
          stock: !!p.in_stock,
          url: p.web_url,
          img: p.img?.s350x350 || null,
        });
      }
    } catch (e) {
      log(`  ! zakaz ${s.name}: ${e.message}`);
    }
    await sleep(250);
  }
  log(`zakaz.ua: магазинов ${ok}/${stores.length}, предложений ${offers.length}`);
  return offers;
}

/* ---------- АТБ: публичная страница поиска ---------- */

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

async function fromAtb(log) {
  const seen = new Map();
  for (const q of ["миргород", "detox"]) {
    const html = await get(`https://www.atbmarket.com/sch?query=${encodeURIComponent(q)}`, { json: false });
    const blocks = html.match(/<article[^>]*catalog-item[\s\S]*?<\/article>/g) || [];
    for (const b of blocks) {
      const href = b.match(/href="(\/product\/[^"]+)"/)?.[1];
      const alt = b.match(/alt="Купити ([^"]+?) у АТБ/)?.[1];
      const price = b.match(/<data value="([\d.]+)" class="product-price__top"/)?.[1];
      const old = b.match(/<data value="([\d.]+)" class="product-price__bottom"/)?.[1];
      const img = b.match(/<img src="(https:[^"]+)"/)?.[1];
      if (!href || !alt || !price) continue;
      const title = decode(alt);
      if (!isDetox(title) || seen.has(href)) continue;
      seen.set(href, {
        source: "atb",
        chain: "atb",
        chainName: "АТБ",
        store: "atbmarket.com",
        city: null, // онлайн-цена сайта (общая)
        address: null,
        ean: null,
        title,
        ml: volumeMl(title),
        price: +price,
        old: old && +old > +price ? +old : null,
        until: null,
        stock: !/out-of-stock|немає в наявності/i.test(b),
        url: `https://www.atbmarket.com${href}`,
        img: img || null,
      });
    }
    await sleep(800);
  }
  log(`АТБ: предложений ${seen.size}`);
  return [...seen.values()];
}

/* ---------- сайт бренда: XML-фид (Google Merchant / YML) ---------- */

function parseFeed(xml) {
  const items = [];
  // YML (Prom / Rozetka / Hotline): <offer ...><name>..</name><price>..</price><url>..</url><barcode>..</barcode>
  for (const o of xml.match(/<offer\b[\s\S]*?<\/offer>/g) || []) {
    const tag = (t) => o.match(new RegExp(`<${t}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`))?.[1]?.trim();
    items.push({ title: tag("name") || tag("name_ua"), price: tag("price"), old: tag("oldprice"), url: tag("url"), ean: tag("barcode"), avail: !/available="false"/.test(o) });
  }
  // Google Merchant (RSS): <item><g:title>..</g:title><g:price>74.90 UAH</g:price><g:link>..</g:link><g:gtin>..</g:gtin>
  for (const it of xml.match(/<item\b[\s\S]*?<\/item>/g) || []) {
    const tag = (t) => it.match(new RegExp(`<${t}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`))?.[1]?.trim();
    const sale = tag("g:sale_price");
    items.push({
      title: tag("g:title") || tag("title"),
      price: sale || tag("g:price"),
      old: sale ? tag("g:price") : null,
      url: tag("g:link") || tag("link"),
      ean: tag("g:gtin"),
      avail: !/out.of.stock/i.test(tag("g:availability") || ""),
    });
  }
  return items
    .filter((i) => i.title && i.price && isDetox(decode(i.title)))
    .map((i) => ({
      title: decode(i.title),
      ml: volumeMl(decode(i.title)),
      price: parseFloat(String(i.price).replace(",", ".")),
      old: i.old ? parseFloat(String(i.old).replace(",", ".")) : null,
      url: i.url ? decode(i.url) : null,
      ean: i.ean ? String(i.ean).replace(/^0+/, "") : null,
      stock: i.avail,
    }));
}

async function brandPrices(config, log) {
  const base = {};
  // 1) ручные цены из detox/config.json
  for (const [ml, price] of Object.entries(config.basePrices || {})) {
    if (price) base[ml] = { ml: +ml, price: +price, source: "manual", url: config.brandShopUrl || null };
  }
  // 2) официальный фид магазина (перекрывает ручные цены)
  if (config.feedUrl) {
    try {
      const items = parseFeed(await get(config.feedUrl, { json: false }));
      for (const i of items) if (i.ml) base[i.ml] = { ...i, source: "feed" };
      log(`Сайт бренда (фид): позиций Detox ${items.length}`);
    } catch (e) {
      log(`! фид сайта бренда: ${e.message} — использую ручные цены`);
    }
  } else {
    log(`Сайт бренда: фид не задан, ручных цен ${Object.keys(base).length}`);
  }
  return base;
}

/* ---------- сборка ---------- */

async function main() {
  const log = (m) => console.log(m);
  const config = JSON.parse(await readFile(CONFIG, "utf8"));
  const sources = [];
  const offers = [];

  for (const [id, name, fn] of [
    ["zakaz", "zakaz.ua", fromZakaz],
    ["atb", "АТБ", fromAtb],
  ]) {
    try {
      const got = await fn(log);
      offers.push(...got);
      sources.push({ id, name, ok: true, count: got.length });
    } catch (e) {
      log(`! ${name}: ${e.message}`);
      sources.push({ id, name, ok: false, count: 0, error: e.message });
    }
  }
  const base = await brandPrices(config, log);

  if (offers.length < 5) throw new Error(`Слишком мало предложений (${offers.length}) — данные не перезаписываю`);

  offers.sort((a, b) => a.ml - b.ml || a.price - b.price);
  const updated = new Date().toISOString();
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    new URL("detox.json", OUT_DIR),
    JSON.stringify({ updated, brand: { url: config.brandShopUrl, prices: base }, sources, offers })
  );

  // История по объёмам: ml -> [[дата, мин, средняя, эталон]] (до 365 дней)
  const histUrl = new URL("detox-history.json", OUT_DIR);
  let hist = {};
  try {
    hist = JSON.parse(await readFile(histUrl, "utf8"));
  } catch {}
  const day = updated.slice(0, 10);
  const byMl = new Map();
  for (const o of offers) if (o.stock && o.ml) (byMl.get(o.ml) || byMl.set(o.ml, []).get(o.ml)).push(o.price);
  for (const [ml, prices] of byMl) {
    const min = Math.min(...prices);
    const avg = Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 100) / 100;
    const row = [day, min, avg, base[ml]?.price ?? null];
    const h = (hist[ml] ||= []);
    if (h.length && h[h.length - 1][0] === day) h[h.length - 1] = row;
    else h.push(row);
    if (h.length > 365) h.splice(0, h.length - 365);
  }
  await writeFile(histUrl, JSON.stringify(hist));

  log(`Готово: ${offers.length} предложений, объёмы: ${[...byMl.keys()].join(", ")} мл`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
