# 🪙 Krishna Accessories — Luxury E-Commerce Platform

> **Production-ready full-stack luxury accessories e-commerce ecosystem**
> React Native Mobile App · ASP.NET Core 8 API · PostgreSQL 18 · React Admin Panel

---

## 🏛 Platform Overview

**Krishna Accessories** is an ultra-luxury e-commerce platform for authentic jewelry, premium watches, fine leather goods, and bespoke accessories. The system supports the complete commerce lifecycle from product discovery through Razorpay-powered checkout and white-glove fulfillment.

| Component | Technology | Status |
|---|---|---|
| Mobile App | React Native (Expo 51) + TypeScript | ✅ 21 screens |
| Admin Panel | React 18 + Vite + TypeScript | ✅ 13 sections |
| Backend API | ASP.NET Core 8 + EF Core | ✅ 12 controllers |
| Database | PostgreSQL 18 | ✅ 23 tables |
| Tests | xUnit | ✅ 7 passing |

---

## ⚡ Quickstart

### Prerequisites

```bash
# Check versions
node --version          # 18+
dotnet --version        # 8.0+
psql --version          # 16+
npx expo --version      # 5+
```

### 1. Clone / Open Project

```bash
cd "Krishna Accessories"
```

### 2. Start PostgreSQL

```bash
# Postgres.app (macOS) — ensure it's running on port 5432
# Create the database if needed:
psql -U admin -c 'CREATE DATABASE "KrishnaAccessoriesDB";'
```

### 3. Start the Backend API

```bash
cd backend
dotnet run --project KrishnaAccessories.API/KrishnaAccessories.API.csproj --urls "http://localhost:5000"
```

- **API:** http://localhost:5000/api
- **Swagger UI:** http://localhost:5000
- Database is auto-migrated and seeded on first run

### 4. Start the Admin Panel

```bash
cd admin/KrishnaAccessoriesAdmin
npm install   # (first time only)
npm run preview -- --port 5173 --host
```

- **Admin Panel:** http://localhost:5173

### 5. Start the Mobile App

```bash
cd mobile/KrishnaAccessoriesApp
npm install   # (first time only)
npx expo start
```

- Press `a` for Android emulator, `i` for iOS Simulator
- Scan QR with Expo Go app on device

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@krishnaaccessories.com | Admin@123456 |
| **Customer** | customer@krishnaaccessories.com | Customer@123456 |

> ⚠️ Change these passwords immediately in any production deployment.

---

## 📁 Repository Structure

```
Krishna Accessories/
├── backend/                     # ASP.NET Core 8 API
├── admin/KrishnaAccessoriesAdmin/  # React + Vite Admin Panel
├── mobile/KrishnaAccessoriesApp/   # Expo React Native App
├── docs/                        # 12 documentation guides
└── README.md                    # ← You are here
```

---

## 📱 Mobile App: 21 Screens

| # | Screen | Description |
|---|---|---|
| 1-5 | Auth Flow | Splash, Onboarding, Login, Register, ForgotPassword |
| 6-10 | Shopping | Home, Category, ProductList, ProductDetails, Search |
| 11-14 | Bag & Address | Wishlist, Cart, Address, Checkout |
| 15-16 | Payment | Razorpay Gateway, Order Confirmation |
| 17-18 | Order Tracking | Orders List, Order Detail & Timeline |
| 19-21 | Account | Profile, Settings, Notifications |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0A0A0D` — Obsidian Black |
| Accent | `#D4AF37` — Champagne Gold |
| Surface | `#141418` — Deep Charcoal |
| Text | `#FFFFFF` — Pure White |
| Muted | `#8E8E93` — Warm Gray |

---

## 📚 Documentation Index

| # | Guide | Link |
|---|---|---|
| 01 | Project Overview | [docs/01-project-overview.md](docs/01-project-overview.md) |
| 02 | Architecture | [docs/02-architecture.md](docs/02-architecture.md) |
| 03 | Database | [docs/03-database.md](docs/03-database.md) |
| 04 | API Reference | [docs/04-api-documentation.md](docs/04-api-documentation.md) |
| 05 | Mobile Setup | [docs/05-mobile-setup.md](docs/05-mobile-setup.md) |
| 06 | Backend Setup | [docs/06-backend-setup.md](docs/06-backend-setup.md) |
| 07 | Admin Setup | [docs/07-admin-setup.md](docs/07-admin-setup.md) |
| 08 | Environment Variables | [docs/08-environment-variables.md](docs/08-environment-variables.md) |
| 09 | Testing | [docs/09-testing.md](docs/09-testing.md) |
| 10 | Deployment | [docs/10-deployment.md](docs/10-deployment.md) |
| 11 | Android Build | [docs/11-android-build.md](docs/11-android-build.md) |
| 12 | iOS Build | [docs/12-ios-build.md](docs/12-ios-build.md) |

---

## ✅ Production Readiness Checklist

- [x] Clean Architecture backend with 4-layer separation
- [x] PostgreSQL with EF Core migrations (23 tables)
- [x] JWT authentication with role-based authorization
- [x] FluentValidation on all request models
- [x] Global exception handling middleware
- [x] Razorpay payment integration (test + production)
- [x] Cash on Delivery flow
- [x] Order management with status tracking timeline
- [x] Coupon/discount system
- [x] Inventory management
- [x] Product reviews
- [x] Notifications system
- [x] Admin panel (13 sections, production build verified)
- [x] Mobile app (21 screens, TypeScript clean)
- [x] 7 backend unit/integration tests passing
- [x] EAS Build configuration (Android APK/AAB + iOS IPA)
- [x] Android keystore generation script
- [x] Docker deployment configuration
- [x] Nginx reverse proxy configuration
- [x] 12 documentation guides

---

## 🏗 Technology Credits

- [Expo](https://expo.dev) · [React Navigation](https://reactnavigation.org)
- [ASP.NET Core](https://dotnet.microsoft.com) · [Entity Framework Core](https://docs.microsoft.com/ef)
- [PostgreSQL](https://postgresql.org) · [FluentValidation](https://fluentvalidation.net)
- [Razorpay](https://razorpay.com) · [Vite](https://vitejs.dev)
- [xUnit](https://xunit.net) · [Lucide Icons](https://lucide.dev)

---

*Built with ❤️ for the bespoke luxury accessories atelier — **Krishna Accessories***
