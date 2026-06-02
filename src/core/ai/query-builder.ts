import type { GeneratedQuery, ProductAnalysis } from '../types';

/**
 * Generate the optimized search queries for a product.
 *
 * Design notes (informed by real-world results):
 *  - **Unquoted** name. Quoting the whole product name (`"dell qcm1250"`)
 *    requires that exact phrase verbatim and tanks recall; bare terms match the
 *    way a human would type them into a search box.
 *  - **Broad, high-recall queries lead** (highest weight). `site:` queries are
 *    kept but weighted *below* the broad ones, so they act as a bonus rather
 *    than restricting the search to the manufacturer domain — datasheets are
 *    frequently hosted on distributor / third-party sites, not only the OEM.
 *
 * Each query carries an `intent` and `weight` consumed by `selectApiQueries`
 * and the ranker.
 */
export function buildQueries(analysis: ProductAnalysis): GeneratedQuery[] {
  const name = analysis.normalized.trim();
  if (!name) return [];

  const queries: GeneratedQuery[] = [
    { query: `${name} datasheet filetype:pdf`, intent: 'datasheet', weight: 1.0, manufacturerScoped: false },
    { query: `${name} filetype:pdf`, intent: 'filetype-pdf', weight: 0.98, manufacturerScoped: false },
    { query: `${name} datasheet pdf`, intent: 'datasheet', weight: 0.88, manufacturerScoped: false },
    { query: `${name} spec sheet pdf`, intent: 'spec-sheet', weight: 0.82, manufacturerScoped: false },
    { query: `${name} specifications pdf`, intent: 'specifications', weight: 0.74, manufacturerScoped: false },
    { query: `${name} technical specifications pdf`, intent: 'technical-specifications', weight: 0.7, manufacturerScoped: false },
    { query: `${name} product brief pdf`, intent: 'product-brief', weight: 0.62, manufacturerScoped: false },
  ];

  const domain = analysis.manufacturer?.domain;
  if (domain) {
    // Below the broad queries on purpose — a bonus, not a restriction.
    queries.push(
      { query: `site:${domain} ${name} filetype:pdf`, intent: 'site-pdf', weight: 0.9, manufacturerScoped: true },
      { query: `site:${domain} ${name} datasheet`, intent: 'site-datasheet', weight: 0.85, manufacturerScoped: true },
    );
  }

  return queries;
}

/**
 * Plain-text query variants used by the open-in-tabs fallback provider — one
 * tab per query. Mirrors the broad/unquoted shape of {@link buildQueries}.
 */
export function buildPlainQueries(analysis: ProductAnalysis): string[] {
  const name = analysis.normalized.trim();
  if (!name) return [];
  const out = [
    `${name} datasheet filetype:pdf`,
    `${name} filetype:pdf`,
    `${name} datasheet pdf`,
    `${name} spec sheet pdf`,
    `${name} specifications pdf`,
    `${name} technical specifications pdf`,
    `${name} product brief pdf`,
  ];
  const domain = analysis.manufacturer?.domain;
  if (domain) {
    out.push(`site:${domain} ${name} pdf`, `site:${domain} ${name} datasheet`);
  }
  return out;
}
