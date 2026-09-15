# 06 — Backend Setup Guide

## Prerequisites

| Tool | Required Version | Check Command |
|---|---|---|
| .NET SDK | 8.0+ | `dotnet --version` |
| PostgreSQL | 16+ (18.4 recommended) | `psql --version` |
| EF Core Tools | 8.0+ | `dotnet ef --version` |

---

## 1. Clone & Navigate

```bash
cd "Krishna Accessories/backend"
```

---

## 2. Database Setup

### Create PostgreSQL Database

```bash
# Using psql CLI
psql -U admin -c "CREATE DATABASE \"KrishnaAccessoriesDB\";"

# Or via pgAdmin / Postgres.app
```

### Update Connection String

Edit `KrishnaAccessories.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=KrishnaAccessoriesDB;Username=admin;Password=YOUR_PASSWORD"
  }
}
```

---

## 3. Apply Migrations

```bash
cd KrishnaAccessories.API
dotnet ef database update --project ../KrishnaAccessories.Infrastructure/KrishnaAccessories.Infrastructure.csproj
```

This creates all 23 tables and runs the `DbInitializer` seeder automatically.

---

## 4. Run the API

```bash
dotnet run --project KrishnaAccessories.API/KrishnaAccessories.API.csproj --urls "http://localhost:5000"
```

**Swagger UI:** [http://localhost:5000](http://localhost:5000)

---

## 5. Environment Variables (Production)

```bash
# Set via environment or appsettings.Production.json
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__DefaultConnection="Host=prod-db;..."
export JwtSettings__SecretKey="your-256-bit-secret-key"
export RazorpaySettings__KeyId="rzp_live_xxxx"
export RazorpaySettings__KeySecret="your-razorpay-secret"
```

---

## 6. Project Architecture (Clean Architecture)

```
KrishnaAccessories.Core/
├── Entities/          17 domain models (User, Product, Order, etc.)
├── Enums/             OrderStatus, PaymentStatus, UserRole, etc.
└── Interfaces/        Repository contracts

KrishnaAccessories.Application/
├── DTOs/              Request/Response DTOs
├── Validators/        FluentValidation rules
└── Services/          Business logic services

KrishnaAccessories.Infrastructure/
├── Data/
│   ├── AppDbContext.cs           EF Core DbContext
│   └── DbInitializer.cs          Seed data (admin, products, etc.)
├── Repositories/                 Generic + domain repositories
└── Migrations/                   EF Core migrations

KrishnaAccessories.API/
├── Controllers/       12 REST controllers
├── Middleware/        JWT auth, global error handling
└── Program.cs         DI container, pipeline setup

KrishnaAccessories.Tests/
└── 7 xUnit test classes (unit + integration)
```

---

## 7. API Endpoints Reference

| Controller | Endpoints |
|---|---|
| AuthController | POST /auth/register, /auth/login, /auth/logout |
| ProductsController | GET /products, /products/{id}, /products/search |
| CategoriesController | GET /categories, /categories/{slug} |
| BrandsController | GET /brands |
| CartController | GET/POST/PUT/DELETE /cart/items |
| WishlistController | GET/POST/DELETE /wishlist |
| AddressController | GET/POST/PUT/DELETE /addresses |
| OrdersController | GET/POST /orders, /orders/{id}/cancel |
| PaymentsController | POST /payments/create-razorpay-order, /payments/verify |
| CouponsController | POST /coupons/validate |
| ReviewsController | GET/POST /reviews/product/{id} |
| NotificationsController | GET /notifications, PUT /notifications/{id}/read |

---

## 8. Run Tests

```bash
cd backend
dotnet test KrishnaAccessories.Tests/KrishnaAccessories.Tests.csproj --verbosity normal
```

Expected: **7 tests pass, 0 failures.**
