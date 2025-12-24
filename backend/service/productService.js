const Product = require("../domain/product");
const { randomUUID } = require("crypto");

let products = [];

class ProductService {
  getAll() {
    return products;
  }

  getById(id) {
    return products.find(p => p.id === id) || null;
  }

  create(data) {
    const product = new Product({
      id: randomUUID(),
      name: data.name,
      price: data.price
    });

    products.push(product);
    return product;
  }

  update(id, data) {
    const product = this.getById(id);
    if (!product) return null;

    product.update(data);
    return product;
  }

  delete(id) {
    const before = products.length;
    products = products.filter(p => p.id !== id);
    return products.length !== before;
  }
}

module.exports = new ProductService();
