# 05 — Mobile App Setup Guide

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Expo CLI | Latest | `npx expo --version` |
| Expo Go App | Latest | Install on Android/iOS device |

---

## 1. Install Dependencies

```bash
cd "Krishna Accessories/mobile/KrishnaAccessoriesApp"
npm install
```

---

## 2. Configure API Base URL

Edit `src/services/api/apiClient.ts`:

```typescript
const apiClient = axios.create({
  baseURL: 'http://YOUR_LOCAL_IP:5000/api',
  // e.g. 'http://192.168.1.100:5000/api' for device testing
  // Use 'http://10.0.2.2:5000/api' for Android Emulator
  // Use 'http://localhost:5000/api' for iOS Simulator
});
```

> **Note:** When testing on a physical device, use your machine's local IP (not `localhost`).

---

## 3. Start Development Server

```bash
npx expo start
```

- Press `a` to open on Android emulator
- Press `i` to open on iOS Simulator
- Scan QR code with Expo Go app on your device

---

## 4. TypeScript Check

```bash
npx tsc --noEmit
# Expected: 0 errors
```

---

## 5. App Structure

```
src/
├── navigation/
│   └── AppNavigator.tsx    # Stack + Tab navigation (all 21 screens)
│
├── screens/                # 21 production screens
│   ├── SplashScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CategoryScreen.tsx
│   ├── ProductListScreen.tsx
│   ├── ProductDetailsScreen.tsx
│   ├── SearchScreen.tsx
│   ├── WishlistScreen.tsx
│   ├── CartScreen.tsx
│   ├── AddressScreen.tsx
│   ├── CheckoutScreen.tsx
│   ├── PaymentScreen.tsx       ← Screen 15
│   ├── OrderSuccessScreen.tsx  ← Screen 16
│   ├── OrdersScreen.tsx        ← Screen 17
│   ├── OrderDetailsScreen.tsx  ← Screen 18
│   ├── ProfileScreen.tsx       ← Screen 19
│   ├── SettingsScreen.tsx      ← Screen 20
│   └── NotificationScreen.tsx  ← Screen 21
│
├── components/             # 8 reusable components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   ├── EmptyState.tsx
│   ├── LoadingView.tsx
│   └── ErrorView.tsx
│
├── context/                # React Context providers
│   ├── AuthContext.tsx     # JWT auth + user state
│   ├── CartContext.tsx     # Cart item count + operations
│   └── WishlistContext.tsx # Wishlist state
│
├── services/api/           # Axios service layer
│   ├── apiClient.ts
│   ├── authService.ts
│   ├── productService.ts
│   ├── cartService.ts
│   ├── wishlistService.ts
│   ├── addressService.ts
│   ├── orderService.ts
│   ├── paymentService.ts
│   └── notificationService.ts
│
└── theme/
    └── colors.ts           # Obsidian Black + Champagne Gold palette
```

---

## 6. Design System

| Token | Value | Usage |
|---|---|---|
| `Colors.background` | `#0A0A0D` | Obsidian black — primary screens |
| `Colors.surface` | `#141418` | Card surfaces |
| `Colors.accent` | `#D4AF37` | Champagne gold — CTAs, highlights |
| `Colors.text` | `#FFFFFF` | Primary text |
| `Colors.textMuted` | `#8E8E93` | Secondary text |
| `Colors.success` | `#34C759` | Order confirmed, in-stock |
| `Colors.error` | `#FF453A` | Errors, cancelled orders |

---

## 7. Payment Integration Notes

The `PaymentScreen` integrates with Razorpay via the backend API:

1. App calls `POST /api/payments/create-razorpay-order/{orderId}` → gets `razorpayOrderId`
2. In production, open the official Razorpay React Native SDK checkout
3. On success, app calls `POST /api/payments/verify` with signature
4. Backend verifies HMAC signature → marks order as `Paid`

For the **development/test environment**, a simulated payment flow is used (no real Razorpay SDK required locally).
