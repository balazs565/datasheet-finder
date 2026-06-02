import { useCallback, useEffect, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';
import { useSearch } from '../hooks/useSearch';
import { SearchBox } from '../components/SearchBox';
import { RecentSearches } from '../components/RecentSearches';
import { ResultList } from '../components/ResultList';
import { FallbackList } from '../components/FallbackList';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { FavoritesPanel } from './FavoritesPanel';
import { resultsToCsv, csvDataUrl } from '../core/export/csv';
import { downloadUrl, openInNewTab } from '../core/util/actions';
import { getLastSearch } from '../core/storage/last-search';
import {
  PENDING_QUERY_KEY,
  type DetectProductsResponse,
  type PendingQuery,
} from '../core/messaging/messages';
import type { SearchResult } from '../core/types';

type Tab = 'search' | 'favorites';

const ENGINE_LABELS: Record<string, string> = {
  google: 'Google',
  bing: 'Bing',
  brave: 'Brave',
  duckduckgo: 'DuckDuckGo',
};

export function App() {
  const { settings, loading: settingsLoading } = useSettings();
  useTheme(settings.theme);
  const { history, record, remove, clear } = useHistory();
  const { favorites, favoriteUrls, toggle, remove: removeFavorite } = useFavorites();
  const search = useSearch();

  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<string | null>(null);

  const runSearch = useCallback(
    async (raw: string) => {
      const value = raw.trim();
      if (!value || settingsLoading) return;
      setTab('search');
      const analysis = await search.search(value, settings);
      if (analysis) await record(analysis);
    },
    [search, settings, settingsLoading, record],
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
      const response = (await chrome.tabs.sendMessage(activeTab.id, {
        type: 'DETECT_PRODUCTS',
      })) as DetectProductsResponse | undefined;
      const best = response?.products?.[0];
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

  const exportCsv = useCallback(() => {
    if (search.results.length === 0) return;
    const name = search.analysis?.normalized?.replace(/[^a-z0-9]+/gi, '-') || 'results';
    downloadUrl(csvDataUrl(resultsToCsv(search.results)), `datasheet-${name}.csv`);
  }, [search.results, search.analysis]);

  const engineLabel = ENGINE_LABELS[settings.fallbackEngine] ?? 'your search engine';

  return (
    <div className="popup">
      <header className="popup-header">
        <div className="brand">
          <span className="brand-mark">DF</span>
          <span className="brand-name">Datasheet Finder</span>
        </div>
        <button
          className="btn-ghost btn-icon"
          title="Settings"
          aria-label="Settings"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          ⚙️
        </button>
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
                  title="Find a datasheet"
                  hint="Paste a product name above, use Detect to read the current page, or right-click selected text on any site."
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
                      {search.results.length > 0 && (
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
                    queries on {engineLabel} instead — or set a SearXNG URL in Settings for
                    reliable in‑popup results.
                  </p>
                )}

                {search.tabs.length > 0 && (
                  <FallbackList tabs={search.tabs} engineLabel={engineLabel} />
                )}

                {search.results.length > 0 && (
                  <ResultList
                    results={search.results}
                    manufacturer={search.analysis?.manufacturer?.name ?? null}
                    favoriteUrls={favoriteUrls}
                    onToggleFavorite={onToggleFavorite}
                  />
                )}

                {search.results.length === 0 && search.tabs.length === 0 && (
                  <EmptyState
                    icon="📭"
                    title="No results"
                    hint="Try a more specific model number, switch to “Open in browser” in Settings, or set a SearXNG URL for more robust free results."
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
