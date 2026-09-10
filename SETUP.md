# The Yads Hood Hotel — Setup Guide

## Quick Start (Production)

```bash
# 1. Clone the repo on your server
git clone <repo-url> /opt/hood-hotel
cd /opt/hood-hotel

# 2. Create the environment files (secrets)
cp .env.example .env
cp backend/.env.example backend/.env
# Edit .env and backend/.env with your real secrets:
#   - .env:         POSTGRES_PASSWORD (required), CERTBOT_EMAIL, DOMAIN
#   - backend/.env: JWT_SECRET / JWT_REFRESH_SECRET, SMTP, M-Pesa

# 3. Make deploy script executable & run it
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

The deploy script generates any missing secrets automatically, builds Docker images, starts PostgreSQL + Redis, runs migrations, seeds data, and starts the full stack.

---

## Manual Setup

### Prerequisites

- Docker & Docker Compose v2
- A server (VPS) with at least 2GB RAM
- Domain name pointing to your server (for SSL)

### Step 1: Environment

Secrets live in two files (both git-ignored, never commit them):

```bash
# Compose/database + deploy images (from the repo root)
cp .env.example .env
# Application secrets (used by the API in both dev & Docker)
cp backend/.env.example backend/.env
```

`backend/.env` holds: `JWT_SECRET` / `JWT_REFRESH_SECRET` (pre-generated), SMTP, M-Pesa, S3. `.env` holds the PostgreSQL password used by the Postgres container and the `DATABASE_URL` Compose builds from it.

### Step 2: Start Everything

From the repo root (the compose file is `docker-compose.yml` at root):

```bash
# Build & start the whole stack
docker compose up -d --build

# Or start infrastructure first, then run migrations:
docker compose up -d postgres redis
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npx prisma db seed
docker compose up -d
```

The database and Redis are only reachable inside the Docker network; nothing is exposed to the host.

---

## SSL (Let's Encrypt)

After your domain points to the server:

```bash
# Issue certificate (email/domain come from your .env)
docker compose --profile ssl run certbot

# Edit docker/nginx.conf — uncomment the HTTPS server block

# Reload nginx
docker compose restart nginx
```

---

## Default Credentials

| Role    | Email                           | Password    |
|---------|---------------------------------|-------------|
| Admin   | admin@yadshoodhotel.com         | Admin@123   |
| Manager | manager@yadshoodhotel.com       | Manager@123 |

**The API forces a password change on first login with these seeded accounts.**

---

## Architecture

```
nginx (:80/:443)
 ├── / → frontend (React SPA)
 ├── /api/ → backend (NestJS API)
 ├── /uploads/ → backend static assets
 └── /health → health check

backend (NestJS + Prisma)
 ├── PostgreSQL (internal network)
 └── Redis (internal network)

frontend (React + Vite, served by nginx)
```

---

## Backup

The backup script creates compressed PostgreSQL dumps:

```bash
# Manual backup
docker compose exec postgres pg_dump -U hood_hotel hood_hotel --format=custom --compress=9 > backup_$(date +%Y%m%d).dump
```

For automated daily backups, add to crontab:
```
0 3 * * * /opt/hood-hotel/backend/scripts/backup.sh /backups
```

---

## Monitoring

- **Health check:** `GET /health` returns `{ status, database, uptime, responseTime }`
- **Logs:** `docker compose logs -f backend`
- **Structured logging:** JSON format in production, written to `logs/` directory
- **Rate limiting:** API is rate-limited (default 100 req / 60s, configurable via `THROTTLE_*`)

---

## Production Checklist

- [ ] Domain DNS pointing to server IP
- [ ] SSL certificates issued via Let's Encrypt
- [ ] HTTPS enabled in nginx config
- [ ] `POSTGRES_PASSWORD` set in `.env` (not the default)
- [ ] JWT secrets random & unique in `backend/.env`
- [ ] M-Pesa API keys configured in `backend/.env`
- [ ] SMTP credentials configured for email
- [ ] Seeded default passwords changed (enforced by the app)
- [ ] Database backup cron job set up
- [ ] Server firewall configured (allow 80, 443, 22)
- [ ] Docker configured to start on boot: `sudo systemctl enable docker`

---

## CI/CD

The GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. **Lint** — backend + frontend type checking
2. **Test** — backend unit tests with PostgreSQL
3. **Build** — compile both projects
4. **Docker** — build & push images to GHCR (on `main` only)
5. **Deploy** — SSH into server, pull the new images, run migrations, restart (on `main` only)

For `docker compose pull` to fetch the pushed images on the server, set `BACKEND_IMAGE` / `FRONTEND_IMAGE` in `.env` to the GHCR image names (format: `ghcr.io/<owner>/<repo>-backend:latest`).

Required GitHub secrets:
- `DEPLOY_HOST` — server IP
- `DEPLOY_USER` — SSH username
- `DEPLOY_KEY` — SSH private key