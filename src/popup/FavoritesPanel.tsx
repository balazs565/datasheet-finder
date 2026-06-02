import type { FavoriteEntry } from '../core/types';
import { ManufacturerLogo } from '../components/ManufacturerLogo';
import { EmptyState } from '../components/states';
import { copyToClipboard, downloadUrl, filenameFromUrl } from '../core/util/actions';
import { bareDomain } from '../core/util/url';

interface Props {
  favorites: FavoriteEntry[];
  onRemove: (id: string) => void;
  onOpen: (url: string) => void;
}

/** Saved/favorited PDFs list. */
export function FavoritesPanel({ favorites, onRemove, onOpen }: Props) {
  if (favorites.length === 0) {
    return (
      <EmptyState
        icon="★"
        title="No favorites yet"
        hint="Tap the star on any result to save it here for quick access."
      />
    );
  }

  return (
    <div className="result-list">
      {favorites.map((f) => (
        <article className="result" key={f.id}>
          <ManufacturerLogo name={f.manufacturer} domain={f.domain} size={30} />
          <div className="result-body">
            <button
              className="result-title truncate"
              onClick={() => onOpen(f.url)}
              title={f.title}
            >
              {f.title}
            </button>
            <div className="result-meta">
              <span className="subtle truncate">{bareDomain(f.domain)}</span>
            </div>
            <div className="result-actions">
              <button className="btn btn-sm" onClick={() => onOpen(f.url)}>
                Open
              </button>
              <button
                className="btn btn-sm"
                onClick={() => downloadUrl(f.url, filenameFromUrl(f.url))}
              >
                Download
              </button>
              <button className="btn btn-sm" onClick={() => copyToClipboard(f.url)}>
                Copy URL
              </button>
              <button
                className="btn btn-sm"
                onClick={() => onRemove(f.id)}
                title="Remove favorite"
              >
                Remove
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
