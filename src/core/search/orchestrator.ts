import type { ProductAnalysis, Settings } from '../types';
import { analyzeProduct } from '../ai/manufacturer-detect';
import { buildQueries } from '../ai/query-builder';
import { resolveProvider, getProvider } from './provider-registry';
import type { SearchOutcome, SearchProvider } from './types';

/** Everything the UI needs after a search round-trip. */
export interface SearchRun {
  analysis: ProductAnalysis;
  provider: SearchProvider;
  outcome: SearchOutcome;
  /**
   * True when the chosen provider failed and we automatically fell back to the
   * open-in-tabs provider so the user is never left at a dead end.
   */
  degraded: boolean;
  /** A short reason for the degradation, if any (shown as a gentle notice). */
  degradedReason?: string;
}

/**
 * End-to-end search: analyze the raw name, build queries, resolve the active
 * provider, and run it.
 *
 * Resilience: if the chosen provider throws (e.g. DuckDuckGo 403, SearXNG
 * instance down), we automatically fall back to the always-available
 * open-in-tabs provider instead of surfacing an error. The UI shows a small
 * notice via the `degraded` flag.
 */
export async function runSearch(raw: string, settings: Settings): Promise<SearchRun> {
  const analysis = analyzeProduct(raw, settings.customManufacturers);
  const queries = buildQueries(analysis);
  const provider = resolveProvider(settings);

  try {
    const outcome = await provider.search(queries, { analysis, settings });
    // An empty inline result set also degrades to tabs so the user can proceed.
    if (outcome.kind === 'results' && outcome.results.length === 0) {
      return degrade(analysis, queries, settings, `No results from ${provider.label}.`);
    }
    return { analysis, provider, outcome, degraded: false };
  } catch (err) {
    const reason =
      err instanceof Error ? err.message : `${provider.label} request failed`;
    return degrade(analysis, queries, settings, reason);
  }
}

/** Run the open-in-tabs fallback provider and tag the run as degraded. */
async function degrade(
  analysis: ProductAnalysis,
  queries: ReturnType<typeof buildQueries>,
  settings: Settings,
  reason: string,
): Promise<SearchRun> {
  const fallback = getProvider('fallback');
  const outcome = await fallback.search(queries, { analysis, settings });
  return { analysis, provider: fallback, outcome, degraded: true, degradedReason: reason };
}
