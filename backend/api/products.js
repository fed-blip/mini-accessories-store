const express = require("express");
const router = express.Router();
const productService = require("../service/productService");

router.get("/", (req, res) => {
  const products = productService.getAll();
  res.json(products);
});

router.post("/", (req, res) => {
  try {
    const product = productService.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: "ValidationError", message: err.message });
  }
});

router.get("/:id", (req, res) => {
  const product = productService.getById(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

router.put("/:id", (req, res) => {
  try {
    const product = productService.update(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: "ValidationError", message: err.message });
  }
});

router.delete("/:id", (req, res) => {
  const deleted = productService.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.status(204).send();
});

module.exports = router;
