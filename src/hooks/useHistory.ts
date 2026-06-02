import { useCallback, useEffect, useState } from 'react';
import type { HistoryEntry, ProductAnalysis } from '../core/types';
import {
  addHistory,
  clearHistory,
  getHistory,
  removeHistory,
} from '../core/storage/history';

/** Manage the search-history list with optimistic local state. */
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    let active = true;
    getHistory().then((h) => active && setHistory(h));
    return () => {
      active = false;
    };
  }, []);

  const record = useCallback(async (analysis: ProductAnalysis) => {
    setHistory(await addHistory(analysis));
  }, []);

  const remove = useCallback(async (id: string) => {
    setHistory(await removeHistory(id));
  }, []);

  const clear = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  return { history, record, remove, clear };
}
