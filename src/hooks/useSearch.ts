import { useCallback, useState } from 'react';
import type { ProductAnalysis, SearchResult, Settings } from '../core/types';
import { runSearch } from '../core/search/orchestrator';
import { SearchProviderError } from '../core/search/types';
import type { SearchProvider } from '../core/search/types';
import {
  clearLastSearch,
  saveLastSearch,
  type LastSearchSnapshot,
} from '../core/storage/last-search';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SearchState {
  status: SearchStatus;
  /** Inline ranked results (key-backed providers). */
  results: SearchResult[];
  /** Open-in-tab links (fallback provider). */
  tabs: { label: string; url: string }[];
  analysis: ProductAnalysis | null;
  provider: SearchProvider | null;
  error: string | null;
  /** True when we fell back to open-in-tabs because a provider failed. */
  degraded: boolean;
  degradedReason: string | null;
}

const INITIAL: SearchState = {
  status: 'idle',
  results: [],
  tabs: [],
  analysis: null,
  provider: null,
  error: null,
  degraded: false,
  degradedReason: null,
};

/**
 * Drive a search through the core orchestrator and expose loading / success /
 * error state plus the resulting data. The caller decides what to do with
 * history recording (so we don't double-record).
 */
export function useSearch() {
  const [state, setState] = useState<SearchState>(INITIAL);

  const search = useCallback(
    async (raw: string, settings: Settings): Promise<ProductAnalysis | null> => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      setState((s) => ({ ...s, status: 'loading', error: null }));
      try {
        const { analysis, provider, outcome, degraded, degradedReason } = await runSearch(
          trimmed,
          settings,
        );
        const base = {
          status: 'success' as const,
          analysis,
          provider,
          error: null,
          degraded,
          degradedReason: degradedReason ?? null,
        };
        const results = outcome.kind === 'results' ? outcome.results : [];
        const tabs = outcome.kind === 'open-tabs' ? outcome.tabs : [];
        setState({ ...base, results, tabs });

        // Persist so the results survive the popup closing.
        void saveLastSearch({
          query: trimmed,
          results,
          tabs,
          analysis,
          degraded,
          degradedReason: degradedReason ?? null,
          timestamp: Date.now(),
        });
        return analysis;
      } catch (err) {
        const message =
          err instanceof SearchProviderError
            ? err.message
            : `Search failed: ${(err as Error).message}`;
        setState((s) => ({ ...s, status: 'error', error: message }));
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => setState(INITIAL), []);

  /** Restore state from a persisted snapshot (popup re-open). */
  const hydrate = useCallback((snapshot: LastSearchSnapshot) => {
    setState({
      status: 'success',
      results: snapshot.results,
      tabs: snapshot.tabs,
      analysis: snapshot.analysis,
      provider: null,
      error: null,
      degraded: snapshot.degraded,
      degradedReason: snapshot.degradedReason,
    });
  }, []);

  /** Clear results both in-memory and from persistent storage. */
  const clear = useCallback(() => {
    setState(INITIAL);
    void clearLastSearch();
  }, []);

  return { ...state, search, reset, hydrate, clear };
}
