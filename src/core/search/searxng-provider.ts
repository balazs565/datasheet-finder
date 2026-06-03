import type { GeneratedQuery, SearchContext, Settings } from '../types';
import { rankResults, type RawResult } from '../ranking/ranker';
import { fetchJson, selectApiQueries } from './provider-base';
import type { SearchOutcome, SearchProvider } from './types';

interface SearxngResult {
  title: string;
  url: string;
  content?: string;
}
interface SearxngResponse {
  results?: SearxngResult[];
}

/** Map a SearXNG JSON payload to raw results. Pure → unit-testable. */
export function mapSearxngResults(data: SearxngResponse): RawResult[] {
  return (data.results ?? [])
    .filter((r) => r.url && r.title)
    .map((r) => ({ title: r.title, url: r.url, snippet: r.content || undefined }));
}

/** Normalize the configured instance URL (trim trailing slash). */
function normalizeBase(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/**
 * Free, self-hostable metasearch provider. Queries a SearXNG instance's JSON
 * API (`/search?q=…&format=json`). The instance URL is configured in Settings;
 * it works equally with a local (`http://localhost:8888`) or public instance.
 * No API key required.
 */
export const searxngProvider: SearchProvider = {
  id: 'searxng',
  label: 'SearXNG (free, self-hosted)',
  requiresApiKey: false,

  isConfigured(settings: Settings): boolean {
    return normalizeBase(settings.searxngUrl).length > 0;
  },

  async search(queries: GeneratedQuery[], ctx: SearchContext): Promise<SearchOutcome> {
    const base = normalizeBase(ctx.settings.searxngUrl);
    const selected = selectApiQueries(queries, 3);
    const raws: RawResult[] = [];

    for (const q of selected) {
      const url = `${base}/search?q=${encodeURIComponent(q.query)}&format=json`;
      const data = await fetchJson<SearxngResponse>(url, {}, 'searxng');
      raws.push(...mapSearxngResults(data));
    }

    return {
      kind: 'results',
      results: rankResults(raws, ctx.analysis, ctx.settings, 'searxng', ctx.docType),
    };
  },
};
