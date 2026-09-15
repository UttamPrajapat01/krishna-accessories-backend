# 01 — Project Overview

## Krishna Accessories Luxury E-Commerce Ecosystem

**Krishna Accessories** is a production-ready full-stack luxury accessories e-commerce platform built for premium jewelry, watches, leather goods, and collectibles. The ecosystem spans a native mobile application, an admin web panel, a robust REST API backend, and a PostgreSQL database.

---

## Business Context

| Attribute | Value |
|---|---|
| Brand Positioning | Ultra-luxury, White-Glove concierge retail |
| Primary Market | India (INR ₹, Razorpay payment gateway) |
| Target Audience | Affluent patrons seeking bespoke accessories |
| Key Differentiators | Authentic products, insured courier, 24/7 concierge |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo SDK 51) + TypeScript |
| Admin Panel | React 18 + TypeScript + Vite |
| API Backend | ASP.NET Core 8 Web API (.NET 8) |
| Database | PostgreSQL 18 (via Entity Framework Core 8) |
| Authentication | JWT Bearer Tokens |
| Payment Gateway | Razorpay (India) + Cash on Delivery |
| ORM | EF Core 8 with Code-First Migrations |
| Validation | FluentValidation |
| Testing | xUnit + EF Core In-Memory Provider |

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │   React Native App   │  │    React Admin Panel (Vite)  │ │
│  │  (Android / iOS)     │  │    (http://localhost:5173)   │ │
│  └─────────┬────────────┘  └──────────────┬───────────────┘ │
└────────────│──────────────────────────────│─────────────────┘
             │ HTTPS REST/JSON              │ HTTPS REST/JSON
             ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│           ASP.NET Core 8 Web API  (port 5000)               │
│  ┌───────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │Controllers│  │  Middleware  │  │  FluentValidation  │   │
│  │ (REST API)│  │(JWT/Errors)  │  │  (Request models)  │   │
│  └─────┬─────┘  └──────────────┘  └────────────────────┘   │
│        │                                                     │
│  ┌─────▼───────────────────────────────────────────────┐    │
│  │           Application Layer (Services)               │    │
│  └─────┬───────────────────────────────────────────────┘    │
│        │                                                     │
│  ┌─────▼───────────────────────────────────────────────┐    │
│  │     Infrastructure Layer (Repositories + EF Core)    │    │
│  └─────┬───────────────────────────────────────────────┘    │
└────────│────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│             PostgreSQL 18 Database                           │
│         (KrishnaAccessoriesDB — 23 tables)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
Krishna Accessories/
├── backend/                        # ASP.NET Core 8 API
│   ├── KrishnaAccessories.Core/    # Domain entities, enums, interfaces
│   ├── KrishnaAccessories.Application/  # Services, DTOs, validators
│   ├── KrishnaAccessories.Infrastructure/ # EF Core, repositories, seeder
│   ├── KrishnaAccessories.API/     # Controllers, middlewares, startup
│   └── KrishnaAccessories.Tests/   # xUnit unit + integration tests
│
├── admin/                          # React + TypeScript + Vite Admin Panel
│   └── KrishnaAccessoriesAdmin/
│       └── src/
│           ├── components/         # Sidebar, Navbar, StatCard, etc.
│           └── pages/              # 13 admin panel pages
│
├── mobile/                         # Expo React Native App
│   └── KrishnaAccessoriesApp/
│       ├── src/
│       │   ├── screens/            # 21 app screens
│       │   ├── components/         # Reusable UI components
│       │   ├── context/            # Auth, Cart, Wishlist contexts
│       │   ├── navigation/         # Stack + Tab AppNavigator
│       │   ├── services/api/       # Axios service layer
│       │   ├── theme/              # Colors, typography
│       │   └── types/              # TypeScript interfaces
│       ├── App.tsx                 # Entry point
│       ├── app.json                # Expo config
│       └── eas.json                # EAS Build config
│
├── docs/                           # 12 comprehensive guides
└── README.md                       # Root quickstart guide
```

---

## Mobile Application: 21 Screens

| # | Screen | Description |
|---|---|---|
| 1 | SplashScreen | Animated brand entry logo |
| 2 | OnboardingScreen | 3-step value proposition carousel |
| 3 | LoginScreen | Email/password JWT authentication |
| 4 | RegisterScreen | Account creation with phone |
| 5 | ForgotPasswordScreen | Password reset initiation |
| 6 | HomeScreen | Featured products, categories, banners |
| 7 | CategoryScreen | Category grid browsing |
| 8 | ProductListScreen | Filterable product catalog |
| 9 | ProductDetailsScreen | Product specs, gallery, reviews |
| 10 | SearchScreen | Full-text product search |
| 11 | WishlistScreen | Saved products |
| 12 | CartScreen | Shopping bag with coupon apply |
| 13 | AddressScreen | Manage delivery addresses |
| 14 | CheckoutScreen | Order review and payment selection |
| 15 | PaymentScreen | Razorpay secure payment gateway |
| 16 | OrderSuccessScreen | Confirmation receipt |
| 17 | OrdersScreen | Order history with status filters |
| 18 | OrderDetailsScreen | Timeline tracker + cancellation |
| 19 | ProfileScreen | Account management and preferences |
| 20 | SettingsScreen | App preferences, legal, cache |
| 21 | NotificationScreen | Order and promotion alerts |

---

## Admin Panel: 13 Sections

Products · Categories · Brands · Inventory · Orders · Customers · Payments · Coupons · Reviews · Notifications · Reports · Settings · Dashboard

---

## Seed Data Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@krishnaaccessories.com | Admin@123456 |
| Customer | customer@krishnaaccessories.com | Customer@123456 |

> **Note:** Change these credentials immediately in production.
