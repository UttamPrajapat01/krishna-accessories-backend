# Krishna Accessories — Complete System Documentation

**Version:** 1.0.4 | **Last Updated:** September 2026  
**Live Backend API:** https://krishna-accessories-api.onrender.com  
**Latest Android APK (v1.0.4):** [Download APK](https://expo.dev/accounts/bharat_009/projects/krishna-accessories/builds/8cf7f93c-3158-47fe-963f-55bd7cc3cc2c)

---

## 1. Project Overview & Quick Reference

Krishna Accessories is an e-commerce platform designed for luxury jewelry and fashion accessories. It consists of three tightly integrated components:
1. **Android Mobile Application (APK):** Built with React Native & Expo SDK 51 for customers.
2. **Backend REST API:** ASP.NET Core 8 deployed in a Docker container on Render.com cloud.
3. **Database:** Managed PostgreSQL 18 on Render.com (Virginia, US).
4. **Admin Web Panel:** React 19 + Vite dashboard for store management and operations.

### Quick Credentials & URLs

| Component | URL / Location | Credentials (Test/Dev) |
|---|---|---|
| **Live API & Swagger** | https://krishna-accessories-api.onrender.com | Bearer JWT |
| **Android APK (v1.0.4)** | [Expo Build Link](https://expo.dev/accounts/bharat_009/projects/krishna-accessories/builds/8cf7f93c-3158-47fe-963f-55bd7cc3cc2c) | Install on Android 8.0+ |
| **Admin Web Panel** | `http://localhost:5173` | `admin@krishnaaccessories.com` / `Admin@123456` |
| **Customer Account** | Mobile App | `customer@krishnaaccessories.com` / `Customer@123456` |
| **Backend Source Repo** | https://github.com/UttamPrajapat01/krishna-accessories-backend | Branch: `main` (auto-deploys) |

---

## 2. High-Level Architecture & End-to-End Workflow

### System Architecture Diagram

```
                 ┌────────────────────────────────────────────────┐
                 │                CLIENTS / APPS                  │
                 │                                                │
                 │  📱 Android Mobile App      🖥️ Web Admin Panel  │
                 │  (React Native / Expo 51)  (React 19 + Vite)   │
                 └──────────────┬──────────────────┬──────────────┘
                                │                  │
                       HTTPS / REST JSON    HTTPS / REST JSON
                      (Bearer JWT Token)   (Bearer JWT Token)
                                │                  │
                                ▼                  ▼
                 ┌────────────────────────────────────────────────┐
                 │          ASP.NET Core 8 Web API                │
                 │    https://krishna-accessories-api.onrender.com│
                 │                                                │
                 │  • Controllers (Auth, Products, Cart, Orders)  │
                 │  • JWT Authentication & Role Authorization     │
                 │  • Entity Framework Core 8 (Npgsql)            │
                 └──────────────────────┬─────────────────────────┘
                                        │
                               TCP connection (SSL Mode=Prefer)
                                        │
                                        ▼
                 ┌────────────────────────────────────────────────┐
                 │            PostgreSQL 18 Database              │
                 │            (Render Cloud Database)             │
                 │                                                │
                 │  • 23 Relational Tables (Users, Products, etc.)│
                 │  • Automatic Migrations & Seeding              │
                 └────────────────────────────────────────────────┘
```

### Complete End-to-End Business Flow

1. **User Sign-Up & Login:**
   - Customer signs up via mobile app (`POST /api/auth/register`).
   - Account is created with role `Customer`.
   - JWT token is returned and stored in `AsyncStorage`.
   - App automatically logs in and redirects directly to the **Home Page**.
2. **Browsing & Discovery:**
   - Mobile app fetches featured/bestseller items (`GET /api/products/featured`, `/api/products/bestsellers`).
   - Categories and Brands are fetched dynamically (`GET /api/categories`, `/api/brands`).
3. **Bag / Cart Management:**
   - User adds products to their bag (`POST /api/cart/items`).
   - Badge counter in the bottom tab bar updates in real time.
4. **Checkout & Address Handling:**
   - When proceeding to checkout (`CheckoutScreen`), if the user has no saved addresses, an inline address form automatically appears pre-filled with their profile name and phone.
   - User enters shipping address (`POST /api/addresses`). Phone format is sanitized automatically.
   - "Save & Deliver Here" saves and auto-selects the address for immediate checkout.
5. **Order Placement & Payment:**
   - Order is created (`POST /api/orders`) capturing line items, pricing snapshot, and address.
   - Razorpay payment order is generated (`POST /api/payments/create-razorpay-order/{orderId}`).
   - After payment verification (`POST /api/payments/verify`), order status shifts to `Confirmed`.
6. **Admin Processing:**
   - Store manager logs into Admin Portal (`LoginPage.tsx`).
   - Admin views real-time metrics, new orders, and low-stock alerts on `DashboardPage.tsx`.
   - Admin updates order status (`PUT /api/admin/orders/{id}/status`) from `Pending` -> `Processing` -> `Shipped` (adds tracking number) -> `Delivered`.

---

## 3. Mobile Application (Android APK)

### Specifications
- **Framework:** React Native 0.74.5, Expo SDK 51.0.28, TypeScript
- **Package Name:** `com.krishnaaccessories.app`
- **Current Version:** `1.0.4` (VersionCode: `3`)
- **API URL Connection:** Uses `EXPO_PUBLIC_API_URL` pointing to `https://krishna-accessories-api.onrender.com/api`

### Release History & Major Fixes
- **v1.0.0:** Initial full release with luxury theme, catalog, and bag.
- **v1.0.1:** Fixed the new-user checkout delivery address issue. Added inline address creation, auto-selection, and phone sanitization.
- **v1.0.2:** Removed sample customer credentials and test login buttons from the login screen. Clean empty fields for real customers.
- **v1.0.4:** Added official Krishna Accessories logo (peacock feather monogram "KA") on home screen, app launcher, and white splash screen.

### Navigation Hierarchy (21 Screens)
- **Auth Stack:** `SplashScreen`, `OnboardingScreen`, `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`
- **Main Tab 1 (Explore):** `HomeScreen`, `CategoryScreen`, `ProductListScreen`, `ProductDetailsScreen`, `SearchScreen`
- **Main Tab 2 (Wishlist):** `WishlistScreen`, `ProductDetailsScreen`
- **Main Tab 3 (Bag / Cart):** `CartScreen`, `AddressScreen`, `CheckoutScreen`, `PaymentScreen`, `OrderSuccessScreen`, `OrdersScreen`, `OrderDetailsScreen`
- **Main Tab 4 (Account):** `ProfileScreen`, `OrdersScreen`, `OrderDetailsScreen`, `AddressScreen`, `NotificationScreen`, `SettingsScreen`

### How to Install / Update the APK
1. Open the download link on an Android phone:  
   👉 [Download v1.0.4 APK](https://expo.dev/accounts/bharat_009/projects/krishna-accessories/builds/8cf7f93c-3158-47fe-963f-55bd7cc3cc2c)
2. Tap **Download**, then open the `.apk` file.
3. Allow installation from unknown sources if prompted.
4. Tap **Install** (replaces previous version seamlessly without data loss).

---

## 4. Backend REST API (ASP.NET Core 8)

### Specifications
- **Language & Runtime:** .NET 8 (C#)
- **Architecture:** 4-Layer Clean Architecture
  - `KrishnaAccessories.Core`: Domain Entities & Enums
  - `KrishnaAccessories.Application`: DTOs, Business Interfaces & Validators
  - `KrishnaAccessories.Infrastructure`: EF Core, PostgreSQL Context, Services
  - `KrishnaAccessories.API`: REST Controllers, Middlewares & Swagger
- **Cloud Host:** Render.com (Docker Container)
- **URL:** `https://krishna-accessories-api.onrender.com`

### Core API Endpoints

| Group | Method | Path | Auth | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Public | Register new customer |
| | `POST` | `/api/auth/login` | Public | Login, returns JWT + Refresh token |
| | `POST` | `/api/auth/refresh-token`| Public | Refresh expired JWT token |
| | `GET` | `/api/auth/me` | Bearer | Get current profile |
| **Products** | `GET` | `/api/products` | Public | List paginated products with filters |
| | `GET` | `/api/products/{id}` | Public | Single product details |
| | `GET` | `/api/products/featured` | Public | Featured catalog items |
| | `POST` | `/api/products` | Admin | Create product |
| | `POST` | `/api/products/upload-image` | Admin | Multipart image upload |
| **Cart** | `GET` | `/api/cart` | Bearer | Get user active cart |
| | `POST` | `/api/cart/items` | Bearer | Add item to cart |
| | `PUT` | `/api/cart/items/{id}` | Bearer | Update item quantity |
| | `DELETE`| `/api/cart/items/{id}` | Bearer | Remove item from cart |
| **Address** | `GET` | `/api/addresses` | Bearer | List saved delivery addresses |
| | `POST` | `/api/addresses` | Bearer | Add new delivery address |
| | `PUT` | `/api/addresses/{id}/default`| Bearer | Set default address |
| **Orders** | `POST` | `/api/orders` | Bearer | Place new order |
| | `GET` | `/api/orders` | Bearer | User order history |
| | `GET` | `/api/orders/{id}` | Bearer | Specific order tracking details |
| **Admin** | `GET` | `/api/admin/dashboard` | Admin | Overall stats, revenue, low stock |
| | `GET` | `/api/admin/orders` | Admin | All orders across store |
| | `PUT` | `/api/admin/orders/{id}/status`| Admin| Update delivery status |
| | `GET` | `/api/admin/inventory` | Admin | Real-time stock counts |
| | `POST` | `/api/admin/coupons` | Admin | Create promotional discount coupon |

---

## 5. Database Schema & Resources (PostgreSQL 18)

Managed PostgreSQL 18 with 23 tables and EF Core automatic migrations (`DbInitializer.SeedAsync()`):

### Key Tables Summary
1. **`Users`**: Id, FullName, Email (Unique), PasswordHash, PhoneNumber, Role (`Admin`/`Customer`), IsActive, CreatedAt.
2. **`Products`**: Id, Name, SKU (Unique), Description, Price, MRP, Discount, StockQuantity, CategoryId, BrandId, IsFeatured, IsBestSeller, IsActive.
3. **`Categories` & `Brands`**: Id, Name, Slug (Unique), Description, ImageUrl/LogoUrl, IsActive.
4. **`ProductImages`**: Id, ProductId (FK), ImageUrl, IsMain, DisplayOrder.
5. **`Carts` & `CartItems`**: 1-to-1 with User. Items store ProductId, Quantity, UnitPrice.
6. **`Addresses`**: Id, UserId (FK), FullName, Phone, AddressLine1, City, State, PostalCode, Country, IsDefault.
7. **`Orders` & `OrderItems`**: OrderNumber (Unique), UserId, ShippingAddressSnapshot (JSON), SubTotal, TaxAmount, ShippingAmount, DiscountAmount, TotalAmount, OrderStatus, TrackingNumber.
8. **`Payments`**: Id, OrderId (FK), RazorpayOrderId, RazorpayPaymentId, Amount, Status, PaymentMethod.
9. **`Inventories`**: ProductId, QuantityAvailable, QuantityReserved, LowStockThreshold.
10. **`Coupons` & `CouponUsages`**: Code, DiscountType, DiscountValue, MinimumOrderAmount, UsageLimit.
11. **`Reviews` & `Notifications`**: Customer reviews (with admin approval flag) and broadcast user notifications.

---

## 6. Admin Panel (Web Application)

### Specifications
- **Framework:** React 19 + Vite 8 + TypeScript
- **Location:** `admin/KrishnaAccessoriesAdmin`
- **Local Dev Server:** `http://localhost:5173`

### Key Modules
- **Dashboard:** Live Revenue, Total Orders, Active Catalog, Client Count, Low Stock Warning, Recent Orders.
- **Product Management:** Full CRUD with product image uploads, SKU, and MRP management.
- **Order Management:** View orders, change status (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`), enter courier tracking IDs.
- **Stock & Inventory:** Monitor stock thresholds and restock products.
- **Coupons & Promotions:** Create percentage or fixed discount promo codes.
- **Customer List:** View customer accounts, emails, and registration dates.
- **Reviews Moderation:** Approve or reject user-submitted product ratings before they go live.

---

## 7. How to Run Locally

### 1. Run Backend
```bash
cd backend
dotnet run --project KrishnaAccessories.API/KrishnaAccessories.API.csproj
# Listens on http://localhost:5070 (Swagger: http://localhost:5070)
```

### 2. Run Admin Panel
```bash
cd admin/KrishnaAccessoriesAdmin
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Run Mobile App (Expo)
```bash
cd mobile/KrishnaAccessoriesApp
npm install
npx expo start
# Scan QR code in Expo Go or run on emulator
```

### 4. Build New APK
```bash
cd mobile/KrishnaAccessoriesApp
# Increment version & versionCode in app.json
npx eas build -p android --profile preview --non-interactive
```

---

## 8. Summary of Status & Future Enhancements
- ✅ **Fully Working:** Live Cloud API, Cloud Database, Customer Registration & Login, Product Browsing, Bag, Address Creation & Checkout, Orders, Admin Management, Custom App Logo, APK v1.0.4.
- 🔄 **Cloud Storage for Images:** Currently images are stored in container filesystem; for permanent enterprise persistence, hook up AWS S3 or Cloudinary.
- 💳 **Live Razorpay Gateway:** Currently configured with sandbox/test keys; switch to live production keys when merchant onboarding completes.
