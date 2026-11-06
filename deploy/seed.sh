#!/usr/bin/env bash
# Seed admin user, categories and demo data. Run once after first deploy.
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose run --rm tools npx tsx prisma/seed.ts
