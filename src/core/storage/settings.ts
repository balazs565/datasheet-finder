import type { Settings } from '../types';

/** Storage key for settings in chrome.storage.sync. */
const SETTINGS_KEY = 'settings';

/** Default settings used on first run and as a merge base. */
export const DEFAULT_SETTINGS: Settings = {
  provider: 'duckduckgo',
  fallbackEngine: 'google',
  maxResults: 15,
  prioritizeManufacturer: true,
  theme: 'system',
  searxngUrl: '',
  apiKeys: {
    bing: '',
    brave: '',
    googleApiKey: '',
    googleCx: '',
  },
  customManufacturers: [],
};

/**
 * Deep-ish merge of stored settings over defaults so that newly-added fields
 * always have a value even for users upgrading from an older version.
 */
function mergeSettings(stored: Partial<Settings> | undefined): Settings {
  if (!stored) return { ...DEFAULT_SETTINGS };
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...(stored.apiKeys ?? {}) },
    customManufacturers: stored.customManufacturers ?? DEFAULT_SETTINGS.customManufacturers,
  };
}

/** Read settings, merged over defaults. */
export async function getSettings(): Promise<Settings> {
  const data = await chrome.storage.sync.get(SETTINGS_KEY);
  return mergeSettings(data[SETTINGS_KEY] as Partial<Settings> | undefined);
}

/** Persist a full settings object. */
export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
}

/** Patch a subset of settings and persist the merged result. */
export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = mergeSettings({ ...current, ...patch });
  await saveSettings(next);
  return next;
}

/** Seed defaults on install if nothing is stored yet. */
export async function ensureSettingsSeeded(): Promise<void> {
  const data = await chrome.storage.sync.get(SETTINGS_KEY);
  if (!data[SETTINGS_KEY]) await saveSettings(DEFAULT_SETTINGS);
}

export { SETTINGS_KEY };
