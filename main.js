const SVG_NS = 'http://www.w3.org/2000/svg';

const COLORS = {
  yellow: '#FFCC29',
  green: '#00A650',
  blue: '#1AAEEB',
  brown: '#8B5A2B',
};

// Coordinates are in the SVG's viewBox space, traced from the TTC map.
const LINES = [
  // Stouffville (drawn first so it sits under everything)
  { color: COLORS.brown, cls: 'thin', d: 'M770,1205 L1300,1205 Q1330,1205 1351,1184 L1470,1065' },
  { color: COLORS.brown, cls: 'thin dashed', d: 'M1470,1065 L1550,985' },
  // Line 2 Bloor-Danforth
  { key: 'l2', color: COLORS.green, d: 'M123,900 L168,878 L1376,878 L1420,860 L1490,790' },
  // Line 1 Yonge-University
  {
    key: 'l1',
    color: COLORS.yellow,
    d: 'M445,300 L445,330 L520,388 Q530,396 530,408 L530,430 Q530,445 545,445 L620,445 Q633,445 640,455 ' +
       'L678,512 L678,705 L706,740 L738,778 L738,833 L782,878 L782,1118 Q782,1142 806,1142 ' +
       'L846,1142 Q870,1142 870,1118 L870,430',
  },
  // Line 3 Scarborough
  { key: 'l3', color: COLORS.blue, d: 'M1490,790 L1490,614 Q1490,592 1512,592 L1622,592' },
];

const STATIONS = [
  // Line 1, west arm (Vaughan to St Andrew)
  [445, 300], [445, 330], [470, 349], [505, 376], [530, 420], [580, 445], [652, 473],
  [678, 522], [678, 566], [678, 610], [678, 654], [678, 698], [706, 740], [738, 787],
  [782, 921], [782, 966], [782, 1053], [782, 1097],
  // Union and Line 1, Yonge arm
  [826, 1142], [870, 1097], [870, 1053], [870, 1010], [870, 966], [870, 932], [870, 833],
  [870, 790], [870, 745], [870, 700], [870, 655], [870, 610], [870, 565], [870, 520],
  [870, 475], [870, 430],
  // Line 2
  [123, 900], [168, 878], [212, 878], [256, 878], [300, 878], [344, 878], [387, 878],
  [430, 878], [474, 878], [518, 878], [562, 878], [606, 878], [650, 878], [694, 878],
  [826, 878], [914, 878], [958, 878], [1002, 878], [1046, 878], [1090, 878], [1147, 878],
  [1204, 878], [1259, 878], [1316, 878], [1376, 878], [1420, 860], [1455, 825],
  // Line 3
  [1490, 702], [1490, 614], [1534, 592], [1578, 592],
];

const INTERCHANGES = [[782, 878], [738, 833], [737, 878], [1490, 790]];

const STOPS = [
  {
    section: 'experience', name: 'Bloor-Yonge', sub: 'Experience', x: 870, y: 878,
    label: { x: 894, y: 924, anchor: 'start' },
  },
  {
    section: 'education', name: 'St. Patrick', sub: 'Education', x: 782, y: 1010,
    label: { x: 756, y: 1008, anchor: 'end' },
  },
  {
    section: 'projects', name: 'McCowan', sub: 'Projects', x: 1622, y: 592,
    label: { x: 1622, y: 537, anchor: 'middle' },
  },
];

const BUS = {
  section: 'misc', name: 'Markham', sub: 'Misc', x: 826, y: 1180,
  label: { x: 826, y: 1252, anchor: 'middle' },
};

function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

function addLabel(group, { name, sub, label }) {
  const text = el('text', { x: label.x, y: label.y, 'text-anchor': label.anchor }, group);
  el('tspan', { class: 'label', x: label.x }, text).textContent = name;
  el('tspan', { class: 'sub', x: label.x, dy: 24 }, text).textContent = sub;
}

function makeClickable(group, stop) {
  group.setAttribute('class', 'stop');
  group.setAttribute('tabindex', '0');
  group.setAttribute('role', 'button');
  group.setAttribute('aria-label', `${stop.name}: ${stop.sub}`);
  const open = () => { location.hash = stop.section; };
  group.addEventListener('click', open);
  group.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
}

function drawTitle(svg) {
  const text = el('text', { x: 1180, y: 700, 'text-anchor': 'middle' }, svg); // centered on Lawrence East
  el('tspan', { class: 'title', x: 1180 }, text).textContent = 'Ryan Gao';
  el('tspan', { class: 'title-sub', x: 1180, dy: 38 }, text).textContent = 'UofT CS 2T9 + Co-op';

  const links = el('text', { x: 1180, y: 772, 'text-anchor': 'middle', class: 'title-links' }, svg);
  TITLE_LINKS.forEach(([label, href], i) => {
    if (i > 0) el('tspan', {}, links).textContent = '  ·  ';
    const a = el('a', { href, target: '_blank', rel: 'noopener' }, links);
    el('tspan', {}, a).textContent = label;
  });
}

const TITLE_LINKS = [
  ['GitHub', 'https://github.com/ryangaoo'],
  ['LinkedIn', 'https://linkedin.com/in/ryanngaoo'],
  ['Devpost', 'https://devpost.com/RyanGaoo'],
  ['Email', 'mailto:Ryann.Gao@mail.utoronto.ca'],
];

function drawMap(svg) {
  drawTitle(svg);
  for (const line of LINES) {
    const attrs = { d: line.d, class: `line ${line.cls || ''}`, stroke: line.color };
    if (line.key) attrs['data-line'] = line.key;
    el('path', attrs, svg);
  }

  // Spadina's walkway between the Line 1 and Line 2 platforms
  el('line', { x1: 738, y1: 833, x2: 737, y2: 878, class: 'connector' }, svg);
  el('line', { x1: 738, y1: 833, x2: 737, y2: 878, class: 'connector-fill' }, svg);

  for (const [cx, cy] of STATIONS) el('circle', { cx, cy, r: 5, class: 'dot' }, svg);
  for (const [cx, cy] of INTERCHANGES) el('circle', { cx, cy, r: 11, class: 'xfer' }, svg);

  // Train pointers ride above the stations but under the clickable stops (trains.js).
  el('g', { id: 'trains-layer', 'aria-hidden': 'true' }, svg);

  for (const stop of STOPS) {
    const g = el('g', {}, svg);
    el('circle', { cx: stop.x, cy: stop.y, r: 30, fill: 'transparent' }, g); // bigger hit area
    el('circle', { cx: stop.x, cy: stop.y, r: 14, class: 'ring', stroke: '#26241f', 'stroke-width': 4 }, g);
    addLabel(g, stop);
    makeClickable(g, stop);
  }

  drawBus(svg);
}

function drawBus(svg) {
  const g = el('g', {}, svg);
  // Position on a wrapper so the CSS hover transform on .bus-body doesn't override it.
  const pos = el('g', { transform: `translate(${BUS.x - 38} ${BUS.y - 22})` }, g);
  const body = el('g', { class: 'bus-body' }, pos);
  el('rect', { x: -10, y: -8, width: 96, height: 60, fill: 'transparent' }, body); // hit area
  el('rect', { x: 0, y: 0, width: 76, height: 36, rx: 8, fill: COLORS.brown, class: 'bus-shell' }, body);
  for (const x of [6, 23, 40]) el('rect', { x, y: 6, width: 13, height: 11, rx: 2, class: 'bus-window' }, body);
  el('rect', { x: 57, y: 6, width: 13, height: 17, rx: 2, class: 'bus-window' }, body); // windshield
  const go = el('text', { x: 28, y: 31, class: 'bus-go', 'text-anchor': 'middle' }, body);
  go.textContent = 'GO';
  for (const cx of [17, 59]) {
    el('circle', { cx, cy: 36, r: 7, fill: '#1d1d1f' }, body);
    el('circle', { cx, cy: 36, r: 2.5, fill: '#cfcfd4' }, body);
  }
  addLabel(g, BUS);
  makeClickable(g, BUS);
}

// ---------- Screen wipe + routing ----------

const mapView = document.getElementById('map-view');
const wipeEl = document.querySelector('.wipe');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WIPE_MS = 550;

// A panel in the line's color sweeps down the screen. atCover() swaps the view
// while it's fully covered, then the panel keeps going and reveals the new view.
function wipe(color, atCover) {
  if (reduceMotion) { atCover(); return Promise.resolve(); }

  return new Promise((resolve) => {
    const layer = document.createElement('i');
    layer.style.background = color;
    wipeEl.replaceChildren(layer);
    wipeEl.classList.add('busy');
    void layer.offsetHeight; // commit the start position before animating
    layer.style.transform = 'translateY(0)';

    setTimeout(() => {
      atCover();
      layer.style.transform = 'translateY(100%)';
      setTimeout(() => {
        wipeEl.replaceChildren();
        wipeEl.classList.remove('busy');
        resolve();
      }, WIPE_MS + 30);
    }, WIPE_MS + 120);
  });
}

let current = null;
let busy = false;

function targetFromHash() {
  const node = document.getElementById(location.hash.slice(1));
  return node && node.classList.contains('page') ? node.id : null;
}

// ---------- Scroll progress: a train riding a strip of line ----------

const TRAIN_W = 46;
const TRACK_PAD = 16;

const TRAIN_SVG = `
  <svg class="ride-train" viewBox="0 0 46 18">
    <path d="M0 2 H40 L46 8 V15 H0 Z" fill="#2b2a27"/>
    <rect x="4" y="5" width="6" height="5" fill="#d9d2c4"/>
    <rect x="13" y="5" width="6" height="5" fill="#d9d2c4"/>
    <rect x="22" y="5" width="6" height="5" fill="#d9d2c4"/>
    <rect x="31" y="5" width="6" height="5" fill="#d9d2c4"/>
    <rect x="0" y="12" width="46" height="1.5" fill="var(--accent)"/>
    <circle cx="9" cy="16" r="2" fill="#2b2a27"/>
    <circle cx="37" cy="16" r="2" fill="#2b2a27"/>
  </svg>`;

function addRide(page) {
  const ride = document.createElement('div');
  ride.className = 'ride';
  ride.setAttribute('aria-hidden', 'true');
  ride.innerHTML = `
    <div class="ride-track">
      <span class="ride-line"></span>
      <span class="ride-stop end" style="left:${TRACK_PAD}px"></span>
      <span class="ride-stop end" style="left:calc(100% - ${TRACK_PAD}px)"></span>
      ${TRAIN_SVG}
    </div>`;
  page.prepend(ride);
  page.addEventListener('scroll', () => requestAnimationFrame(() => moveTrain(page)), { passive: true });
}

function rideMetrics(page) {
  const track = page.querySelector('.ride-track');
  const run = track.clientWidth - TRACK_PAD * 2 - TRAIN_W; // distance the train can travel
  const maxScroll = page.scrollHeight - page.clientHeight;
  return { track, run, maxScroll };
}

function moveTrain(page) {
  const { track, run, maxScroll } = rideMetrics(page);
  const progress = maxScroll > 0 ? Math.min(1, page.scrollTop / maxScroll) : 1;
  track.querySelector('.ride-train').style.transform = `translateX(${progress * run}px)`;
}

// Small station ticks mark where each entry starts, so the strip doubles as a
// map of the page.
function layoutRide(page) {
  const { track, run, maxScroll } = rideMetrics(page);
  track.querySelectorAll('.ride-stop:not(.end)').forEach((t) => t.remove());
  if (maxScroll > 0) {
    const barH = page.querySelector('.ride').offsetHeight;
    page.querySelectorAll('.entry').forEach((entry) => {
      const q = (entry.offsetTop - barH - 16) / maxScroll;
      if (q <= 0.02 || q >= 0.98) return;
      const tick = document.createElement('span');
      tick.className = 'ride-stop';
      tick.style.left = `${TRACK_PAD + q * run + TRAIN_W / 2}px`;
      track.insertBefore(tick, track.querySelector('.ride-train'));
    });
  }
  moveTrain(page);
}

function show(target) {
  if (current) document.getElementById(current).hidden = true;
  if (target) {
    const page = document.getElementById(target);
    page.hidden = false;
    page.scrollTop = 0;
    layoutRide(page);
  }
  mapView.inert = Boolean(target);
  current = target;
}

async function sync() {
  if (busy) return;
  const target = targetFromHash();
  if (target === current) return;

  busy = true;
  const color = document.getElementById(target || current).dataset.color;
  await wipe(color, () => show(target));
  busy = false;

  if (target) document.querySelector(`#${target} .back`).focus({ preventScroll: true });
  sync(); // catch any hash change that happened mid-animation
}

function closePage() {
  history.pushState(null, '', location.pathname + location.search);
  sync();
}

drawMap(document.getElementById('map'));
document.querySelectorAll('.page').forEach(addRide);
window.addEventListener('resize', () => { if (current) layoutRide(document.getElementById(current)); });
window.addEventListener('load', () => { if (current) layoutRide(document.getElementById(current)); });
show(targetFromHash()); // deep links open without a wipe

window.addEventListener('hashchange', sync);
window.addEventListener('popstate', sync);
document.querySelectorAll('.back').forEach((btn) => btn.addEventListener('click', closePage));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (zoomed) closePhoto();
  else if (current) closePage();
});

// ---------- Polaroid zoom ----------

const lightbox = document.querySelector('.lightbox');
const ZOOM_MS = 380;
let zoomed = null; // { source, clone, rest }

function openPhoto(source) {
  if (zoomed) return;
  // The bounding box is skewed by the tilt, but its center isn't.
  const rect = source.getBoundingClientRect();
  const w = source.offsetWidth;
  const h = source.offsetHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const clone = source.cloneNode(true);
  clone.classList.add('zoomed');
  clone.removeAttribute('tabindex');
  clone.removeAttribute('role');
  clone.style.left = `${cx - w / 2}px`;
  clone.style.top = `${cy - h / 2}px`;
  clone.style.width = `${w}px`;
  const tilt = getComputedStyle(source).getPropertyValue('--r').trim() || '0deg';
  const rest = `translate(0px, 0px) scale(1) rotate(${tilt})`;
  clone.style.transform = rest;

  const scale = Math.min((innerWidth * 0.9) / w, (innerHeight * 0.88) / h, 3.2);
  const tx = innerWidth / 2 - cx;
  const ty = innerHeight / 2 - cy;

  lightbox.hidden = false;
  document.body.appendChild(clone);
  source.style.visibility = 'hidden';
  void clone.offsetWidth; // commit the start position before animating
  lightbox.classList.add('open');
  clone.style.transform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(0deg)`;

  clone.addEventListener('click', closePhoto);
  zoomed = { source, clone, rest };
}

function closePhoto() {
  if (!zoomed) return;
  const { source, clone, rest } = zoomed;
  zoomed = null;
  lightbox.classList.remove('open');
  clone.style.transform = rest;
  setTimeout(() => {
    clone.remove();
    source.style.visibility = '';
    lightbox.hidden = true;
    source.focus({ preventScroll: true });
  }, reduceMotion ? 0 : ZOOM_MS);
}

lightbox.addEventListener('click', closePhoto);
document.querySelectorAll('.page .polaroid').forEach((fig) => {
  const caption = fig.querySelector('figcaption')?.textContent || 'photo';
  fig.tabIndex = 0;
  fig.setAttribute('role', 'button');
  fig.setAttribute('aria-label', `Enlarge photo: ${caption}`);
  fig.addEventListener('click', () => openPhoto(fig));
  fig.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhoto(fig); }
  });
});

// ---------- Intro loader ----------

const LOADER_MS = 2500;
const loaderEl = document.querySelector('.loader');
if (loaderEl) {
  mapView.inert = true;
  setTimeout(() => {
    loaderEl.classList.add('done');
    mapView.inert = Boolean(current);
    setTimeout(() => loaderEl.remove(), 500);
  }, reduceMotion ? 400 : LOADER_MS);
}
