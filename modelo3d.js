// Visor 3D de muestra (célula animal). Cada <div class="m3d" data-src="…"> se
// convierte en un visor con <model-viewer> y una lista de piezas: al elegir una,
// las demás se vuelven casi transparentes y aparece qué es. El visor (1 MB) y el
// modelo (1 MB) se cargan solo cuando el visor está por aparecer en pantalla.
(function () {
  'use strict';
  // Los materiales del modelo (.glb) tienen nombre en español: en inglés se muestra
  // el nombre traducido. Idioma según <html lang> (inglés en la raíz, español en /es/).
  var ES = document.documentElement.lang.indexOf('es') === 0;
  var T = ES ? {
    model: 'Modelo 3D', loading: 'Cargando modelo… ', modelError: 'No se pudo cargar el modelo 3D.',
    viewerError: 'No se pudo cargar el visor 3D.',
    hint: 'Elige una parte para resaltarla. Gira el modelo arrastrando y acércalo con la rueda o con dos dedos.'
  } : {
    model: '3D model', loading: 'Loading model… ', modelError: 'The 3D model could not be loaded.',
    viewerError: 'The 3D viewer could not be loaded.',
    hint: 'Choose a part to highlight it. Rotate the model by dragging and zoom with the wheel or two fingers.'
  };
  // nombre del material → [nombre en inglés, descripción en español, descripción en inglés]
  var PARTS = {
    'Membrana celular': ['Cell membrane', 'Envoltura que separa la célula de su entorno y decide qué entra y qué sale.', 'The outer layer that separates the cell from its surroundings and controls what goes in and out.'],
    'Núcleo': ['Nucleus', 'Guarda el material genético (ADN) y dirige las funciones de la célula.', 'Holds the genetic material (DNA) and directs the cell’s functions.'],
    'Nucléolo': ['Nucleolus', 'Zona dentro del núcleo donde se fabrican los ribosomas.', 'The area inside the nucleus where ribosomes are made.'],
    'Retículo endoplásmico rugoso': ['Rough endoplasmic reticulum', 'Red de membranas con ribosomas pegados que fabrica proteínas.', 'A network of membranes studded with ribosomes that makes proteins.'],
    'Retículo endoplásmico liso': ['Smooth endoplasmic reticulum', 'Red de membranas sin ribosomas que produce lípidos y elimina sustancias tóxicas.', 'A network of membranes without ribosomes that makes lipids and removes toxic substances.'],
    'Aparato de Golgi': ['Golgi apparatus', 'Empaca las proteínas y las envía a donde se necesitan.', 'Packages proteins and ships them where they are needed.'],
    'Mitocondrias': ['Mitochondria', 'Producen la energía que la célula usa para funcionar.', 'Produce the energy the cell uses to work.'],
    'Lisosomas': ['Lysosomes', 'Contienen enzimas que digieren desechos y partes viejas de la célula.', 'Contain enzymes that digest waste and worn-out parts of the cell.'],
    'Vacuola': ['Vacuole', 'Almacena agua, nutrientes y desechos.', 'Stores water, nutrients and waste.'],
    'Centriolos': ['Centrioles', 'Ayudan a organizar la división de la célula.', 'Help organize cell division.'],
    'Ribosomas': ['Ribosomes', 'Pequeñas estructuras que arman las proteínas.', 'Tiny structures that assemble proteins.']
  };
  function label(name) { var p = PARTS[name]; return ES || !p ? name : p[0]; }
  function info(name) { var p = PARTS[name]; return p ? p[ES ? 1 : 2] : ''; }
  // El visor se busca junto a este script, para que funcione igual desde /es/.
  var here = document.currentScript ? document.currentScript.src : location.href;
  var VIEWER = new URL('vendor/model-viewer.min.js', here).href;
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.m3d[data-src]'));
  if (!boxes.length) return;

  var scriptPromise = null;
  function loadViewer() {
    if (window.customElements && customElements.get('model-viewer')) return Promise.resolve();
    if (!scriptPromise) {
      scriptPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = VIEWER;
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return scriptPromise;
  }

  function css(c) {
    return 'rgb(' + c.slice(0, 3).map(function (v) { return Math.round(v * 255); }).join(',') + ')';
  }

  function mount(box) {
    var status = box.querySelector('.m3d-status');
    loadViewer().then(function () {
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', box.dataset.src);
      mv.setAttribute('alt', box.dataset.alt || T.model);
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('auto-rotate-delay', '1500');
      mv.setAttribute('touch-action', 'pan-y');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('shadow-intensity', '0');
      mv.className = 'm3d-view';
      box.querySelector('.m3d-stage').appendChild(mv);
      mv.addEventListener('progress', function (e) {
        if (status) status.textContent = T.loading + Math.round(e.detail.totalProgress * 100) + ' %';
      });
      mv.addEventListener('error', function () {
        if (status) status.textContent = T.modelError;
      });
      mv.addEventListener('load', function () { buildLegend(box, mv); if (status) status.hidden = true; });
    }).catch(function () {
      if (status) status.textContent = T.viewerError;
    });
  }

  function buildLegend(box, mv) {
    var list = box.querySelector('.m3d-parts');
    var note = box.querySelector('.m3d-note');
    var mats = mv.model ? mv.model.materials : [];
    var original = mats.map(function (m) { return m.pbrMetallicRoughness.baseColorFactor.slice(); });
    var modes = mats.map(function (m) { return m.getAlphaMode ? m.getAlphaMode() : 'OPAQUE'; });
    var current = -1;
    function apply(sel) {
      mats.forEach(function (m, i) {
        var c = original[i].slice();
        if (sel >= 0 && i !== sel) { m.setAlphaMode('BLEND'); c[3] = Math.min(c[3], 0.08); }
        else m.setAlphaMode(modes[i]);
        m.pbrMetallicRoughness.setBaseColorFactor(c);
      });
      Array.prototype.forEach.call(list.children, function (li, i) {
        li.firstChild.setAttribute('aria-pressed', String(i === sel));
      });
      if (sel >= 0) {
        var name = mats[sel].name;
        note.innerHTML = '';
        var b = document.createElement('strong'); b.textContent = label(name);
        note.appendChild(b);
        note.appendChild(document.createTextNode(': ' + info(name)));
      } else {
        note.textContent = T.hint;
      }
    }
    list.innerHTML = '';
    mats.forEach(function (m, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', 'false');
      var sw = document.createElement('span');
      sw.className = 'm3d-swatch';
      sw.style.background = css(original[i]);
      btn.appendChild(sw);
      btn.appendChild(document.createTextNode(label(m.name)));
      btn.addEventListener('click', function () {
        current = current === i ? -1 : i;
        if (current >= 0) mv.removeAttribute('auto-rotate');
        apply(current);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
    apply(-1);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); mount(e.target); }
      });
    }, { rootMargin: '300px 0px' });
    boxes.forEach(function (b) { io.observe(b); });
  } else {
    boxes.forEach(mount);
  }
})();
