import type { HistoryEntry, ProductAnalysis } from '../types';

const HISTORY_KEY = 'history';
const MAX_HISTORY = 50;

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Read the full search history, newest first. */
export async function getHistory(): Promise<HistoryEntry[]> {
  const data = await chrome.storage.local.get(HISTORY_KEY);
  return (data[HISTORY_KEY] as HistoryEntry[] | undefined) ?? [];
}

/**
 * Record a search. De-duplicates by normalized name (moves an existing entry
 * to the top) and caps the list to {@link MAX_HISTORY}.
 */
export async function addHistory(analysis: ProductAnalysis): Promise<HistoryEntry[]> {
  const existing = await getHistory();
  const normalizedKey = analysis.normalized.toLowerCase();
  const filtered = existing.filter(
    (e) => e.normalized.toLowerCase() !== normalizedKey,
  );
  const entry: HistoryEntry = {
    id: makeId(),
    query: analysis.raw,
    normalized: analysis.normalized,
    manufacturer: analysis.manufacturer?.name ?? null,
    timestamp: Date.now(),
  };
  const next = [entry, ...filtered].slice(0, MAX_HISTORY);
  await chrome.storage.local.set({ [HISTORY_KEY]: next });
  return next;
}

/** Remove a single history entry by id. */
export async function removeHistory(id: string): Promise<HistoryEntry[]> {
  const next = (await getHistory()).filter((e) => e.id !== id);
  await chrome.storage.local.set({ [HISTORY_KEY]: next });
  return next;
}

/** Clear all history. */
export async function clearHistory(): Promise<void> {
  await chrome.storage.local.set({ [HISTORY_KEY]: [] });
}

export { HISTORY_KEY };
