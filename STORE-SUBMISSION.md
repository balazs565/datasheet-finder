# Chrome Web Store submission notes

Reference for filling out the Developer Dashboard listing. Copy/paste the
justification strings into the matching fields.

## Packaging (what to upload)

Upload a **ZIP of the built `dist/` folder**, not the source. Reviewers run the
uploaded code as-is; they do **not** build your project.

```bash
npm install
npm run package:store   # builds, then zips dist/ with manifest.json at the ROOT
```

Upload `releases/datasheet-finder-v<version>-store.zip`. The Web Store requires
`manifest.json` at the **top level** of the zip — `package:store` produces that.

> ⚠️ Do **not** upload the `npm run package` zip to the store — that one nests
> everything under a `datasheet-finder/` folder (for "Load unpacked" sharing) and
> the store will reject it with "Manifest file is missing or unreadable".

> Bump `version` in **both** `package.json` and `src/manifest.config.ts` before
> each new upload, then re-run `npm run package`.

## Single purpose (required field)

> Find official datasheets, manuals, technical PDFs, and EU Declarations of
> Conformity for a product by name.

## Permission justifications (required per item)

**activeTab**
> Used only when the user clicks "Detect" to read the current page's title and
> selection to suggest a product name, and to load search results. The extension
> does not access pages until the user invokes it.

**scripting**
> Injects a read-only detector into the active tab on demand (gated by
> activeTab) to extract a candidate product name, and reads the chosen search
> engine's results page. No code is ever fetched or run from a remote source.

**contextMenus**
> Adds a right-click "Find Datasheet for ‘…’" option on selected text.

**downloads**
> Saves a PDF or exports a CSV of results when the user clicks Download/Export.

**storage**
> Stores user settings, search history, and favorites locally in the browser.

**Host permission — duckduckgo.com / html.duckduckgo.com / lite.duckduckgo.com**
> The default, free search backend. The extension loads the DuckDuckGo results
> page for the user's query and reads the rendered results to display them.

**Host permission — api.bing.microsoft.com / api.search.brave.com / www.googleapis.com**
> Optional alternative search providers, used only if the user enters their own
> API key for that provider in Settings.

**Optional host permission — http://*/* and https://*/* (requested at runtime)**
> Requested only if the user configures a self-hosted/public SearXNG instance
> URL, so the extension can query that specific instance. Not granted on install.

## Remote code

> No. The extension contains no remote code. All scripts are bundled; nothing is
> fetched and executed (`eval`, remote `<script>`, etc. are not used).

## Data usage disclosures (Privacy practices tab)

- **What you collect:** the extension does **not** collect data for the
  developer. The user's search query is transmitted to the user-selected search
  provider solely to return results.
- Check **"Web history"** / **"User activity"** only to the extent the search
  query reflects user input sent to the chosen provider; the extension itself
  performs no analytics or tracking.
- Certify: data is **not** sold, **not** used for unrelated purposes, and **not**
  used for creditworthiness/lending.
- **Privacy policy URL:** host `PRIVACY.md` at a public URL (e.g. GitHub raw or
  Pages) and paste the link.

## Pre-submit checklist

- [ ] `npm run build` succeeds and `dist/manifest.json` is correct
- [ ] Version bumped in `package.json` **and** `src/manifest.config.ts`
- [ ] `dist/` zipped (via `npm run package`)
- [ ] Privacy policy published at a public URL
- [ ] Screenshots (1280×800 or 640×400) and store icon (128×128) prepared
- [ ] Permission justifications pasted from this file
