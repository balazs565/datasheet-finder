import type { GeneratedQuery, ProductAnalysis } from '../types';
import { DOC_TYPES, type DocTypeConfig } from '../doc-types';

/** Descending intent weights applied to each `<term> pdf` query, by position. */
const TERM_WEIGHTS = [0.88, 0.82, 0.74, 0.7, 0.62, 0.56, 0.5];

/** Turn a search term into a slug usable as a query intent. */
function intentSlug(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Generate the optimized search queries for a product and a given document
 * type. The shape is identical across types — only the document type's
 * `searchTerms` change — so new types can be added purely as data in
 * `core/doc-types.ts`.
 *
 * Design notes (informed by real-world results):
 *  - **Unquoted** name. Quoting the whole product name (`"dell qcm1250"`)
 *    requires that exact phrase verbatim and tanks recall; bare terms match the
 *    way a human would type them into a search box.
 *  - **Broad, high-recall queries lead** (highest weight). `site:` queries are
 *    kept but weighted *below* the broad ones, so they act as a bonus rather
 *    than restricting the search to the manufacturer domain — documents are
 *    frequently hosted on distributor / third-party sites, not only the OEM.
 *
 * Each query carries an `intent` and `weight` consumed by `selectApiQueries`
 * and the ranker, plus the `docType` it belongs to.
 */
export function buildQueries(
  analysis: ProductAnalysis,
  config: DocTypeConfig = DOC_TYPES.datasheet,
): GeneratedQuery[] {
  const name = analysis.normalized.trim();
  if (!name) return [];

  const terms = config.searchTerms;
  const lead = terms[0];

  const queries: GeneratedQuery[] = [
    { query: `${name} ${lead} filetype:pdf`, intent: intentSlug(lead), weight: 1.0, manufacturerScoped: false, docType: config.id },
    { query: `${name} filetype:pdf`, intent: 'filetype-pdf', weight: 0.98, manufacturerScoped: false, docType: config.id },
    ...terms.map((term, i) => ({
      query: `${name} ${term} pdf`,
      intent: intentSlug(term),
      weight: TERM_WEIGHTS[i] ?? Math.max(0.3, 0.5 - i * 0.04),
      manufacturerScoped: false,
      docType: config.id,
    })),
  ];

  const domain = analysis.manufacturer?.domain;
  if (domain) {
    // Below the broad queries on purpose — a bonus, not a restriction.
    queries.push(
      { query: `site:${domain} ${name} filetype:pdf`, intent: 'site-pdf', weight: 0.9, manufacturerScoped: true, docType: config.id },
      { query: `site:${domain} ${name} ${lead}`, intent: `site-${intentSlug(lead)}`, weight: 0.85, manufacturerScoped: true, docType: config.id },
    );
  }

  return queries;
}

/**
 * Plain-text query variants used by the open-in-tabs fallback provider — one
 * tab per query. Mirrors the broad/unquoted shape of {@link buildQueries}.
 */
export function buildPlainQueries(
  analysis: ProductAnalysis,
  config: DocTypeConfig = DOC_TYPES.datasheet,
): string[] {
  const name = analysis.normalized.trim();
  if (!name) return [];

  const terms = config.searchTerms;
  const out = [
    `${name} ${terms[0]} filetype:pdf`,
    `${name} filetype:pdf`,
    ...terms.map((term) => `${name} ${term} pdf`),
  ];

  const domain = analysis.manufacturer?.domain;
  if (domain) {
    out.push(`site:${domain} ${name} pdf`, `site:${domain} ${name} ${terms[0]}`);
  }
  return out;
}
