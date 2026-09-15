# 07 — Admin Panel Setup Guide

## Overview

The Admin Panel is a React 18 + TypeScript + Vite application with a luxury Black & Gold theme.
It provides complete management over all store operations.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |

---

## 1. Install Dependencies

```bash
cd "Krishna Accessories/admin/KrishnaAccessoriesAdmin"
npm install
```

---

## 2. Configure API URL

Edit `src/services/api.ts` (or create `.env`):

```bash
# Create .env.local
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env.local
```

---

## 3. Development Server

```bash
npm run dev
# Opens at http://localhost:5173
```

---

## 4. Production Build

```bash
npm run build
# Output: dist/ directory

# Preview production build locally
npm run preview -- --port 5173 --host
```

---

## 5. Default Admin Credentials

| Field | Value |
|---|---|
| Email | admin@krishnaaccessories.com |
| Password | Admin@123456 |

---

## 6. Admin Panel Pages

| Page | Route | Features |
|---|---|---|
| Dashboard | `/` | Live stats, revenue chart, recent orders |
| Products | `/products` | CRUD, image management, bulk operations |
| Categories | `/categories` | Category hierarchy, display order |
| Brands | `/brands` | Brand logo, descriptions |
| Inventory | `/inventory` | Stock levels, low-stock alerts |
| Orders | `/orders` | Status updates, order tracking |
| Customers | `/customers` | Customer profiles, order history |
| Payments | `/payments` | Transaction ledger |
| Coupons | `/coupons` | Create/expire discount codes |
| Reviews | `/reviews` | Moderate customer reviews |
| Notifications | `/notifications` | System-wide broadcast |
| Reports | `/reports` | Revenue, top products, region analytics |
| Settings | `/settings` | Store configuration |

---

## 7. Deployment

### Deploy with Nginx

```nginx
server {
    listen 80;
    server_name admin.krishnaaccessories.com;
    root /var/www/krishna-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Build & Deploy

```bash
npm run build
rsync -avz dist/ user@server:/var/www/krishna-admin/dist/
```
