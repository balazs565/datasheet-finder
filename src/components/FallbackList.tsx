import { openInNewTab } from '../core/util/actions';

interface Props {
  tabs: { label: string; url: string }[];
  engineLabel: string;
}

/**
 * Rendered when no provider API key is configured: each generated query opens
 * in a new tab on the user's chosen search engine.
 */
export function FallbackList({ tabs, engineLabel }: Props) {
  return (
    <div className="fallback">
      <div className="fallback-note muted">
        No search API key configured — these open on <strong>{engineLabel}</strong> in a
        new tab. Add a key in Settings for ranked in-popup results.
      </div>
      <div className="result-list">
        {tabs.map((t) => (
          <button
            key={t.url}
            className="fallback-item"
            onClick={() => openInNewTab(t.url)}
            title={t.url}
          >
            <span className="fallback-q truncate">{t.label}</span>
            <span className="fallback-go" aria-hidden>
              ↗
            </span>
          </button>
        ))}
      </div>
      <button
        className="btn btn-sm fallback-all"
        onClick={() => tabs.forEach((t) => openInNewTab(t.url))}
      >
        Open all queries
      </button>
    </div>
  );
}
