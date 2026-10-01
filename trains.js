// Trains on the map, keeping roughly real TTC pace: a minute or two between
// stations, a few minutes to turn around at the ends. Each train waits at its
// station until departure, then makes a quick eased hop to the next one.
// Positions come from the wall clock, so every visitor (and every refresh)
// sees the same trains in the same places. Runs after main.js and reuses its
// el(), COLORS and current.

const TRAVEL_S_PER_UNIT = 2.2; // ~100 s for a typical 45-unit hop between stations
const DWELL_S = 30;            // stop at each station
const HOP_S = 2;               // on-screen time to glide between stations
const TERMINUS_S = 180;        // turnaround at the ends

// Stations in path order. Coordinates match STATIONS in main.js.
const ROUTES = [
  {
    key: 'l1', name: 'Line 1 Yonge–University', color: COLORS.yellow,
    ends: ['Vaughan', 'Finch'], count: 7, firstRun: 101,
    stations: [
      ['Vaughan Metropolitan Centre', 445, 300], ['Highway 407', 445, 330], ['Pioneer Village', 470, 349],
      ['York University', 505, 376], ['Finch West', 530, 420], ['Downsview Park', 580, 445],
      ['Sheppard West', 652, 473], ['Wilson', 678, 522], ['Yorkdale', 678, 566],
      ['Lawrence West', 678, 610], ['Glencairn', 678, 654], ['Cedarvale', 678, 698],
      ['St Clair West', 706, 740], ['Dupont', 738, 787], ['Spadina', 738, 833], ['St George', 782, 878],
      ['Museum', 782, 921], ["Queen's Park", 782, 966], ['St Patrick', 782, 1010], ['Osgoode', 782, 1053],
      ['St Andrew', 782, 1097], ['Union', 826, 1142], ['King', 870, 1097], ['Queen', 870, 1053],
      ['TMU', 870, 1010], ['College', 870, 966], ['Wellesley', 870, 932], ['Bloor-Yonge', 870, 878],
      ['Rosedale', 870, 833], ['Summerhill', 870, 790], ['St Clair', 870, 745], ['Davisville', 870, 700],
      ['Eglinton', 870, 655], ['Lawrence', 870, 610], ['York Mills', 870, 565], ['Sheppard-Yonge', 870, 520],
      ['North York Centre', 870, 475], ['Finch', 870, 430],
    ],
  },
  {
    key: 'l2', name: 'Line 2 Bloor–Danforth', color: COLORS.green,
    ends: ['Kipling', 'Kennedy'], count: 5, firstRun: 201,
    stations: [
      ['Kipling', 123, 900], ['Islington', 168, 878], ['Royal York', 212, 878], ['Old Mill', 256, 878],
      ['Jane', 300, 878], ['Runnymede', 344, 878], ['High Park', 387, 878], ['Keele', 430, 878],
      ['Dundas West', 474, 878], ['Lansdowne', 518, 878], ['Dufferin', 562, 878], ['Ossington', 606, 878],
      ['Christie', 650, 878], ['Bathurst', 694, 878], ['Spadina', 737, 878], ['St George', 782, 878],
      ['Bay', 826, 878], ['Bloor-Yonge', 870, 878], ['Sherbourne', 914, 878], ['Castle Frank', 958, 878],
      ['Broadview', 1002, 878], ['Chester', 1046, 878], ['Pape', 1090, 878], ['Donlands', 1147, 878],
      ['Greenwood', 1204, 878], ['Coxwell', 1259, 878], ['Woodbine', 1316, 878], ['Main Street', 1376, 878],
      ['Victoria Park', 1420, 860], ['Warden', 1455, 825], ['Kennedy', 1490, 790],
    ],
  },
];

// Line 3 closed in 2023; it gets a status row but no trains.
const CLOSED = [{ name: 'Line 3 Scarborough', color: COLORS.blue, status: 'Closed' }];

const POINTER_D = 'M5.4,0 L-5.4,-4.8 L-2.6,0 L-5.4,4.8 Z'; // arrowhead along +x, centered on 0,0

// ---------- Geometry ----------

function stopsAlong(path, stations) {
  const total = path.getTotalLength();
  const samples = [];
  for (let s = 0; s <= total; s += 2) {
    const p = path.getPointAtLength(s);
    samples.push([s, p.x, p.y]);
  }
  return stations.map(([name, x, y]) => {
    let best = 0;
    let bestD = Infinity;
    for (const [s, px, py] of samples) {
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bestD) { bestD = d; best = s; }
    }
    return { name, s: best };
  });
}

function pose(path, s, dir) {
  const total = path.getTotalLength();
  const p = path.getPointAtLength(s);
  const a = path.getPointAtLength(Math.max(0, s - 1.5));
  const b = path.getPointAtLength(Math.min(total, s + 1.5));
  let angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  if (dir < 0) angle += 180;
  return `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})`;
}

// ---------- Schedule ----------

// One round trip as a list of legs: dwell at a stop, or move between two stops.
function buildCycle(stops) {
  const last = stops.length - 1;
  const legs = [];
  const pass = (from, to, dir) => {
    for (let k = from; k !== to; k += dir) {
      // Real travel time is spent waiting at the platform; only the last
      // HOP_S seconds are shown as movement.
      const travel = Math.abs(stops[k + dir].s - stops[k].s) * TRAVEL_S_PER_UNIT;
      const wait = (k === from ? TERMINUS_S : DWELL_S) + Math.max(0, travel - HOP_S);
      legs.push({ dwell: true, at: k, dir, dur: wait });
      legs.push({ dwell: false, at: k, to: k + dir, dir, dur: Math.min(HOP_S, travel) });
    }
  };
  pass(0, last, 1);
  pass(last, 0, -1);
  let t = 0;
  for (const leg of legs) { leg.start = t; t += leg.dur; }
  return { legs, length: t };
}

// Where a train is at clock time `now` (seconds), given its offset in the cycle.
function locate(cycle, stops, offset, now) {
  const t = ((now + offset) % cycle.length + cycle.length) % cycle.length;
  let lo = 0;
  let hi = cycle.legs.length - 1;
  while (lo < hi) { // last leg starting at or before t
    const mid = (lo + hi + 1) >> 1;
    if (cycle.legs[mid].start <= t) lo = mid; else hi = mid - 1;
  }
  const leg = cycle.legs[lo];
  if (leg.dwell) {
    return { s: stops[leg.at].s, dir: leg.dir, text: `at ${stops[leg.at].name}` };
  }
  const x = (t - leg.start) / leg.dur;
  const f = x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2; // ease in-out
  return {
    s: stops[leg.at].s + (stops[leg.to].s - stops[leg.at].s) * f,
    dir: leg.dir,
    text: `next ${stops[leg.to].name}`,
  };
}

// ---------- Tracker panel ----------

const PANEL = { x: 118, y: 540, w: 400 };

function drawTracker(svg) {
  const { x, w } = PANEL;
  let y = PANEL.y;
  const g = el('g', { class: 'tracker', 'aria-hidden': 'true' }, svg);

  const rows = new Map(); // run -> { row, towards, status }
  for (const route of ROUTES) {
    el('rect', { x, y: y - 9, width: 18, height: 6, fill: route.color }, g);
    el('text', { x: x + 28, y, class: 'tr-line' }, g).textContent = route.name;
    el('text', { x: x + w, y, 'text-anchor': 'end', class: 'tr-muted' }, g).textContent = `${route.count} trains`;
    y += 22;
    for (let i = 0; i < route.count; i++) {
      const run = route.firstRun + i;
      const row = el('text', { x: x + 28, y, class: 'tr-row' }, g);
      el('tspan', { class: 'tr-id' }, row).textContent = run;
      const towards = el('tspan', { x: x + 66 }, row);
      const status = el('tspan', { x: x + 176, class: 'tr-status' }, row);
      rows.set(run, { row, towards, status });
      y += 19;
    }
    y += 10;
  }
  for (const line of CLOSED) {
    el('rect', { x, y: y - 9, width: 18, height: 6, fill: line.color }, g);
    el('text', { x: x + 28, y, class: 'tr-line' }, g).textContent = line.name;
    el('text', { x: x + w, y, 'text-anchor': 'end', class: 'tr-muted' }, g).textContent = line.status;
  }
  return rows;
}

// ---------- Wire up ----------

(function startTrains() {
  const svg = document.getElementById('map');
  const layer = document.getElementById('trains-layer');
  if (!svg || !layer) return;

  const rows = drawTracker(svg);
  const fleet = [];

  for (const route of ROUTES) {
    const path = svg.querySelector(`path[data-line="${route.key}"]`);
    const stops = stopsAlong(path, route.stations);
    const cycle = buildCycle(stops);
    for (let i = 0; i < route.count; i++) {
      const run = route.firstRun + i;
      const node = el('g', { class: 'train' }, layer);
      el('path', { d: POINTER_D }, node);
      const row = rows.get(run);
      // Evenly spaced around the round trip, so trains run both ways at once.
      const offset = (i / route.count) * cycle.length;
      fleet.push({ route, path, stops, cycle, offset, node, row, text: '' });

      // Hovering a row or a pointer highlights both.
      const on = () => { node.classList.add('hl'); row.row.classList.add('hl'); };
      const off = () => { node.classList.remove('hl'); row.row.classList.remove('hl'); };
      row.row.addEventListener('mouseenter', on);
      row.row.addEventListener('mouseleave', off);
      node.addEventListener('mouseenter', on);
      node.addEventListener('mouseleave', off);
    }
  }

  function render() {
    const now = Date.now() / 1000;
    for (const f of fleet) {
      const at = locate(f.cycle, f.stops, f.offset, now);
      f.node.setAttribute('transform', pose(f.path, at.s, at.dir));
      const towards = `to ${f.route.ends[at.dir > 0 ? 1 : 0]}`;
      if (towards + at.text !== f.text) {
        f.row.towards.textContent = towards;
        f.row.status.textContent = at.text;
        f.text = towards + at.text;
      }
    }
  }

  function frame() {
    if (!current && !document.hidden) render();
    requestAnimationFrame(frame);
  }
  render();
  requestAnimationFrame(frame);
})();
