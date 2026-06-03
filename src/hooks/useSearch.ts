import { useCallback, useState } from 'react';
import type { DocTypeId, ProductAnalysis, Settings } from '../core/types';
import { runSearch, type DocTypeGroup } from '../core/search/orchestrator';
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
  /** Results (and fallback tabs) grouped by document type. */
  groups: DocTypeGroup[];
  analysis: ProductAnalysis | null;
  provider: SearchProvider | null;
  error: string | null;
  /** True when we fell back to open-in-tabs for at least one document type. */
  degraded: boolean;
  degradedReason: string | null;
}

const INITIAL: SearchState = {
  status: 'idle',
  groups: [],
  analysis: null,
  provider: null,
  error: null,
  degraded: false,
  degradedReason: null,
};

/**
 * Drive a search through the core orchestrator and expose loading / success /
 * error state plus the resulting grouped data. The caller decides what to do
 * with history recording (so we don't double-record).
 */
export function useSearch() {
  const [state, setState] = useState<SearchState>(INITIAL);

  const search = useCallback(
    async (
      raw: string,
      settings: Settings,
      docTypes: DocTypeId[],
    ): Promise<ProductAnalysis | null> => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      setState((s) => ({ ...s, status: 'loading', error: null }));
      try {
        const { analysis, provider, groups, degraded, degradedReason } = await runSearch(
          trimmed,
          settings,
          docTypes,
        );
        setState({
          status: 'success',
          groups,
          analysis,
          provider,
          error: null,
          degraded,
          degradedReason: degradedReason ?? null,
        });

        // Persist so the results survive the popup closing.
        void saveLastSearch({
          query: trimmed,
          docTypes,
          groups,
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
      groups: snapshot.groups,
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
