const { v4: uuidv4 } = require('uuid');

class Product {
  constructor({ id, name, price }) {
    this.id = id || uuidv4();
    this.name = name;
    this.price = price;

    this.validate();
  }

  validate() {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Product name is required');
    }

    if (this.price == null || typeof this.price !== 'number') {
      throw new Error('Product price must be a number');
    }
  }

  update(data) {
    if (data.name !== undefined) this.name = data.name;
    if (data.price !== undefined) this.price = data.price;

    this.validate();
  }
}

module.exports = Product;
