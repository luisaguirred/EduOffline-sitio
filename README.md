# Sitio de OfflineEdu

Sitio estático en HTML, CSS y JavaScript, sin compilación. Inspirado en el estilo editorial de getartcraft.com, sin usar su marca, textos ni imágenes.

## Ver el sitio
Desde esta carpeta: `python3 -m http.server 8080` y abre http://localhost:8080. Se publica subiendo estos archivos a cualquier hosting estático.

## Archivos
- `index.html`: contenido, en orden de secciones.
- `styles.css`: colores y tipografías en `:root`, con tema cuaderno (claro) y pizarrón (oscuro).
- `lightbox.js`: amplía las capturas al hacer clic.
- `detalles.js`: despliega la descripción de cada función.
- `funciones.html`: guía detallada de funciones.
- `main.js`: efecto de luz (`makeLight`), constelación de la portada (`saberes`), pestañas, tema y regla lateral.

## Efecto de luz
`makeLight` agrega a cada `[data-light]` tres capas: `.light-core` (bloque), `.light-tail` (estela que llega más tarde) y `.light-glow` (resplandor). Para ajustar el recorrido cambia los `transition` de esas clases, y los colores con `--light-a` y `--light-b`. Cada `.light-item` recibe `--lit` (de 0 a 1) para encenderse cuando la luz pasa cerca.

## Constelación de la portada
`saberes` dibuja en `<canvas id="saberes">` símbolos de varias materias unidos por trazos, con chispas que viajan entre ellos y encienden el símbolo al llegar. Los símbolos se apartan del cursor y se iluminan cerca de él. Los textos están en `LABELS` y los colores en las variables `--fx-*`. La zona sin símbolos se calcula con el tamaño de `.hero-in`. Se detiene fuera de pantalla y queda fija con `prefers-reduced-motion`.

## Página de funciones
`funciones.html`: cada pestaña del panel de escritorio, el panel del celular, tipos de asignaciones y reactivos, bancos, conversaciones con voz (ElevenLabs), reportes y vista del alumno, con ejemplos de uso. En `index.html`, cada función de las listas se despliega con `detalles.js` (atributo `data-info`). Al agregar funciones al programa, actualizar ambas.

## Guía de instalación
En `#instalacion`, con el Xiaomi AX3000T como ejemplo. Los nombres de menú del router cambian según su firmware: revisarlos con un equipo real antes de publicar.

## Preguntas frecuentes
En `#preguntas`, con `<details>` (sin JavaScript). Linux y macOS se explican dentro de `#instalacion`; hoy su instalación es manual.

## Pendientes
- **Descarga:** es libre. Cuando exista la primera versión, activa el botón de `#descargar` con https://github.com/luisaguirred/OfflineEdu-releases/releases/latest
- **Donaciones:** falta el enlace del servicio que elija el maestro.
- **Nombre:** OfflineEdu (antes EduPlay, registrado en el IMPI). El logo vectorizado está en `assets/offlineedu-*.svg`; el script que lo genera, en `contenido/Marca/`.
- **Capturas:** están en `assets/capturas/`, en modo claro y tomadas de una plataforma de demostración, sin nada de la base real: los alumnos aparecen como "Alumno 01". Muestran la marca OfflineEdu, así que hay que repetirlas al cambiar el nombre.
- **Contacto y aviso de privacidad:** faltan los datos reales.
