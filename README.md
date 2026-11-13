# Sitio de EduOffline

Sitio estático en HTML, CSS y JavaScript, sin compilación. Inspirado en el estilo editorial de getartcraft.com, sin usar su marca, textos ni imágenes.

## Ver el sitio
Desde la carpeta del repositorio: `python3 -m http.server 8080` y abre http://localhost:8080. Se publica subiendo estos archivos a cualquier hosting estático.

## Publicación (GitHub Pages, dominio en Namecheap)
- Este repositorio (`luisaguirred/EduOffline-sitio`, rama `main`) es solo el sitio, separado de la plataforma (`luisaguirred/EduOffline`).
- `.github/workflows/pages.yml` publica el sitio en https://eduoffline.com con cada cambio a `main` (Settings → Pages → Source: **GitHub Actions**, Custom domain `eduoffline.com`, Enforce HTTPS). Deja fuera `.github` y este README.
- DNS en Namecheap (Advanced DNS): cuatro `A` para `@` (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) y `CNAME` `www` → `luisaguirred.github.io.`; `www` redirige solo al dominio sin `www`. El reenvío de correo (`MX` y el `TXT` de SPF) está en Mail Settings y no se toca. El certificado HTTPS lo pone GitHub.
- GitHub Pages no permite encabezados propios: la CSP va como `<meta>` en cada página, y no hay forma de impedir que otro sitio muestre este dentro de un marco (`frame-ancestors`/`X-Frame-Options`). La caché la fija GitHub (10 minutos) y comprime con gzip HTML, CSS, JS y el modelo 3D.
- Las capturas y los íconos de los juegos vienen de la plataforma: los íconos son copias de `public/icons/games/` de `EduOffline`.

## Idiomas (inglés y español)
- **Inglés es el idioma principal**: las páginas de la raíz (`index.html`, `funciones.html`, `privacidad.html`) están en inglés. La versión en español está en `es/`, con los mismos nombres de archivo y los mismos `id` de sección.
- El botón `ES` / `EN` de la barra superior (`.lang`) abre la misma página en el otro idioma y conserva la sección (`#…`) en la que estaba el visitante. Cada página declara su versión en el otro idioma con `<link rel="alternate" hreflang>`.
- Las páginas de `es/` usan `../` para llegar a `assets/`, `vendor/`, CSS y JS (son los mismos archivos para los dos idiomas).
- Los textos que pone JavaScript (`main.js`, `lightbox.js`, `modelo3d.js`) se eligen según `<html lang>`. Los nombres de las partes de la célula vienen en español dentro del `.glb`; su traducción está en `PARTS` de `modelo3d.js`.
- **Al cambiar un texto, cambiarlo en los dos idiomas.** Al subir el `?v=` de CSS/JS, subirlo en las seis páginas.

## Archivos
- `index.html`: contenido, en orden de secciones (inglés; `es/index.html` en español).
- `styles.css`: colores y tipografías en `:root`, con tema cuaderno (claro) y pizarrón (oscuro).
- `lightbox.js`: amplía las capturas al hacer clic.
- `detalles.js`: despliega la descripción de cada función.
- `funciones.html`: guía detallada de funciones.
- `privacidad.html`: aviso de privacidad del sitio y del programa (enlazado desde el pie de página).
- `tema.js`: aplica el tema guardado antes de pintar la página.
- **Seguridad (CSP):** cada página lleva al inicio de `<head>` un `<meta http-equiv="Content-Security-Policy">` que solo permite archivos del propio sitio (GitHub Pages no permite ponerla como encabezado). Por eso no hay scripts ni estilos en línea (`<script>…</script>`, `<style>`, `style="…"`): todo va en archivos `.js` y `.css`. `'wasm-unsafe-eval'`, `blob:` y `data:` son para el visor 3D; el `sha256` de `style-src` es el estilo que inyecta `vendor/model-viewer.min.js` (si se actualiza ese archivo, la consola del navegador indicará la huella nueva). Si se agrega algo de otro dominio, hay que permitirlo en las seis páginas y actualizar el aviso de privacidad.
- **Caché del navegador:** los enlaces a `styles.css`, `fuentes.css` y los `.js` (también `tema.js`) llevan `?v=AAAAMMDD…` en las seis páginas (tres en inglés y tres en `es/`). Al cambiar alguno de esos archivos, sube ese número en las seis para que los visitantes no vean la versión vieja.
- `fuentes.css` y `assets/fuentes/`: tipografías servidas desde el propio sitio (Atkinson Hyperlegible, Caveat, Fraunces; licencia OFL). El sitio no hace peticiones a terceros: no volver a agregar Google Fonts ni analítica sin actualizar el aviso.
- `main.js`: efecto de luz (`makeLight`), constelación de la portada (`saberes`), pestañas, tema y regla lateral.

## Efecto de luz
`makeLight` agrega a cada `[data-light]` tres capas: `.light-core` (bloque), `.light-tail` (estela que llega más tarde) y `.light-glow` (resplandor). Para ajustar el recorrido cambia los `transition` de esas clases, y los colores con `--light-a` y `--light-b`. Cada `.light-item` recibe `--lit` (de 0 a 1) para encenderse cuando la luz pasa cerca.

## Íconos del efecto principal
En la portada, `.float-cards` son enlaces solo con ícono (sin texto visible). Al pasar el mouse o con el teclado aparece la burbuja `.tip` con el nombre y una línea de información; `tl`/`tr` abren la burbuja hacia la derecha o la izquierda y `up` hacia arriba. `data-tab="t-exam"` abre esa pestaña de Funciones (en `main.js`). Los íconos de EduQuiz, EduCard y EduFlip están en `assets/juegos/` (copias de `public/icons/games/` de la plataforma).

## Celular (≤ 820 px)
La barra superior muestra logo, botón de menú (`.menu-btn`, abre el panel `.nav` con la clase `.top.open`) y tema. Los íconos del efecto principal pasan debajo del texto en cuadrícula; el primer toque muestra su información en `#fc-info` con "Ver más" y el segundo abre la sección.

## Juegos principales
En `#juegos` hay un bloque por juego (`#eduquiz`, `#educard`, `#eduflip`) con capturas `assets/capturas/edu*.webp` y `edu*-alumno.webp`, tomadas de la plataforma de demostración en modo claro con nombres ficticios.

## Constelación de la portada
`saberes` dibuja en `<canvas id="saberes">` símbolos de varias materias unidos por trazos, con chispas que viajan entre ellos y encienden el símbolo al llegar. Los símbolos se apartan del cursor y se iluminan cerca de él. Los textos están en `LABELS` y los colores en las variables `--fx-*`. La zona sin símbolos se calcula con el tamaño de `.hero-in`. Se detiene fuera de pantalla y queda fija con `prefers-reduced-motion`.

## Página de funciones
`funciones.html`: cada pestaña del panel de escritorio, el panel del celular, tipos de asignaciones y reactivos, bancos, conversaciones con voz (ElevenLabs), reportes, vista del alumno y panel de la dirección (`#direccion`), con ejemplos de uso. En `index.html`, cada función de las listas se despliega con `detalles.js` (atributo `data-info`). Al agregar funciones al programa, actualizar ambas.

## Guía de instalación
En `#instalacion`, con el Xiaomi AX3000T como ejemplo. Los nombres de menú del router cambian según su firmware: revisarlos con un equipo real antes de publicar.

## Preguntas frecuentes
En `#preguntas`, con `<details>` (sin JavaScript). Linux y macOS se explican dentro de `#instalacion`; hoy su instalación es manual.

## Pendientes
- **Descarga:** es libre. Cuando exista la primera versión, activa el botón de `#descargar` con https://github.com/luisaguirred/EduOffline-releases/releases/latest
- **Donaciones:** falta el enlace del servicio que elija el maestro.
- **Nombre:** EduOffline (antes EduPlay, registrado en el IMPI). El logo vectorizado está en `assets/eduoffline-*.svg`; el script que lo genera, en `contenido/Marca/`.
- **Capturas:** están en `assets/capturas/`, en modo claro y tomadas de una plataforma de demostración, sin nada de la base real: los alumnos aparecen como "Alumno 01". Muestran la marca EduOffline, así que hay que repetirlas al cambiar el nombre.
- **Contacto:** falta el contacto del proyecto; cuando exista, agregarlo en `privacidad.html` (sección de derechos) y en `PROJECT_CONTACT` de `server/privacy.js`. Revisar la fecha de `privacidad.html` al cambiarlo.
- **Modelo 3D de muestra:** `modelo3d.js` convierte cada `<div class="m3d" data-src="…">` en un visor con la lista de partes (al elegir una se resalta y aparece qué es). Usa `vendor/model-viewer.min.js` (copia del que trae la plataforma) y `assets/modelos/celula-animal.glb` (generado con `contenido/ejemplos/celula-animal/make-cell.js`). Solo se descargan cuando el visor está por aparecer en pantalla. El modelo está cuantizado (`gltf-transform dedup`, `weld`, `quantize` y `prune`: 1.1 MB → 620 KB, sin cambio visible) y no usa Draco ni meshopt, que necesitarían un decodificador de otro sitio.
- Las descripciones de cada organelo están en `modelo3d.js`.
