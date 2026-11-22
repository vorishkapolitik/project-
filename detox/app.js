import { t, lang, setLang, LANGS, cityName, chainName, locale } from "./i18n.js";

const app = document.getElementById("app");

const state = {
  data: null,
  history: null,
  f: { ml: "", city: "", chain: "", below: false, stock: false },
  sort: { key: "price", dir: 1 },
};

/* ---------- утилиты ---------- */

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const money = (n) =>
  n == null || Number.isNaN(n)
    ? "—"
    : `${n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴`;

const vol = (ml) => {
  if (!ml) return "—";
  const v = String(ml / 1000).replace(".", lang === "en" ? "." : ",");
  return `${v} ${lang === "en" ? "L" : "л"}`;
};

const date = (iso, opts = { day: "numeric", month: "short" }) => (iso ? new Date(iso).toLocaleDateString(locale(), opts) : "");


const basePrice = (ml) => state.data?.brand?.prices?.[ml]?.price ?? null;

function diff(o) {
  const b = basePrice(o.ml);
  if (b == null) return null;
  return { abs: o.price - b, pct: ((o.price - b) / b) * 100 };
}

const hasBase = () => Object.values(state.data?.brand?.prices || {}).some((p) => p?.price);

const chain = (o) => chainName(o.chain, o.chainName);

/* ---------- шапка ---------- */

function renderHeader() {
  document.documentElement.lang = lang;
  document.title = t("title");
  const box = document.getElementById("lang");
  box.setAttribute("aria-label", t("langLabel"));
  box.innerHTML = LANGS.map(
    ([code, label]) => `<button type="button" data-lang="${code}" class="${code === lang ? "on" : ""}" aria-pressed="${code === lang}">${label}</button>`
  ).join("");
}

document.getElementById("lang").addEventListener("click", (e) => {
  const b = e.target.closest("[data-lang]");
  if (!b || b.dataset.lang === lang) return;
  setLang(b.dataset.lang);
  renderHeader();
  if (state.data) render();
});

/* ---------- расчёты ---------- */

function volumes() {
  return [...new Set(state.data.offers.map((o) => o.ml).filter(Boolean))].sort((a, b) => a - b);
}

function statsFor(ml) {
  const all = state.data.offers.filter((o) => o.ml === ml);
  const live = all.filter((o) => o.stock);
  const pool = live.length ? live : all;
  const prices = pool.map((o) => o.price);
  const min = Math.min(...prices);
  const cheapest = pool.filter((o) => o.price === min);
  const b = basePrice(ml);
  return {
    count: live.length,
    min,
    max: Math.max(...prices),
    avg: prices.reduce((s, p) => s + p, 0) / prices.length,
    where: cheapest,
    base: b,
    below: b == null ? null : live.filter((o) => o.price < b).length,
  };
}

function filtered() {
  const { ml, city, chain: ch, below, stock } = state.f;
  let rows = state.data.offers.filter(
    (o) =>
      (!ml || o.ml === +ml) &&
      (!city || o.city === city) &&
      (!ch || o.chain === ch) &&
      (!stock || o.stock) &&
      (!below || (diff(o) && diff(o).abs < 0))
  );
  const { key, dir } = state.sort;
  const val = {
    price: (o) => o.price,
    ml: (o) => o.ml || 0,
    chain: (o) => chain(o),
    city: (o) => cityName(o.city) || "",
    diff: (o) => diff(o)?.pct ?? Infinity,
    disc: (o) => (o.old ? 1 - o.price / o.old : 0),
  }[key];
  rows = rows.slice().sort((a, b) => {
    const x = val(a);
    const y = val(b);
    const c = typeof x === "string" ? x.localeCompare(y, locale()) : x - y;
    return c * dir || a.price - b.price;
  });
  return rows;
}

/* ---------- разделы ---------- */

function heroHtml() {
  const img = state.data.offers.find((o) => o.img && o.source === "zakaz")?.img;
  return `<section class="hero">
    ${img ? `<img src="${esc(img)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()" />` : ""}
    <div>
      <h1>${t("product")}</h1>
      <p class="muted">${t("tagline")}</p>
      <p class="small muted">${t("updated", { d: date(state.data.updated, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) })}
        ${state.data.brand?.url ? ` · <a href="${esc(state.data.brand.url)}" target="_blank" rel="noopener">${t("brandShop")}</a>` : ""}</p>
    </div>
  </section>
  ${hasBase() ? "" : `<div class="notice">${t("noBase")}</div>`}`;
}

function cardsHtml() {
  return `<h2>${t("overview")}</h2><div class="cards">
    ${volumes()
      .map((ml) => {
        const s = statsFor(ml);
        // Самая низкая цена: по сетям, с числом магазинов
        const byChain = new Map();
        for (const o of s.where) byChain.set(o.chain, [...(byChain.get(o.chain) || []), o]);
        const where = [...byChain.values()]
          .map((list) => (list.length > 1 ? t("nStores", { c: chain(list[0]), n: list.length }) : `${chain(list[0])}${list[0].city ? ` · ${cityName(list[0].city)}` : ""}`))
          .join("; ");
        return `<div class="card">
          <div class="vol"><b>${vol(ml)}</b><span class="small muted">${t("sellers", { n: s.count })}</span></div>
          <dl class="kv">
            <dt>${t("siteAt")}</dt><dd>${s.base != null ? money(s.base) : `<span class="muted">${t("notSet")}</span>`}</dd>
            <dt>${t("marketMin")}</dt><dd class="big">${money(s.min)}</dd>
            <dd class="where">${esc(where)}</dd>
            <dt>${t("marketAvg")}</dt><dd>${money(s.avg)}</dd>
            <dt>${t("marketMax")}</dt><dd>${money(s.max)}</dd>
            <dt>${t("minPerL")}</dt><dd>${money((s.min / ml) * 1000)}</dd>
          </dl>
          ${s.below == null ? "" : s.below ? `<span class="pill bad">⚠ ${t("below", { n: s.below })}</span>` : `<span class="pill">✓ ${t("belowNone")}</span>`}
        </div>`;
      })
      .join("")}
  </div>`;
}

function filtersHtml() {
  const { ml, city, chain: ch, below, stock } = state.f;
  const cities = [...new Set(state.data.offers.map((o) => o.city).filter(Boolean))].sort((a, b) =>
    cityName(a).localeCompare(cityName(b), locale())
  );
  const chains = [...new Map(state.data.offers.map((o) => [o.chain, o])).values()].sort((a, b) => chain(a).localeCompare(chain(b), locale()));
  return `<div class="filters">
    <button class="chip ${!ml ? "on" : ""}" data-ml="">${t("all")}</button>
    ${volumes().map((v) => `<button class="chip ${String(v) === String(ml) ? "on" : ""}" data-ml="${v}">${vol(v)}</button>`).join("")}
  </div>
  <div class="filters">
    <select class="sel" id="fCity" aria-label="${esc(t("allCities"))}">
      <option value="">${t("allCities")}</option>
      ${cities.map((c) => `<option value="${esc(c)}" ${c === city ? "selected" : ""}>${esc(cityName(c))}</option>`).join("")}
    </select>
    <select class="sel" id="fChain" aria-label="${esc(t("allChains"))}">
      <option value="">${t("allChains")}</option>
      ${chains.map((o) => `<option value="${esc(o.chain)}" ${o.chain === ch ? "selected" : ""}>${esc(chain(o))}</option>`).join("")}
    </select>
    <label class="check"><input type="checkbox" id="fStock" ${stock ? "checked" : ""} />${t("onlyStock")}</label>
    ${hasBase() ? `<label class="check"><input type="checkbox" id="fBelow" ${below ? "checked" : ""} />${t("onlyBelow")}</label>` : ""}
  </div>`;
}

function th(key, label, cls = "") {
  const on = state.sort.key === key;
  return `<th class="${cls}" data-sort="${key}" aria-sort="${on ? (state.sort.dir > 0 ? "ascending" : "descending") : "none"}">${label}${on ? ` <span class="arrow">${state.sort.dir > 0 ? "▲" : "▼"}</span>` : ""}</th>`;
}

function tableHtml(rows) {
  const base = hasBase();
  if (!rows.length) return `<p class="muted">${t("nothing")}</p>`;
  return `<div class="tablebox"><table class="offers">
    <thead><tr>
      ${th("chain", t("colChain"))}
      ${th("city", t("colStore"))}
      ${th("ml", t("colVol"), "num")}
      ${th("price", t("colPrice"), "num")}
      ${th("disc", t("colDisc"), "num")}
      ${base ? th("diff", t("colDiff"), "num") : ""}
      <th>${t("colStock")}</th>
      <th>${t("colLink")}</th>
    </tr></thead>
    <tbody>
    ${rows
      .map((o) => {
        const d = diff(o);
        const isBelow = d && d.abs < 0;
        const disc = o.old ? Math.round((1 - o.price / o.old) * 100) : 0;
        return `<tr class="${isBelow ? "below" : ""}">
          <td class="first" data-l="${esc(t("colChain"))}">${esc(chain(o))}</td>
          <td data-l="${esc(t("colStore"))}"><span>${o.city ? esc(cityName(o.city)) : `<span class="muted">${t("online")}</span>`}<span class="sub">${esc(o.address || o.store || "")}</span></span></td>
          <td class="num" data-l="${esc(t("colVol"))}">${vol(o.ml)}</td>
          <td class="num" data-l="${esc(t("colPrice"))}"><b>${money(o.price)}</b>${o.old ? `<span class="sub"><s>${money(o.old)}</s></span>` : ""}</td>
          <td class="num" data-l="${esc(t("colDisc"))}">${disc ? `<span class="badge">−${disc}%</span>${o.until ? `<span class="sub">${esc(t("until", { d: date(o.until) }))}</span>` : ""}` : "—"}</td>
          ${
            base
              ? `<td class="num ${d ? (isBelow ? "diff-bad" : "diff-ok") : ""}" data-l="${esc(t("colDiff"))}">${
                  d ? `${d.abs > 0 ? "+" : ""}${money(d.abs)}<span class="sub">${d.pct > 0 ? "+" : ""}${d.pct.toFixed(1)}%</span>` : "—"
                }</td>`
              : ""
          }
          <td data-l="${esc(t("colStock"))}" class="${o.stock ? "" : "out"}">${o.stock ? t("inStock") : t("outStock")}</td>
          <td data-l="${esc(t("colLink"))}"><a href="${esc(o.url)}" target="_blank" rel="noopener">↗</a></td>
        </tr>`;
      })
      .join("")}
    </tbody></table></div>`;
}

function matrixHtml() {
  const vols = volumes();
  const byChain = new Map();
  for (const o of state.data.offers) {
    if (!o.stock || !o.ml) continue;
    const row = byChain.get(o.chain) || byChain.set(o.chain, { o, mins: {} }).get(o.chain);
    row.mins[o.ml] = Math.min(row.mins[o.ml] ?? Infinity, o.price);
  }
  const rows = [...byChain.values()].sort((a, b) => chain(a.o).localeCompare(chain(b.o), locale()));
  return `<h2>${t("matrix")}</h2>
  ${hasBase() ? `<p class="small muted">${t("matrixNote")}</p>` : ""}
  <div class="tablebox matrix-scroll"><table class="matrix">
    <thead><tr><th>${t("colChain")}</th>${vols.map((v) => `<th class="num">${vol(v)}</th>`).join("")}</tr></thead>
    <tbody>
      ${
        hasBase()
          ? `<tr><td><b>${t("siteAt")}</b></td>${vols.map((v) => `<td class="num"><b>${money(basePrice(v))}</b></td>`).join("")}</tr>`
          : ""
      }
      ${rows
        .map(
          (r) => `<tr><td>${esc(chain(r.o))}</td>${vols
            .map((v) => {
              const p = r.mins[v];
              if (p == null) return `<td class="empty">·</td>`;
              const b = basePrice(v);
              return `<td class="num ${b != null && p < b ? "bad" : ""}">${money(p)}</td>`;
            })
            .join("")}</tr>`
        )
        .join("")}
    </tbody>
  </table></div>`;
}

const COLORS = { min: "var(--green)", avg: "#3b82f6", base: "var(--red)" };

function chartSvg(points) {
  const W = 800;
  const H = 220;
  const P = { l: 54, r: 12, t: 12, b: 26 };
  const vals = points.flatMap((p) => [p[1], p[2], p[3]]).filter((v) => v != null);
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  if (hi - lo < 1) {
    lo -= 1;
    hi += 1;
  }
  const x = (i) => P.l + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - P.l - P.r));
  const y = (v) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);
  const line = (idx, color, dash = "") => {
    const pts = points.map((p, i) => (p[idx] == null ? null : [x(i), y(p[idx])])).filter(Boolean);
    if (!pts.length) return "";
    return `<polyline points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ""} vector-effect="non-scaling-stroke" stroke-linejoin="round" />`;
  };
  const ticks = [lo, (lo + hi) / 2, hi];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(t("history"))}">
    ${ticks
      .map(
        (v) => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" />
        <text x="${P.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${Math.round(v)}</text>`
      )
      .join("")}
    <text x="${P.l}" y="${H - 6}" font-size="11" fill="var(--muted)">${esc(date(points[0][0]))}</text>
    <text x="${W - P.r}" y="${H - 6}" font-size="11" fill="var(--muted)" text-anchor="end">${esc(date(points[points.length - 1][0]))}</text>
    ${line(2, COLORS.avg)}${line(1, COLORS.min)}${line(3, COLORS.base, "6 5")}
  </svg>`;
}

function historyHtml() {
  const h = state.history || {};
  const ml = state.f.ml || String(volumes().find((v) => (h[v]?.length || 0) > 0) || "");
  const pts = h[ml] || [];
  const body =
    pts.length < 2
      ? `<p class="muted">${t("histFew")}</p>`
      : `${chartSvg(pts)}
        <div class="legend">
          <span><i style="background:${COLORS.min}"></i>${t("histMin")}</span>
          <span><i style="background:${COLORS.avg}"></i>${t("histAvg")}</span>
          ${pts.some((p) => p[3] != null) ? `<span><i style="background:${COLORS.base}"></i>${t("histBase")}</span>` : ""}
        </div>`;
  return `<h2>${t("history")}${ml ? ` · ${vol(+ml)}` : ""}</h2><div class="card">${body}</div>`;
}

function sourcesHtml() {
  const brand = state.data.brand?.prices || {};
  const how = Object.values(brand).some((p) => p?.source === "feed")
    ? t("howFeed")
    : Object.values(brand).some((p) => p?.source === "manual")
      ? t("howManual")
      : t("howNone");
  const items = [
    ...state.data.sources.map((s) => `<li>${s.ok ? "✅" : "⚠️"} <b>${esc(s.name)}</b> — ${s.ok ? t("srcOk", { n: s.count }) : esc(t("srcFail", { e: s.error }))}</li>`),
    `<li>${how === t("howNone") ? "⏳" : "✅"} <b>shop.aquamyrgorod.com.ua</b> — ${esc(t("srcBrand", { how }))}</li>`,
    ...["Сільпо", "Rozetka", "Fozzy", "tabletki.ua"].map((n) => `<li>🔒 <b>${n}</b> — ${t("srcBlocked")}</li>`),
    `<li>🔒 <b>Varus</b> — ${t("srcInternal")}</li>`,
  ];
  return `<h2>${t("sources")}</h2><ul class="sources">${items.join("")}</ul>`;
}

/* ---------- CSV для Excel ---------- */

function exportCsv(rows) {
  const head = [t("colChain"), t("colStore"), t("colAddr"), t("colVol"), t("colPrice"), t("colOld"), t("colDisc"), t("colDiff"), t("colStock"), t("colLink")];
  const lines = rows.map((o) => {
    const d = diff(o);
    return [
      chain(o),
      cityName(o.city) || t("online"),
      o.address || o.store || "",
      o.ml ? o.ml / 1000 : "",
      o.price.toFixed(2).replace(".", ","),
      o.old ? o.old.toFixed(2).replace(".", ",") : "",
      o.old ? `${Math.round((1 - o.price / o.old) * 100)}%` : "",
      d ? `${d.pct.toFixed(1).replace(".", ",")}%` : "",
      o.stock ? t("inStock") : t("outStock"),
      o.url,
    ];
  });
  const csv = [head, ...lines]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `detox-prices-${state.data.updated.slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
}

/* ---------- отрисовка ---------- */

function render() {
  const rows = filtered();
  const y = window.scrollY;
  app.innerHTML = `
    ${heroHtml()}
    ${cardsHtml()}
    <h2>${t("offers")}</h2>
    ${filtersHtml()}
    <div class="bar">
      <span class="small muted">${t("shown", { n: rows.length })} · ${t("sortHint")}</span>
      <button class="btn primary" id="csv">${t("exportCsv")}</button>
    </div>
    ${tableHtml(rows)}
    ${matrixHtml()}
    ${historyHtml()}
    ${sourcesHtml()}
    <footer>${t("footer")}</footer>`;
  window.scrollTo(0, y);
  bind(rows);
}

function bind(rows) {
  app.querySelectorAll("[data-ml]").forEach((b) =>
    b.addEventListener("click", () => {
      state.f.ml = b.dataset.ml;
      render();
    })
  );
  app.querySelector("#fCity").addEventListener("change", (e) => {
    state.f.city = e.target.value;
    render();
  });
  app.querySelector("#fChain").addEventListener("change", (e) => {
    state.f.chain = e.target.value;
    render();
  });
  app.querySelector("#fStock").addEventListener("change", (e) => {
    state.f.stock = e.target.checked;
    render();
  });
  app.querySelector("#fBelow")?.addEventListener("change", (e) => {
    state.f.below = e.target.checked;
    render();
  });
  app.querySelectorAll("th[data-sort]").forEach((th) =>
    th.addEventListener("click", () => {
      const k = th.dataset.sort;
      state.sort = state.sort.key === k ? { key: k, dir: -state.sort.dir } : { key: k, dir: 1 };
      render();
    })
  );
  app.querySelector("#csv").addEventListener("click", () => exportCsv(rows));
}

async function start() {
  renderHeader();
  app.innerHTML = `<p class="muted">${t("loading")}</p>`;
  try {
    const res = await fetch("../data/detox.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    state.data = await res.json();
  } catch (e) {
    app.innerHTML = `<div class="notice">⚠️ ${esc(t("loadFail", { s: e.message }))}</div>`;
    return;
  }
  try {
    const h = await fetch("../data/detox-history.json", { cache: "no-cache" });
    state.history = h.ok ? await h.json() : {};
  } catch {
    state.history = {};
  }
  render();
}

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

start();
