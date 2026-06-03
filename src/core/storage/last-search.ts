import type { DocTypeId, ProductAnalysis } from '../types';
import type { DocTypeGroup } from '../search/orchestrator';

const LAST_SEARCH_KEY = 'lastSearch';

/**
 * A serializable snapshot of the most recent successful search, persisted to
 * chrome.storage.local so the popup can restore results after it closes (the
 * popup unmounts and loses all React state whenever it loses focus). Cleared
 * only when the user explicitly clears it.
 *
 * The non-serializable `provider` object is intentionally omitted — only what
 * the UI needs to re-render is stored.
 */
export interface LastSearchSnapshot {
  query: string;
  /** Document types that were searched. */
  docTypes: DocTypeId[];
  /** Results grouped by document type. */
  groups: DocTypeGroup[];
  analysis: ProductAnalysis | null;
  degraded: boolean;
  degradedReason: string | null;
  timestamp: number;
}

/** Read the persisted last-search snapshot, or null if none. */
export async function getLastSearch(): Promise<LastSearchSnapshot | null> {
  const data = await chrome.storage.local.get(LAST_SEARCH_KEY);
  return (data[LAST_SEARCH_KEY] as LastSearchSnapshot | undefined) ?? null;
}

/** Persist the last-search snapshot. */
export async function saveLastSearch(snapshot: LastSearchSnapshot): Promise<void> {
  await chrome.storage.local.set({ [LAST_SEARCH_KEY]: snapshot });
}

/** Remove the persisted snapshot. */
export async function clearLastSearch(): Promise<void> {
  await chrome.storage.local.remove(LAST_SEARCH_KEY);
}

export { LAST_SEARCH_KEY };
