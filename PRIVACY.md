# Privacy Policy — Datasheet Finder

_Last updated: 2026-06-03_

Datasheet Finder is a browser extension that helps you find official datasheets,
spec sheets, manuals, technical PDFs, and EU Declarations of Conformity for
products. This policy explains exactly what data the extension handles and where
it goes.

**Summary: the extension has no backend server, no account, and no analytics or
tracking. We never collect, store, or transmit your data to the developer. Your
search terms are sent only to the search provider you choose, in order to return
results.**

## What the extension processes

- **Your search query** — the product name you type, paste, select on a page, or
  that is detected from the current page when you press **Detect**.
- **The current page (only when you press Detect)** — the extension reads the
  page title, `<h1>`, and `og:title`/meta tags and your current text selection to
  suggest a product name. This happens on demand only, never automatically, and
  the page content is never sent anywhere except as part of a search query you
  initiate.
- **Your settings** — preferred search provider, theme, manufacturer mappings,
  and any optional API keys you enter.
- **Local history & favorites** — recent searches and PDFs you star.

## Where data goes

The extension talks only to the search service **you select** in Settings:

- **DuckDuckGo (default):** your query is submitted to DuckDuckGo to load and read
  its results page. Subject to [DuckDuckGo's privacy policy](https://duckduckgo.com/privacy).
- **Bing / Brave / Google (optional, legacy):** only if you enter an API key; your
  query is sent to that provider's official API.
- **Favicons:** to show a small site icon next to each result, the extension
  requests favicons from Google's public favicon service
  (`https://www.google.com/s2/favicons`), which receives the **domain** of each
  result (not your search terms or browsing history).

The extension sends **no data to the developer** and uses **no third-party
analytics, advertising, or tracking**.

## Where data is stored

All stored data stays in your browser via the Chrome Storage API:

- **Settings** (including any API keys) are stored in `chrome.storage.sync`, so
  they may sync across your signed-in Chrome profiles via Google's account sync.
  They are never sent anywhere else.
- **Search history, favorites, and the last result set** are stored in
  `chrome.storage.local` on your device only.

You can clear history and favorites from within the extension at any time.
Uninstalling the extension removes all locally stored data.

## Permissions and why they are needed

- **activeTab + scripting** — to read a product name from the page **only when you
  press Detect**, and to load search results. The extension does not run on pages
  until you invoke it.
- **contextMenus** — the right-click "Find Datasheet" entry.
- **downloads** — to save a PDF or export a CSV when you click Download/Export.
- **storage** — to save settings, history, and favorites (as described above).
- **Host access** to DuckDuckGo and the optional provider APIs — to fetch search
  results.

## Children

The extension is a general-purpose utility and is not directed at children.

## Changes

Material changes to this policy will be reflected in the extension's listing and
in this file's "Last updated" date.

## Contact

Questions about this policy can be raised via the project's GitHub repository:
<https://github.com/balazs565/datasheet-finder>.
