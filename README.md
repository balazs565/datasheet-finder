# Datasheet Finder

A polished **Chrome Extension (Manifest V3)** that helps you find official
datasheets, spec sheets, technical PDFs, product briefs, and manuals for any
product — straight from the browser.

Built with **TypeScript + React 18 + Vite** and a clean, modular architecture.

---

## ✨ Features

- **Multiple entry points**
  - Select text on any page → right‑click → **Find Datasheet** / **Search Datasheet**
  - Paste a product name in the popup
  - **Detect** the product from the current page automatically
- **AI‑assisted query building** — normalizes the product name, removes noise,
  detects the manufacturer, and generates optimized queries:
  ```
  "Brother MFC-L5715DN" datasheet pdf
  "Brother MFC-L5715DN" spec sheet pdf
  "Brother MFC-L5715DN" specifications pdf
  "Brother MFC-L5715DN" technical specifications pdf
  "Brother MFC-L5715DN" product brief pdf
  "Brother MFC-L5715DN" filetype:pdf
  site:brother.com "Brother MFC-L5715DN" pdf
  site:brother.com "Brother MFC-L5715DN" datasheet
  ```
- **Smart manufacturer detection** for Dell, HP, HPE, Lenovo, Cisco, Synology,
  Brother, Canon, ASUS, Acer, MSI, Samsung, LG, Intel, AMD, MikroTik, Ubiquiti,
  TP‑Link, QNAP, Fortinet, APC, Epson — plus an **extendable mapping** you can
  add to in Settings.
- **Free, zero‑install search** — works out of the box via **DuckDuckGo** (no
  key, no account, nothing to run). Pluggable providers also support **SearXNG**
  (free, self‑hosted or public) and optional paid APIs.
- **Result ranking & confidence score** — official manufacturer PDFs rank
  highest; retailer/mirror PDFs rank lower. Each result shows a 0–100 score.
- **PDF preview** — open in a new tab, in the built‑in viewer, copy the URL, or
  download.
- **Search history**, **favorites**, **CSV export**, **keyboard shortcuts**,
  **manufacturer logos**, and **light/dark/system themes**.

---

## 🔌 Search modes — all free, no API key required

| Provider | Setup | Behavior |
| --- | --- | --- |
| **DuckDuckGo** (default) | **None** — works on install | Opens a quick **background tab** to load DuckDuckGo, scrapes the rendered results, closes the tab, and shows them **ranked** in the popup with confidence scores. No key, no account, nothing to install. |
| **SearXNG** (optional) | Paste an instance URL in Settings | Queries a [SearXNG](https://docs.searxng.org/) instance's JSON API (local or public). Free, no key. The most robust free option. |
| **Open in browser** (fallback) | None | Each generated query opens in a new tab on your chosen engine. Always works — the safety net if a provider is down. |
| **Bing / Brave / Google** (legacy) | Requires a paid/registered key | Only for users who already hold keys. See below. |

> **Why no Google/Bing keys by default?** As of 2026 the Bing Search API is
> retired, Google's Custom Search API is closed to new sign‑ups, and Brave's
> free tier now requires a credit card. DuckDuckGo + SearXNG keep this extension
> genuinely free.

### How the DuckDuckGo provider works (and its limits)

Search engines return **HTTP 403** to extension `fetch()` calls (the request
looks automated). To get results for free anyway, the provider does a *real
browser navigation*: it opens DuckDuckGo in a **background tab**, lets the page
render, scrapes the live DOM, then closes the tab. Because it's an ordinary page
load, DuckDuckGo serves it normally.

Trade-offs / notes:

- You'll see a tab briefly open and close in the background during a search.
- It reads the rendered results DOM, so a DuckDuckGo markup change could require
  a small selector update (the scraper already tries several selectors).
- If it ever returns nothing, the extension **automatically falls back** to the
  open-in-tabs mode (no error), and you can point the **SearXNG URL** at an
  instance for a stable JSON API.

### Using SearXNG (optional, most robust free option)

SearXNG is a free, open‑source metasearch engine. You can either use a public
instance or run your own.

1. Get an instance URL — e.g. a public instance from
   [searx.space](https://searx.space/), or run your own.
   > Note: the instance must have the **JSON format enabled**
   > (`search.formats: [html, json]` in its `settings.yml`). Many do; some public
   > ones don't.
2. In **Settings → Search provider**, paste the URL into **SearXNG instance URL**
   and click **Save**. Approve the one‑time permission prompt for that domain.
3. Set **Preferred provider** to **SearXNG**.

---

## 🚀 Build & install

> Requires **Node 18+** and **npm**.

```bash
npm install        # install dependencies
npm run build      # type-check + bundle to dist/
```

Then load it in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the generated **`dist/`** folder

### Development (hot reload)

```bash
npm run dev
```

`@crxjs/vite-plugin` serves the extension with HMR. Load the `dist/` folder once;
changes reload automatically.

### Other scripts

```bash
npm test           # run unit tests (vitest)
npm run lint       # eslint
npm run format     # prettier
npm run package    # build + zip into releases/datasheet-finder-vX.X.X.zip
```

## 📦 Sharing with colleagues (no Web Store needed)

```bash
npm run package
```

This produces `releases/datasheet-finder-vX.X.X.zip`. Send that zip **plus
[INSTALL.md](INSTALL.md)** to colleagues — they unzip it and use *Load unpacked*
at `chrome://extensions` (Developer mode on). No account, key, or payment.

To ship an update: bump `version` in `package.json` and `src/manifest.config.ts`,
run `npm run package` again, and share the new zip (they replace the folder and
hit the ↻ reload icon).

---

## 🔑 Paid API keys (optional — not needed)

You can ignore this section entirely; the free providers above cover normal use.
If you already hold keys, open **Settings** (gear icon in the popup) and pick a
provider:

- **Bing Web Search** — create a *Bing Search v7* resource in the Azure portal
  and paste its subscription key.
- **Brave Search** — get an API token from the
  [Brave Search API](https://brave.com/search/api/) dashboard.
- **Google Custom Search** — create an API key in Google Cloud and a
  [Programmable Search Engine](https://programmablesearchengine.google.com/)
  to get the **Search Engine ID (cx)**. Enter both.

Keys are stored in `chrome.storage.sync` and are never sent anywhere except the
provider’s official REST endpoint.

---

## ⌨️ Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + Shift + D` | Open Datasheet Finder |
| `Ctrl/Cmd + Shift + F` | Find datasheet for the current selection |

(Configurable at `chrome://extensions/shortcuts`.)

---

## 🏗️ Architecture

```
src/
├─ manifest.config.ts         # typed MV3 manifest (@crxjs)
├─ background/                # service worker: context menus, commands, routing
├─ content/                  # on-page product detection
├─ popup/                    # popup React app (search, results, favorites)
├─ options/                  # settings page (providers, keys, theme, mfr editor)
├─ viewer/                   # in-extension PDF viewer
├─ components/               # reusable presentational components
├─ hooks/                    # React hooks wrapping core (settings/history/…)
├─ core/                     # framework-agnostic, unit-tested business logic
│  ├─ ai/                    # normalizer, manufacturer map + detect, query builder
│  ├─ search/                # SearchProvider abstraction + providers + registry
│  ├─ ranking/               # confidence scoring & tiering
│  ├─ storage/               # settings / history / favorites (Chrome Storage)
│  ├─ export/                # CSV export
│  ├─ util/                  # url / favicon / actions helpers
│  └─ messaging/             # typed message contracts
└─ styles/                   # theme tokens + global + component CSS
```

### Search provider abstraction

Every backend implements one interface (`src/core/search/types.ts`):

```ts
interface SearchProvider {
  id: ProviderId;
  label: string;
  requiresApiKey: boolean;
  isConfigured(settings): boolean;
  search(queries, ctx): Promise<SearchOutcome>;
}
```

To **add a provider**: implement the interface in a new file under
`src/core/search/`, then register it in `provider-registry.ts`. API keys flow in
through `Settings.apiKeys` — nothing is hardcoded.

### Extending the manufacturer registry

- **Permanently:** add an entry to `BUILTIN_MANUFACTURERS` in
  `src/core/ai/manufacturer-map.ts` (name, domain, aliases, optional model
  prefixes).
- **At runtime:** Settings → *Manufacturer mapping* → add a brand → domain.
  Stored in `settings.customManufacturers` and merged over the built‑ins.

### Ranking

`src/core/ranking/ranker.ts` assigns a 0–100 confidence and a source tier:

- **High (80–100):** official manufacturer‑domain PDF, datasheet/spec keywords
- **Medium (50–79):** official manuals / product briefs
- **Low (<50):** retailer/mirror domains, non‑PDF

Deterministic and fully unit‑tested.

---

## 🧪 Tests

Core logic (normalizer, manufacturer detection, query builder, ranker, CSV) is
covered by `vitest`:

```bash
npm test
```

---

## 📦 Tech stack

- Manifest V3, service worker
- TypeScript (strict) · React 18 · Vite 5 · `@crxjs/vite-plugin`
- Chrome Storage API (`sync` for settings, `local` for history/favorites)
- Vitest for unit tests

## 📄 License

MIT
