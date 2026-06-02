import { useEffect } from 'react';
import type { ThemePreference } from '../core/types';

/** Resolve a theme preference to a concrete light/dark value. */
function resolve(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

/**
 * Apply the theme preference to <html data-theme="…">. Re-applies when the OS
 * theme changes while in `system` mode.
 */
export function useTheme(pref: ThemePreference): void {
  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute('data-theme', resolve(pref));
    };
    apply();

    if (pref === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
    return undefined;
  }, [pref]);
}
