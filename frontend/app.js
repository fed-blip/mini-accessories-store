const API = "http://localhost:3000/orders";

let failCount = 0;
const FAIL_LIMIT = 3;

const logBox = document.getElementById("log");
const button = document.getElementById("btn");
const banner = document.getElementById("degraded");

function log(text) {
  logBox.textContent += text + "\n";
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function backoff(base, attempt) {
  const jitter = Math.floor(Math.random() * 120);
  return base * 2 ** attempt + jitter;
}

async function fetchWithResilience(url, payload) {
  let retries = 2;
  let attempt = 0;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    while (true) {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
          "X-Request-Id": crypto.randomUUID()
        },
        signal: controller.signal,
      });

      // 429 → чекаємо Retry‑After
      if (res.status === 429) {
        const ra = Number(res.headers.get("Retry-After") || 1) * 1000;
        log("429 → чекаємо " + ra + "ms");
        await sleep(ra);
        continue;
      }

      // 5xx → ретраї
      if ([500, 502, 503, 504].includes(res.status) && retries > 0) {
        const delay = backoff(300, attempt++);
        log("5xx → ретраї через " + delay + "ms");
        await sleep(delay);
        retries--;
        continue;
      }

      return res;
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function createOrder() {
  if (failCount >= FAIL_LIMIT) return;

  button.disabled = true;
  log("▶ Надсилаю запит...");

  try {
    const payload = { title: "watch" };

    const res = await fetchWithResilience(API, payload);
    const data = await res.json();

    if (!res.ok) {
      failCount++;
      log("❌ Помилка: " + data.error + " | requestId=" + data.requestId);
    } else {
      failCount = 0;
      log("✅ Успіх! orderId=" + data.id + " | requestId=" + data.requestId);
    }
  } catch (e) {
    failCount++;
    log("❌ Abort / Network fail");
  }

  if (failCount >= FAIL_LIMIT) {
    banner.style.display = "block";
    button.disabled = true;
    log("⚠️ Увімкнено degraded mode");
  } else {
    button.disabled = false;
  }
}

button.addEventListener("click", createOrder);
