class Order {
  constructor(id, userId) {
    this.id = id;
    this.userId = userId;
    this.items = [];
    this.status = "CREATED";
  }

  addItem(orderItem) {
    this.items.push(orderItem);
  }
}

module.exports = Order;
