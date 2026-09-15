# 03 — Database Guide

## Database Overview

| Setting | Value |
|---|---|
| Engine | PostgreSQL 18.4 |
| Database Name | `KrishnaAccessoriesDB` |
| Port | 5432 |
| ORM | Entity Framework Core 8 (Code-First) |
| Migration Strategy | EF Core Migrations |

---

## Tables (23 total)

| Table | Records at Seed | Description |
|---|---|---|
| Users | 2 | Admin + Customer accounts |
| Categories | 7 | Fine Jewelry, Watches, Leather, etc. |
| Brands | 10 | Luxury brand registry |
| Products | 13 | Curated luxury accessories |
| ProductImages | 13+ | Product photo URLs |
| Inventories | 13 | Stock per product |
| Cart | 1 | Active customer carts |
| CartItems | 0+ | Line items in carts |
| Wishlists | 1 | Per-user saved products |
| WishlistItems | 0+ | Items in wishlists |
| Addresses | 1 | Delivery addresses |
| Orders | 1 | Placed orders |
| OrderItems | 1+ | Line items in orders |
| Payments | 1 | Payment records |
| Coupons | 2 | WELCOME10, LUXURY20 |
| Reviews | 0+ | Product reviews |
| Notifications | 1 | System/order notifications |
| AuditLogs | 0+ | Action audit trail |
| ProductTags | 0+ | Product tagging |
| Tags | 0+ | Tag library |
| RefreshTokens | 0+ | JWT refresh tokens |
| UserSessions | 0+ | Active user sessions |

---

## Apply Migrations

```bash
cd "Krishna Accessories/backend"

# Apply all pending migrations
dotnet ef database update \
  --project KrishnaAccessories.Infrastructure/KrishnaAccessories.Infrastructure.csproj \
  --startup-project KrishnaAccessories.API/KrishnaAccessories.API.csproj

# Add a new migration
dotnet ef migrations add <MigrationName> \
  --project KrishnaAccessories.Infrastructure/KrishnaAccessories.Infrastructure.csproj \
  --startup-project KrishnaAccessories.API/KrishnaAccessories.API.csproj \
  --output-dir Data/Migrations
```

---

## Seed Data Details

### Default Users

| Name | Email | Role | Password |
|---|---|---|---|
| Krishna Admin | admin@krishnaaccessories.com | Admin | Admin@123456 |
| Priya Patel | customer@krishnaaccessories.com | Customer | Customer@123456 |

### Default Categories

1. Fine Jewelry
2. Luxury Watches
3. Premium Leather Goods
4. Precious Gemstones
5. Designer Sunglasses
6. Elite Fragrances
7. Royal Accessories

### Default Coupons

| Code | Type | Value | Min Order |
|---|---|---|---|
| WELCOME10 | Percentage | 10% | ₹5,000 |
| LUXURY20 | Percentage | 20% | ₹50,000 |

---

## Key Relationships

```sql
-- Products belong to categories and brands
Products.CategoryId → Categories.Id
Products.BrandId → Brands.Id

-- One inventory record per product
Inventories.ProductId → Products.Id (1:1)

-- Cart is user-scoped
Cart.UserId → Users.Id
CartItems.CartId → Cart.Id
CartItems.ProductId → Products.Id

-- Orders contain snapshot address (not FK — denormalized for history)
Orders.UserId → Users.Id
OrderItems.OrderId → Orders.Id
OrderItems.ProductId → Products.Id

-- Payments link to orders
Payments.OrderId → Orders.Id

-- Reviews are per-user per-product
Reviews.UserId → Users.Id
Reviews.ProductId → Products.Id

-- Notifications are user-targeted
Notifications.UserId → Users.Id (nullable — null = broadcast)
```

---

## Common Queries

```sql
-- Top selling products by order volume
SELECT p.name, COUNT(oi.id) as units_sold, SUM(oi.total_price) as revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.order_status = 'Delivered'
GROUP BY p.name
ORDER BY units_sold DESC;

-- Low stock alert (< 5 units)
SELECT p.name, p.sku, i.quantity_in_stock
FROM inventories i
JOIN products p ON i.product_id = p.id
WHERE i.quantity_in_stock < 5
ORDER BY i.quantity_in_stock;

-- Revenue by month
SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(total_amount) as revenue
FROM orders
WHERE order_status != 'Cancelled'
GROUP BY month
ORDER BY month;
```

---

## Backup & Restore

```bash
# Backup
pg_dump -U admin -h localhost KrishnaAccessoriesDB > backup.sql

# Restore
psql -U admin -h localhost KrishnaAccessoriesDB < backup.sql
```
