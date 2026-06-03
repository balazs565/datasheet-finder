/**
 * Generates 5 Chrome Web Store screenshot HTML pages (1280x800) that showcase
 * Datasheet Finder using the product's real design tokens and UI markup.
 *
 * Pipeline (see package.json "screenshots" script):
 *   node store-assets/gen-screenshots.mjs   → writes store-assets/html/*.html
 *   headless Edge/Chrome renders each to PNG
 *   PowerShell flattens to 24-bit PNG (no alpha), per store rules.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, 'html');
mkdirSync(outDir, { recursive: true });

/* ---------- shared styles (light theme tokens from src/styles/theme.css) ---------- */
const STYLE = `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --brand:#6366f1;--brand-strong:#4f46e5;--brand-soft:#818cf8;--brand-contrast:#fff;
  --gradient-brand:linear-gradient(135deg,#6366f1 0%,#8b5cf6 55%,#a855f7 100%);
  --gradient-brand-soft:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
  --tier-high:#16a34a;--tier-med:#d97706;--tier-low:#64748b;
  --surface:#fff;--surface-2:#f3f5fc;--border:#e3e7f2;--border-strong:#d3d9ea;
  --text:#0f172a;--text-muted:#5b6475;--text-subtle:#8a92a6;--input-bg:#fff;
  --radius-md:12px;--radius-pill:999px;
  --shadow-sm:0 1px 2px rgba(15,23,42,.06),0 1px 3px rgba(15,23,42,.04);
  --shadow-brand:0 8px 24px rgba(99,102,241,.28);
}
html,body{width:1280px;height:800px;font-family:'Segoe UI',system-ui,-apple-system,Arial,sans-serif;color:var(--text)}
body{display:flex;align-items:center;gap:64px;padding:0 84px;
  background:
    radial-gradient(120% 80% at 100% 0%,rgba(139,92,246,.18),transparent 60%),
    radial-gradient(110% 70% at 0% 100%,rgba(99,102,241,.16),transparent 55%),
    linear-gradient(135deg,#eef1f9 0%,#e6e9fb 100%);
  overflow:hidden}
.copy{width:560px;flex:none}
.eyebrow{display:inline-block;font-size:14px;font-weight:800;letter-spacing:.14em;
  text-transform:uppercase;color:var(--brand-strong);
  background:#eef2ff;border:1px solid #dfe3ff;padding:6px 12px;border-radius:999px;margin-bottom:22px}
.copy h1{font-size:52px;line-height:1.05;letter-spacing:-.02em;font-weight:800;margin-bottom:22px}
.copy h1 .grad{background:var(--gradient-brand);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.lead{font-size:19px;line-height:1.5;color:var(--text-muted);margin-bottom:26px;max-width:500px}
.bullets{list-style:none;display:flex;flex-direction:column;gap:14px}
.bullets li{display:flex;align-items:center;gap:12px;font-size:17px;font-weight:600;color:#26304a}
.tick{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;flex:none;
  border-radius:8px;background:var(--gradient-brand-soft);color:#fff;font-size:14px;font-weight:800;box-shadow:var(--shadow-brand)}
.brandline{display:flex;align-items:center;gap:12px;margin-top:38px;color:var(--text-subtle);font-weight:600;font-size:15px}

/* ---- device + popup ---- */
.stage{flex:none;position:relative}
.device{width:440px;border-radius:24px;background:var(--surface);
  box-shadow:0 30px 70px rgba(30,27,75,.30),0 6px 16px rgba(30,27,75,.18);
  border:1px solid #e7e9f5;overflow:hidden}
.pp-header{display:flex;align-items:center;justify-content:space-between;padding:15px 17px;border-bottom:1px solid var(--border);
  background:rgba(255,255,255,.8)}
.brand{display:flex;align-items:center;gap:11px}
.brand-mark{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;
  background:var(--gradient-brand);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--shadow-brand)}
.brand-name{font-size:16px;font-weight:800;background:var(--gradient-brand);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.gear{font-size:17px;opacity:.7}
.tabs{display:flex;gap:4px;margin:13px 15px 0;padding:4px;background:var(--surface-2);border:1px solid var(--border);border-radius:999px}
.tab{flex:1;text-align:center;font-size:13.5px;font-weight:700;padding:8px 10px;border-radius:999px;color:var(--text-muted)}
.tab.on{color:#fff;background:var(--gradient-brand-soft);box-shadow:var(--shadow-brand)}
.main{padding:15px}
.searchbox{display:flex;gap:8px}
.sb-input{flex:1;display:flex;align-items:center;gap:8px;background:var(--input-bg);border:1px solid var(--brand);
  border-radius:12px;padding:11px 12px;box-shadow:0 0 0 4px rgba(99,102,241,.18)}
.sb-input .ic{opacity:.65}
.sb-input .val{font-size:14.5px;color:var(--text);font-weight:500}
.btn{border:1px solid var(--border-strong);background:var(--surface);border-radius:12px;padding:0 14px;font-size:13.5px;font-weight:700;color:var(--text);display:flex;align-items:center}
.btn.primary{border:none;color:#fff;background:var(--gradient-brand-soft);box-shadow:var(--shadow-brand)}
.label{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--text-subtle);margin:16px 0 9px}
.opts{display:flex;flex-wrap:wrap;gap:8px}
.opt{display:inline-flex;align-items:center;gap:9px;padding:9px 13px;border-radius:999px;font-size:12.5px;font-weight:700;
  border:1px solid var(--border);background:var(--surface-2);color:var(--text-muted)}
.opt.on{color:#fff;background:var(--gradient-brand-soft);border-color:transparent;box-shadow:var(--shadow-brand)}
.opt .box{width:17px;height:17px;border-radius:5px;border:1.5px solid var(--border-strong);background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff}
.opt.on .box{background:var(--brand);border-color:var(--brand)}
.analysis{font-size:12.5px;color:var(--text-muted);margin:16px 2px 12px}
.analysis b{color:var(--text)}
.acc{display:flex;flex-direction:column;gap:10px}
.sec{border:1px solid var(--border);border-radius:12px;background:var(--surface);overflow:hidden;box-shadow:var(--shadow-sm)}
.sec-head{display:flex;align-items:center;gap:9px;padding:11px 13px;background:var(--surface-2);font-size:13px;font-weight:800}
.caret{font-size:10px;color:var(--text-muted)}
.caret.open{transform:rotate(90deg)}
.sec-title{flex:1}
.count{min-width:23px;height:21px;padding:0 8px;border-radius:999px;background:var(--gradient-brand-soft);color:#fff;font-size:12px;font-weight:800;display:inline-flex;align-items:center;justify-content:center}
.sec-body{padding:11px;display:flex;flex-direction:column;gap:9px}
.card{display:flex;gap:11px;padding:11px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);box-shadow:var(--shadow-sm)}
.logo{width:32px;height:32px;flex:none;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px}
.cbody{flex:1;min-width:0}
.ctitle{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ctitle .t{font-size:13.5px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.score{flex:none;font-size:11px;font-weight:800;padding:3px 8px;border-radius:999px;color:#fff}
.s-high{background:var(--tier-high)}.s-med{background:var(--tier-med)}.s-low{background:var(--tier-low)}
.cmeta{display:flex;align-items:center;gap:7px;margin-top:5px;font-size:11.5px;color:var(--text-subtle)}
.pill{font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;background:#eef2ff;color:#4338ca}
.dot{opacity:.5}
.cactions{display:flex;gap:6px;margin-top:9px}
.mini{font-size:11px;font-weight:700;color:var(--text);border:1px solid var(--border-strong);border-radius:8px;padding:4px 9px;background:var(--surface)}
.mini.star{color:#d97706;border-color:#f1d6a8;background:#fff8ec}
.hint{font-size:12.5px;color:var(--text-muted);background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 13px;line-height:1.5;margin-top:12px}
.ctx{position:absolute;top:150px;left:-54px;width:288px;background:#fff;border:1px solid #e2e6f2;border-radius:12px;
  box-shadow:0 22px 50px rgba(30,27,75,.30);overflow:hidden;font-size:13.5px}
.ctx .row{padding:11px 14px;display:flex;align-items:center;gap:10px;color:#1f2740}
.ctx .row.hi{background:#f1f4fd;font-weight:700;color:var(--brand-strong)}
.ctx .sep{height:1px;background:#eceef6}
.ctx .ico{width:18px;text-align:center;opacity:.8}
.note-card{border:1px solid var(--border);border-radius:12px;background:var(--surface);box-shadow:var(--shadow-sm);padding:14px;margin-top:4px}
.note-card h3{font-size:14px;margin-bottom:10px}
.field-lab{font-size:12px;font-weight:700;color:var(--text-muted);margin:0 0 6px}
.select{display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border-strong);border-radius:10px;padding:10px 12px;font-size:13.5px;font-weight:600}
.badges{display:flex;flex-direction:column;gap:9px;margin-top:12px}
.bd{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:#26304a}
.bd .k{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;background:#ecfdf3;color:#16a34a;font-size:14px;font-weight:900}
`;

/* ---------- markup helpers ---------- */
const logoColors = ['#2563eb', '#0ea5e9', '#7c3aed', '#0891b2', '#db2777'];
const card = (t, domain, src, score, cls, letter, ci) => `
<div class="card">
  <div class="logo" style="background:${logoColors[ci % logoColors.length]}">${letter}</div>
  <div class="cbody">
    <div class="ctitle"><span class="t">${t}</span><span class="score ${cls}">${score}</span></div>
    <div class="cmeta"><span>${domain}</span><span class="dot">·</span><span>${src}</span><span class="pill">PDF</span></div>
    <div class="cactions"><span class="mini">Open</span><span class="mini">Preview</span><span class="mini">Download</span><span class="mini star">★</span></div>
  </div>
</div>`;

const popupHead = `
<div class="pp-header"><div class="brand"><span class="brand-mark">DF</span><span class="brand-name">Datasheet Finder</span></div><span class="gear">⚙️</span></div>
<div class="tabs"><div class="tab on">Search</div><div class="tab">Favorites</div></div>`;

const searchBox = (val) => `
<div class="searchbox">
  <div class="sb-input"><span class="ic">🔎</span><span class="val">${val}</span></div>
  <div class="btn primary">Search</div><div class="btn">Detect</div>
</div>`;

const selector = `
<div class="label">Document types</div>
<div class="opts">
  <div class="opt on"><span class="box">✓</span>Datasheet PDF</div>
  <div class="opt on"><span class="box">✓</span>EU Declaration of Conformity (DoC) PDF</div>
</div>`;

const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${STYLE}</style></head><body>${body}</body></html>`;

const copy = (eyebrow, h1, lead, bullets, footer) => `
<div class="copy">
  ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}
  <h1>${h1}</h1>
  <p class="lead">${lead}</p>
  <ul class="bullets">${bullets.map((b) => `<li><span class="tick">✓</span>${b}</li>`).join('')}</ul>
  ${footer ? `<div class="brandline">${footer}</div>` : ''}
</div>`;

/* ---------- 5 scenes ---------- */
const scenes = {};

// 1 — hero: grouped accordion results
scenes['1-overview'] = page(
  copy(
    'New in 1.0',
    'Datasheets <span class="grad">&amp; EU Declarations of Conformity</span>',
    'Find official product PDFs by name. Pick the document types you need and get clean, grouped, ranked results in one click.',
    ['Search multiple document types at once', 'Results grouped into tidy sections', 'Official manufacturer PDFs ranked first'],
    'Chrome extension · free · no account',
  ) +
    `<div class="stage"><div class="device">${popupHead}
  <div class="main">
    ${searchBox('Brother MFC-L5715DN')}
    ${selector}
    <div class="analysis">Results for <b>Brother MFC-L5715DN</b> · Brother</div>
    <div class="acc">
      <div class="sec">
        <div class="sec-head"><span class="caret open">▶</span><span class="sec-title">Datasheets</span><span class="count">12</span></div>
        <div class="sec-body">
          ${card('MFC-L5715DN Datasheet.pdf', 'brother.com', 'Official', 96, 's-high', 'B', 0)}
          ${card('Technical Specifications.pdf', 'brother.com', 'Official', 88, 's-high', 'B', 0)}
        </div>
      </div>
      <div class="sec">
        <div class="sec-head"><span class="caret">▶</span><span class="sec-title">EU Declarations of Conformity</span><span class="count">4</span></div>
      </div>
    </div>
  </div></div></div>`,
);

// 2 — document type selector
scenes['2-doctypes'] = page(
  copy(
    'Document types',
    'Choose <span class="grad">what to look for</span>',
    'Tick one or both. Datasheet Finder runs each type with queries tuned for it — so a DoC search actually finds Declarations of Conformity.',
    ['Datasheet PDFs', 'EU Declaration of Conformity (DoC) PDFs', 'Easy to extend with new types'],
    'One search · grouped answers',
  ) +
    `<div class="stage"><div class="device">${popupHead}
  <div class="main">
    ${searchBox('Ubiquiti UniFi U6-Pro')}
    ${selector}
    <div class="hint">Pick document types above, paste a product name, use <b>Detect</b> to read the current page, or right-click selected text on any site.</div>
  </div></div></div>`,
);

// 3 — ranked results with confidence
scenes['3-ranked'] = page(
  copy(
    'Smart ranking',
    'Official sources, <span class="grad">ranked by confidence</span>',
    'Every result gets a 0–100 score. Manufacturer-hosted PDFs rise to the top; retailers and mirrors sink. Open, preview, download or star any one.',
    ['0–100 confidence score on every hit', 'Official manufacturer domains boosted', 'Open · Preview · Download · Favorite'],
    'Built-in PDF preview included',
  ) +
    `<div class="stage"><div class="device">${popupHead}
  <div class="main">
    ${searchBox('Synology DS923+')}
    <div class="analysis">Results for <b>Synology DS923+</b> · Synology</div>
    <div class="acc"><div class="sec"><div class="sec-head"><span class="caret open">▶</span><span class="sec-title">Datasheets</span><span class="count">9</span></div>
    <div class="sec-body">
      ${card('DS923+ Datasheet.pdf', 'synology.com', 'Official', 96, 's-high', 'S', 2)}
      ${card('DS923+ Hardware Spec.pdf', 'global.synology.com', 'Official', 84, 's-high', 'S', 2)}
      ${card('DS923 Product Overview.pdf', 'cdw.com', 'Retailer', 42, 's-med', 'C', 4)}
      ${card('synology-ds923.pdf', 'manualslib.com', 'Mirror', 31, 's-low', 'M', 3)}
    </div></div></div>
  </div></div></div>`,
);

// 4 — start from any page (right-click / detect)
scenes['4-detect'] = page(
  copy(
    'Anywhere you browse',
    'Start from <span class="grad">any page</span>',
    'Select a product name and right-click, let the extension auto-detect it from the page, or hit the keyboard shortcut. No copy-paste needed.',
    ['Right-click selected text to search', 'Auto-detect the product on a page', 'Shortcut: Ctrl/Cmd + Shift + F'],
    'Context menu · Detect · Shortcuts',
  ) +
    `<div class="stage">
  <div class="ctx">
    <div class="row"><span class="ico">🔎</span>Search the web</div>
    <div class="sep"></div>
    <div class="row hi"><span class="ico">📄</span>Find Datasheet for “MFC-L5715DN”</div>
    <div class="row"><span class="ico">🔍</span>Search Datasheet for “MFC-L5715DN”</div>
    <div class="sep"></div>
    <div class="row"><span class="ico">🖼️</span>Inspect</div>
  </div>
  <div class="device">${popupHead}
  <div class="main">
    ${searchBox('MFC-L5715DN')}
    ${selector}
    <div class="hint">Tip: highlight any model number on a product or distributor page, right-click, and choose <b>Find Datasheet</b>.</div>
  </div></div></div>`,
);

// 5 — free & private
scenes['5-private'] = page(
  copy(
    'Private by design',
    'Free, private, <span class="grad">no account</span>',
    'Works out of the box via DuckDuckGo — no API key, no sign-up. No analytics, no tracking. Your settings and history never leave your browser.',
    ['Free out of the box — no API key', 'No tracking, no analytics, no ads', 'Data stays in your browser'],
    'Optional SearXNG · Bing · Brave · Google',
  ) +
    `<div class="stage"><div class="device">${popupHead}
  <div class="main">
    <div class="note-card">
      <h3>Search provider</h3>
      <p class="field-lab">Preferred provider</p>
      <div class="select">DuckDuckGo (free, no key) <span style="opacity:.5">▾</span></div>
      <div class="badges">
        <div class="bd"><span class="k">✓</span>No API key or account required</div>
        <div class="bd"><span class="k">✓</span>No analytics or third-party tracking</div>
        <div class="bd"><span class="k">✓</span>Settings &amp; history stored locally</div>
      </div>
    </div>
    <div class="hint">Prefer your own backend? Add a free <b>SearXNG</b> URL, or paste Bing / Brave / Google keys — entirely optional.</div>
  </div></div></div>`,
);

for (const [name, html] of Object.entries(scenes)) {
  const file = resolve(outDir, `${name}.html`);
  writeFileSync(file, html, 'utf8');
  console.log('wrote', file);
}
console.log(`\n${Object.keys(scenes).length} screenshot pages generated in ${outDir}`);
