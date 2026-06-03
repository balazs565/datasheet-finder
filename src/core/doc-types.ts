import type { DocTypeId } from './types';

/**
 * Configuration for a single searchable document type.
 *
 * Adding a new document type is intentionally a *data* change: append an entry
 * to {@link DOC_TYPES} (and a member to {@link DocTypeId}) and the query
 * builder, ranker, orchestrator and UI all pick it up automatically — no
 * hardcoded per-type branches.
 */
export interface DocTypeConfig {
  /** Stable identifier, also used as the storage value. */
  id: DocTypeId;
  /** Plural heading shown for the result section, e.g. "Datasheets". */
  label: string;
  /** Checkbox option label in the selector. */
  optionLabel: string;
  /**
   * Ordered search terms, most specific first. The first term is also used for
   * the `filetype:pdf` lead query and the manufacturer-scoped (`site:`) query.
   * These drive {@link buildQueries} / {@link buildPlainQueries}.
   */
  searchTerms: string[];
  /**
   * Keywords the ranker treats as a strong signal that a result belongs to this
   * document type (lower-cased substrings matched against title/url/snippet).
   */
  rankKeywords: string[];
}

/**
 * The document-type registry. The single source of truth consumed across the
 * search pipeline. Order here defines the default display order of sections.
 */
export const DOC_TYPES: Record<DocTypeId, DocTypeConfig> = {
  datasheet: {
    id: 'datasheet',
    label: 'Datasheets',
    optionLabel: 'Datasheet PDF',
    searchTerms: [
      'datasheet',
      'spec sheet',
      'specifications',
      'technical specifications',
      'product brief',
    ],
    // Kept identical to the original datasheet ranking keywords so existing
    // datasheet scoring is preserved exactly.
    rankKeywords: ['datasheet', 'data sheet', 'spec sheet', 'specsheet', 'specification'],
  },
  doc: {
    id: 'doc',
    label: 'EU Declarations of Conformity',
    optionLabel: 'EU Declaration of Conformity (DoC) PDF',
    searchTerms: [
      'EU Declaration of Conformity',
      'Declaration of Conformity',
      'CE Declaration',
      'DoC',
    ],
    // Distinctive phrases only — a bare "doc" substring would mis-match
    // "document", "docs", etc. and pollute scoring.
    rankKeywords: [
      'declaration of conformity',
      'eu declaration',
      'ce declaration',
      'declaration of ce',
      // Common non-English equivalents found on official EU manufacturer sites.
      'konformitätserklärung',
      'déclaration de conformité',
      'dichiarazione di conformità',
    ],
  },
};

/** Display / iteration order for document types. */
export const DOC_TYPE_ORDER: DocTypeId[] = ['datasheet', 'doc'];

/** Default selection — preserves the original datasheet-only behavior. */
export const DEFAULT_DOC_TYPES: DocTypeId[] = ['datasheet'];

/** Type guard for a stored/string value that may be a DocTypeId. */
export function isDocTypeId(value: unknown): value is DocTypeId {
  return typeof value === 'string' && value in DOC_TYPES;
}

/**
 * Normalize a requested list of document types: keep only known ids, preserve
 * the canonical {@link DOC_TYPE_ORDER}, and fall back to the default when the
 * input is empty or invalid. Always returns at least one type.
 */
export function resolveDocTypes(requested: readonly string[] | undefined): DocTypeId[] {
  const wanted = new Set((requested ?? []).filter(isDocTypeId));
  const ordered = DOC_TYPE_ORDER.filter((id) => wanted.has(id));
  return ordered.length > 0 ? ordered : [...DEFAULT_DOC_TYPES];
}
