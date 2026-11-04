# Sitio de EduPlay

Sitio estático en HTML, CSS y JavaScript, sin compilación. Inspirado en el estilo editorial de getartcraft.com, sin usar su marca, textos ni imágenes.

## Ver el sitio
Desde esta carpeta: `python3 -m http.server 8080` y abre http://localhost:8080. Se publica subiendo estos archivos a cualquier hosting estático.

## Archivos
- `index.html`: contenido, en orden de secciones.
- `styles.css`: colores y tipografías en `:root`, con tema claro y oscuro.
- `main.js`: efecto de luz (`makeLight`), pestañas, tema y regla lateral.

## Efecto de luz
`makeLight` agrega a cada `[data-light]` tres capas: `.light-core` (bloque), `.light-tail` (estela que llega más tarde) y `.light-glow` (resplandor). Para ajustar el recorrido cambia los `transition` de esas clases, y los colores con `--light-a` y `--light-b`. Cada `.light-item` recibe `--lit` (de 0 a 1) para encenderse cuando la luz pasa cerca.

## Pendientes
- **Descarga:** el botón de `#descargar` sigue desactivado; falta la dirección pública del instalador y decidir si la descarga es libre o de pago.
- **Donaciones o venta:** no hay botón ni precios hasta tomar esa decisión.
- **Juegos:** WordleEdu queda fuera a propósito porque "Wordle" es una marca ajena; agrégalo si se renombra.
- **Imágenes:** las tarjetas son ilustrativas. Si se agregan capturas reales, usa datos de prueba, nunca alumnos reales.
- **Contacto y aviso de privacidad:** faltan los datos reales.
