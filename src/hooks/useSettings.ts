import { useCallback, useEffect, useState } from 'react';
import type { Settings } from '../core/types';
import {
  DEFAULT_SETTINGS,
  getSettings,
  updateSettings as persistUpdate,
} from '../core/storage/settings';
import { SETTINGS_KEY } from '../core/storage/settings';

/**
 * Load and persist settings, staying in sync across pages via
 * chrome.storage.onChanged (so editing in Options reflects in the popup).
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSettings().then((s) => {
      if (active) {
        setSettings(s);
        setLoading(false);
      }
    });

    const onChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === 'sync' && changes[SETTINGS_KEY]) {
        getSettings().then((s) => active && setSettings(s));
      }
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => {
      active = false;
      chrome.storage.onChanged.removeListener(onChange);
    };
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const next = await persistUpdate(patch);
    setSettings(next);
    return next;
  }, []);

  return { settings, loading, update };
}
