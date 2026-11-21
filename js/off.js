// Open Food Facts — открытая мировая база продуктов (в том числе пива) по штрихкоду.
// Бесплатно, без ключа. https://world.openfoodfacts.org

const BASE = "https://world.openfoodfacts.org";
const FIELDS = [
  "code", "product_name", "product_name_uk", "product_name_ru", "product_name_en", "generic_name",
  "brands", "quantity", "categories_tags", "countries_tags", "origins", "manufacturing_places",
  "image_front_url", "nutriments", "ingredients_text", "ingredients_text_uk", "labels",
].join(",");

const cache = new Map();

// Стили пива из категорий Open Food Facts (ключи переводов из i18n.js)
const STYLE_TAGS = [
  ["non-alcoholic-beers", "nonalc"],
  ["india-pale-ales", "ipa"],
  ["ipa", "ipa"],
  ["pale-ales", "pale"],
  ["stouts", "stout"],
  ["porters", "porter"],
  ["wheat-beers", "wheat"],
  ["white-beers", "wheat"],
  ["pilsners", "pils"],
  ["pils", "pils"],
  ["abbey-beers", "abbey"],
  ["trappist-beers", "trappist"],
  ["sour-beers", "sour"],
  ["bocks", "bock"],
  ["amber-beers", "amber"],
  ["red-beers", "red"],
  ["dark-beers", "dark"],
  ["brown-ales", "brown"],
  ["ales", "ale"],
  ["lagers", "lager"],
  ["craft-beers", "craft"],
  ["flavoured-beers", "flavored"],
  ["radlers", "flavored"],
];

export function offStyle(tags = []) {
  const clean = tags.map((t) => t.replace(/^[a-z]{2}:/, ""));
  for (const [tag, name] of STYLE_TAGS) if (clean.includes(tag)) return name;
  return null;
}

export async function offProduct(code) {
  if (cache.has(code)) return cache.get(code);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${BASE}/api/v2/product/${code}.json?fields=${FIELDS}`, {
      signal: ctrl.signal,
    });
    if (res.status === 404) {
      cache.set(code, null); // такого штрихкода в базе нет
      return null;
    }
    if (!res.ok) return null;
    const j = await res.json();
    if (j.status !== 1 || !j.product) {
      cache.set(code, null);
      return null;
    }
    const p = j.product;
    const n = p.nutriments || {};
    const info = {
      code,
      name:
        p.product_name_uk || p.product_name_ru || p.product_name || p.product_name_en || null,
      brand: (p.brands || "").split(",")[0].trim() || null,
      quantity: p.quantity || null,
      abv: n.alcohol_100g ?? n.alcohol ?? null,
      style: offStyle(p.categories_tags),
      isBeer: (p.categories_tags || []).some((t) => /beer|bier|пиво/.test(t)),
      origin: p.origins || p.manufacturing_places || null,
      countries: (p.countries_tags || []).map((t) => t.replace(/^[a-z]{2}:/, "")),
      img: p.image_front_url || null,
      ingredients: p.ingredients_text_uk || p.ingredients_text || null,
      url: `${BASE}/product/${code}`,
    };
    cache.set(code, info);
    return info;
  } catch {
    return null; // нет сети или база не ответила — не страшно
  } finally {
    clearTimeout(timer);
  }
}
