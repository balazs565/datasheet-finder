# Store assets

Marketing screenshots for the Chrome Web Store listing.

## `screenshots/` — upload these

Five **1280×800, 24‑bit PNG (no alpha)** images, matching the store's rules
(max 5, 1280×800 or 640×400, JPEG or 24‑bit PNG without alpha):

| File | Shows |
| --- | --- |
| `1-overview.png` | Hero — grouped Datasheet + EU DoC results |
| `2-doctypes.png` | The document‑type selector |
| `3-ranked.png` | Confidence‑ranked results |
| `4-detect.png` | Right‑click / detect from any page |
| `5-private.png` | Free & private (no key, no tracking) |

## Regenerating

The images are built from the product's real design tokens, so they stay
on‑brand.

1. **Generate the HTML pages** (cross‑platform):

   ```bash
   node store-assets/gen-screenshots.mjs   # → store-assets/html/*.html
   ```

2. **Render + flatten to compliant PNGs** (Windows, uses headless Edge/Chrome +
   System.Drawing — no installs). Run in PowerShell:

   ```powershell
   ./store-assets/render.ps1
   ```

   Output lands in `store-assets/screenshots/`. The intermediate
   `store-assets/html/` and `store-assets/raw/` folders are git‑ignored.

> On macOS/Linux, render the `html/*.html` files at a 1280×800 viewport with any
> headless browser and export as JPEG (no alpha) instead.
