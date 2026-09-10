#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Always run from the repository root regardless of where the script is invoked
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   The Yads Hood Hotel — Production Deploy Script  ${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}\n"

# ---- Prerequisites ----
echo -e "${YELLOW}[1/7] Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required. Install: https://docs.docker.com/engine/install/${NC}"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required.${NC}"; exit 1; }
echo -e "${GREEN}  ✓ Docker $(docker --version)${NC}"
echo -e "${GREEN}  ✓ Docker Compose $(docker compose version --short)${NC}"

# ---- Environment ----
echo -e "\n${YELLOW}[2/6] Setting up environment...${NC}"
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${YELLOW}  ⚠  Copied .env.example to .env — edit POSTGRES_PASSWORD and app secrets before continuing${NC}"
fi
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo -e "${YELLOW}  ⚠  Copied backend/.env.example to backend/.env — edit it with your secrets${NC}"
fi
command -v openssl >/dev/null 2>&1 || { echo -e "${RED}openssl is required.${NC}"; exit 1; }

# Generate secure secrets if placeholders remain
GEN="openssl rand -hex 48"
if grep -q "change-me-to-a-long-random-password" .env; then
  echo -e "${YELLOW}  ⚠  Generating POSTGRES_PASSWORD...${NC}"
  sed -i -E "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$($GEN)|" .env
fi
for VAR in JWT_SECRET JWT_REFRESH_SECRET; do
  if grep -qE "^${VAR}=(change-this|\.\.\.|\"\")" backend/.env; then
    echo -e "${YELLOW}  ⚠  Generating ${VAR}...${NC}"
    sed -i -E "s|^${VAR}=.*|${VAR}=\"$($GEN)\"|" backend/.env
  fi
done
echo -e "${GREEN}  ✓ Environment ready${NC}"

# ---- SSL ----
echo -e "\n${YELLOW}[3/6] SSL certificates...${NC}"
if [ -d "docker/ssl/certbot/conf/live" ]; then
  echo -e "${GREEN}  ✓ SSL certificates found${NC}"
else
  echo -e "${YELLOW}  ⚠  No SSL certificates yet. After DNS points here, run:${NC}"
  echo -e "${YELLOW}     docker compose --profile ssl run certbot${NC}"
  echo -e "${YELLOW}     Then uncomment the HTTPS server block in docker/nginx.conf${NC}"
fi

# ---- Build -------------------------------------------------------------
echo -e "\n${YELLOW}[4/6] Building images...${NC}"
docker compose build
echo -e "${GREEN}  ✓ Build complete${NC}"

# ---- Database ----------------------------------------------------------
echo -e "${YELLOW}  Starting database services...${NC}"
docker compose up -d postgres redis
echo -e "${YELLOW}  Waiting for PostgreSQL to be healthy...${NC}"
PG_USER="$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2)"
sleep 5
docker compose exec -T postgres pg_isready -U "${PG_USER:-postgres}" >/dev/null 2>&1 || {
  echo -e "${YELLOW}  Still waiting...${NC}"
  sleep 10
}

echo -e "\n${YELLOW}[5/6] Running database migrations...${NC}"
docker compose run --rm backend npx prisma migrate deploy
echo -e "${GREEN}  ✓ Migrations applied${NC}"

echo -e "${YELLOW}  Seeding initial data...${NC}"
docker compose run --rm backend npx prisma db seed || echo -e "${YELLOW}  ⚠  Seed skipped (already seeded or errored)${NC}"
echo -e "${GREEN}  ✓ Seed data loaded${NC}"

# ---- Start All ----------------------------------------------------------
docker compose up -d
echo -e "${GREEN}  ✓ All services started${NC}"

# ---- Summary ------------------------------------------------------------
echo -e "\n${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Deployment Complete!${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "  Frontend:  http://localhost"
echo -e "  API:       http://localhost/api/v1"
echo -e "  Health:    http://localhost/health"
echo -e ""
echo -e "  Next steps:"
echo -e "  1. Point your domain to this server's IP"
echo -e "  2. Run:   docker compose --profile ssl run certbot"
echo -e "  3. Uncomment HTTPS in docker/nginx.conf"
echo -e "  4. Restart: docker compose restart nginx"
echo -e "  5. Set M-Pesa and SMTP credentials in backend/.env"
echo -e "  6. Change the seeded default passwords on first login"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"