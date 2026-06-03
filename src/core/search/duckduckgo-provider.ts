import type { GeneratedQuery, SearchContext, Settings } from '../types';
import { rankResults, type RawResult } from '../ranking/ranker';
import { selectApiQueries } from './provider-base';
import { SearchProviderError } from './types';
import { searchViaBackgroundTab } from './tab-search';
import type { SearchOutcome, SearchProvider } from './types';

/**
 * Resolve a DuckDuckGo result href to the real destination URL.
 *
 * DDG wraps outbound links as `//duckduckgo.com/l/?uddg=<encoded-url>&rut=…`.
 * We decode the `uddg` parameter. Direct (non-redirect) hrefs are returned
 * as-is (with a protocol added for protocol-relative links).
 */
export function resolveDdgHref(href: string): string | null {
  if (!href) return null;
  let normalized = href.trim();
  if (normalized.startsWith('//')) normalized = `https:${normalized}`;

  try {
    const u = new URL(normalized, 'https://duckduckgo.com');
    const uddg = u.searchParams.get('uddg');
    if (uddg) return decodeURIComponent(uddg);
    // Ignore DDG's own ad/feedback links; keep real external results.
    if (u.hostname.endsWith('duckduckgo.com')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Parse the DuckDuckGo HTML results page into raw results. Pure (takes the
 * HTML string), so it is unit-testable without any network access.
 */
export function parseDuckDuckGoHtml(html: string): RawResult[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('.result, .web-result');
  const out: RawResult[] = [];

  rows.forEach((row) => {
    const link = row.querySelector<HTMLAnchorElement>('a.result__a');
    if (!link) return;
    const url = resolveDdgHref(link.getAttribute('href') ?? '');
    if (!url) return;
    const title = (link.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!title) return;
    const snippetEl = row.querySelector('.result__snippet');
    const snippet = (snippetEl?.textContent ?? '').replace(/\s+/g, ' ').trim();
    out.push({ title, url, snippet: snippet || undefined });
  });

  return out;
}

/**
 * Free, zero-config default provider.
 *
 * Instead of `fetch()` (which DuckDuckGo blocks with HTTP 403), this performs a
 * real browser navigation in a background tab and scrapes the rendered results
 * — see {@link searchViaBackgroundTab}. No API key, no account, nothing to
 * install.
 *
 * Sends only the top 1–2 queries per search to keep the background tab quick.
 *
 * `parseDuckDuckGoHtml` / `resolveDdgHref` above remain exported for unit tests
 * and document the same parsing logic that the injected scraper applies live.
 */
export const duckduckgoProvider: SearchProvider = {
  id: 'duckduckgo',
  label: 'DuckDuckGo (free, no key)',
  requiresApiKey: false,

  isConfigured(_settings: Settings): boolean {
    return true;
  },

  async search(queries: GeneratedQuery[], ctx: SearchContext): Promise<SearchOutcome> {
    const selected = selectApiQueries(queries, 2).map((q) => q.query);
    try {
      const raws = await searchViaBackgroundTab(selected);
      return {
        kind: 'results',
        results: rankResults(raws, ctx.analysis, ctx.settings, 'duckduckgo', ctx.docType),
      };
    } catch (err) {
      throw err instanceof SearchProviderError
        ? err
        : new SearchProviderError(
            `DuckDuckGo search failed: ${(err as Error).message}`,
            'duckduckgo',
            err,
          );
    }
  },
};
