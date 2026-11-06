#!/usr/bin/env bash
# One-shot installer for Kraftshed on a Hostinger VPS (Ubuntu). Run as root from /opt/kraftshed:
#   bash deploy/bootstrap.sh kraftshed.com you@email.com
# Works on a fresh server (installs Nginx + certbot) AND on a server that already fronts sites with a
# Caddy container (e.g. the Triagon ERP VPS): it joins Caddy's network and adds a site block to its Caddyfile.
set -euo pipefail
DOMAIN="${1:?Usage: bootstrap.sh <domain> <email-for-ssl>}"
EMAIL="${2:?Usage: bootstrap.sh <domain> <email-for-ssl>}"
cd "$(dirname "$0")/.."

echo "==> [1/6] Base tools"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq && apt-get install -y -qq ca-certificates curl git openssl >/dev/null
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh >/dev/null

# Detect an existing Caddy container fronting the server
CADDY="$(docker ps --format '{{.Names}} {{.Image}}' | awk '/caddy/{print $1; exit}')"
if [ -n "$CADDY" ]; then
  MODE=caddy
  CADDY_NET="$(docker inspect "$CADDY" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | awk '{print $1}')"
  CADDYFILE="$(docker inspect "$CADDY" --format '{{range .Mounts}}{{if eq .Destination "/etc/caddy/Caddyfile"}}{{.Source}}{{end}}{{end}}')"
  [ -n "$CADDYFILE" ] || { echo "!! Found Caddy container '$CADDY' but could not locate its Caddyfile mount. Aborting."; exit 1; }
  echo "    Existing Caddy detected: $CADDY (network: $CADDY_NET, Caddyfile: $CADDYFILE) — Kraftshed will be added behind it"
elif ss -ltnp | grep -q ':80 ' && ! ss -ltnp | grep ':80 ' | grep -q nginx; then
  echo "!! Port 80 is owned by something other than Nginx or Caddy. Aborting."; exit 1
else
  MODE=nginx
  apt-get install -y -qq nginx certbot python3-certbot-nginx >/dev/null
  if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then ufw allow 'Nginx Full' >/dev/null || true; fi
fi
APP_PORT=3000; while ss -ltn | grep -q ":${APP_PORT} "; do APP_PORT=$((APP_PORT+1)); done
export APP_PORT
echo "    Mode: $MODE · app port 127.0.0.1:${APP_PORT}"

echo "==> [2/6] Writing .env"
if [ ! -f .env ]; then
  cat > .env <<ENV
DATABASE_URL="postgresql://kraftshed:$(openssl rand -hex 16)@db:5432/kraftshed?schema=public"
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
APP_PORT="${APP_PORT}"
ENV
  echo "    .env created (fill Razorpay keys later: nano .env)"
else
  echo "    .env already exists, keeping it"
fi
export POSTGRES_PASSWORD="$(grep -E '^DATABASE_URL=' .env | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')"

echo "==> [3/6] Web server config"
if [ "$MODE" = caddy ]; then
  cat > docker-compose.override.yml <<YML
services:
  web:
    networks: [default, front]
networks:
  front:
    external: true
    name: ${CADDY_NET}
YML
  if ! grep -q "kraftshed-web:3000" "$CADDYFILE"; then
    cat >> "$CADDYFILE" <<CADDY

# Kraftshed marketplace (added by kraftshed/deploy/bootstrap.sh)
${DOMAIN}, www.${DOMAIN} {
    encode gzip
    request_body { max_size 20MB }
    reverse_proxy kraftshed-web:3000
}
CADDY
    echo "    Site block appended to $CADDYFILE"
  fi
else
  sed -e "s/kraftshed.com/${DOMAIN}/g" -e "s/127.0.0.1:3000/127.0.0.1:${APP_PORT}/" deploy/nginx.conf > /etc/nginx/sites-available/${DOMAIN}
  ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
  nginx -t -q && systemctl reload nginx
fi

echo "==> [4/6] Building and starting the app (3-6 minutes)"
docker compose build -q web
docker compose up -d db
sleep 5
docker compose run --rm tools npx prisma migrate deploy
docker compose up -d web

echo "==> [5/6] Seeding admin, categories and demo data"
docker compose run --rm tools npx tsx prisma/seed.ts

echo "==> [6/6] HTTPS"
if [ "$MODE" = caddy ]; then
  docker exec "$CADDY" caddy reload --config /etc/caddy/Caddyfile && echo "    Caddy reloaded — it issues the SSL certificate automatically once DNS for ${DOMAIN} points here"
else
  certbot --nginx --non-interactive --agree-tos -m "${EMAIL}" -d "${DOMAIN}" -d "www.${DOMAIN}" --redirect || echo "    (SSL skipped — DNS may not point here yet. Re-run: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN})"
fi

echo
echo "================================================================"
echo " Kraftshed is live:  https://${DOMAIN}"
echo " Admin login:        $(grep ADMIN_EMAIL .env | cut -d'"' -f2)  /  $(grep ADMIN_PASSWORD .env | cut -d'"' -f2)"
echo " Demo maker login:   demo-seller@kraftshed.com / Demo@12345  (delete before launch)"
echo " Next: nano .env  → add Razorpay keys, then:  docker compose up -d --force-recreate web"
echo "================================================================"
