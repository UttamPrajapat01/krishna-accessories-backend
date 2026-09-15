# 08 — Environment Variables Guide

## Overview

This guide covers all environment variables and configuration secrets for the Krishna Accessories platform.

> ⚠️ **Never commit secrets to Git.** Use environment-specific `appsettings` files, `.env.local`, or a secrets manager.

---

## Backend (ASP.NET Core)

### `appsettings.json` (Base — Non-sensitive defaults)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"]
  }
}
```

### `appsettings.Development.json` (Local Dev)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=KrishnaAccessoriesDB;Username=admin;Password=YOUR_LOCAL_PG_PASSWORD"
  },
  "JwtSettings": {
    "SecretKey": "dev-secret-key-minimum-256-bits-krishna-accessories-2026",
    "Issuer": "KrishnaAccessoriesAPI",
    "Audience": "KrishnaAccessoriesApp",
    "ExpirationHours": 24
  },
  "RazorpaySettings": {
    "KeyId": "rzp_test_YOUR_TEST_KEY_ID",
    "KeySecret": "YOUR_TEST_KEY_SECRET"
  }
}
```

### `appsettings.Production.json` (Production)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=prod-db-host;Port=5432;Database=KrishnaAccessoriesDB;Username=ka_prod_user;Password=STRONG_PROD_PASSWORD;SSL Mode=Require"
  },
  "JwtSettings": {
    "SecretKey": "MINIMUM-256-BIT-PRODUCTION-SECRET-KEY-HERE",
    "Issuer": "KrishnaAccessoriesAPI",
    "Audience": "KrishnaAccessoriesApp",
    "ExpirationHours": 12
  },
  "RazorpaySettings": {
    "KeyId": "rzp_live_YOUR_LIVE_KEY_ID",
    "KeySecret": "YOUR_LIVE_KEY_SECRET"
  }
}
```

### Environment Variable Overrides (Recommended for Production)

```bash
# Database
export ConnectionStrings__DefaultConnection="Host=...;..."

# JWT
export JwtSettings__SecretKey="your-256-bit-secret"
export JwtSettings__Issuer="KrishnaAccessoriesAPI"
export JwtSettings__ExpirationHours="12"

# Razorpay
export RazorpaySettings__KeyId="rzp_live_..."
export RazorpaySettings__KeySecret="..."

# ASP.NET
export ASPNETCORE_ENVIRONMENT="Production"
export ASPNETCORE_URLS="http://0.0.0.0:5000"
```

---

## Admin Panel (Vite)

### `.env.local` (Development)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### `.env.production` (Production Build)

```env
VITE_API_BASE_URL=https://api.krishnaaccessories.com/api
```

---

## Mobile App (Expo)

### `app.json` extras section

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://YOUR_LOCAL_IP:5000/api"
    }
  }
}
```

For different environments use Expo's `APP_VARIANT` approach or EAS environment variables:

```bash
# EAS Secrets (set once via CLI)
eas secret:create --scope project --name API_BASE_URL --value "https://api.krishnaaccessories.com/api"
```

---

## Razorpay Configuration

### Test Keys (Development)

1. Sign in at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to Settings → API Keys → Generate Test Keys
3. Copy `rzp_test_XXXX` as `KeyId` and the secret as `KeySecret`

### Live Keys (Production)

1. Complete KYC verification on Razorpay Dashboard
2. Go to Settings → API Keys → Generate Live Keys
3. Update `appsettings.Production.json` or environment variables

---

## Security Checklist

- [ ] JWT `SecretKey` is at least 256 bits (32 characters minimum)
- [ ] PostgreSQL user has minimal permissions (not `postgres` superuser)
- [ ] Razorpay live keys are never in source control
- [ ] `appsettings.Production.json` is in `.gitignore`
- [ ] Admin panel is behind HTTPS with valid SSL certificate
- [ ] CORS is restricted to known origins in production
- [ ] API rate limiting is enabled in production
