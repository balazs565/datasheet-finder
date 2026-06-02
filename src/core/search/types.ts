import type {
  GeneratedQuery,
  ProviderId,
  SearchContext,
  SearchResult,
  Settings,
} from '../types';

/** Discriminated outcome of a provider search. */
export type SearchOutcome =
  | { kind: 'results'; results: SearchResult[] }
  | {
      /**
       * The provider can't return inline results (no API key). Instead it
       * yields query strings that should be opened in new browser tabs.
       */
      kind: 'open-tabs';
      tabs: { label: string; url: string }[];
    };

/**
 * A pluggable search backend. Implement this interface and register it in
 * `provider-registry.ts` to add a new provider. API keys are supplied via
 * `Settings.apiKeys` and never hardcoded.
 */
export interface SearchProvider {
  readonly id: ProviderId;
  readonly label: string;
  readonly requiresApiKey: boolean;
  /** Whether the provider has everything it needs to run live searches. */
  isConfigured(settings: Settings): boolean;
  /** Execute the search for the generated query set. */
  search(queries: GeneratedQuery[], ctx: SearchContext): Promise<SearchOutcome>;
}

/** Thrown when a provider call fails; carries a user-friendly message. */
export class SearchProviderError extends Error {
  readonly providerId: ProviderId;
  readonly reason?: unknown;

  constructor(message: string, providerId: ProviderId, reason?: unknown) {
    super(message);
    this.name = 'SearchProviderError';
    this.providerId = providerId;
    this.reason = reason;
  }
}
