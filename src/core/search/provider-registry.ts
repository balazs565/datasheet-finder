import type { ProviderId, Settings } from '../types';
import { duckduckgoProvider } from './duckduckgo-provider';
import { bingProvider } from './bing-provider';
import { braveProvider } from './brave-provider';
import { fallbackProvider } from './fallback-provider';
import { googleCseProvider } from './google-cse-provider';
import type { SearchProvider } from './types';

/** All registered providers, keyed by id. Add new providers here. */
export const PROVIDERS: Record<ProviderId, SearchProvider> = {
  duckduckgo: duckduckgoProvider,
  bing: bingProvider,
  brave: braveProvider,
  'google-cse': googleCseProvider,
  fallback: fallbackProvider,
};

/**
 * Providers exposed in the settings dropdown, in display order. Free,
 * zero-config options come first.
 */
export const SELECTABLE_PROVIDERS: SearchProvider[] = [
  duckduckgoProvider,
  fallbackProvider,
  bingProvider,
  braveProvider,
  googleCseProvider,
];

/**
 * Resolve the provider to use for a search:
 *  - the user's chosen provider when it's configured,
 *  - otherwise the always-available fallback provider.
 */
export function resolveProvider(settings: Settings): SearchProvider {
  const chosen = PROVIDERS[settings.provider] ?? fallbackProvider;
  if (chosen.isConfigured(settings)) return chosen;
  return fallbackProvider;
}

export function getProvider(id: ProviderId): SearchProvider {
  return PROVIDERS[id] ?? fallbackProvider;
}
