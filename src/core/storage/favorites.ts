import type { FavoriteEntry, SearchResult } from '../types';

const FAVORITES_KEY = 'favorites';

/** Read all favorites, newest first. */
export async function getFavorites(): Promise<FavoriteEntry[]> {
  const data = await chrome.storage.local.get(FAVORITES_KEY);
  return (data[FAVORITES_KEY] as FavoriteEntry[] | undefined) ?? [];
}

/** True if a URL is already favorited. */
export async function isFavorite(url: string): Promise<boolean> {
  return (await getFavorites()).some((f) => f.url === url);
}

/**
 * Toggle a result's favorite state. Returns the updated list and whether the
 * result is now favorited.
 */
export async function toggleFavorite(
  result: SearchResult,
  manufacturer: string | null,
): Promise<{ favorites: FavoriteEntry[]; favorited: boolean }> {
  const existing = await getFavorites();
  const found = existing.find((f) => f.url === result.url);
  if (found) {
    const favorites = existing.filter((f) => f.url !== result.url);
    await chrome.storage.local.set({ [FAVORITES_KEY]: favorites });
    return { favorites, favorited: false };
  }
  const entry: FavoriteEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: result.title,
    url: result.url,
    domain: result.domain,
    manufacturer,
    timestamp: Date.now(),
  };
  const favorites = [entry, ...existing];
  await chrome.storage.local.set({ [FAVORITES_KEY]: favorites });
  return { favorites, favorited: true };
}

/** Remove a favorite by id. */
export async function removeFavorite(id: string): Promise<FavoriteEntry[]> {
  const next = (await getFavorites()).filter((f) => f.id !== id);
  await chrome.storage.local.set({ [FAVORITES_KEY]: next });
  return next;
}

export { FAVORITES_KEY };
