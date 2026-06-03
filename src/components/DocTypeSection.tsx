import { useId } from 'react';
import type { SearchResult } from '../core/types';
import type { DocTypeGroup } from '../core/search/orchestrator';
import { ResultList } from './ResultList';
import { FallbackList } from './FallbackList';

interface Props {
  group: DocTypeGroup;
  expanded: boolean;
  onToggle: () => void;
  manufacturer: string | null;
  favoriteUrls: Set<string>;
  onToggleFavorite: (result: SearchResult) => void;
  engineLabel: string;
}

/**
 * A single collapsible (accordion) section for one document type. Shows the
 * type label and a result count in the header; the body holds ranked results,
 * fallback open-in-tab links, or an empty notice. Expands/collapses
 * independently of sibling sections.
 */
export function DocTypeSection({
  group,
  expanded,
  onToggle,
  manufacturer,
  favoriteUrls,
  onToggleFavorite,
  engineLabel,
}: Props) {
  const panelId = useId();
  const count = group.results.length || group.tabs.length;
  const empty = count === 0;

  return (
    <section className="doctype-section">
      <button
        type="button"
        className="doctype-head"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className={`doctype-caret ${expanded ? 'is-open' : ''}`} aria-hidden>
          ▶
        </span>
        <span className="doctype-title">{group.label}</span>
        <span className={`doctype-count ${empty ? 'is-empty' : ''}`}>{count}</span>
      </button>

      {expanded && (
        <div className="doctype-body" id={panelId}>
          {group.results.length > 0 && (
            <ResultList
              results={group.results}
              manufacturer={manufacturer}
              favoriteUrls={favoriteUrls}
              onToggleFavorite={onToggleFavorite}
            />
          )}

          {group.results.length === 0 && group.tabs.length > 0 && (
            <FallbackList tabs={group.tabs} engineLabel={engineLabel} />
          )}

          {empty && <p className="doctype-empty muted">No documents found</p>}
        </div>
      )}
    </section>
  );
}
