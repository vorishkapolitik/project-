import { BeerIndex } from "./search.js";
import { startScanner } from "./scanner.js";
import { offProduct } from "./off.js";
import { t, lang, setLang, LANGS, styleName, countryName, chainName, locale } from "./i18n.js";

const view = document.getElementById("view");
const photoInput = document.getElementById("photo");

const state = {
  data: null,
  index: null,
  chains: {},
  history: null,
  home: { q: "", tab: "deals", country: "", shown: 40 },
  label: null, // результат распознавания фото
  scanner: null,
};

/* ---------- утилиты ---------- */

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const money = (n) =>
  n == null ? "—" : `${n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴`;

const perLitre = (price, ml) => (ml ? (price / ml) * 1000 : null);

const num = (n) => (lang === "en" ? String(n) : String(n).replace(".", ","));

const volume = (ml) => {
  if (!ml) return "";
  const L = lang === "en" ? "L" : "л";
  const ML = lang === "en" ? "ml" : "мл";
  return ml >= 1000 || ml % 100 === 0 ? `${num(ml / 1000)} ${L}` : `${ml} ${ML}`;
};

const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString(locale(), { day: "numeric", month: "short" }) : "");

const FLAGS = {
  Україна: "🇺🇦", Німеччина: "🇩🇪", Литва: "🇱🇹", Чехія: "🇨🇿", Бельгія: "🇧🇪", Нідерланди: "🇳🇱",
  Іспанія: "🇪🇸", Італія: "🇮🇹", Франція: "🇫🇷", Австрія: "🇦🇹", Польща: "🇵🇱", Ірландія: "🇮🇪",
  Мексика: "🇲🇽", "Велика Британія": "🇬🇧", Шотландія: "🏴", Данія: "🇩🇰", Японія: "🇯🇵",
  Латвія: "🇱🇻", Естонія: "🇪🇪", США: "🇺🇸", Грузія: "🇬🇪", Словаччина: "🇸🇰", Угорщина: "🇭🇺",
  Молдова: "🇲🇩", Китай: "🇨🇳", Таїланд: "🇹🇭", Швеція: "🇸🇪", Фінляндія: "🇫🇮", Норвегія: "🇳🇴",
  Хорватія: "🇭🇷", Сербія: "🇷🇸", Словенія: "🇸🇮", Португалія: "🇵🇹", Греція: "🇬🇷", Румунія: "🇷🇴",
};
const country = (c) => (c ? `${FLAGS[c] || "🌍"} ${countryName(c)}` : "");

const chain = (id) => chainName(id, state.chains[id]);

// Стиль пива по названию (названия в магазинах на украинском) → ключи переводов
const STYLES = [
  [/безалког|0[.,]0\s*%|\b0%/i, "nonalc"],
  [/\b(neipa|nepa|hazy)\b/i, "neipa"],
  [/\bi\.?p\.?a\b|\bіпа\b/i, "ipa"],
  [/\bapa\b|pale ale|пейл/i, "pale"],
  [/stout|стаут/i, "stout"],
  [/porter|портер/i, "porter"],
  [/пшенич|weiss|weiß|weizen|hefe|witbier|wit\b|blanc|blanche|white/i, "wheat"],
  [/pils|пілз|пілс|пільз/i, "pils"],
  [/gose|гозе|sour|саур|кисл/i, "sour"],
  [/radler|радлер|лимон|грейпфрут|вишн|малин|зі смаком|з соком|смак/i, "flavored"],
  [/\bbock\b|бок\b/i, "bock"],
  [/dunkel|темне|dark|black/i, "dark"],
  [/\bale\b|\bель\b/i, "ale"],
  [/lager|лагер|hell|світле/i, "light"],
];

function styles(title) {
  const out = [];
  for (const [re, key] of STYLES) if (re.test(title) && !out.includes(key)) out.push(key);
  if (/нефільтр|unfiltered|naturtrüb|naturtrub/i.test(title)) out.push("unfiltered");
  // "Светлое" не показываем рядом с "Тёмное" и у пшеничного/IPA/стаута и т.п. — там это лишнее
  if (out.some((s) => s !== "light" && s !== "unfiltered" && s !== "nonalc")) return out.filter((s) => s !== "light");
  return out;
}

const abvText = (abv) => `${num(abv)}%`;

function bestDiscount(b) {
  let best = 0;
  for (const p of b.prices) if (p.stock && p.old) best = Math.max(best, Math.round((1 - p.price / p.old) * 100));
  return best;
}

function minPrice(b) {
  const avail = b.prices.filter((p) => p.stock);
  return (avail.length ? avail : b.prices)[0];
}

/* ---------- шапка и язык ---------- */

function renderHeader() {
  document.documentElement.lang = lang;
  document.title = t("appTitle");
  document.getElementById("appName").textContent = t("appName");
  const sw = document.getElementById("lang");
  sw.setAttribute("aria-label", t("langLabel"));
  sw.innerHTML = LANGS.map(
    ([code, label]) =>
      `<button type="button" data-lang="${code}" class="${code === lang ? "on" : ""}" aria-pressed="${code === lang}">${label}</button>`
  ).join("");
}

document.getElementById("lang").addEventListener("click", (e) => {
  const b = e.target.closest("[data-lang]");
  if (!b || b.dataset.lang === lang) return;
  setLang(b.dataset.lang);
  renderHeader();
  if (location.hash === "#/scan") {
    // не перезапускаем камеру — только подписи
    view.querySelector("#close").textContent = t("close");
    view.querySelector("#torch").textContent = t("torch");
    view.querySelector("#hint").textContent = t("aimHint");
    view.querySelector("#manual input").placeholder = t("typeCode");
  } else if (state.data) {
    const y = window.scrollY;
    route();
    window.scrollTo(0, y);
  }
});

/* ---------- данные ---------- */

async function loadData() {
  const res = await fetch("data/beers.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(t("loadFail", { s: res.status }));
  const data = await res.json();
  state.data = data;
  state.index = new BeerIndex(data.beers);
  state.chains = Object.fromEntries(data.chains.map((c) => [c.id, c.name]));
}

async function loadHistory() {
  if (state.history) return state.history;
  try {
    const res = await fetch("data/history.json", { cache: "no-cache" });
    state.history = res.ok ? await res.json() : {};
  } catch {
    state.history = {};
  }
  return state.history;
}

/* ---------- элементы списка ---------- */

function thumb(b, cls = "thumb") {
  return b.img
    ? `<img class="${cls}" src="${esc(b.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='<div class=&quot;${cls} empty&quot;>🍺</div>'" />`
    : `<div class="${cls} empty">🍺</div>`;
}

function itemHtml(b) {
  const p = minPrice(b);
  const disc = bestDiscount(b);
  const pl = perLitre(p.price, b.ml);
  const meta = [country(b.country), b.abv != null ? abvText(b.abv) : "", volume(b.ml)].filter(Boolean).join(" · ");
  return `<li><a class="item" href="#/b/${b.ean}">
    ${thumb(b)}
    <div><div class="name">${esc(b.title.replace(/^Пиво\s+/i, ""))}</div><div class="meta">${esc(meta)}</div></div>
    <div class="price"><b>${money(p.price)}</b>${disc ? `<span class="badge">−${disc}%</span> ` : ""}${pl ? `<small>${money(pl)}${t("perL")}</small>` : ""}</div>
  </a></li>`;
}

/* ---------- главная ---------- */

function homeList() {
  const { q, tab, country: c } = state.home;
  let items;
  if (q.trim()) {
    items = state.index.search(q, 200).map((r) => r.beer);
  } else {
    items = state.data.beers.filter((b) => b.prices.some((p) => p.stock));
    if (tab === "deals") {
      items = items.filter((b) => bestDiscount(b) > 0).sort((a, b) => bestDiscount(b) - bestDiscount(a));
    } else if (tab === "cheap") {
      items = items
        .filter((b) => b.ml && b.abv !== 0)
        .sort((a, b) => perLitre(minPrice(a).price, a.ml) - perLitre(minPrice(b).price, b.ml));
    } else if (tab === "strong") {
      items = items.filter((b) => b.abv).sort((a, b) => b.abv - a.abv);
    } else if (tab === "zero") {
      items = items.filter((b) => b.abv === 0 || /безалког/i.test(b.title)).sort((a, b) => a.min - b.min);
    }
  }
  if (c) items = items.filter((b) => b.country === c);
  return items;
}

function renderHome() {
  const { q, tab, country: c } = state.home;
  const counts = new Map();
  for (const b of state.data.beers) if (b.country) counts.set(b.country, (counts.get(b.country) || 0) + 1);
  const countries = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
  const tabs = [
    ["deals", t("tabDeals")],
    ["cheap", t("tabCheap")],
    ["strong", t("tabStrong")],
    ["zero", t("tabZero")],
  ];

  view.innerHTML = `
    <div class="actions">
      <a class="btn big primary" href="#/scan"><span class="ico">▥</span>${t("scanBtn")}</a>
      <button class="btn big" id="photoBtn" type="button"><span class="ico">📷</span>${t("photoBtn")}</button>
    </div>
    <div class="search"><input id="q" type="search" placeholder="${esc(t("searchPh"))}" value="${esc(q)}" autocomplete="off" enterkeyhint="search" /></div>
    <div class="tabs" ${q.trim() ? "hidden" : ""}>
      ${tabs.map(([id, label]) => `<button class="tab ${tab === id ? "on" : ""}" data-tab="${id}">${label}</button>`).join("")}
    </div>
    <div class="tabs">
      <select class="tab ${c ? "on" : ""}" id="country" aria-label="${esc(t("country"))}">
        <option value="">${t("allCountries")}</option>
        ${countries.map((x) => `<option value="${esc(x)}" ${x === c ? "selected" : ""}>${esc(country(x))}</option>`).join("")}
      </select>
    </div>
    <div id="results"></div>
    <footer class="foot">
      ${esc(t("footStats", { n: state.data.beers.length, m: state.data.chains.length, list: state.data.chains.map((x) => chain(x.id)).join(", ") }))}<br />
      ${esc(t("footSrc", { d: shortDate(state.data.updated) }))}<br />
      ${esc(t("footInstall"))}
    </footer>`;

  const results = view.querySelector("#results");
  const draw = () => {
    const items = homeList();
    const shown = items.slice(0, state.home.shown);
    results.innerHTML = items.length
      ? `<ul class="list">${shown.map(itemHtml).join("")}</ul>
         ${items.length > shown.length ? `<p class="center"><button class="btn" id="more">${t("showMore", { n: items.length - shown.length })}</button></p>` : ""}`
      : `<p class="center muted pad">${t("nothing")}</p>`;
    results.querySelector("#more")?.addEventListener("click", () => {
      state.home.shown += 40;
      draw();
    });
  };
  draw();

  const qInput = view.querySelector("#q");
  let timer;
  qInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.home.q = qInput.value;
      state.home.shown = 40;
      view.querySelectorAll(".tabs")[0].hidden = !!qInput.value.trim();
      draw();
    }, 120);
  });
  qInput.addEventListener("keydown", (e) => e.key === "Enter" && qInput.blur());
  view.querySelectorAll("[data-tab]").forEach((el) =>
    el.addEventListener("click", () => {
      state.home.tab = el.dataset.tab;
      state.home.shown = 40;
      renderHome();
    })
  );
  view.querySelector("#country").addEventListener("change", (e) => {
    state.home.country = e.target.value;
    state.home.shown = 40;
    renderHome();
  });
  view.querySelector("#photoBtn").addEventListener("click", () => photoInput.click());
}

/* ---------- карточка пива ---------- */

function sparkline(points) {
  const W = 600;
  const H = 80;
  const ys = points.map((p) => p[1]);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;
  const xy = points.map((p, i) => [
    (i / (points.length - 1)) * (W - 8) + 4,
    H - 8 - ((p[1] - min) / span) * (H - 16),
  ]);
  const d = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = xy[xy.length - 1];
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(t("trendAria"))}">
    <path d="${d}" fill="none" stroke="var(--amber)" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
    <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="var(--amber2)" />
  </svg>`;
}

function description(b) {
  const st = styles(b.title).map(styleName);
  const kind = st.length ? st.join(", ").toLowerCase() : t("beer");
  let s = `${kind[0].toUpperCase()}${kind.slice(1)}`;
  if (b.abv) s += `, ${t("abv", { n: num(b.abv) })}`;
  if (b.ml) s += `, ${volume(b.ml)}`;
  const parts = [`${s}.`];
  if (b.brand) parts.push(t("brand", { v: b.brand }));
  if (b.country) parts.push(t("countryIs", { v: countryName(b.country) }));
  if (b.producer) parts.push(t("producer", { v: b.producer.trim() }));
  return parts.join(" ");
}

function related(b) {
  if (!b.brand) return [];
  return state.data.beers.filter((x) => x.brand === b.brand && x.ean !== b.ean).slice(0, 8);
}

async function renderBeer(ean) {
  const b = state.index.byEan.get(ean);
  if (!b) return renderUnknown(ean);

  const p = minPrice(b);
  const pl = perLitre(p.price, b.ml);
  const inStock = b.prices.filter((x) => x.stock);
  const disc = bestDiscount(b);
  const chips = [...styles(b.title).map(styleName), b.abv != null ? abvText(b.abv) : null, volume(b.ml), country(b.country)]
    .filter(Boolean)
    .map((c) => `<span class="chip">${esc(c)}</span>`)
    .join("");

  view.innerHTML = `
    <button class="linkbtn back" onclick="history.length > 1 ? history.back() : (location.hash = '#/')">${t("back")}</button>
    <div class="hero">
      ${thumb(b, "pic")}
      <div>
        <h1>${esc(b.title)}</h1>
        <div class="chips" id="chips">${chips}</div>
      </div>
    </div>

    <div class="summary">
      <div class="stat"><b>${money(p.price)}</b><span>${esc(t("minPrice", { c: chain(p.chain) }))}</span></div>
      <div class="stat"><b>${money(b.avg)}</b><span>${esc(t("avgPrice", { n: inStock.length || b.prices.length }))}</span></div>
      <div class="stat"><b>${pl ? money(pl) : "—"}</b><span>${t("perLitre")}</span></div>
    </div>
    ${disc ? `<div class="notice">${t("dealNote", { n: disc })}</div>` : ""}

    <h2>${t("whereBuy")}</h2>
    <ul class="stores">
      ${b.prices
        .map(
          (x) => `<li class="store ${x.stock ? "" : "out"}">
        <div><b class="${x === p ? "best" : ""}">${esc(chain(x.chain))}</b>
          <div class="small muted">${x.stock ? (x.old ? `<span class="badge">−${Math.round((1 - x.price / x.old) * 100)}%</span> ${x.until ? esc(t("until", { d: shortDate(x.until) })) : ""}` : t("inStock")) : t("outStock")}</div></div>
        <div class="p">${money(x.price)}${x.old ? `<s>${money(x.old)}</s>` : ""}</div>
        <a href="${esc(x.url)}" target="_blank" rel="noopener" aria-label="${esc(t("openStore"))}">↗</a>
      </li>`
        )
        .join("")}
    </ul>
    <p class="small muted">${esc(t("priceNote", { d: shortDate(state.data.updated) }))}</p>

    <div id="hist"></div>

    <h2>${t("about")}</h2>
    <div class="box" id="about">
      <p>${esc(description(b))}</p>
      ${b.ingredients ? `<p class="small"><span class="muted">${t("ingredients")}</span> ${esc(b.ingredients)}</p>` : ""}
      <p class="small muted">${esc(t("barcode", { v: b.ean }))}</p>
    </div>
    <div id="off"></div>

    ${related(b).length ? `<h2>${esc(t("otherOf", { v: b.brand }))}</h2><ul class="list">${related(b).map(itemHtml).join("")}</ul>` : ""}
  `;

  // История цен
  loadHistory().then((h) => {
    const pts = h[b.ean];
    const el = view.querySelector("#hist");
    if (!el || !pts || pts.length < 2) return;
    const first = pts[0][1];
    const last = pts[pts.length - 1][1];
    const diff = last - first;
    el.innerHTML = `<h2>${t("priceTrend")}</h2><div class="box">${sparkline(pts)}
      <p class="small muted">${esc(t("since", { d: shortDate(pts[0][0]) }))} ${money(first)} → ${money(last)}
      ${diff ? `<span class="badge ${diff < 0 ? "green" : ""}">${diff > 0 ? "+" : ""}${Math.round((diff / first) * 100)}%</span>` : ""}</p></div>`;
  });

  // Дополнение из мировой базы Open Food Facts
  offProduct(b.ean).then((o) => {
    const el = view.querySelector("#off");
    if (!el || !o) return;
    if (o.style && !styles(b.title).includes(o.style)) {
      view.querySelector("#chips")?.insertAdjacentHTML("afterbegin", `<span class="chip">${esc(styleName(o.style))}</span>`);
    }
    if (!b.img && o.img) {
      const pic = view.querySelector(".pic");
      pic?.replaceWith(Object.assign(document.createElement("img"), { className: "pic", src: o.img, alt: "" }));
    }
    const extra = [
      o.name && o.name !== b.title ? t("offName", { v: o.name }) : null,
      o.origin ? t("offOrigin", { v: o.origin }) : null,
    ].filter(Boolean);
    el.innerHTML = `<p class="small muted">${extra.map(esc).join(" · ")}${extra.length ? " · " : ""}<a href="${esc(o.url)}" target="_blank" rel="noopener">Open Food Facts ↗</a></p>`;
  });
}

/* ---------- штрихкод не найден в магазинах ---------- */

async function renderUnknown(code) {
  view.innerHTML = `
    <button class="linkbtn back" onclick="location.hash = '#/'">${t("home")}</button>
    <h1>${esc(t("barcodeTitle", { v: code }))}</h1>
    <p class="muted">${t("searchingWorld")}</p>`;
  const o = await offProduct(code);
  if (location.hash !== `#/b/${code}`) return; // пользователь уже ушёл
  const guesses = o?.name ? state.index.matchLabel(`${o.brand || ""} ${o.name}`, 6) : [];

  view.innerHTML = `
    <button class="linkbtn back" onclick="location.hash = '#/'">${t("home")}</button>
    ${
      o
        ? `<div class="hero">
            ${o.img ? `<img class="pic" src="${esc(o.img)}" alt="" />` : `<div class="pic empty">🍺</div>`}
            <div><h1>${esc(o.name || t("noName"))}</h1>
              <div class="chips">${[o.brand, o.style ? styleName(o.style) : null, o.abv != null ? abvText(o.abv) : null, o.quantity, o.origin]
                .filter(Boolean)
                .map((c) => `<span class="chip">${esc(c)}</span>`)
                .join("")}</div></div>
          </div>
          ${!o.isBeer ? `<div class="notice">${t("notBeer")}</div>` : ""}
          ${o.ingredients ? `<div class="box" style="margin-top:14px"><p class="small"><span class="muted">${t("ingredients")}</span> ${esc(o.ingredients)}</p></div>` : ""}
          <p class="small"><a href="${esc(o.url)}" target="_blank" rel="noopener">${t("openOff")}</a></p>`
        : `<h1>${esc(t("barcodeTitle", { v: code }))}</h1>`
    }
    <div class="notice">${t("notInStores")} ${o ? "" : t("notInOff")}</div>
    ${guesses.length ? `<h2>${t("maybe")}</h2><ul class="list">${guesses.map((g) => itemHtml(g.beer)).join("")}</ul>` : ""}
    <h2>${t("findByName")}</h2>
    <form class="manual" id="f"><input class="field" name="q" placeholder="${esc(t("examplePh"))}" value="${esc(o?.name || "")}" /><button class="btn primary">${t("find")}</button></form>`;
  view.querySelector("#f").addEventListener("submit", (e) => {
    e.preventDefault();
    state.home.q = e.target.q.value;
    location.hash = "#/";
  });
}

/* ---------- сканер ---------- */

async function renderScan() {
  view.innerHTML = `
    <div class="scanner">
      <video muted playsinline></video>
      <div class="frame"></div>
      <div class="bar top">
        <button class="btn" id="close">${t("close")}</button>
        <button class="btn" id="torch" hidden>${t("torch")}</button>
      </div>
      <div class="bar bottom">
        <div class="hint" id="hint">${t("aimHint")}</div>
        <form class="manual" id="manual">
          <input class="field" name="code" inputmode="numeric" pattern="[0-9]*" placeholder="${esc(t("typeCode"))}" />
          <button class="btn primary">OK</button>
        </form>
      </div>
    </div>`;

  const video = view.querySelector("video");
  const hint = view.querySelector("#hint");
  view.querySelector("#close").addEventListener("click", () => history.back());
  view.querySelector("#manual").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = e.target.code.value.replace(/\D/g, "");
    if (code.length >= 8) found(code);
  });

  let done = false;
  function found(code) {
    if (done) return;
    done = true;
    navigator.vibrate?.(60);
    stopScanner();
    const ean = code.replace(/^0+/, "");
    location.replace(`#/b/${ean}`);
  }

  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error(t("noCamera"));
    state.scanner = await startScanner(video, found);
    if (location.hash !== "#/scan") return stopScanner(); // пользователь уже ушёл
    if (state.scanner.torch) {
      const tb = view.querySelector("#torch");
      let on = false;
      tb.hidden = false;
      tb.addEventListener("click", () => state.scanner?.setTorch((on = !on)));
    }
  } catch (e) {
    const msg = e.name === "NotAllowedError" ? t("camDenied") : e.message === "scanner_load_failed" ? t("noCamera") : e.message;
    hint.innerHTML = `⚠️ ${esc(msg)}.<br/>${t("typeManually")}`;
  }
}

function stopScanner() {
  state.scanner?.stop();
  state.scanner = null;
}

/* ---------- фото этикетки ---------- */

const STEP = { loading: "ocrLoading", reading: "ocrReading", done: "ocrDone" };

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  photoInput.value = "";
  if (!file) return;
  state.label = { file, url: URL.createObjectURL(file), text: null, results: null, error: null, progress: 0, step: "" };
  if (location.hash === "#/label") renderLabel();
  else location.hash = "#/label";
  runOcr(state.label);
});

async function runOcr(job) {
  try {
    const { readLabel } = await import("./ocr.js");
    job.text = await readLabel(job.file, (p, step) => {
      job.progress = p;
      job.step = step;
      if (state.label === job && location.hash === "#/label") {
        const bar = view.querySelector(".progress i");
        if (bar) bar.style.width = `${Math.round(p * 100)}%`;
        const st = view.querySelector("#step");
        if (st) st.textContent = t(STEP[step] || "preparing");
      }
    });
    job.results = state.index.matchLabel(job.text, 8);
  } catch (e) {
    job.error = e.message || String(e);
  }
  if (state.label === job && location.hash === "#/label") renderLabel();
}

function renderLabel() {
  const job = state.label;
  if (!job) {
    location.replace("#/");
    return;
  }
  const busy = job.results == null && !job.error;
  const err = job.error === "ocr_load_failed" ? t("ocrLibFail") : job.error;
  view.innerHTML = `
    <button class="linkbtn back" onclick="location.hash = '#/'">${t("home")}</button>
    <img class="photo-preview" src="${job.url}" alt="${esc(t("yourPhoto"))}" />
    ${
      busy
        ? `<p id="step" class="muted">${t(STEP[job.step] || "preparing")}</p><div class="progress"><i style="width:${Math.round(job.progress * 100)}%"></i></div>
           <p class="small muted">${t("firstTime")}</p>`
        : ""
    }
    ${job.error ? `<div class="notice">⚠️ ${esc(t("ocrFail", { v: err }))}</div>` : ""}
    ${
      job.results
        ? job.results.length
          ? `<h2>${t("looksLike")}</h2><ul class="list">${job.results.map((r) => itemHtml(r.beer)).join("")}</ul>`
          : `<div class="notice">${t("noMatch")}</div>`
        : ""
    }
    ${!busy ? `<p class="center"><button class="btn" id="again">${t("anotherPhoto")}</button> <a class="btn" href="#/scan">${t("barcodeBtn")}</a></p>` : ""}
    ${job.text ? `<details><summary>${t("ocrText")}</summary><pre class="ocr">${esc(job.text.trim() || t("empty"))}</pre></details>` : ""}
    <h2>${t("orFindByName")}</h2>
    <form class="manual" id="f"><input class="field" name="q" placeholder="${esc(t("examplePh"))}" /><button class="btn primary">${t("find")}</button></form>`;
  view.querySelector("#again")?.addEventListener("click", () => photoInput.click());
  view.querySelector("#f").addEventListener("submit", (e) => {
    e.preventDefault();
    state.home.q = e.target.q.value;
    location.hash = "#/";
  });
}

/* ---------- маршрутизация ---------- */

function route() {
  const h = location.hash || "#/";
  if (h !== "#/scan") stopScanner();
  if (h === "#/scan") return renderScan();
  if (h === "#/label") return renderLabel();
  const m = h.match(/^#\/b\/(\d+)$/);
  if (m) return renderBeer(m[1]);
  return renderHome();
}

function onHashChange() {
  route();
  window.scrollTo(0, 0);
}

async function start() {
  renderHeader();
  view.innerHTML = `<p class="center muted pad">${t("loading")}</p>`;
  try {
    await loadData();
  } catch (e) {
    view.innerHTML = `<div class="notice">⚠️ ${esc(e.message)}. ${t("checkNet")}</div>`;
    return;
  }
  renderHeader();
  window.addEventListener("hashchange", onHashChange);
  route();
}

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

start();
