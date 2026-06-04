import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';
import { useSearch } from '../hooks/useSearch';
import { SearchBox } from '../components/SearchBox';
import { DocTypeSelector } from '../components/DocTypeSelector';
import { DocTypeSection } from '../components/DocTypeSection';
import { RecentSearches } from '../components/RecentSearches';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { FavoritesPanel } from './FavoritesPanel';
import { resultsToCsv, csvDataUrl } from '../core/export/csv';
import { downloadUrl, openInNewTab } from '../core/util/actions';
import { getLastSearch } from '../core/storage/last-search';
import { resolveDocTypes } from '../core/doc-types';
import { detectProductsInPage } from '../content/detect';
import { PENDING_QUERY_KEY, type PendingQuery } from '../core/messaging/messages';
import type { DetectedProduct, DocTypeId, SearchResult } from '../core/types';

type Tab = 'search' | 'favorites';

const ENGINE_LABELS: Record<string, string> = {
  google: 'Google',
  bing: 'Bing',
  brave: 'Brave',
  duckduckgo: 'DuckDuckGo',
};

export function App() {
  const { settings, loading: settingsLoading, update } = useSettings();
  useTheme(settings.theme);
  const { history, record, remove, clear } = useHistory();
  const { favorites, favoriteUrls, toggle, remove: removeFavorite } = useFavorites();
  const search = useSearch();

  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [docTypes, setDocTypes] = useState<DocTypeId[]>(settings.docTypes);
  const [docTypesReady, setDocTypesReady] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<string | null>(null);

  // Seed the selected document types from saved settings once they load.
  useEffect(() => {
    if (settingsLoading || docTypesReady) return;
    setDocTypes(resolveDocTypes(settings.docTypes));
    setDocTypesReady(true);
  }, [settingsLoading, docTypesReady, settings.docTypes]);

  // Default each section's expanded state when a new result set arrives:
  // open the sections that have content, collapse the empty ones.
  useEffect(() => {
    if (search.status !== 'success') return;
    setExpanded(
      Object.fromEntries(
        search.groups.map((g) => [g.docType, g.results.length + g.tabs.length > 0]),
      ),
    );
  }, [search.groups, search.status]);

  const onChangeDocTypes = useCallback(
    (next: DocTypeId[]) => {
      setDocTypes(next);
      void update({ docTypes: next });
    },
    [update],
  );

  const runSearch = useCallback(
    async (raw: string, types: DocTypeId[] = docTypes) => {
      const value = raw.trim();
      if (!value || settingsLoading) return;
      setTab('search');
      const analysis = await search.search(value, settings, resolveDocTypes(types));
      if (analysis) await record(analysis);
    },
    [search, settings, settingsLoading, record, docTypes],
  );

  // On open: run a pending query (from context menu / shortcut), else restore
  // the last search so results persist across popup closes.
  useEffect(() => {
    if (settingsLoading) return;
    chrome.storage.local.get(PENDING_QUERY_KEY).then((data) => {
      const pending = data[PENDING_QUERY_KEY] as PendingQuery | undefined;
      if (pending?.text) {
        chrome.storage.local.remove(PENDING_QUERY_KEY);
        setQuery(pending.text);
        void runSearch(pending.text);
        return;
      }
      // No pending query — restore the previous results, if any.
      getLastSearch().then((snapshot) => {
        if (snapshot) {
          setQuery(snapshot.query);
          if (snapshot.docTypes?.length) {
            setDocTypes(resolveDocTypes(snapshot.docTypes));
            setDocTypesReady(true);
          }
          search.hydrate(snapshot);
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoading]);

  const detectFromPage = useCallback(async () => {
    setDetecting(true);
    setDetectMsg(null);
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id) throw new Error('No active tab');
      // Inject the detector on demand (activeTab) rather than running a content
      // script on every page. Returns the scraped candidates directly.
      const [injection] = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: detectProductsInPage,
      });
      const products = (injection?.result as DetectedProduct[] | undefined) ?? [];
      const best = products[0];
      if (best) {
        setQuery(best.name);
        await runSearch(best.name);
      } else {
        setDetectMsg('No product detected on this page.');
      }
    } catch {
      setDetectMsg('Could not read this page (try a normal website tab).');
    } finally {
      setDetecting(false);
    }
  }, [runSearch]);

  const onToggleFavorite = useCallback(
    (result: SearchResult) => {
      void toggle(result, search.analysis?.manufacturer?.name ?? null);
    },
    [toggle, search.analysis],
  );

  // All ranked results across every document-type group, for CSV export.
  const allResults = useMemo(
    () => search.groups.flatMap((g) => g.results),
    [search.groups],
  );

  const hasAnyContent = useMemo(
    () => search.groups.some((g) => g.results.length + g.tabs.length > 0),
    [search.groups],
  );

  const exportCsv = useCallback(() => {
    if (allResults.length === 0) return;
    const name = search.analysis?.normalized?.replace(/[^a-z0-9]+/gi, '-') || 'results';
    downloadUrl(csvDataUrl(resultsToCsv(allResults)), `datasheet-${name}.csv`);
  }, [allResults, search.analysis]);

  const engineLabel = ENGINE_LABELS[settings.fallbackEngine] ?? 'your search engine';

  return (
    <div className="popup">
      <header className="popup-header">
        <div className="brand">
          <span className="brand-mark">DF</span>
          <span className="brand-name">Datasheet Finder</span>
        </div>
        <div className="header-actions">
          <a
            className="btn-ghost btn-icon"
            href="https://ko-fi.com/balazs555"
            target="_blank"
            rel="noopener noreferrer"
            title="Support me on Ko-fi"
            aria-label="Support me on Ko-fi"
          >
            ☕
          </a>
          <button
            className="btn-ghost btn-icon"
            title="Settings"
            aria-label="Settings"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            ⚙️
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === 'search' ? 'is-active' : ''}`}
          onClick={() => setTab('search')}
        >
          Search
        </button>
        <button
          className={`tab ${tab === 'favorites' ? 'is-active' : ''}`}
          onClick={() => setTab('favorites')}
        >
          Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
        </button>
      </nav>

      <main className="popup-main">
        {tab === 'search' && (
          <>
            <SearchBox
              value={query}
              onChange={setQuery}
              onSearch={() => runSearch(query)}
              onDetect={detectFromPage}
              loading={search.status === 'loading'}
              detecting={detecting}
            />

            <DocTypeSelector
              selected={docTypes}
              onChange={onChangeDocTypes}
              disabled={search.status === 'loading'}
            />

            {detectMsg && <p className="detect-msg muted">{detectMsg}</p>}

            {search.status === 'idle' && (
              <>
                <RecentSearches
                  history={history}
                  onPick={(q) => {
                    setQuery(q);
                    void runSearch(q);
                  }}
                  onRemove={remove}
                  onClear={clear}
                />
                <EmptyState
                  title="Find a document"
                  hint="Pick document types above, paste a product name, use Detect to read the current page, or right-click selected text on any site."
                />
              </>
            )}

            {search.status === 'loading' && <LoadingState />}

            {search.status === 'error' && (
              <ErrorState
                message={search.error ?? 'Unknown error'}
                onRetry={() => runSearch(query)}
              />
            )}

            {search.status === 'success' && (
              <section className="results-section">
                {search.analysis && (
                  <div className="analysis spread">
                    <span className="muted truncate">
                      Results for <strong>{search.analysis.normalized}</strong>
                      {search.analysis.manufacturer && (
                        <> · {search.analysis.manufacturer.name}</>
                      )}
                    </span>
                    <span className="row analysis-actions">
                      {allResults.length > 0 && (
                        <button className="btn-ghost btn-sm" onClick={exportCsv}>
                          Export CSV
                        </button>
                      )}
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => {
                          search.clear();
                          setQuery('');
                        }}
                        title="Clear saved results"
                      >
                        Clear
                      </button>
                    </span>
                  </div>
                )}

                {search.degraded && (
                  <p className="degraded-note">
                    Couldn’t fetch inline results
                    {search.degradedReason ? ` (${search.degradedReason})` : ''}. Opening
                    queries on {engineLabel} instead — click any to view the results.
                  </p>
                )}

                {hasAnyContent ? (
                  <div className="doctype-sections">
                    {search.groups.map((group) => (
                      <DocTypeSection
                        key={group.docType}
                        group={group}
                        expanded={expanded[group.docType] ?? false}
                        onToggle={() =>
                          setExpanded((e) => ({
                            ...e,
                            [group.docType]: !(e[group.docType] ?? false),
                          }))
                        }
                        manufacturer={search.analysis?.manufacturer?.name ?? null}
                        favoriteUrls={favoriteUrls}
                        onToggleFavorite={onToggleFavorite}
                        engineLabel={engineLabel}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="📭"
                    title="No results"
                    hint="Try a more specific model number, or switch to “Open in browser” in Settings to open the queries in new tabs."
                  />
                )}
              </section>
            )}
          </>
        )}

        {tab === 'favorites' && (
          <FavoritesPanel
            favorites={favorites}
            onRemove={removeFavorite}
            onOpen={openInNewTab}
          />
        )}
      </main>
    </div>
  );
}
