# 02 — Architecture Guide

## System Architecture

Krishna Accessories follows **Clean Architecture** on the backend, a **component-based SPA** on the admin panel, and a **Context + Service Layer** pattern on the mobile app.

---

## Backend: Clean Architecture (4 Layers)

```
┌────────────────────────────────────────────────────┐
│                  KrishnaAccessories.API            │
│          (Controllers, Middleware, Program.cs)      │
│                  ↓ depends on ↓                    │
├────────────────────────────────────────────────────┤
│            KrishnaAccessories.Application           │
│         (Services, DTOs, FluentValidators)          │
│                  ↓ depends on ↓                    │
├────────────────────────────────────────────────────┤
│            KrishnaAccessories.Infrastructure        │
│      (AppDbContext, Repositories, DbInitializer)    │
│                  ↓ depends on ↓                    │
├────────────────────────────────────────────────────┤
│              KrishnaAccessories.Core                │
│         (Entities, Enums, IRepository interfaces)  │
│              (No external dependencies)             │
└────────────────────────────────────────────────────┘
```

### Dependency Rule
- Outer layers depend on inner layers
- `Core` has zero external dependencies
- `Infrastructure` implements interfaces defined in `Core`
- `API` wires everything via DI in `Program.cs`

---

## Database: Entity-Relationship Overview

### Core Entities (17 domain models)

```
Users ──────────────────┬──── Orders ──── OrderItems
  │                     │         │
  ├── Cart ─── CartItems │         └─── Payments
  │                     │
  ├── Wishlists ── WishlistItems
  │
  ├── Addresses
  │
  └── Notifications

Products ───────────────┬──── CartItems
  │                     ├──── WishlistItems
  ├── Categories         ├──── OrderItems
  ├── Brands             └──── ProductImages
  ├── Inventory
  └── Reviews

Coupons (standalone, applied at order creation)
```

---

## API Layer: Request Pipeline

```
HTTP Request
     │
     ▼
Rate Limiting (configured in Program.cs)
     │
     ▼
CORS Middleware
     │
     ▼
JWT Authentication Middleware
     │
     ▼
Request Logging Middleware
     │
     ▼
Controller Action
     │
     ▼
FluentValidation Filter
     │
     ▼
Application Service
     │
     ▼
Repository (EF Core)
     │
     ▼
PostgreSQL Database
     │
     ▼
Response → Global Exception Handler → HTTP Response
```

---

## Mobile App: Navigation Architecture

```
App.tsx
└── AuthProvider
    └── CartProvider
        └── WishlistProvider
            └── AppNavigator (NavigationContainer)
                │
                ├── Auth Stack (when not logged in)
                │   ├── OnboardingScreen
                │   ├── LoginScreen
                │   ├── RegisterScreen
                │   └── ForgotPasswordScreen
                │
                └── Main Bottom Tabs (when logged in)
                    ├── HomeTab (Stack)
                    │   ├── HomeScreen
                    │   ├── CategoryScreen
                    │   ├── ProductListScreen
                    │   ├── ProductDetailsScreen
                    │   └── SearchScreen
                    │
                    ├── WishlistTab (Stack)
                    │   ├── WishlistScreen
                    │   └── ProductDetailsScreen
                    │
                    ├── CartTab (Stack)
                    │   ├── CartScreen
                    │   ├── AddressScreen
                    │   ├── CheckoutScreen
                    │   ├── PaymentScreen
                    │   ├── OrderSuccessScreen
                    │   ├── OrdersScreen
                    │   └── OrderDetailsScreen
                    │
                    └── ProfileTab (Stack)
                        ├── ProfileScreen
                        ├── OrdersScreen
                        ├── OrderDetailsScreen
                        ├── AddressScreen
                        ├── NotificationScreen
                        └── SettingsScreen
```

---

## Authentication Flow

```
Client                       API
  │                           │
  ├─── POST /auth/login ──────►
  │                           │
  │   Validate credentials    │
  │   Hash password (BCrypt)  │
  │   Generate JWT (256-bit)  │
  │                           │
  ◄────── { token, user } ────┤
  │                           │
  │  Store token              │
  │  (AsyncStorage)           │
  │                           │
  ├─── Any Protected Route ───►
  │  Authorization: Bearer {token}
  │                           │
  │   Validate JWT            │
  │   Extract userId claim    │
  │   Authorize role          │
  ◄────── 200 OK / 401 ───────┤
```

---

## Payment Flow (Razorpay)

```
Mobile App                   Backend                   Razorpay
  │                             │                          │
  ├─ POST /orders ─────────────►│                          │
  │  (addressId, paymentMethod) │                          │
  │◄─ { orderId } ──────────────┤                          │
  │                             │                          │
  ├─ POST /payments/            │                          │
  │  create-razorpay-order/id ─►│                          │
  │                             ├─ Create Order ──────────►│
  │                             │◄─ { razorpayOrderId } ───┤
  │◄─ { razorpayOrderId, keyId }┤                          │
  │                             │                          │
  │  [Open Razorpay Checkout]   │                          │
  │  [User completes payment]   │                          │
  │                             │                          │
  ├─ POST /payments/verify ────►│                          │
  │  (paymentId, signature)     │                          │
  │                             │ Verify HMAC-SHA256       │
  │                             │ signature                │
  │                             │                          │
  │◄─ { success: true } ────────┤                          │
  │                             │                          │
  Navigate → OrderSuccess       │                          │
```
