import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { Field, Select, Toggle } from '../components/controls';
import { ManufacturerEditor } from './ManufacturerEditor';
import { SELECTABLE_PROVIDERS } from '../core/search/provider-registry';
import type { FallbackEngine, ProviderId, ThemePreference } from '../core/types';

const PROVIDER_HELP: Record<ProviderId, string> = {
  duckduckgo:
    'Free, no key, nothing to install. Opens a quick background tab to read DuckDuckGo results, then ranks them in the popup. Recommended.',
  searxng:
    'Free metasearch. Enter a SearXNG instance URL below (local or public). No key needed.',
  fallback: 'No key needed. Generated queries open in a new tab on your chosen engine.',
  bing: 'Bing Web Search API was retired in 2025 — kept for legacy keys only.',
  brave: 'Requires a Brave Search API token (paid / card required for new accounts).',
  'google-cse': 'Requires a Google API key + Search Engine ID (cx). Closed to new sign-ups.',
};

/**
 * Ensure the extension has host permission for a SearXNG instance URL, prompting
 * the user once. Returns true if permission is granted (or the URL is empty).
 */
async function ensureSearxngPermission(url: string): Promise<boolean> {
  const trimmed = url.trim();
  if (!trimmed) return true;
  let origin: string;
  try {
    origin = `${new URL(trimmed).origin}/*`;
  } catch {
    return false;
  }
  try {
    if (await chrome.permissions.contains({ origins: [origin] })) return true;
    return await chrome.permissions.request({ origins: [origin] });
  } catch {
    return false;
  }
}

export function SettingsApp() {
  const { settings, loading, update } = useSettings();
  useTheme(settings.theme);
  const [saved, setSaved] = useState(false);
  const [searxngInput, setSearxngInput] = useState('');
  const [searxngInit, setSearxngInit] = useState(false);
  const [searxngError, setSearxngError] = useState<string | null>(null);

  // Seed the SearXNG input from stored settings once they load.
  if (!searxngInit && !loading) {
    setSearxngInput(settings.searxngUrl);
    setSearxngInit(true);
  }

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const patch = async (p: Parameters<typeof update>[0]) => {
    await update(p);
    flashSaved();
  };

  const setApiKey = (key: keyof typeof settings.apiKeys, value: string) =>
    patch({ apiKeys: { ...settings.apiKeys, [key]: value } });

  const saveSearxngUrl = async () => {
    const url = searxngInput.trim();
    setSearxngError(null);
    if (url && !(await ensureSearxngPermission(url))) {
      setSearxngError('Permission to access that URL was denied or the URL is invalid.');
      return;
    }
    await patch({ searxngUrl: url });
  };

  if (loading) {
    return (
      <div className="options">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="options">
      <header className="options-header">
        <div className="brand">
          <span className="brand-mark">DF</span>
          <div>
            <h1>Datasheet Finder</h1>
            <p className="muted">Settings</p>
          </div>
        </div>
        <span className={`save-flash ${saved ? 'is-visible' : ''}`}>✓ Saved</span>
      </header>

      <div className="options-grid">
        {/* Search provider */}
        <section className="card">
          <h2>Search provider</h2>
          <Field label="Preferred provider" hint={PROVIDER_HELP[settings.provider]}>
            <Select<ProviderId>
              value={settings.provider}
              onChange={(v) => patch({ provider: v })}
              options={SELECTABLE_PROVIDERS.map((p) => ({ value: p.id, label: p.label }))}
            />
          </Field>

          <Field
            label="SearXNG instance URL (optional)"
            hint="For the SearXNG provider. Works with a local or public instance, e.g. http://localhost:8888 — no key needed."
          >
            <div className="row searxng-row">
              <input
                className="input"
                type="text"
                autoComplete="off"
                value={searxngInput}
                onChange={(e) => setSearxngInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveSearxngUrl()}
                placeholder="http://localhost:8888"
              />
              <button className="btn" onClick={saveSearxngUrl}>
                Save
              </button>
            </div>
          </Field>
          {searxngError && <p className="hint" style={{ color: 'var(--danger)' }}>{searxngError}</p>}

          <Field
            label="Fallback engine (open-in-tabs mode)"
            hint="When the “Open in browser” provider is selected, queries open here in a new tab."
          >
            <Select<FallbackEngine>
              value={settings.fallbackEngine}
              onChange={(v) => patch({ fallbackEngine: v })}
              options={[
                { value: 'google', label: 'Google' },
                { value: 'bing', label: 'Bing' },
                { value: 'brave', label: 'Brave' },
                { value: 'duckduckgo', label: 'DuckDuckGo' },
              ]}
            />
          </Field>
        </section>

        {/* API keys (optional / advanced) */}
        <section className="card">
          <h2>Paid providers (optional)</h2>
          <p className="muted card-sub">
            Not required — the free <strong>DuckDuckGo</strong> provider is the default.
            These are only for users who already hold API keys. Stored locally in{' '}
            <code>chrome.storage.sync</code> and never shared.
          </p>
          <Field label="Bing subscription key">
            <input
              className="input"
              type="password"
              autoComplete="off"
              value={settings.apiKeys.bing}
              onChange={(e) => setApiKey('bing', e.target.value)}
              placeholder="Ocp-Apim-Subscription-Key"
            />
          </Field>
          <Field label="Brave Search token">
            <input
              className="input"
              type="password"
              autoComplete="off"
              value={settings.apiKeys.brave}
              onChange={(e) => setApiKey('brave', e.target.value)}
              placeholder="X-Subscription-Token"
            />
          </Field>
          <Field label="Google API key">
            <input
              className="input"
              type="password"
              autoComplete="off"
              value={settings.apiKeys.googleApiKey}
              onChange={(e) => setApiKey('googleApiKey', e.target.value)}
              placeholder="AIza…"
            />
          </Field>
          <Field label="Google Search Engine ID (cx)">
            <input
              className="input"
              type="text"
              autoComplete="off"
              value={settings.apiKeys.googleCx}
              onChange={(e) => setApiKey('googleCx', e.target.value)}
              placeholder="0123456789abcdef:xyz"
            />
          </Field>
        </section>

        {/* Results & ranking */}
        <section className="card">
          <h2>Results & ranking</h2>
          <Field label={`Maximum results: ${settings.maxResults}`}>
            <input
              className="range"
              type="range"
              min={5}
              max={30}
              step={1}
              value={settings.maxResults}
              onChange={(e) => patch({ maxResults: Number(e.target.value) })}
            />
          </Field>
          <div className="field">
            <Toggle
              checked={settings.prioritizeManufacturer}
              onChange={(v) => patch({ prioritizeManufacturer: v })}
              label="Prioritize official manufacturer results"
            />
            <span className="hint">
              Boosts results hosted on the detected manufacturer’s domain.
            </span>
          </div>
        </section>

        {/* Appearance */}
        <section className="card">
          <h2>Appearance</h2>
          <Field label="Theme">
            <Select<ThemePreference>
              value={settings.theme}
              onChange={(v) => patch({ theme: v })}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </Field>
        </section>

        {/* Manufacturer map */}
        <section className="card card-wide">
          <h2>Manufacturer mapping</h2>
          <p className="muted card-sub">
            Add custom brand → domain entries. These extend the built-in registry and are
            used for detection and <code>site:</code> queries.
          </p>
          <ManufacturerEditor
            custom={settings.customManufacturers}
            onChange={(list) => patch({ customManufacturers: list })}
          />
        </section>
      </div>

      <footer className="options-footer muted">
        Datasheet Finder · keyboard shortcut <kbd>Ctrl/Cmd+Shift+D</kbd> to open ·{' '}
        <kbd>Ctrl/Cmd+Shift+F</kbd> to search selection.
      </footer>
    </div>
  );
}
