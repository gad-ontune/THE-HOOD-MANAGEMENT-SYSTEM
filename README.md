# The Hood Hotel Management System

A comprehensive, full-stack hotel management system built for The Hood Hotel. The platform handles reservations, guests, rooms, payments, restaurant operations, events, inventory, housekeeping, maintenance, employees, and more — all from a single unified application.

[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker)](https://www.docker.com/)
[![NestJS](https://img.shields.io/badge/NestJS-E6234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis)](https://redis.io/)

---

## Architecture

```
nginx (:80/:443)
  ├── /         → Frontend (React SPA)
  ├── /api/     → Backend (NestJS API)
  ├── /uploads/ → Static assets
  └── /health   → Health check

backend (NestJS + Prisma)
  ├── PostgreSQL (internal)
  └── Redis (internal)

frontend (React + Vite, served by nginx)
```

---

## Problem & Solution

### The Problem

Hotels and hospitality businesses face a set of recurring operational challenges that directly impact revenue, guest satisfaction, and staff efficiency:

| # | Problem | Impact |
|---|---------|--------|
| 1 | **Double bookings & overbooking** | Guest dissatisfaction, revenue loss, operational chaos |
| 2 | **Manual record keeping** | Errors, slow lookups, no real-time visibility |
| 3 | **Fragmented payment tracking** | Revenue leaks, unreconciled accounts, audit nightmares |
| 4 | **Inventory blind spots** | Stockouts, wastage, inflated procurement costs |
| 5 | **No real-time room status** | Assigning occupied/maintenance rooms, guest complaints |
| 6 | **Inconsistent guest experience** | No guest history, no personalization, poor retention |
| 7 | **Employee management chaos** | Unclear schedules, missed attendance, payroll errors |
| 8 | **No audit trail** | Accountability gaps, fraud risk, compliance issues |
| 9 | **Poor financial visibility** | No real-time revenue data, slow decision-making |
| 10 | **Difficulty scaling operations** | Adding rooms, staff, or services without systems |

### The Solution

The Hood Hotel Management System addresses each of these problems with purpose-built modules:

| Problem | Solution |
|---------|----------|
| Double bookings & overbooking | **Real-time room status tracking** with statuses (Available, Occupied, Booked, Cleaning, Maintenance) and **reservation lifecycle management** that prevents conflicting bookings |
| Manual record keeping | **Centralized database** with PostgreSQL + Prisma ORM — all guest, room, and reservation data is digital, searchable, and instantly accessible |
| Fragmented payment tracking | **Unified payment module** tracking all methods (Cash, Card, M-Pesa, Bank Transfer) with invoice generation, refund processing, and full transaction history |
| Inventory blind spots | **Inventory management** with stock tracking, alerts for low stock, supplier management, and purchase order workflows |
| No real-time room status | **Room status engine** with status history tracking and automatic status transitions tied to reservations and housekeeping tasks |
| Inconsistent guest experience | **360° guest profiles** with preferences, history, reviews, and documents — enabling personalized service and repeat bookings |
| Employee management chaos | **Employee management** with department hierarchy, attendance tracking, leave requests, and automated payroll |
| No audit trail | **Comprehensive audit logging** — every action is recorded with user ID, IP, device, and timestamp. Failed login tracking and security event monitoring included |
| Poor financial visibility | **Reports & analytics module** providing real-time revenue data, payment summaries, and financial reporting |
| Difficulty scaling | **Modular architecture** — add new rooms, departments, or services without restructuring. **Role-based access control** ensures security as the team grows |

### Additional Safeguards

- **Soft delete** across all modules — nothing is permanently lost, enabling audit recovery
- **Rate limiting** (configurable) protects against abuse and ensures system stability
- **JWT authentication with refresh tokens** secures every API endpoint
- **M-Pesa integration** specifically tailored for the Kenyan market
- **Automatic password change enforcement** on first login for seeded accounts
- **Structured JSON logging** for production monitoring and troubleshooting

---

## Features

### Room & Reservation Management
- Room types with configurable amenities and pricing
- Real-time room status tracking (Available, Occupied, Booked, Cleaning, Maintenance)
- Reservation lifecycle management (Pending → Confirmed → Checked-In → Checked-Out)
- Multiple booking sources (Website, Walk-in, Phone, WhatsApp, Email, Travel Agent)
- Reservation notes, requests, and cancellation handling

### Guest Management
- Guest profiles with preferences, documents, and contact information
- Guest reviews and staff responses
- Guest activity tracking and history
- ID/passport document management

### Payment Processing
- Multiple payment methods: Cash, Card, M-Pesa, Bank Transfer
- M-Pesa integration for Kenyan mobile payments
- Invoice generation and management
- Refund processing
- Payment status tracking (Pending → Processing → Completed → Failed → Refunded)

### Restaurant Management
- Table management with status tracking
- Menu categories and items with pricing
- Order workflow (Pending → Accepted → Preparing → Ready → Served → Completed)
- Restaurant-specific payment processing

### Event Management
- Event hall booking with capacity and pricing
- Event packages with customizable items
- Booking management with deposit tracking

### Inventory Management
- Category-based inventory with stock tracking
- Supplier management and purchase orders
- Inventory transactions, adjustments, and alerts
- Barcode and expiry date tracking

### Housekeeping
- Task assignment and priority management
- Checklist-based cleaning verification
- Laundry tracking

### Maintenance
- Ticket system with categories and priorities
- Equipment tracking with service history
- Warranty and condition monitoring

### Employee Management
- Department and position hierarchy
- Full employee profiles with Kenyan tax details (KRA, NHIF, NSSF)
- Attendance tracking and leave management
- Payroll processing
- Document management

### CMS & Website
- Website page management
- Homepage content, gallery, and hero slides
- Promotions, FAQ, and contact information
- SEO settings and partner management

### System Administration
- Role-based access control with permissions
- JWT authentication with refresh tokens
- Audit logging and security event tracking
- Hotel settings, payment settings, notification settings
- Soft delete across all modules
- Rate limiting (default 100 req/60s)

---

## Quick Start

### Prerequisites

- Docker & Docker Compose v2
- A server (VPS) with at least 2GB RAM
- Domain name pointing to your server (for SSL)

### Production Deployment

```bash
# 1. Clone the repo
git clone <repo-url> /opt/hood-hotel
cd /opt/hood-hotel

# 2. Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
# Edit both files with your real secrets

# 3. Deploy
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

The deploy script generates missing secrets, builds Docker images, starts PostgreSQL + Redis, runs migrations, seeds data, and starts the full stack.

### Manual Setup

```bash
# Build & start the whole stack
docker compose up -d --build

# Or start infrastructure first, then run migrations:
docker compose up -d postgres redis
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npx prisma db seed
docker compose up -d
```

### SSL (Let's Encrypt)

```bash
docker compose --profile ssl run certbot
# Edit docker/nginx.conf — uncomment the HTTPS server block
docker compose restart nginx
```

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yadshoodhotel.com | Admin@123 |
| Manager | manager@yadshoodhotel.com | Manager@123 |

**The API forces a password change on first login with these seeded accounts.**

---

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev        # Dev server on :5173
npm run build      # Production build
npm run lint       # Oxlint
```

**Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS + Radix UI + React Query + Zustand + Framer Motion + Recharts

### Backend

```bash
cd backend
npm install
npm run start:dev  # Dev server on :4000
npm run build
npm run test       # Unit tests
npm run prisma:migrate
npm run prisma:seed
```

**Tech Stack**: NestJS + Prisma + PostgreSQL + Redis + JWT + Swagger + Winston

---

## API Documentation

When running in development mode, the API docs are available at:

```
http://localhost:4000/api/docs
```

The global API prefix is `api/v1`.

---

## Health Check

```
GET /api/v1/health
```

Returns `{ status, database, uptime, responseTime }`.

---

## Environment Variables

### Root `.env` (Compose/Database)

```env
POSTGRES_USER=hood_hotel
POSTGRES_PASSWORD=change-me-to-a-long-random-password
POSTGRES_DB=hood_hotel
CERTBOT_EMAIL=admin@thehoodhotel.com
DOMAIN=thehoodhotel.com
```

### Backend `.env` (Application Secrets)

Contains `JWT_SECRET`, `JWT_REFRESH_SECRET`, SMTP, M-Pesa, and S3 credentials. Copy from `backend/.env.example`.

---

## CI/CD

The GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. **Lint** — Backend + Frontend type checking
2. **Test** — Backend unit tests with PostgreSQL
3. **Build** — Compile both projects
4. **Docker** — Build & push images to GHCR (on `main` only)
5. **Deploy** — SSH into server, pull images, run migrations, restart (on `main` only)

Required GitHub secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`.

---

## Monitoring

- **Health check:** `GET /api/v1/health`
- **Logs:** `docker compose logs -f backend`
- **Structured logging:** JSON format, written to `logs/` directory
- **Rate limiting:** Configurable via `THROTTLE_*` environment variables

---

## Backup

```bash
# Manual backup
docker compose exec postgres pg_dump -U hood_hotel hood_hotel --format=custom --compress=9 > backup_$(date +%Y%m%d).dump
```

Automated daily backups via crontab:
```
0 3 * * * /opt/hood-hotel/backend/scripts/backup.sh /backups
```

---

## Project Structure

```
the-hood-management-system/
├── backend/              # NestJS API (Prisma, PostgreSQL, Redis)
│   ├── src/
│   │   ├── auth/         # Authentication & authorization
│   │   ├── guests/       # Guest management
│   │   ├── rooms/        # Room management
│   │   ├── reservations/ # Reservation system
│   │   ├── payments/     # Payment processing
│   │   ├── restaurant/   # Restaurant operations
│   │   ├── events/       # Event hall booking
│   │   ├── inventory/    # Inventory management
│   │   ├── housekeeping/ # Housekeeping tasks
│   │   ├── maintenance/  # Maintenance tickets
│   │   ├── employees/    # Employee & payroll management
│   │   ├── reports/      # Reports & analytics
│   │   ├── cms/          # Content management system
│   │   ├── settings/     # Hotel & system settings
│   │   ├── users/        # User management
│   │   ├── public/       # Public-facing routes
│   │   └── common/       # Shared modules (Prisma, Logger, Mail, Storage)
│   ├── prisma/           # Database schema & migrations
│   └── Dockerfile
├── frontend/             # React SPA
│   ├── src/
│   │   ├── app/          # Application root
│   │   ├── features/     # Feature-based modules
│   │   ├── components/   # Reusable components
│   │   ├── layouts/      # Page layouts
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── store/        # Zustand state management
│   │   └── routes/       # React Router routes
│   └── Dockerfile
├── docker/
│   ├── nginx.conf        # Nginx reverse proxy config
│   └── ssl/              # SSL certificates
├── scripts/
│   └── deploy.sh         # Production deploy script
├── docker-compose.yml    # Full stack orchestration
├── .env.example          # Environment template
└── SETUP.md              # Detailed setup guide
```

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint` (frontend) and `npx tsc --noEmit` (backend)
4. Run tests: `npm test` (backend)
5. Submit a pull request

---

## License

Proprietary — The Hood Hotel Management System
