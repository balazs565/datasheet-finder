import type { RawResult } from '../ranking/ranker';

/**
 * Background-tab search.
 *
 * DuckDuckGo (and most engines) return HTTP 403 to extension `fetch()` calls
 * because the request looks automated (no real browser headers / Sec-Fetch
 * context). To get results reliably and for free, we instead perform a *real
 * browser navigation*: open the results page in a background tab, let it render,
 * scrape the live DOM via `chrome.scripting`, then close the tab. The engine
 * serves it normally because it is an ordinary page load.
 *
 * A single background tab is reused for all queries in one search to minimize
 * the visible flash.
 */

/** Build the DuckDuckGo results URL for a query. */
function ddgUrl(query: string): string {
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
}

/**
 * Function injected into the results page. Must be fully self-contained (it is
 * serialized and run in the page), so the DDG redirect-decoding logic is
 * duplicated here from `duckduckgo-provider.ts`. Polls until results render,
 * then returns up to `max` scraped rows.
 */
function scrapePage(max: number): Promise<{ title: string; url: string; snippet?: string }[]> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const resolveHref = (raw: string): string | null => {
    if (!raw) return null;
    try {
      const u = new URL(raw, location.href);
      const uddg = u.searchParams.get('uddg');
      if (uddg) return decodeURIComponent(uddg);
      if (u.hostname.endsWith('duckduckgo.com')) return null; // ad/redirect noise
      return u.toString();
    } catch {
      return null;
    }
  };

  const collect = () => {
    const rows = document.querySelectorAll(
      'article[data-testid="result"], li[data-layout="organic"], .result, .web-result',
    );
    const out: { title: string; url: string; snippet?: string }[] = [];
    const seen = new Set<string>();
    rows.forEach((row) => {
      const link = row.querySelector<HTMLAnchorElement>(
        'a[data-testid="result-title-a"], a.result__a, h2 a, h3 a',
      );
      if (!link) return;
      const url = resolveHref(link.getAttribute('href') ?? link.href ?? '');
      if (!url || seen.has(url)) return;
      const title = (link.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (!title) return;
      const snEl = row.querySelector('[data-testid="result-snippet"], .result__snippet');
      const snippet = (snEl?.textContent ?? '').replace(/\s+/g, ' ').trim();
      seen.add(url);
      out.push({ title, url, snippet: snippet || undefined });
    });
    return out;
  };

  return (async () => {
    const deadline = Date.now() + 8000;
    let results = collect();
    while (results.length === 0 && Date.now() < deadline) {
      await sleep(300);
      results = collect();
    }
    return results.slice(0, max);
  })();
}

/** Resolve once the given tab has finished loading (or after a timeout). */
function waitForLoad(tabId: number, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Results page took too long to load'));
    }, timeoutMs);

    const onUpdated = (id: number, info: chrome.tabs.TabChangeInfo) => {
      if (id === tabId && info.status === 'complete') {
        cleanup();
        resolve();
      }
    };
    const cleanup = () => {
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };

    chrome.tabs.onUpdated.addListener(onUpdated);
    // Guard against the 'complete' event having fired before we attached.
    chrome.tabs.get(tabId).then((t) => {
      if (t.status === 'complete') {
        cleanup();
        resolve();
      }
    });
  });
}

async function scrapeTab(tabId: number, max: number): Promise<RawResult[]> {
  await waitForLoad(tabId);
  const injection = await chrome.scripting.executeScript({
    target: { tabId },
    func: scrapePage,
    args: [max],
  });
  const rows = (injection[0]?.result as RawResult[] | undefined) ?? [];
  return rows;
}

/**
 * Run one or more queries through a single reused background tab and return the
 * combined raw results. The tab is always closed afterward.
 */
export async function searchViaBackgroundTab(
  queries: string[],
  maxPerQuery = 12,
): Promise<RawResult[]> {
  if (!chrome.tabs?.create || !chrome.scripting?.executeScript) {
    throw new Error('Background-tab search requires tabs + scripting permissions');
  }
  if (queries.length === 0) return [];

  const tab = await chrome.tabs.create({ url: ddgUrl(queries[0]), active: false });
  const tabId = tab.id;
  if (tabId === undefined) throw new Error('Could not open a background tab');

  const all: RawResult[] = [];
  try {
    all.push(...(await scrapeTab(tabId, maxPerQuery)));
    for (let i = 1; i < queries.length; i++) {
      await chrome.tabs.update(tabId, { url: ddgUrl(queries[i]) });
      all.push(...(await scrapeTab(tabId, maxPerQuery)));
    }
  } finally {
    chrome.tabs.remove(tabId).catch(() => undefined);
  }
  return all;
}
