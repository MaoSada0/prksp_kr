#!/bin/sh
BACKEND_URL="${BACKEND_URL:-http://backend.railway.internal:8080}"
echo "[entrypoint] BACKEND_URL=$BACKEND_URL"
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
cat /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
