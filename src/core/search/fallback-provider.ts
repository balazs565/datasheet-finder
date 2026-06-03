import type { FallbackEngine, GeneratedQuery, SearchContext, Settings } from '../types';
import { buildPlainQueries } from '../ai/query-builder';
import type { SearchOutcome, SearchProvider } from './types';

/** Map an engine id to its search-results URL builder. */
const ENGINE_URL: Record<FallbackEngine, (q: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  brave: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
};

/**
 * Derive a human-friendly label from a query by stripping the product name and
 * tidying the remaining search operators — works for any document type rather
 * than relying on a fixed positional list.
 */
function labelForQuery(query: string, productName: string): string {
  let rest = query;
  if (productName) rest = rest.split(productName).join(' ');
  rest = rest.replace(/\s+/g, ' ').trim();
  rest = rest.replace(/filetype:pdf/gi, 'PDF');
  rest = rest.replace(/^site:(\S+)\s*/i, 'On $1 — ');
  rest = rest.trim().replace(/\s+pdf$/i, ' PDF');
  if (!rest) return 'Any PDF';
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

/**
 * Zero-config provider. Requires no API key: it turns each generated query
 * into an "open in a new tab" link on the user's chosen search engine.
 * This keeps the extension fully usable out of the box.
 */
export const fallbackProvider: SearchProvider = {
  id: 'fallback',
  label: 'Open in browser (no API key)',
  requiresApiKey: false,

  isConfigured(_settings: Settings): boolean {
    return true;
  },

  async search(queries: GeneratedQuery[], ctx: SearchContext): Promise<SearchOutcome> {
    const engine = ctx.settings.fallbackEngine;
    const build = ENGINE_URL[engine] ?? ENGINE_URL.google;

    // Prefer the structured queries; fall back to plain variants if empty.
    const queryStrings =
      queries.length > 0 ? queries.map((q) => q.query) : buildPlainQueries(ctx.analysis);

    const productName = ctx.analysis.normalized.trim();
    const tabs = queryStrings.map((q) => ({
      label: labelForQuery(q, productName),
      url: build(q),
    }));

    return { kind: 'open-tabs', tabs };
  },
};
