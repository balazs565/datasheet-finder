import { useCallback, useEffect, useState } from 'react';
import type { FavoriteEntry, SearchResult } from '../core/types';
import {
  getFavorites,
  removeFavorite,
  toggleFavorite,
} from '../core/storage/favorites';

/** Manage favorited PDFs, exposing a fast lookup set for the result list. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    let active = true;
    getFavorites().then((f) => active && setFavorites(f));
    return () => {
      active = false;
    };
  }, []);

  const favoriteUrls = new Set(favorites.map((f) => f.url));

  const toggle = useCallback(async (result: SearchResult, manufacturer: string | null) => {
    const { favorites: next } = await toggleFavorite(result, manufacturer);
    setFavorites(next);
  }, []);

  const remove = useCallback(async (id: string) => {
    setFavorites(await removeFavorite(id));
  }, []);

  return { favorites, favoriteUrls, toggle, remove };
}
