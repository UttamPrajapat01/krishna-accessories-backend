# 09 — Testing Guide

## Overview

The backend API is covered by an xUnit test suite using EF Core In-Memory provider for integration-style tests without a live database.

---

## Backend Tests

### Test Project Location

```
backend/KrishnaAccessories.Tests/
```

### Run All Tests

```bash
cd "Krishna Accessories/backend"
dotnet test KrishnaAccessories.Tests/KrishnaAccessories.Tests.csproj --verbosity normal
```

### Expected Output

```
Build succeeded.
Test run for KrishnaAccessories.Tests.dll (.NETCoreApp 8.0)
Starting test execution...

  ProductServiceTests
    ✓ GetProducts_ReturnsSeededProducts
    ✓ GetProductById_ReturnsCorrectProduct

  CartServiceTests
    ✓ AddItem_AddsItemToCart
    ✓ AddDuplicateItem_IncreasesQuantity

  OrderServiceTests
    ✓ CreateOrder_FromCart_ReturnsValidOrder

  AuthServiceTests
    ✓ Login_ValidCredentials_ReturnsToken
    ✓ Register_NewUser_ReturnsUser

Passed: 7   Failed: 0   Skipped: 0
Test run succeeded.
```

### Test Structure

```
KrishnaAccessories.Tests/
├── ProductServiceTests.cs     Unit tests for product queries
├── CartServiceTests.cs        Cart add/update/remove operations
├── OrderServiceTests.cs       Order creation from cart
└── AuthServiceTests.cs        Registration and JWT login
```

### Test Approach

- **In-Memory Database**: Each test creates a fresh in-memory EF Core context
- **Real Service Layer**: Services are instantiated directly — no mocking
- **Isolated State**: Tests do not share state; each test rebuilds seed data

---

## Mobile App — TypeScript Type Check

```bash
cd "Krishna Accessories/mobile/KrishnaAccessoriesApp"
npx tsc --noEmit
# Expected: 0 errors, 0 warnings
```

---

## Admin Panel — Production Build Verification

```bash
cd "Krishna Accessories/admin/KrishnaAccessoriesAdmin"
npm run build
# Expected: dist/ created with no TypeScript or Vite errors
```

---

## End-to-End Smoke Test (Manual)

With the backend running at `http://localhost:5000`, run:

```bash
# 1. Login as customer
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@krishnaaccessories.com","password":"Customer@123456"}' | python3 -m json.tool

# 2. Use token from step 1 in subsequent calls
export TOKEN="<jwt_from_step_1>"

# 3. Get products
curl -s http://localhost:5000/api/products -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 4. Get cart
curl -s http://localhost:5000/api/cart -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 5. Get order history
curl -s http://localhost:5000/api/orders -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## Admin API Smoke Test

```bash
# Login as admin
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@krishnaaccessories.com","password":"Admin@123456"}'

export ADMIN_TOKEN="<admin_jwt>"

# Get dashboard stats
curl -s http://localhost:5000/api/admin/dashboard -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
```

---

## Production Health Check Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Application health status |
| `/api/products?page=1&pageSize=1` | GET | Basic API connectivity |
