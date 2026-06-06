

// ---- Background characters (the spans are filled after SECTIONS below) ----
const bg = document.getElementById("bg");
const bgSpans = [];

// Pool of available background chars, keyed by character.
let pool = new Map();
function rebuildPool() {
  pool = new Map();
  bgSpans.forEach((s, i) => {
    const c = s.textContent;
    if (!pool.has(c)) pool.set(c, []);
    pool.get(c).push(i);
  });
}

function takeFromPool(ch) {
  if (pool.has(ch) && pool.get(ch).length) return pool.get(ch).pop();
  for (const [k, arr] of pool) {
    if (arr.length && k.toLowerCase() === ch.toLowerCase()) return arr.pop();
  }
  for (const [k, arr] of pool) {
    if (arr.length && k.trim() !== "") return arr.pop();
  }
  return null;
}

// ---- Section content ----
const SECTIONS = {
  overview: `// OVERVIEW
Title: Software Engineer
Location: Toronto, CA
I build full-stack and AI-driven software that ships, from RAG pipelines and Flask APIs to responsive React frontends. I care about clean architecture, real testing, and writing code that holds up in the real world.`,

  experience: `// EXPERIENCE
Software Developer | SEPT 2025 — PRESENT
C.R.E.A.T.E. — University of Toronto · Toronto, ON
Architected and deployed a RAG-based note-taking application with LangChain, enabling semantic search and automated summarization across user-generated documents.
Engineered a scalable backend data layer on Supabase, using pgvector to optimize storage and querying of high-dimensional embeddings.
Drove the full software development lifecycle in an agile team — sprint planning, CI/CD pipelines, code reviews, and cross-functional collaboration via Jira.`,

  education: `// EDUCATION
Honours BSc, Computer Science | SEPT 2025 — SEPT 2029
University of Toronto Scarborough · Toronto, Canada
Details: Software Engineering stream + Co-op.
Credits: 7.0 / 20.0 earned (Year 2 in progress).
Coursework:
Intro to Computer Science I & II (CSCA08 / CSCA48)
Software Design (CSCB07)
Software Tools & Systems Programming (CSCB09)
Intro to Databases & Web Apps (CSCB20)
Discrete Mathematics (CSCA67)
Linear Algebra I (MATA22)
Calculus I & II (MATA31 / MATA37)
Intro to Probability (STAB52)
Intro to Ethics (PHLA11)
Ancient Mythology I (CLAA05)
Transfer credits (IB HL): Economics, English, Chemistry.`,

  skills: `// SKILLS
Languages: Python, TypeScript, JavaScript, Java, C, C++, SQL (PostgreSQL / MySQL / SQLite), HTML / CSS
Frameworks & Libraries: React, Node.js, Flask, LangChain, OpenCV, YOLOv8, Solana Web3.js, Redux, Arduino
Databases & Cloud: MongoDB Atlas, PostgreSQL, MySQL, Snowflake, Supabase (pgvector), Firebase, Google Cloud (GCP)
Developer Tools: Git / Git Hooks, Docker, Kubernetes (K8s), Linux, VS Code Extension API, RESTful APIs, Postman, Claude Code, Cursor, Arduino IDE`,
};

// ---- Projects (structured so each can be opened to read more) ----
const PROJECTS = [
  {
    code: "CODEGUARD",
    date: "APR 2026",
    short: "An automated code reviewer that learns a repo's own standards from past PRs.",
    stack: "Python · TypeScript · MongoDB · Claude Opus 3.6 · Git Hooks · OpenRouter",
    meta: "Event: LA Hacks 2026 @ UCLA",
    awards: "",
    bullets: [
      "RAG pipeline that learns and enforces repo-specific standards from merged PRs.",
      "Commit ingestion engine parsing unified diffs into 384-dim embeddings, idempotent in MongoDB Atlas.",
      "Dual VS Code extensions: a live AST / call-graph sandbox and a SHA-1-cached dual-agent reviewer.",
      "Non-blocking Git post-merge hooks for automated background runs.",
    ],
    linkLabel: "→ DEVPOST",
    link: "https://devpost.com/software/repo-warrior",
  },
  {
    code: "LOCKBLOCK",
    date: "JAN 2026",
    short: "A face-recognition door lock with blockchain-backed remote approval.",
    stack: "Python · Flask · JavaScript · SQLite · OpenCV · Solana · Arduino (C++)",
    meta: "Event: Hack Hive @ Ontario Tech University",
    awards: "Best Use of Solana",
    bullets: [
      "Real-time facial-recognition access control with blockchain-backed remote auth.",
      "Edge CV pipeline using YuNet + SFace models for low-latency recognition.",
      "Secure Web3 auth via Solana Ed25519 signature verification.",
      "Flask + JS dashboard with user whitelisting and live WebSocket alerts.",
    ],
    linkLabel: "→ DEVPOST",
    link: "https://devpost.com/software/lockblock-9ct281",
  },
  {
    code: "HATSEYE",
    date: "JAN 2026",
    short: "Wearable AI that narrates surroundings aloud for the visually impaired.",
    stack: "Python · Computer Vision · YOLOv8 · REST APIs · IoT · Arduino (C++)",
    meta: "Event: DeltaHacks 12 @ McMaster University",
    awards: "Top 6 Finalists",
    bullets: [
      "AI spatial-awareness wearable narrating surroundings for the visually impaired.",
      "YOLOv8 vision pipeline detecting environmental hazards in real time.",
      "Async ElevenLabs + Gemini calls turning scenes into natural voice descriptions.",
      "Low-latency tactile feedback loop via ultrasonic sensors and vibration motors.",
    ],
    linkLabel: "→ DEVPOST",
    link: "https://devpost.com/software/hatseye",
  },
  {
    code: "FANTASY '16",
    date: "APR 2026",
    short: "A fantasy basketball league simulator set in the 2016 NBA season.",
    stack: "Python · Flask · SQLite · HTML · CSS · JavaScript",
    meta: "Course: CSCB20 — Intro to Web Apps & Databases",
    awards: "",
    bullets: [
      "Full-stack fantasy basketball simulator set in the 2016 NBA season.",
      "Snake-draft algorithm, round-robin scheduler, and five-category scoring engine.",
      "Flask backend with strict turn-based draft validation and day advancement.",
      "Strictly-typed SQLite schema with status-aware HTML / CSS / JS views.",
    ],
    linkLabel: "→ GITHUB REPO",
    link: "#",
  },
  {
    code: "STOP! DON'T GO ON!",
    date: "NOV 2025",
    short: "A focus gadget that sprays you when it catches you slacking off.",
    stack: "Python · OpenCV · Flask · React · TypeScript · Vite · Arduino · EmailJS · Pygame",
    meta: "Event: Go On Hacks ;)",
    awards: "Top 6 Finalists",
    bullets: [
      "Accountability gadget fusing computer vision, audio detection, and an Arduino spray rig.",
      "Python + OpenCV backend tracking the user's face and sampling mic input.",
      "Servo-driven Arduino Uno actuates a spray bottle on distraction.",
      "React + Vite frontend with a 6-second math challenge; failure emails a candid snapshot.",
    ],
    linkLabel: "→ DEVPOST",
    link: "https://devpost.com/software/stop-don-t-go-on",
  },
  {
    code: "MYROOM",
    date: "JAN 2026",
    short: "Turn a room photo into a buildable, shoppable 3D voxel scene.",
    stack: "React · Three.js / R3F · TypeScript · Node.js · MongoDB · Shopify Storefront API · Gemini · RAG",
    meta: "Event: UofTHacks 13",
    awards: "",
    bullets: [
      "'Cursor for Interior Design': turns 2D room photos into modular 3D voxel scenes.",
      "CV pipeline segmenting images onto a custom voxel system rendered in React Three Fiber.",
      "Shopify Storefront integration linking blocks to real purchasable products.",
      "Node.js + MongoDB metrics feeding a RAG-driven recommendation engine.",
    ],
    linkLabel: "→ DEVPOST",
    link: "https://devpost.com/software/myroom-ju8v6y",
  },
];

// ---- Contact (with links) ----
const CONTACTS = [
  { label: "Email", text: "Ryann.Gao@mail.utoronto.ca", url: "mailto:Ryann.Gao@mail.utoronto.ca" },
  { label: "Phone", text: "647-763-6808" },
  { label: "GitHub", text: "github.com/ryangaoo", url: "https://github.com/ryangaoo" },
  { label: "LinkedIn", text: "linkedin.com/in/ryanngaoo", url: "https://linkedin.com/in/ryanngaoo" },
  {
    label: "Devpost",
    text: "devpost.com/RyanGaoo",
    url: "https://devpost.com/RyanGaoo?ref_content=user-portfolio&ref_feature=portfolio&ref_medium=global-nav",
  },
];

function openLink(url) {
  if (!url || url === "#") return;
  if (url.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener");
}

function projectDetailText(p) {
  let t = `Project: ${p.code} | ${p.date} | ${p.linkLabel}\nStack: ${p.stack}\n${p.meta}`;
  if (p.awards) t += `\nAwards: ${p.awards}`;
  t += "\n" + p.bullets.map((b) => `- ${b}`).join("\n");
  return t;
}

// A project list item: codename + date, a short blurb, and a "read more →"
// cue that flies in from the bank like the rest of the text.
function projectListItemText(p) {
  return `${p.code} | ${p.date}\n${p.short}\nread more →`;
}

// Every view that can ever be displayed at once (used to size the background).
const ALL_VIEWS = [
  ...Object.values(SECTIONS),
  "// CONTACT" + CONTACTS.map((c) => `${c.label}: ${c.text}`).join("\n"),
  "// PROJECTS" + PROJECTS.map(projectListItemText).join("\n"),
  ...PROJECTS.map((p) => projectDetailText(p) + "← back to projects"),
];

// ---- Build an OPTIMIZED background ----
// Only one section is shown at a time and every character returns home before
// the next section forms, so a single background character can be reused across
// sections. We therefore only need as many copies of each character as the most
// demanding single section requires (max over sections), never the sum. This
// guarantees a section can always form 1-to-1 without ever taking two of a
// character from one span.
function charCounts(text) {
  const counts = new Map();
  for (const ch of text) {
    if (ch === " " || ch === "\n") continue;
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  return counts;
}

const maxCounts = new Map();
for (const text of ALL_VIEWS) {
  for (const [ch, n] of charCounts(text)) {
    if (n > (maxCounts.get(ch) || 0)) maxCounts.set(ch, n);
  }
}

const bgChars = [];
for (const [ch, n] of maxCounts) {
  for (let i = 0; i < n; i++) bgChars.push(ch);
}
bgChars.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

for (const ch of bgChars) {
  const s = document.createElement("span");
  s.className = "ch";
  s.textContent = ch;
  bg.appendChild(s);
  bgSpans.push(s);
}
rebuildPool();

// Live glyph count on the letter-bank label: available / total, updated as
// letters fly out to form a view and return.
const bankLabel = document.querySelector(".bank-label");
function updateBankCount() {
  if (!bankLabel) return;
  const available = bgSpans.length - active.length;
  bankLabel.textContent = `letter bank · ${available} / ${bgSpans.length}`;
}

// Panel header/footer chrome.
function setPanel(title, hint) {
  const t = document.getElementById("panel-title");
  const h = document.getElementById("panel-hint");
  if (t) t.textContent = title;
  if (h) h.textContent = hint;
}

// ---- Morph: move matching chars from the background to form the section ----
const left = document.getElementById("left");
const RETURN_MS = 500; // matches the .flyer transition duration
const STAGGER_SPREAD = 0.28; // total seconds the stagger is spread across, capped
let active = []; // [{ flyer, src }]
let busy = false;
let currentView = null; // re-runnable renderer for the active view
updateBankCount();

// Per-character delay: small step, but the whole stagger never exceeds
// STAGGER_SPREAD so large views don't drag on.
function staggerDelay(i, total) {
  const step = Math.min(0.0015, STAGGER_SPREAD / Math.max(total, 1));
  return i * step;
}

// Animate the currently-formed characters back to their home spots,
// then run the callback once they've all returned.
function returnHome(done) {
  if (!active.length) {
    done();
    return;
  }
  const current = active;
  active = [];
  const n = current.length;
  current.forEach((a, i) => {
    a.flyer.style.transitionDelay = staggerDelay(i, n).toFixed(4) + "s";
    a.flyer.style.transform = "translate(0, 0)";
  });
  const wait = RETURN_MS + staggerDelay(n, n) * 1000 + 30;
  setTimeout(() => {
    current.forEach((a) => {
      a.flyer.remove();
      a.src.style.opacity = "";
    });
    rebuildPool();
    updateBankCount();
    done();
  }, wait);
}

// Form a view. `blocks` is an array of { text, onClick? }.
function formView(blocks) {
  if (!blocks || busy) return;
  busy = true;
  returnHome(() => {
    busy = false;
    buildView(blocks);
  });
}

// Split text into one block per line so lines get breathing room instead of
// reading as a single wall of text.
function linesToBlocks(text) {
  return text.split("\n").map((line) => ({
    text: line,
    className: line.startsWith("//") ? "heading" : "line",
  }));
}

function formText(text) {
  if (!text) return;
  currentView = () => formText(text);
  formView(linesToBlocks(text));
}

// ---- Projects: list view + per-project detail view ----
function showProjects() {
  currentView = showProjects;
  setPanel("projects", "click a project to read more");
  const blocks = [{ text: "// PROJECTS", className: "heading" }];
  PROJECTS.forEach((p) => {
    blocks.push({
      text: projectListItemText(p),
      onClick: () => showProjectDetail(p),
      className: "proj",
    });
  });
  formView(blocks);
}

function showProjectDetail(p) {
  currentView = () => showProjectDetail(p);
  setPanel(p.code.toLowerCase(), "← back to projects");
  const blocks = [
    {
      className: "proj-head",
      segments: [
        { text: `Project: ${p.code} | ${p.date} |` },
        { text: p.linkLabel, onClick: () => openLink(p.link), className: "link-block" },
      ],
    },
    { text: `Stack: ${p.stack}` },
    { text: p.meta },
  ];
  if (p.awards) blocks.push({ text: `Awards: ${p.awards}` });
  p.bullets.forEach((b) => blocks.push({ text: `- ${b}`, className: "bullet" }));
  blocks.push({ text: "← back to projects", onClick: showProjects, className: "back" });
  formView(blocks);
}

// ---- Contact: each line with a link opens its URL ----
function showContact() {
  currentView = showContact;
  setPanel("contact", "");
  const blocks = [{ text: "// CONTACT", className: "heading" }];
  CONTACTS.forEach((c) => {
    blocks.push({
      text: `${c.label}: ${c.text}`,
      className: c.url ? "link-block" : "line",
      onClick: c.url ? () => openLink(c.url) : undefined,
    });
  });
  formView(blocks);
}

// Append text into a parent element: line by line, each word in a nowrap span
// so lines only break at the spaces between words (never mid-word).
function fillWords(target, text) {
  text.split("\n").forEach((line, li) => {
    if (li > 0) target.appendChild(document.createElement("br"));
    line.split(" ").forEach((word, wi) => {
      if (wi > 0) target.appendChild(document.createTextNode(" "));
      if (word === "") return;
      const wordEl = document.createElement("span");
      wordEl.className = "word";
      for (const ch of word) {
        const slot = document.createElement("span");
        slot.className = "slot";
        slot.textContent = ch;
        wordEl.appendChild(slot);
      }
      target.appendChild(wordEl);
    });
  });
}

function buildView(blocks) {
  left.innerHTML = "";

  // Build invisible slots that define the final layout.
  const container = document.createElement("div");
  container.className = "section";
  for (const b of blocks) {
    const block = document.createElement("div");
    block.className = "block" + (b.className ? " " + b.className : "");
    if (b.segments) {
      // Inline segments sit on the same line (e.g. project name + its link).
      b.segments.forEach((seg) => {
        const segEl = document.createElement("span");
        segEl.className = "seg" + (seg.className ? " " + seg.className : "");
        if (seg.onClick) {
          segEl.classList.add("clickable");
          segEl.addEventListener("click", seg.onClick);
        }
        fillWords(segEl, seg.text);
        block.appendChild(segEl);
      });
    } else {
      if (b.onClick) {
        block.classList.add("clickable");
        block.addEventListener("click", b.onClick);
      }
      fillWords(block, b.text);
    }
    container.appendChild(block);
  }
  left.appendChild(container);

  const slots = [...container.querySelectorAll(".slot")];

  // READ phase: pick a source char and measure rects (no writes in between).
  const plan = [];
  for (const slot of slots) {
    const ch = slot.textContent;
    if (ch === "\u00a0") continue;
    const srcIdx = takeFromPool(ch);
    if (srcIdx == null) {
      slot.style.color = "#1a1a1a";
      continue;
    }
    const src = bgSpans[srcIdx];
    plan.push({
      ch,
      src,
      srcSize: getComputedStyle(src).fontSize,
      sr: src.getBoundingClientRect(),
      tr: slot.getBoundingClientRect(),
    });
  }

  // WRITE phase 1: hide sources, spawn flyers at their source position,
  // already at the final size so the only thing that changes is position.
  plan.forEach((p) => {
    p.src.style.opacity = "0.22"; // leave a faint ghost where the letter was
    const flyer = document.createElement("span");
    flyer.className = "flyer";
    flyer.textContent = p.ch;
    flyer.style.fontSize = p.srcSize;
    flyer.style.left = p.sr.left + "px";
    flyer.style.top = p.sr.top + "px";
    flyer.style.transform = "translate(0, 0)";
    document.body.appendChild(flyer);
    p.flyer = flyer;
    active.push({ flyer, src: p.src });
  });

  // Force a reflow so the starting transform is committed.
  void document.body.offsetWidth;

  // WRITE phase 2: translate each flyer into formation.
  const n = plan.length;
  plan.forEach((p, i) => {
    const dx = p.tr.left - p.sr.left;
    const dy = p.tr.top - p.sr.top;
    p.flyer.style.transitionDelay = staggerDelay(i, n).toFixed(4) + "s";
    p.flyer.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  // Draw in decorative rails once formation has begun (CSS handles the timing).
  requestAnimationFrame(() => container.classList.add("in"));

  // Reflect how many letters are now out of the bank.
  updateBankCount();
}

document.querySelectorAll(".link").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.section;
    if (key === "projects") showProjects();
    else if (key === "contact") showContact();
    else {
      setPanel(key, "");
      formText(SECTIONS[key]);
    }
  });
});

// Default view on load: Overview. Wait for fonts/layout so flyer rects align.
window.addEventListener("load", () => {
  setPanel("overview", "");
  formText(SECTIONS.overview);
});

// Re-align on resize / browser zoom: flyers are viewport-fixed, so when the
// layout changes we clear them and re-form the current view from fresh rects.
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!currentView) return;
    active.forEach((a) => {
      a.flyer.remove();
      a.src.style.opacity = "";
    });
    active = [];
    busy = false;
    rebuildPool();
    currentView();
  }, 200);
});
