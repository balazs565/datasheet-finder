import type { GeneratedQuery, SearchContext, Settings } from '../types';
import { rankResults, type RawResult } from '../ranking/ranker';
import { fetchJson, selectApiQueries } from './provider-base';
import type { SearchOutcome, SearchProvider } from './types';

interface CseItem {
  title: string;
  link: string;
  snippet?: string;
}
interface CseResponse {
  items?: CseItem[];
}

const ENDPOINT = 'https://www.googleapis.com/customsearch/v1';

/**
 * Google Programmable Search (Custom Search JSON API) provider. Requires both
 * an API key and a Search Engine ID (cx). This is the official JSON API — not
 * HTML scraping.
 */
export const googleCseProvider: SearchProvider = {
  id: 'google-cse',
  label: 'Google Custom Search',
  requiresApiKey: true,

  isConfigured(settings: Settings): boolean {
    return (
      settings.apiKeys.googleApiKey.trim().length > 0 &&
      settings.apiKeys.googleCx.trim().length > 0
    );
  },

  async search(queries: GeneratedQuery[], ctx: SearchContext): Promise<SearchOutcome> {
    const key = ctx.settings.apiKeys.googleApiKey.trim();
    const cx = ctx.settings.apiKeys.googleCx.trim();
    const selected = selectApiQueries(queries, 3);
    const raws: RawResult[] = [];

    for (const q of selected) {
      const url = `${ENDPOINT}?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(
        cx,
      )}&q=${encodeURIComponent(q.query)}&num=10`;
      const data = await fetchJson<CseResponse>(url, {}, 'google-cse');
      for (const item of data.items ?? []) {
        raws.push({ title: item.title, url: item.link, snippet: item.snippet });
      }
    }

    return {
      kind: 'results',
      results: rankResults(raws, ctx.analysis, ctx.settings, 'google-cse'),
    };
  },
};
