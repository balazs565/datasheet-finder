import type { GeneratedQuery, SearchContext, Settings } from '../types';
import { rankResults, type RawResult } from '../ranking/ranker';
import { fetchJson, selectApiQueries } from './provider-base';
import type { SearchOutcome, SearchProvider } from './types';

interface BraveWebResult {
  title: string;
  url: string;
  description?: string;
}
interface BraveResponse {
  web?: { results: BraveWebResult[] };
}

const ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';

/** Brave Search API provider. Requires an `X-Subscription-Token`. */
export const braveProvider: SearchProvider = {
  id: 'brave',
  label: 'Brave Search',
  requiresApiKey: true,

  isConfigured(settings: Settings): boolean {
    return settings.apiKeys.brave.trim().length > 0;
  },

  async search(queries: GeneratedQuery[], ctx: SearchContext): Promise<SearchOutcome> {
    const key = ctx.settings.apiKeys.brave.trim();
    const selected = selectApiQueries(queries, 3);
    const raws: RawResult[] = [];

    for (const q of selected) {
      const url = `${ENDPOINT}?q=${encodeURIComponent(q.query)}&count=10`;
      const data = await fetchJson<BraveResponse>(
        url,
        {
          headers: {
            Accept: 'application/json',
            'X-Subscription-Token': key,
          },
        },
        'brave',
      );
      for (const r of data.web?.results ?? []) {
        raws.push({ title: r.title, url: r.url, snippet: r.description });
      }
    }

    return {
      kind: 'results',
      results: rankResults(raws, ctx.analysis, ctx.settings, 'brave', ctx.docType),
    };
  },
};
