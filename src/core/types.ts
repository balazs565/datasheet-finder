/**
 * Shared, framework-agnostic domain types for Datasheet Finder.
 * Everything in `core/` depends on these and nothing on React.
 */

/** Identifier for a search provider implementation. */
export type ProviderId =
  | 'duckduckgo'
  | 'searxng'
  | 'bing'
  | 'brave'
  | 'google-cse'
  | 'fallback';

/** Which supported search engine the fallback provider opens in a new tab. */
export type FallbackEngine = 'google' | 'bing' | 'brave' | 'duckduckgo';

/**
 * Identifier for a searchable document type. The full configuration lives in
 * `core/doc-types.ts`; this union keeps the rest of `core/` type-safe without a
 * circular import.
 */
export type DocTypeId = 'datasheet' | 'doc';

/** Theme preference. `system` follows `prefers-color-scheme`. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Semantic intent attached to a generated query, used by the ranker. */
export type QueryIntent =
  | 'datasheet'
  | 'spec-sheet'
  | 'specifications'
  | 'technical-specifications'
  | 'product-brief'
  | 'manual'
  | 'filetype-pdf'
  | 'site-pdf'
  | 'site-datasheet';

/** Classification of where a result came from, drives ranking tiers. */
export type ResultSource =
  | 'official'
  | 'manual'
  | 'brief'
  | 'retailer'
  | 'mirror'
  | 'unknown';

/** A single generated search query plus the metadata used downstream. */
export interface GeneratedQuery {
  /** The raw query string sent to a provider or search engine. */
  query: string;
  /**
   * Semantic intent of the query. Well-known datasheet intents are listed in
   * {@link QueryIntent}; document-type-specific intents are derived from the
   * type's search terms, so the field is a string for extensibility.
   */
  intent: string;
  /** Relative weight (0–1) used by the ranker as an intent prior. */
  weight: number;
  /** True when the query is scoped to the manufacturer domain (site:). */
  manufacturerScoped: boolean;
  /** The document type this query searches for. */
  docType: DocTypeId;
}

/** A manufacturer entry in the extendable registry. */
export interface Manufacturer {
  /** Canonical display name, e.g. "Brother". */
  name: string;
  /** Primary official domain, e.g. "brother.com". */
  domain: string;
  /** Lower-cased aliases / alternative spellings used for matching. */
  aliases: string[];
  /**
   * Optional model-number prefixes that strongly indicate this brand,
   * e.g. ["mfc-", "hl-", "dcp-"] for Brother. Lower-cased.
   */
  modelPrefixes?: string[];
}

/** Result of normalizing + detecting a product name. */
export interface ProductAnalysis {
  /** The user's raw input. */
  raw: string;
  /** Cleaned product name with noise removed. */
  normalized: string;
  /** Detected manufacturer, if any. */
  manufacturer: Manufacturer | null;
  /** Detection confidence 0–100. */
  manufacturerConfidence: number;
  /** Extracted model number tokens (if any). */
  modelNumbers: string[];
}

/** A search result, after ranking. */
export interface SearchResult {
  title: string;
  url: string;
  /** Hostname only, e.g. "www.brother.com". */
  domain: string;
  snippet?: string;
  isPdf: boolean;
  source: ResultSource;
  /** 0–100 confidence assigned by the ranker. */
  confidence: number;
  /** Provider that produced this result. */
  provider: ProviderId;
  /** The document type this result was searched and grouped under. */
  docType: DocTypeId;
}

/** Context passed into a provider's `search` call. */
export interface SearchContext {
  analysis: ProductAnalysis;
  settings: Settings;
  /**
   * The document type being searched. Providers forward it to the ranker so
   * results are scored and tagged for the right type. Defaults to `datasheet`.
   */
  docType?: DocTypeId;
}

/** Per-provider API keys. Empty string = not configured. */
export interface ApiKeys {
  bing: string;
  brave: string;
  /** Google Custom Search API key. */
  googleApiKey: string;
  /** Google Programmable Search Engine ID (cx). */
  googleCx: string;
}

/** User-configurable settings, persisted to chrome.storage.sync. */
export interface Settings {
  /** Active provider id. */
  provider: ProviderId;
  /** Engine used by the fallback (open-in-tab) provider. */
  fallbackEngine: FallbackEngine;
  /** Maximum number of results to display. */
  maxResults: number;
  /** When true, manufacturer-domain results are boosted in ranking. */
  prioritizeManufacturer: boolean;
  /** Theme preference. */
  theme: ThemePreference;
  /**
   * Base URL of a SearXNG instance (local or public), used by the SearXNG
   * provider. Empty = not configured. e.g. "http://localhost:8888".
   */
  searxngUrl: string;
  /** API keys for providers. */
  apiKeys: ApiKeys;
  /** User-defined manufacturers, merged over the built-in registry. */
  customManufacturers: Manufacturer[];
  /**
   * Document types to search for, remembered across sessions. Empty/invalid
   * falls back to the default (datasheet only). See `core/doc-types.ts`.
   */
  docTypes: DocTypeId[];
}

/** A stored search-history entry. */
export interface HistoryEntry {
  id: string;
  query: string;
  normalized: string;
  manufacturer: string | null;
  timestamp: number;
}

/** A favorited PDF/result. */
export interface FavoriteEntry {
  id: string;
  title: string;
  url: string;
  domain: string;
  manufacturer: string | null;
  timestamp: number;
}

/** A candidate product name detected from a page. */
export interface DetectedProduct {
  name: string;
  /** Where on the page the candidate came from. */
  source: 'selection' | 'title' | 'og:title' | 'heading' | 'meta';
  confidence: number;
}
