#!/bin/bash
# SSL certificate setup using Let's Encrypt
# Run: docker compose run --rm certbot
# Then uncomment the HTTPS server block in nginx.conf and restart

domains="thehoodhotel.com www.thehoodhotel.com"
email="admin@thehoodhotel.com"

docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$email" \
  --agree-tos \
  --no-eff-email \
  -d "$domains"
