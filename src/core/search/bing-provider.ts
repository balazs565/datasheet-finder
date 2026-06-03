import type { GeneratedQuery, SearchContext, Settings } from '../types';
import { rankResults, type RawResult } from '../ranking/ranker';
import { fetchJson, selectApiQueries } from './provider-base';
import type { SearchOutcome, SearchProvider } from './types';

interface BingWebPage {
  name: string;
  url: string;
  snippet?: string;
}
interface BingResponse {
  webPages?: { value: BingWebPage[] };
}

const ENDPOINT = 'https://api.bing.microsoft.com/v7.0/search';

/**
 * Bing Web Search provider. Requires an `Ocp-Apim-Subscription-Key`.
 * Note: this API does not use Google HTML scraping — it is the official REST
 * endpoint.
 */
export const bingProvider: SearchProvider = {
  id: 'bing',
  label: 'Bing Web Search',
  requiresApiKey: true,

  isConfigured(settings: Settings): boolean {
    return settings.apiKeys.bing.trim().length > 0;
  },

  async search(queries: GeneratedQuery[], ctx: SearchContext): Promise<SearchOutcome> {
    const key = ctx.settings.apiKeys.bing.trim();
    const selected = selectApiQueries(queries, 3);
    const raws: RawResult[] = [];

    for (const q of selected) {
      const url = `${ENDPOINT}?q=${encodeURIComponent(q.query)}&count=10&responseFilter=Webpages`;
      const data = await fetchJson<BingResponse>(
        url,
        { headers: { 'Ocp-Apim-Subscription-Key': key } },
        'bing',
      );
      for (const wp of data.webPages?.value ?? []) {
        raws.push({ title: wp.name, url: wp.url, snippet: wp.snippet });
      }
    }

    return {
      kind: 'results',
      results: rankResults(raws, ctx.analysis, ctx.settings, 'bing', ctx.docType),
    };
  },
};
