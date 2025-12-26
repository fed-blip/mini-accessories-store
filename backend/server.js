const express = require("express");
const cors = require("cors");
const db = require("./db");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors({
  origin: "*",
  allowedHeaders: [
    "Content-Type",
    "Idempotency-Key",
    "X-Request-Id"
  ]
}));
app.use(express.json());

// ================== X-Request-Id ==================
// робимо щоб кожен запит мав свій унікальний id
app.use((req, res, next) => {
  const rid = req.get("X-Request-Id") || randomUUID();
  req.rid = rid;
  res.setHeader("X-Request-Id", rid);
  next();
});

// ================== База ==================
const initSql = fs.readFileSync(path.join(__dirname, "items.sql"), "utf8");
db.exec(initSql);

const now = () => Date.now();

// ================== Rate limit + Retry‑After ==================
// примітивний ліміт запитів за 10 секунд
const rate = new Map();
const WINDOW_MS = 10_000;
const MAX_REQ = 8;

app.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "local";

  const bucket = rate.get(ip) ?? { count: 0, ts: now() };
  const within = now() - bucket.ts < WINDOW_MS;

  const state = within
    ? { count: bucket.count + 1, ts: bucket.ts }
    : { count: 1, ts: now() };

  rate.set(ip, state);

  if (state.count > MAX_REQ) {
    res.setHeader("Retry-After", "2");
    return res
      .status(429)
      .json({ error: "too_many_requests", requestId: req.rid });
  }

  next();
});

// ================== Fault injection ==================
// інколи сервер спеціально лагає або падає
app.use(async (req, res, next) => {
  const r = Math.random();

  // затримка відповіді
  if (r < 0.15) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
  }

  // 503 або 500
  if (r > 0.8) {
    const err = Math.random() < 0.5 ? "unavailable" : "unexpected";
    const code = err === "unavailable" ? 503 : 500;
    return res.status(code).json({ error: err, requestId: req.rid });
  }

  next();
});

// ================== Ідемпотентний POST ==================
const idemStore = new Map();

app.post("/orders", (req, res) => {
  const key = req.get("Idempotency-Key");

  if (!key) {
    return res.status(400).json({
      error: "idempotency_key_required",
      requestId: req.rid,
    });
  }

  // якщо вже створювали з цим ключем → повертаємо старий результат
  if (idemStore.has(key)) {
    return res
      .status(201)
      .json({ ...idemStore.get(key), requestId: req.rid });
  }

  const order = {
    id: "ord_" + randomUUID().slice(0, 8),
    title: req.body?.title ?? "Untitled",
  };

  idemStore.set(key, order);

  return res.status(201).json({ ...order, requestId: req.rid });
});

// ================== API ==================
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ error: "db_error", requestId: req.rid });

    res.json(rows);
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const productsRouter = require("./api/products");
app.use("/products", productsRouter);

// ================== ROOT ==================
app.get("/", (req, res) => {
  res.send("Mini Accessories API works");
});

// ================== Єдиний формат помилок ==================
// (обов'язково в самому кінці)
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    error: err.message || "unexpected_error",
    code: err.code ?? null,
    details: err.details ?? null,
    requestId: req?.rid ?? null
  });
});

// ================== START ==================
const PORT = 3000;
app.listen(3000, "0.0.0.0", () =>
  console.log("Server running on port 3000")
);