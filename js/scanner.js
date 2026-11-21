// Сканер штрихкодов с камеры.
// На Android (Chrome) используется встроенный BarcodeDetector, на iPhone — библиотека ZXing.

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];

export function validEan(code) {
  if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
  const d = code.split("").map(Number);
  const check = d.pop();
  let sum = 0;
  d.reverse().forEach((n, i) => (sum += n * (i % 2 === 0 ? 3 : 1)));
  return (10 - (sum % 10)) % 10 === check;
}

async function nativeDetector() {
  if (!("BarcodeDetector" in window)) return null;
  try {
    const supported = await window.BarcodeDetector.getSupportedFormats();
    const formats = FORMATS.filter((f) => supported.includes(f));
    return formats.length ? new window.BarcodeDetector({ formats }) : null;
  } catch {
    return null;
  }
}

let zxingLoading;
function loadZXing() {
  if (window.ZXing) return Promise.resolve();
  zxingLoading ||= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "vendor/zxing.min.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("scanner_load_failed"));
    document.head.appendChild(s);
  });
  return zxingLoading;
}

/**
 * Запускает камеру в <video> и вызывает onCode(код) при успешном чтении.
 * Возвращает объект { stop(), torch: bool, setTorch(on) }.
 */
export async function startScanner(video, onCode) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
  });
  const track = stream.getVideoTracks()[0];
  video.srcObject = stream;
  video.setAttribute("playsinline", "");
  video.muted = true;
  await video.play();

  let stopped = false;
  let zxReader = null;
  const done = (code) => {
    if (stopped || !validEan(code)) return;
    onCode(code);
  };

  const detector = await nativeDetector();
  if (detector) {
    const loop = async () => {
      if (stopped) return;
      try {
        if (video.readyState >= 2) {
          const found = await detector.detect(video);
          for (const f of found) done(f.rawValue);
        }
      } catch {}
      setTimeout(loop, 120);
    };
    loop();
  } else {
    await loadZXing();
    const Z = window.ZXing;
    const hints = new Map();
    hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [
      Z.BarcodeFormat.EAN_13,
      Z.BarcodeFormat.EAN_8,
      Z.BarcodeFormat.UPC_A,
      Z.BarcodeFormat.UPC_E,
    ]);
    hints.set(Z.DecodeHintType.TRY_HARDER, true);
    zxReader = new Z.MultiFormatReader();
    zxReader.setHints(hints);
    // Берём кадры с камеры сами: так работает одинаково на всех телефонах
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const loop = () => {
      if (stopped) return;
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w && h) {
        const k = Math.min(1, 1024 / Math.max(w, h));
        canvas.width = Math.round(w * k);
        canvas.height = Math.round(h * k);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const src = new Z.HTMLCanvasElementLuminanceSource(canvas);
          const res = zxReader.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(src)));
          done(res.getText());
        } catch {
          // в этом кадре штрихкода нет — пробуем следующий
        }
      }
      setTimeout(loop, 100);
    };
    loop();
  }

  const caps = track.getCapabilities ? track.getCapabilities() : {};
  return {
    torch: !!caps.torch,
    setTorch: (on) => track.applyConstraints({ advanced: [{ torch: on }] }).catch(() => {}),
    stop() {
      stopped = true;
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    },
  };
}
