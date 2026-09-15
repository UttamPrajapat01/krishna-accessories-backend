# 10 — Deployment Guide

## Overview

This guide covers production deployment of all three components:
1. **Backend API** — ASP.NET Core 8 on Linux/Docker
2. **Admin Panel** — React/Vite static site on Nginx
3. **Mobile App** — Play Store (Android) + App Store (iOS)

---

## Infrastructure Requirements

| Component | Minimum Spec | Recommended |
|---|---|---|
| API Server | 1 vCPU, 1 GB RAM | 2 vCPU, 2 GB RAM |
| Database | PostgreSQL 16+, 20 GB storage | Managed PostgreSQL (RDS/Supabase) |
| Admin Panel | Static file hosting | Nginx or CDN |
| SSL | Let's Encrypt (free) | Commercial wildcard cert |

---

## 1. Backend API Deployment

### Option A: Docker (Recommended)

Create `backend/Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "KrishnaAccessories.API/KrishnaAccessories.API.csproj"
RUN dotnet publish "KrishnaAccessories.API/KrishnaAccessories.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "KrishnaAccessories.API.dll"]
```

```bash
# Build and run
docker build -t krishna-api:1.0.0 ./backend
docker run -d \
  -p 5000:80 \
  -e ConnectionStrings__DefaultConnection="Host=db;..." \
  -e JwtSettings__SecretKey="your-secret" \
  -e RazorpaySettings__KeyId="rzp_live_..." \
  -e RazorpaySettings__KeySecret="..." \
  --name krishna-api \
  krishna-api:1.0.0
```

### Option B: Systemd Service on Ubuntu

```bash
# Publish
cd backend
dotnet publish KrishnaAccessories.API/KrishnaAccessories.API.csproj \
  -c Release -o /var/www/krishna-api

# Create service file
sudo nano /etc/systemd/system/krishna-api.service
```

```ini
[Unit]
Description=Krishna Accessories API
After=network.target

[Service]
WorkingDirectory=/var/www/krishna-api
ExecStart=/usr/bin/dotnet /var/www/krishna-api/KrishnaAccessories.API.dll
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://0.0.0.0:5000
EnvironmentFile=/etc/krishna-api/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable krishna-api
sudo systemctl start krishna-api
```

---

## 2. Admin Panel Deployment

### Build

```bash
cd admin/KrishnaAccessoriesAdmin
VITE_API_BASE_URL=https://api.krishnaaccessories.com/api npm run build
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name admin.krishnaaccessories.com;

    ssl_certificate /etc/letsencrypt/live/admin.krishnaaccessories.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.krishnaaccessories.com/privkey.pem;

    root /var/www/krishna-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;
}

# API reverse proxy
server {
    listen 443 ssl;
    server_name api.krishnaaccessories.com;

    ssl_certificate /etc/letsencrypt/live/api.krishnaaccessories.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.krishnaaccessories.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 3. Database Migration in Production

```bash
# Apply migrations without dropping data
cd backend
dotnet ef database update \
  --project KrishnaAccessories.Infrastructure/KrishnaAccessories.Infrastructure.csproj \
  --startup-project KrishnaAccessories.API/KrishnaAccessories.API.csproj \
  --connection "Host=prod-db;..."
```

---

## 4. Mobile App Deployment

### Android — Google Play Store

```bash
# EAS Production Build
cd mobile/KrishnaAccessoriesApp
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### iOS — Apple App Store

```bash
# EAS Production Build
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios
```

---

## 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.krishnaaccessories.com -d admin.krishnaaccessories.com
sudo certbot renew --dry-run  # Test auto-renewal
```

---

## 6. Backup Strategy

```bash
# Daily PostgreSQL backup
pg_dump -h localhost -U ka_prod_user KrishnaAccessoriesDB | \
  gzip > /backups/krishna-db-$(date +%Y%m%d).sql.gz

# Cron job (daily at 2 AM)
echo "0 2 * * * pg_dump ... | gzip > /backups/..." | crontab -
```

---

## 7. Monitoring & Observability

| Tool | Purpose |
|---|---|
| Application Insights | ASP.NET Core telemetry (Azure) |
| Sentry | Error tracking (mobile + API) |
| Prometheus + Grafana | Infrastructure metrics |
| UptimeRobot | External uptime monitoring |
