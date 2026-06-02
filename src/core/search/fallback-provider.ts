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

/** Human-friendly label for each generated query, by position. */
const LABELS = [
  'Datasheet PDF',
  'Spec sheet PDF',
  'Specifications PDF',
  'Technical specifications PDF',
  'Product brief PDF',
  'Any PDF (filetype:pdf)',
  'Manufacturer site — PDF',
  'Manufacturer site — datasheet',
];

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

    const tabs = queryStrings.map((q, i) => ({
      label: LABELS[i] ?? `Query ${i + 1}`,
      url: build(q),
    }));

    return { kind: 'open-tabs', tabs };
  },
};
