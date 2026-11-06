#!/usr/bin/env bash
# One-shot installer for a fresh Hostinger VPS (Ubuntu 22.04/24.04). Run as root from /opt/kraftshed:
#   bash deploy/bootstrap.sh kraftshed.com you@email.com
# It installs Docker + Nginx + SSL, generates secrets, builds the app, creates the database, seeds demo data.
set -euo pipefail
DOMAIN="${1:?Usage: bootstrap.sh <domain> <email-for-ssl>}"
EMAIL="${2:?Usage: bootstrap.sh <domain> <email-for-ssl>}"
cd "$(dirname "$0")/.."

echo "==> [1/6] Installing Docker, Nginx, Certbot"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq && apt-get install -y -qq ca-certificates curl git nginx ufw certbot python3-certbot-nginx >/dev/null
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh >/dev/null
ufw allow OpenSSH >/dev/null && ufw allow 'Nginx Full' >/dev/null && ufw --force enable >/dev/null

echo "==> [2/6] Writing .env"
if [ ! -f .env ]; then
  DBPASS="$(openssl rand -hex 16)"
  cat > .env <<ENV
DATABASE_URL="postgresql://kraftshed:${DBPASS}@db:5432/kraftshed?schema=public"
AUTH_SECRET="$(openssl rand -base64 32)"
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"
NEXT_PUBLIC_SITE_NAME="Kraftshed"
RAZORPAY_KEY_ID="rzp_test_REPLACE_ME"
RAZORPAY_KEY_SECRET="REPLACE_ME"
RAZORPAY_WEBHOOK_SECRET="REPLACE_ME"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_REPLACE_ME"
PLATFORM_COMMISSION_PERCENT="10"
ADMIN_EMAIL="admin@${DOMAIN}"
ADMIN_PASSWORD="$(openssl rand -base64 12 | tr -d '/+=')"
ENV
  echo "    .env created (Razorpay keys still need to be filled in: nano .env)"
else
  echo "    .env already exists, keeping it"
fi
export POSTGRES_PASSWORD="$(grep -E '^DATABASE_URL=' .env | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')"

echo "==> [3/6] Nginx site for ${DOMAIN}"
sed "s/kraftshed.com/${DOMAIN}/g" deploy/nginx.conf > /etc/nginx/sites-available/${DOMAIN}
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
rm -f /etc/nginx/sites-enabled/default
nginx -t -q && systemctl reload nginx

echo "==> [4/6] Building and starting the app (this takes 3-6 minutes)"
docker compose build -q web
docker compose up -d db
sleep 5
docker compose run --rm tools npx prisma migrate deploy
docker compose up -d web

echo "==> [5/6] Seeding admin, categories and demo data"
docker compose run --rm tools npx tsx prisma/seed.ts

echo "==> [6/6] SSL certificate"
certbot --nginx --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" -d "www.${DOMAIN}" --redirect || echo "    (SSL skipped — DNS for ${DOMAIN} may not point here yet. Re-run: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN})"

echo
echo "================================================================"
echo " Kraftshed is live:  https://${DOMAIN}"
echo " Admin login:        $(grep ADMIN_EMAIL .env | cut -d'"' -f2)  /  $(grep ADMIN_PASSWORD .env | cut -d'"' -f2)"
echo " Demo maker login:   demo-seller@kraftshed.com / Demo@12345  (delete before launch)"
echo " Next: nano .env  → add Razorpay keys, then:  docker compose up -d --force-recreate web"
echo "================================================================"
