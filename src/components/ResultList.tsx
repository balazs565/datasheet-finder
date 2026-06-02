import type { SearchResult } from '../core/types';
import { ResultCard } from './ResultCard';

interface Props {
  results: SearchResult[];
  manufacturer: string | null;
  favoriteUrls: Set<string>;
  onToggleFavorite: (result: SearchResult) => void;
}

/** Renders the ranked result cards. */
export function ResultList({
  results,
  manufacturer,
  favoriteUrls,
  onToggleFavorite,
}: Props) {
  return (
    <div className="result-list">
      {results.map((r) => (
        <ResultCard
          key={r.url}
          result={r}
          manufacturer={manufacturer}
          isFavorite={favoriteUrls.has(r.url)}
          onToggleFavorite={() => onToggleFavorite(r)}
        />
      ))}
    </div>
  );
}
