# Sitio de EduOffline en Railway: archivos estáticos servidos con Caddy.
# Railway construye esta imagen desde GitHub (repositorio EduOffline-sitio, rama main)
# y le pasa el puerto en la variable PORT.
FROM caddy:2.11-alpine
COPY . /srv
# La configuración del servidor no se publica junto con el sitio.
RUN mv /srv/Caddyfile /etc/caddy/Caddyfile && rm -f /srv/Dockerfile
