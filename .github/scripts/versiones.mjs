// Llena la lista de versiones de versiones.html y es/versiones.html con las versiones
// publicadas en el repositorio público de instaladores (luisaguirred/EduOffline-releases).
// Lo ejecuta el workflow de GitHub Pages sobre la carpeta que se va a publicar:
//   GH_TOKEN=… node .github/scripts/versiones.mjs _site
// Para probar sin GitHub: VERSIONES_JSON=ejemplo.json node .github/scripts/versiones.mjs carpeta
//
// Notas en dos idiomas: en la descripción de la versión, el texto después de <!-- en -->
// va a la página en inglés y el que sigue a <!-- es --> a la de español. Si no hay
// marcas, el mismo texto aparece en las dos.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const REPO = process.env.VERSIONES_REPO || 'luisaguirred/EduOffline-releases';
const OUT = process.argv[2] || '_site';
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const API = 'https://api.github.com';

const T = {
  en: {
    locale: 'en-US', latest: 'Latest', pre: 'Pre-release', download: 'Download',
    noFiles: 'No downloads for this version.', notes: 'No notes for this version.',
    onGithub: 'View on GitHub', other: 'Other files',
    empty: 'No versions have been published yet. Check back soon.',
    platforms: { windows: 'Windows', macos: 'macOS', linux: 'Linux' }
  },
  es: {
    locale: 'es-MX', latest: 'Más reciente', pre: 'Versión preliminar', download: 'Descargar',
    noFiles: 'Esta versión no tiene descargas.', notes: 'Esta versión no tiene notas.',
    onGithub: 'Ver en GitHub', other: 'Otros archivos',
    empty: 'Todavía no se ha publicado ninguna versión. Vuelve pronto.',
    platforms: { windows: 'Windows', macos: 'macOS', linux: 'Linux' }
  }
};

async function gh(path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...init.headers
    }
  });
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path}: ${res.status} ${await res.text()}`);
  return res;
}

async function loadReleases() {
  if (process.env.VERSIONES_JSON) return JSON.parse(await readFile(process.env.VERSIONES_JSON, 'utf8'));
  const all = [];
  for (let page = 1; ; page++) {
    let res;
    try { res = await gh(`/repos/${REPO}/releases?per_page=100&page=${page}`); }
    catch (e) {
      // El repositorio aún no existe o no es público: se publica la página vacía.
      if (String(e.message).includes(': 404 ')) { console.warn(`No se encontró ${REPO}: página sin versiones.`); return []; }
      throw e;
    }
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all.filter(r => !r.draft);
}

// GitHub convierte el Markdown a HTML (y lo limpia). Sin contexto de repositorio, para
// que #123 o @usuario no se vuelvan enlaces al repositorio privado.
const rendered = new Map();
async function markdown(text) {
  if (!text.trim()) return '';
  if (rendered.has(text)) return rendered.get(text);
  let html;
  if (process.env.VERSIONES_JSON && !TOKEN) {
    html = '<pre>' + esc(text) + '</pre>';
  } else {
    const res = await gh('/markdown', { method: 'POST', body: JSON.stringify({ text, mode: 'markdown' }) });
    html = await res.text();
  }
  rendered.set(text, html);
  return html;
}

function splitNotes(body) {
  const text = (body || '').replace(/\r\n/g, '\n');
  const re = /<!--\s*(en|es)\s*-->/gi;
  const marks = [...text.matchAll(re)];
  if (!marks.length) return { en: text.trim(), es: text.trim() };
  const out = {};
  marks.forEach((m, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].index : text.length;
    out[m[1].toLowerCase()] = text.slice(m.index + m[0].length, end).trim();
  });
  return { en: out.en ?? out.es ?? '', es: out.es ?? out.en ?? '' };
}

// Archivos que usa el actualizador automático y que no se ofrecen para descargar.
const HIDDEN = /(\.blockmap|latest[^/]*\.ya?ml)$/i;
function platformOf(name) {
  if (/\.(exe|msi|msix|appx)$/i.test(name)) return 'windows';
  if (/\.(dmg|pkg)$/i.test(name) || /mac.*\.zip$/i.test(name)) return 'macos';
  if (/\.(appimage|deb|rpm|snap|flatpak)$/i.test(name) || /linux.*\.(tar\.gz|tgz|zip)$/i.test(name)) return 'linux';
  return 'other';
}
function size(bytes) {
  return bytes >= 1048576 ? (bytes / 1048576).toFixed(0) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function renderRelease(r, lang, isLatest) {
  const t = T[lang];
  const tag = r.tag_name;
  const id = 'v-' + tag.replace(/^v/i, '').replace(/[^\w.-]/g, '-');
  const date = r.published_at
    ? new Date(r.published_at).toLocaleDateString(t.locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    : '';
  const notes = await markdown(splitNotes(r.body)[lang]);
  const files = (r.assets || []).filter(a => !HIDDEN.test(a.name));
  const order = ['windows', 'macos', 'linux', 'other'];
  files.sort((a, b) => order.indexOf(platformOf(a.name)) - order.indexOf(platformOf(b.name)) || a.name.localeCompare(b.name));
  const badges = (isLatest ? `<span class="rel-badge">${t.latest}</span>` : '') + (r.prerelease ? `<span class="rel-badge pre">${t.pre}</span>` : '');
  const links = files.map(a => {
    const p = platformOf(a.name);
    const label = p === 'other' ? t.other : t.platforms[p];
    return `<li><a class="rel-dl" href="${esc(a.browser_download_url)}"><strong>${label}</strong><span>${esc(a.name)} · ${size(a.size)}</span></a></li>`;
  }).join('');
  return `      <article class="release" id="${esc(id)}">
        <header class="rel-head"><h2>${esc(r.name || tag)}</h2>${badges}<time datetime="${esc((r.published_at || '').slice(0, 10))}">${esc(date)}</time></header>
        <div class="rel-notes">${notes || `<p>${t.notes}</p>`}</div>
        <div class="rel-files"><h3>${t.download}</h3>${links ? `<ul>${links}</ul>` : `<p>${t.noFiles}</p>`}<p class="rel-gh"><a href="${esc(r.html_url)}">${t.onGithub}</a></p></div>
      </article>`;
}

async function fill(file, lang, releases) {
  const path = join(OUT, file);
  const page = await readFile(path, 'utf8');
  const start = '<!-- versiones:inicio -->', end = '<!-- versiones:fin -->';
  const a = page.indexOf(start), b = page.indexOf(end);
  if (a < 0 || b < a) throw new Error(`${path}: faltan las marcas ${start} / ${end}`);
  const latestId = releases.find(r => !r.prerelease)?.id;
  const items = releases.length
    ? (await Promise.all(releases.map(r => renderRelease(r, lang, r.id === latestId)))).join('\n')
    : `      <p class="releases-empty">${T[lang].empty}</p>`;
  await writeFile(path, page.slice(0, a + start.length) + '\n' + items + '\n' + page.slice(b));
}

const releases = (await loadReleases())
  .sort((x, y) => new Date(y.published_at || y.created_at) - new Date(x.published_at || x.created_at));
await fill('versiones.html', 'en', releases);
await fill('es/versiones.html', 'es', releases);
console.log(`Versiones publicadas en el sitio: ${releases.length} (${REPO})`);
