# 04 — API Documentation

## Base URL

| Environment | URL |
|---|---|
| Development | `http://localhost:5000/api` |
| Swagger UI | `http://localhost:5000` |
| Production | `https://api.krishnaaccessories.com/api` |

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

JWT token is obtained via `POST /api/auth/login`.

---

## Auth Endpoints

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string (optional)"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id", "fullName", "email", "role" }
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id", "fullName", "email", "role" }
  }
}
```

---

## Products

### List Products
```
GET /api/products?page=1&pageSize=20&categoryId=&brandId=&search=&sortBy=name&sortDesc=false

Response 200:
{
  "data": {
    "items": [ Product[] ],
    "totalCount": 13,
    "page": 1,
    "pageSize": 20
  }
}
```

### Get Product
```
GET /api/products/{id}

Response 200:
{
  "data": {
    "id": "guid",
    "name": "string",
    "sku": "string",
    "price": 49999,
    "mrp": 65000,
    "discount": 23,
    "categoryName": "string",
    "brandName": "string",
    "mainImageUrl": "string",
    "imageUrls": ["string"],
    "averageRating": 4.5,
    "reviewCount": 12
  }
}
```

### Search Products
```
GET /api/products/search?q=watch&page=1&pageSize=10
```

---

## Cart

### Get Cart
```
GET /api/cart  [Auth required]

Response 200:
{
  "data": {
    "id": "guid",
    "items": [ CartItem[] ],
    "subTotal": 49999,
    "estimatedTax": 8999,
    "totalAmount": 58998,
    "itemCount": 1
  }
}
```

### Add Item to Cart
```
POST /api/cart/items  [Auth required]

{
  "productId": "guid",
  "quantity": 1
}
```

### Update Cart Item
```
PUT /api/cart/items/{itemId}  [Auth required]

{
  "quantity": 2
}
```

### Remove Cart Item
```
DELETE /api/cart/items/{itemId}  [Auth required]
```

### Apply Coupon
```
POST /api/cart/apply-coupon  [Auth required]

{
  "couponCode": "WELCOME10"
}
```

---

## Orders

### Place Order
```
POST /api/orders  [Auth required]

{
  "addressId": "guid",
  "paymentMethod": "Razorpay | CashOnDelivery",
  "couponCode": "string (optional)",
  "notes": "string (optional)"
}

Response 200:
{
  "data": {
    "id": "guid",
    "orderNumber": "KA-20260911-XXXXXX",
    "totalAmount": 58998,
    "orderStatus": "Pending",
    "paymentStatus": "Pending"
  }
}
```

### Get Order History
```
GET /api/orders?page=1&pageSize=10  [Auth required]
```

### Get Order Details
```
GET /api/orders/{id}  [Auth required]
```

### Cancel Order
```
POST /api/orders/{id}/cancel  [Auth required]
```

---

## Payments

### Create Razorpay Order
```
POST /api/payments/create-razorpay-order/{orderId}  [Auth required]

Response 200:
{
  "data": {
    "orderId": "guid",
    "razorpayOrderId": "order_XXXXXX",
    "amount": 58998,
    "currency": "INR",
    "keyId": "rzp_test_XXXX"
  }
}
```

### Verify Payment
```
POST /api/payments/verify  [Auth required]

{
  "orderId": "guid",
  "razorpayOrderId": "order_XXXX",
  "razorpayPaymentId": "pay_XXXX",
  "razorpaySignature": "sha256_signature"
}
```

---

## Wishlist

```
GET    /api/wishlist              [Auth] — Get wishlist
POST   /api/wishlist              [Auth] — Add product
DELETE /api/wishlist/{productId}  [Auth] — Remove product
```

---

## Addresses

```
GET    /api/addresses             [Auth] — List addresses
POST   /api/addresses             [Auth] — Add address
PUT    /api/addresses/{id}        [Auth] — Update address
DELETE /api/addresses/{id}        [Auth] — Delete address
PUT    /api/addresses/{id}/default [Auth] — Set default
```

---

## Notifications

```
GET /api/notifications            [Auth] — Get all notifications
PUT /api/notifications/{id}/read  [Auth] — Mark as read
```

---

## Coupons

```
POST /api/coupons/validate
{
  "code": "WELCOME10",
  "orderTotal": 50000
}

Response:
{
  "data": {
    "isValid": true,
    "discountAmount": 5000,
    "finalTotal": 45000
  }
}
```

---

## Standard Response Envelope

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... },
  "errors": ["validation error 1", "..."]
}
```

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error |
| 401 | Unauthorized (invalid/expired JWT) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |
