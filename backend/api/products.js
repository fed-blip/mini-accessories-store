const express = require("express");
const router = express.Router();
const productService = require("../service/productService");

// GET ALL
router.get("/", (req, res) => {
  res.json(productService.getAll());
});

// GET BY ID
router.get("/:id", (req, res) => {
  const product = productService.getById(req.params.id);
  if (!product) return res.status(404).json({ error: "Not Found" });
  res.json(product);
});

// CREATE
router.post("/", (req, res) => {
  try {
    const product = productService.create(req.body);
    res.status(201).json(product);
  } catch (e) {
    res.status(400).json({
      error: "ValidationError",
      message: e.message
    });
  }
});

// UPDATE
router.put("/:id", (req, res) => {
  try {
    const product = productService.update(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: "Not Found" });

    res.json(product);
  } catch (e) {
    res.status(400).json({
      error: "ValidationError",
      message: e.message
    });
  }
});

// DELETE
router.delete("/:id", (req, res) => {
  const ok = productService.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: "Not Found" });

  res.status(204).send();
});

module.exports = router;
