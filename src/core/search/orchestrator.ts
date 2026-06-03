import type { DocTypeId, GeneratedQuery, ProductAnalysis, SearchResult, Settings } from '../types';
import { analyzeProduct } from '../ai/manufacturer-detect';
import { buildQueries } from '../ai/query-builder';
import { DOC_TYPES, resolveDocTypes } from '../doc-types';
import { resolveProvider, getProvider } from './provider-registry';
import type { SearchProvider } from './types';

/** Results (and/or fallback tabs) for a single document type. */
export interface DocTypeGroup {
  docType: DocTypeId;
  /** Section heading, e.g. "Datasheets". */
  label: string;
  /** Inline ranked results from a key-backed provider. */
  results: SearchResult[];
  /** Open-in-tab links (fallback / no inline results). */
  tabs: { label: string; url: string }[];
}

/** Everything the UI needs after a search round-trip. */
export interface SearchRun {
  analysis: ProductAnalysis;
  provider: SearchProvider;
  /** One group per enabled document type, in canonical order. */
  groups: DocTypeGroup[];
  /**
   * True when the chosen provider failed for at least one type and we
   * automatically fell back to the open-in-tabs provider so the user is never
   * left at a dead end.
   */
  degraded: boolean;
  /** A short reason for the degradation, if any (shown as a gentle notice). */
  degradedReason?: string;
}

/**
 * End-to-end search: analyze the raw name once, then for each enabled document
 * type build the type-specific queries, run the active provider, and collect
 * the results into a per-type group.
 *
 * Resilience: if the chosen provider throws (e.g. DuckDuckGo 403) or returns
 * nothing for a type, that type automatically falls
 * back to the always-available open-in-tabs provider instead of surfacing an
 * error. The UI shows a small notice via the `degraded` flag.
 */
export async function runSearch(
  raw: string,
  settings: Settings,
  docTypeIds?: readonly DocTypeId[],
): Promise<SearchRun> {
  const analysis = analyzeProduct(raw, settings.customManufacturers);
  const provider = resolveProvider(settings);
  const types = resolveDocTypes(docTypeIds ?? settings.docTypes);

  const groups: DocTypeGroup[] = [];
  let degraded = false;
  let degradedReason: string | undefined;

  for (const id of types) {
    const config = DOC_TYPES[id];
    const queries = buildQueries(analysis, config);

    try {
      const outcome = await provider.search(queries, { analysis, settings, docType: id });

      if (outcome.kind === 'open-tabs') {
        // The active provider is itself the open-in-tabs provider — expected,
        // not a degradation.
        groups.push({ docType: id, label: config.label, results: [], tabs: outcome.tabs });
        continue;
      }

      if (outcome.results.length > 0) {
        groups.push({ docType: id, label: config.label, results: outcome.results, tabs: [] });
        continue;
      }

      // Inline provider returned nothing — degrade this type to open-in-tabs.
      groups.push({
        docType: id,
        label: config.label,
        results: [],
        tabs: await fallbackTabs(analysis, queries, settings),
      });
      degraded = true;
      degradedReason ??= `No results from ${provider.label}.`;
    } catch (err) {
      const reason = err instanceof Error ? err.message : `${provider.label} request failed`;
      groups.push({
        docType: id,
        label: config.label,
        results: [],
        tabs: await fallbackTabs(analysis, queries, settings),
      });
      degraded = true;
      degradedReason ??= reason;
    }
  }

  return { analysis, provider, groups, degraded, degradedReason };
}

/** Run the open-in-tabs fallback provider for one type's queries. */
async function fallbackTabs(
  analysis: ProductAnalysis,
  queries: GeneratedQuery[],
  settings: Settings,
): Promise<{ label: string; url: string }[]> {
  const fallback = getProvider('fallback');
  const outcome = await fallback.search(queries, { analysis, settings });
  return outcome.kind === 'open-tabs' ? outcome.tabs : [];
}
