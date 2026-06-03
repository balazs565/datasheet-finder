/**
 * Generates the Chrome Web Store **marquee promo tile** (1400x560) for
 * Datasheet Finder, using the product's real design tokens.
 *
 *   node store-assets/gen-marquee.mjs   → store-assets/html/marquee.html
 *   then render at 1400x560 and flatten to 24-bit PNG (no alpha).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, 'html');
mkdirSync(outDir, { recursive: true });

const STYLE = `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --brand:#6366f1;--brand-strong:#4f46e5;--brand-soft:#818cf8;
  --gradient-brand-soft:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
  --tier-high:#16a34a;--tier-med:#d97706;
  --surface:#fff;--surface-2:#f3f5fc;--border:#e3e7f2;--border-strong:#d3d9ea;
  --text:#0f172a;--text-muted:#5b6475;--text-subtle:#8a92a6;
  --shadow-sm:0 1px 2px rgba(15,23,42,.06),0 1px 3px rgba(15,23,42,.04);
  --shadow-brand:0 8px 24px rgba(99,102,241,.28);
}
html,body{width:1400px;height:560px;font-family:'Segoe UI',system-ui,-apple-system,Arial,sans-serif}
body{position:relative;overflow:hidden;color:#fff;
  background:
    radial-gradient(120% 120% at 88% -10%,rgba(255,255,255,.25),transparent 45%),
    radial-gradient(90% 120% at 0% 110%,rgba(76,29,149,.55),transparent 55%),
    linear-gradient(125deg,#4f46e5 0%,#6d4adf 42%,#8b5cf6 70%,#a855f7 100%)}
/* faint dotted texture */
body::before{content:"";position:absolute;inset:0;opacity:.10;
  background-image:radial-gradient(rgba(255,255,255,.9) 1.3px,transparent 1.3px);
  background-size:26px 26px}

.left{position:absolute;left:84px;top:0;height:560px;width:780px;display:flex;flex-direction:column;justify-content:center;z-index:2}
.wordmark{display:flex;align-items:center;gap:14px;margin-bottom:30px}
.mark{width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;
  background:#fff;color:#5b21b6;font-weight:900;font-size:20px;box-shadow:0 10px 26px rgba(30,27,75,.35)}
.wm-name{font-size:25px;font-weight:800;letter-spacing:-.01em}
h1{font-size:60px;line-height:1.04;letter-spacing:-.025em;font-weight:800;margin-bottom:22px;text-shadow:0 2px 18px rgba(30,27,75,.25)}
h1 .hl{color:#fde68a}
.sub{font-size:22px;line-height:1.5;color:rgba(255,255,255,.92);max-width:620px;margin-bottom:30px}
.pills{display:flex;gap:12px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:700;color:#fff;
  background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.34);padding:10px 16px;border-radius:999px;
  backdrop-filter:blur(2px)}
.pill .d{width:9px;height:9px;border-radius:999px;background:#fde68a}
.foot{margin-top:30px;font-size:15px;font-weight:600;color:rgba(255,255,255,.8)}

/* floating popup on the right */
.stage{position:absolute;right:-26px;top:64px;transform:rotate(-4deg);z-index:1}
.device{width:452px;border-radius:24px;background:var(--surface);color:var(--text);
  box-shadow:0 40px 90px rgba(30,27,75,.45),0 10px 26px rgba(30,27,75,.30);
  border:1px solid #eceefb;overflow:hidden}
.pp-header{display:flex;align-items:center;justify-content:space-between;padding:15px 17px;border-bottom:1px solid var(--border)}
.brand{display:flex;align-items:center;gap:11px}
.brand-mark{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;
  background:var(--gradient-brand-soft);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--shadow-brand)}
.brand-name{font-size:16px;font-weight:800;color:var(--brand-strong)}
.gear{font-size:17px;opacity:.6}
.tabs{display:flex;gap:4px;margin:13px 15px 0;padding:4px;background:var(--surface-2);border:1px solid var(--border);border-radius:999px}
.tab{flex:1;text-align:center;font-size:13.5px;font-weight:700;padding:8px 10px;border-radius:999px;color:var(--text-muted)}
.tab.on{color:#fff;background:var(--gradient-brand-soft);box-shadow:var(--shadow-brand)}
.main{padding:15px}
.searchbox{display:flex;gap:8px}
.sb{flex:1;display:flex;align-items:center;gap:8px;border:1px solid var(--brand);border-radius:12px;padding:11px 12px;box-shadow:0 0 0 4px rgba(99,102,241,.16);font-size:14.5px;font-weight:500;color:var(--text)}
.btn{border:1px solid var(--border-strong);border-radius:12px;padding:0 14px;font-size:13.5px;font-weight:700;display:flex;align-items:center;color:var(--text)}
.btn.p{border:none;color:#fff;background:var(--gradient-brand-soft);box-shadow:var(--shadow-brand)}
.lab{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--text-subtle);margin:15px 0 9px}
.opts{display:flex;flex-wrap:wrap;gap:8px}
.opt{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border-radius:999px;font-size:12px;font-weight:700;color:#fff;background:var(--gradient-brand-soft);box-shadow:var(--shadow-brand)}
.opt .b{width:16px;height:16px;border-radius:5px;background:var(--brand);display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900}
.sec{border:1px solid var(--border);border-radius:12px;background:var(--surface);overflow:hidden;box-shadow:var(--shadow-sm);margin-top:13px}
.sh{display:flex;align-items:center;gap:9px;padding:11px 13px;background:var(--surface-2);font-size:13px;font-weight:800}
.caret{font-size:10px;color:var(--text-muted)}.caret.o{transform:rotate(90deg)}
.st{flex:1}
.count{min-width:23px;height:21px;padding:0 8px;border-radius:999px;background:var(--gradient-brand-soft);color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}
.body{padding:11px;display:flex;flex-direction:column;gap:9px}
.card{display:flex;gap:11px;padding:11px 12px;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-sm)}
.logo{width:32px;height:32px;border-radius:9px;background:#2563eb;color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}
.cb{flex:1;min-width:0}
.ct{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ct .t{font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.score{font-size:11px;font-weight:800;padding:3px 8px;border-radius:999px;color:#fff;background:var(--tier-high)}
.cm{display:flex;align-items:center;gap:7px;margin-top:5px;font-size:11.5px;color:var(--text-subtle)}
.tag{font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;background:#eef2ff;color:#4338ca}
`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${STYLE}</style></head><body>
  <div class="left">
    <div class="wordmark"><span class="mark">DF</span><span class="wm-name">Datasheet Finder</span></div>
    <h1>Every datasheet.<br>Now every <span class="hl">EU DoC</span> too.</h1>
    <p class="sub">Find official product PDFs by name — datasheets and EU Declarations of Conformity — grouped, ranked, in one click.</p>
    <div class="pills">
      <span class="pill"><span class="d"></span>Datasheets</span>
      <span class="pill"><span class="d"></span>EU Declarations of Conformity</span>
      <span class="pill"><span class="d"></span>Free &amp; private</span>
    </div>
    <div class="foot">Free · no account · no tracking</div>
  </div>

  <div class="stage"><div class="device">
    <div class="pp-header"><div class="brand"><span class="brand-mark">DF</span><span class="brand-name">Datasheet Finder</span></div><span class="gear">⚙️</span></div>
    <div class="tabs"><div class="tab on">Search</div><div class="tab">Favorites</div></div>
    <div class="main">
      <div class="searchbox"><div class="sb"><span>🔎</span><span>Brother MFC-L5715DN</span></div><div class="btn p">Search</div><div class="btn">Detect</div></div>
      <div class="lab">Document types</div>
      <div class="opts"><span class="opt"><span class="b">✓</span>Datasheet PDF</span><span class="opt"><span class="b">✓</span>EU Declaration of Conformity (DoC) PDF</span></div>
      <div class="sec"><div class="sh"><span class="caret o">▶</span><span class="st">Datasheets</span><span class="count">12</span></div>
        <div class="body">
          <div class="card"><div class="logo">B</div><div class="cb"><div class="ct"><span class="t">MFC-L5715DN Datasheet.pdf</span><span class="score">96</span></div><div class="cm"><span>brother.com</span><span>·</span><span>Official</span><span class="tag">PDF</span></div></div></div>
          <div class="card"><div class="logo">B</div><div class="cb"><div class="ct"><span class="t">Technical Specifications.pdf</span><span class="score">88</span></div><div class="cm"><span>brother.com</span><span>·</span><span>Official</span><span class="tag">PDF</span></div></div></div>
        </div>
      </div>
      <div class="sec"><div class="sh"><span class="caret">▶</span><span class="st">EU Declarations of Conformity</span><span class="count">4</span></div></div>
    </div>
  </div></div>
</body></html>`;

const file = resolve(outDir, 'marquee.html');
writeFileSync(file, html, 'utf8');
console.log('wrote', file);
