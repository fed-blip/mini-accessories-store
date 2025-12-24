const Product = require("../domain/product");

let products = [];


function getAll() {
  return products;
}

function getById(id) {
  const product = products.find(p => p.id === id);
  if (!product) {
    const err = new Error("Product not found");
    err.type = "NOT_FOUND";
    throw err;
  }
  return product;
}


function create(data) {
  if (!data) {
    const err = new Error("Request body is required");
    err.type = "VALIDATION";
    throw err;
  }

  const { name, price } = data;

  if (!name || price === undefined) {
    const err = new Error("Name and price are required");
    err.type = "VALIDATION";
    throw err;
  }

  const product = new Product({ name, price });
  products.push(product);
  return product;
}


function update(id, data) {
  if (!data) {
    const err = new Error("Request body is required");
    err.type = "VALIDATION";
    throw err;
  }

  const product = getById(id);
  product.update(data);
  return product;
}


function remove(id) {
  getById(id); 
  products = products.filter(p => p.id !== id);
  return;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
