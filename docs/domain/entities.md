# Domain Entities

## Catalog
### Item
- id
- name
- description
- price
- categoryId

### Category
- id
- name

## Users
### User
- id
- name
- email

## Orders
### Order
- id
- userId
- status
- totalPrice
- createdAt

### OrderItem
- id
- orderId
- itemId
- quantity
- price

## Payments (майбутній)
### Payment
- id
- orderId
- status
- method
