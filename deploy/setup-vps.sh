#!/usr/bin/env bash
# One-time setup on a fresh Hostinger VPS (Ubuntu 22.04/24.04). Run as root.
set -euo pipefail
DOMAIN="${1:-kraftshed.com}"
apt-get update && apt-get install -y ca-certificates curl git nginx ufw
# Docker
curl -fsSL https://get.docker.com | sh
# Firewall
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
# Nginx site
cp "$(dirname "$0")/nginx.conf" /etc/nginx/sites-available/$DOMAIN
sed -i "s/kraftshed.com/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
# SSL
apt-get install -y certbot python3-certbot-nginx
echo "Now run:  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "Then:     cd /opt/kraftshed && ./deploy/deploy.sh"
