class Product {
  constructor({ id, name, price }) {
    if (!name) throw new Error("NAME_REQUIRED");
    if (price == null || price < 0) throw new Error("INVALID_PRICE");

    this.id = id;
    this.name = name;
    this.price = price;
  }

  update({ name, price }) {
    if (name) this.name = name;
    if (price != null) {
      if (price < 0) throw new Error("INVALID_PRICE");
      this.price = price;
    }
  }
}

module.exports = Product;
