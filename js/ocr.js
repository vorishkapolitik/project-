// Распознавание текста на фото этикетки прямо в телефоне (Tesseract.js, без ИИ и без интернета).
// Библиотека (~10 МБ) загружается только при первом использовании, потом берётся из кэша.

let workerPromise;
let progressCb = () => {};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Не удалось загрузить распознавание текста"));
    document.head.appendChild(s);
  });
}

const abs = (p) => new URL(p, location.href).href;

async function getWorker(onProgress) {
  workerPromise ||= (async () => {
    if (!window.Tesseract) await loadScript("vendor/tesseract/tesseract.min.js");
    const worker = await window.Tesseract.createWorker(["ukr", "eng"], 1, {
      workerPath: abs("vendor/tesseract/worker.min.js"),
      corePath: abs("vendor/tesseract/core"),
      langPath: abs("vendor/tesseract/lang"),
      logger: (m) => progressCb(m),
    });
    // Режим "разрозненный текст": на этикетке надписи разбросаны, а не идут абзацами
    await worker.setParameters({ tessedit_pageseg_mode: "11" });
    return worker;
  })();
  progressCb = onProgress;
  try {
    return await workerPromise;
  } catch (e) {
    workerPromise = null;
    throw e;
  }
}

// Уменьшаем фото и повышаем контраст — так Tesseract читает лучше и быстрее
async function prepare(file) {
  const bmp = await createImageBitmap(file);
  const max = 1600;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * k);
  const h = Math.round(bmp.height * k);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = Math.max(0, Math.min(255, (g - 128) * 1.4 + 128));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Возвращает распознанный текст. onProgress(доля 0..1, подпись) */
export async function readLabel(file, onProgress = () => {}) {
  onProgress(0.05, "Загружаю распознавание…");
  const worker = await getWorker((m) => {
    if (m.status === "recognizing text") onProgress(0.3 + m.progress * 0.7, "Читаю этикетку…");
    else if (m.progress != null) onProgress(0.05 + m.progress * 0.25, "Загружаю распознавание…");
  });
  const canvas = await prepare(file);
  onProgress(0.3, "Читаю этикетку…");
  const { data } = await worker.recognize(canvas);
  onProgress(1, "Готово");
  return data.text || "";
}
