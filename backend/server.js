const express = require("express");
const cors = require("cors");
const db = require("./db");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());


const initSql = fs.readFileSync(path.join(__dirname, "items.sql"), "utf8");
db.exec(initSql);

app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});


app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


const productsRouter = require("./api/products");
app.use("/products", productsRouter);


const PORT = 3000;
app.get("/", (req, res) => {
  res.send("Міні онлайн-магазин аксесуарів — сервер працює 🎉");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
