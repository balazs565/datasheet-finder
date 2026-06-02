import type { HistoryEntry } from '../core/types';

interface Props {
  history: HistoryEntry[];
  onPick: (query: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

/** Recent-search chips with per-item remove and a clear-all action. */
export function RecentSearches({ history, onPick, onRemove, onClear }: Props) {
  if (history.length === 0) return null;
  return (
    <section className="recent">
      <div className="spread recent-head">
        <span className="section-label">Recent searches</span>
        <button className="btn-ghost btn-sm" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="chips">
        {history.slice(0, 8).map((h) => (
          <span className="chip" key={h.id}>
            <button className="chip-main" onClick={() => onPick(h.query)} title={h.query}>
              {h.manufacturer && <strong>{h.manufacturer}</strong>}
              <span className="truncate">{h.normalized || h.query}</span>
            </button>
            <button
              className="chip-x"
              onClick={() => onRemove(h.id)}
              title="Remove"
              aria-label="Remove"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
