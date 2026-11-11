# Sitio de EduOffline en Railway: archivos estáticos servidos con Caddy.
# Railway construye esta imagen desde GitHub (Root Directory del servicio: /sitio)
# y le pasa el puerto en la variable PORT.
FROM caddy:2.8-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY . /srv
