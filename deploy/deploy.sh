#!/usr/bin/env bash
# Build & (re)start Kraftshed. Run from the project root on the VPS: ./deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Copy .env.example to .env and fill it in first."; exit 1; }
export APP_PORT="$(grep -E "^APP_PORT=" .env | cut -d'"' -f2)"; export APP_PORT="${APP_PORT:-3000}"
export POSTGRES_PASSWORD="$(grep -E '^DATABASE_URL=' .env | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')"
docker compose build web
docker compose up -d db
docker compose run --rm tools npx prisma migrate deploy
docker compose up -d web
echo "Deployed. Check: docker compose logs -f web"
