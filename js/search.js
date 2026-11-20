// Нечёткий поиск пива по названию: работает и для набранного текста,
// и для "грязного" текста, распознанного с фото этикетки.
// Кириллица и латиница приводятся к одной форме, поэтому "Хайнекен" находит "Heineken".

const CYR = {
  а: "a", б: "b", в: "v", г: "g", ґ: "g", д: "d", е: "e", є: "e", ё: "e", ж: "zh", з: "z",
  и: "i", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "i",
  ь: "", э: "e", ю: "u", я: "ia", "'": "", "’": "", "ʼ": "",
};

// Общие слова, которые есть почти в каждом названии и не помогают найти пиво
const STOP = new Set(
  [
    "пиво", "beer", "bier", "пивo", "світле", "темне", "светлое", "темное", "напій", "пивний",
    "з", "та", "і", "в", "ж/б", "ж", "б", "скл", "пл", "бут", "бутылка", "пляшка", "банка", "can",
    "bottle", "л", "мл", "l", "ml", "alc", "vol", "the", "de", "la", "le", "of", "and",
  ].map((w) => skeleton(w))
);

// Приводим слово к "скелету": транслит + упрощение похожих звуков
export function skeleton(word) {
  let s = word.toLowerCase();
  s = s.replace(/[а-яёіїєґ'’ʼ]/g, (c) => CYR[c] ?? c);
  s = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // ü -> u, é -> e
    .replace(/ß/g, "ss")
    .replace(/kh/g, "h")
    .replace(/ph/g, "f")
    .replace(/[yj]/g, "i")
    .replace(/w/g, "v")
    .replace(/ck|q|c(?=[aouk]|$)/g, "k")
    .replace(/x/g, "ks")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1"); // двойные буквы
  return s;
}

export function tokenize(text) {
  return String(text || "")
    .replace(/(\d)[.,](\d)/g, "$1$2") // 0,5 -> 05, 4.8 -> 48
    .split(/[^0-9A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’ʼÀ-ÿ]+/)
    .map(skeleton)
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

const triCache = new Map();
function trigrams(t) {
  let s = triCache.get(t);
  if (!s) {
    s = new Set();
    const p = ` ${t} `;
    for (let i = 0; i < p.length - 2; i++) s.add(p.slice(i, i + 3));
    triCache.set(t, s);
  }
  return s;
}

// Похожесть двух слов 0..1
export function similarity(a, b) {
  if (a === b) return 1;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) {
    return 0.75 + 0.2 * (Math.min(a.length, b.length) / Math.max(a.length, b.length));
  }
  const A = trigrams(a);
  const B = trigrams(b);
  let common = 0;
  for (const g of A) if (B.has(g)) common++;
  return (2 * common) / (A.size + B.size);
}

export class BeerIndex {
  constructor(beers) {
    this.items = beers.map((b) => {
      const tokens = [...new Set(tokenize(`${b.title} ${b.brand || ""}`))];
      const brand = tokenize(b.brand || "");
      return { beer: b, tokens, brand, words: tokens.filter((t) => !/^\d+$/.test(t)) };
    });
    // IDF: редкие слова (название бренда) важнее частых ("lager", "500")
    const df = new Map();
    for (const it of this.items) for (const t of it.tokens) df.set(t, (df.get(t) || 0) + 1);
    const N = this.items.length;
    this.idf = (t) => Math.log(1 + N / (df.get(t) || 0.5));
    this.byEan = new Map(beers.map((b) => [b.ean, b]));
  }

  // Поиск по набранному тексту: все слова запроса должны найтись
  search(query, limit = 40) {
    const q = tokenize(query);
    if (!q.length) return [];
    const res = [];
    for (const it of this.items) {
      let sum = 0;
      let ok = true;
      for (const qt of q) {
        let best = 0;
        for (const t of it.tokens) {
          // "чернигов" ≈ начало "чернігівське"
          const s = t.startsWith(qt)
            ? 1
            : Math.max(similarity(qt, t), qt.length >= 4 ? similarity(qt, t.slice(0, qt.length)) * 0.95 : 0);
          if (s > best) best = s;
          if (best === 1) break;
        }
        if (best < 0.5) {
          ok = false;
          break;
        }
        sum += best;
      }
      if (ok) res.push({ beer: it.beer, score: sum / q.length });
    }
    res.sort((a, b) => b.score - a.score || a.beer.min - b.beer.min);
    return res.slice(0, limit);
  }

  // Поиск по тексту с фото: какие пива лучше всего "покрыты" словами с этикетки
  matchLabel(text, limit = 8) {
    const ocr = [...new Set(tokenize(text))].filter((t) => t.length >= 3 || /^\d+$/.test(t));
    if (!ocr.length) return [];
    const res = [];
    for (const it of this.items) {
      if (!it.words.length) continue;
      let got = 0;
      let total = 0;
      let brandHit = 0;
      for (const t of it.tokens) {
        const w = this.idf(t) * (/^\d+$/.test(t) ? 0.3 : 1);
        total += w;
        let best = 0;
        for (const o of ocr) {
          const s = similarity(t, o);
          if (s > best) best = s;
          if (best === 1) break;
        }
        if (best >= 0.55) {
          got += w * best;
          if (it.brand.includes(t)) brandHit = Math.max(brandHit, best);
        }
      }
      if (!got) continue;
      const score = (got / total) * 0.7 + brandHit * 0.3;
      if (score > 0.25) res.push({ beer: it.beer, score });
    }
    res.sort((a, b) => b.score - a.score);
    return res.slice(0, limit);
  }
}
