# Installing Datasheet Finder (for colleagues)

This is a Chrome extension that finds official datasheets and spec-sheet PDFs for
products. It's distributed as a zip you load directly into Chrome — **no account,
no API key, nothing to pay**.

> Works in Chrome, Edge, Brave, and other Chromium-based browsers.

## Install (about 1 minute)

1. **Unzip** `datasheet-finder-vX.X.X.zip`. You'll get a folder named
   `datasheet-finder` (it contains a `manifest.json` file). Put it somewhere
   permanent — e.g. `Documents\datasheet-finder` — and **don't delete it**, as
   Chrome loads the extension from this folder.
2. Open Chrome and go to **`chrome://extensions`** (type it in the address bar).
3. Turn on **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** (top-left).
5. Select the unzipped **`datasheet-finder`** folder.
6. Done — the **DF** icon appears in your toolbar. Click the puzzle-piece icon
   and **pin** it so it's always visible.

## Using it

- Click the **DF** icon, type or paste a product name (e.g. `Brother MFC-L5715DN`),
  press **Search**.
- Or select a product name on any web page, **right-click → Find Datasheet**.
- Or click **Detect** to read the product from the page you're on.
- Each result has **Open / Preview / Copy URL / Download** and a ⭐ to save it to
  **Favorites**. Your last results stay until you hit **Clear**.

> A small background tab may briefly open and close while it searches — that's
> normal (it's how it reads results for free).

## Good to know

- **Keep the folder.** If you move or delete it, the extension stops working.
  Just re-run *Load unpacked* if that happens.
- **"Disable developer-mode extensions" popup:** Chrome shows this on some
  startups because the extension was loaded manually (not from the Web Store).
  Click **Cancel / Keep** — it's expected and safe.
- **Updates:** when a new zip is shared, unzip it over the same folder (replace
  the files), then on `chrome://extensions` click the **↻ reload** icon on the
  Datasheet Finder card.

## Troubleshooting

- *Nothing happens / no results:* it automatically falls back to opening the
  search queries in new tabs. You can also try a more specific model number.
- *"Manifest error" on load:* make sure you selected the folder that directly
  contains `manifest.json` (the inner `datasheet-finder` folder), not its parent.
