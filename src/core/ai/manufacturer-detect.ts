import type { Manufacturer, ProductAnalysis } from '../types';
import { buildManufacturerIndex, type ManufacturerIndex } from './manufacturer-map';
import { extractModelNumbers, normalizeProductName } from './normalizer';

/**
 * Detect the manufacturer of a (normalized) product name using:
 *  1. Direct alias match on any token or multi-word alias (high confidence).
 *  2. Model-number prefix match (medium-high confidence).
 *
 * Returns the manufacturer plus a 0–100 confidence.
 */
export function detectManufacturer(
  normalized: string,
  index: ManufacturerIndex,
): { manufacturer: Manufacturer | null; confidence: number } {
  const lower = normalized.toLowerCase();
  const tokens = lower.split(/\s+/).filter(Boolean);

  // 1) Multi-word alias match (e.g. "tp link", "hewlett packard enterprise").
  for (const [alias, m] of index.byAlias) {
    if (alias.includes(' ') && lower.includes(alias)) {
      return { manufacturer: m, confidence: 95 };
    }
  }

  // 2) Single-token alias match — strongest when it's the leading token.
  for (let i = 0; i < tokens.length; i++) {
    const hit = index.byAlias.get(tokens[i]);
    if (hit) return { manufacturer: hit, confidence: i === 0 ? 95 : 85 };
  }

  // 3) Model-prefix match against any token.
  for (const tok of tokens) {
    for (const [prefix, m] of index.byPrefix) {
      if (tok.startsWith(prefix)) return { manufacturer: m, confidence: 75 };
    }
  }

  return { manufacturer: null, confidence: 0 };
}

/**
 * Full analysis pipeline: normalize -> detect manufacturer -> extract models.
 * This is the single entry point used by the popup and background.
 */
export function analyzeProduct(
  raw: string,
  customManufacturers: Manufacturer[] = [],
): ProductAnalysis {
  const index = buildManufacturerIndex(customManufacturers);
  const normalized = normalizeProductName(raw);
  const { manufacturer, confidence } = detectManufacturer(normalized, index);
  return {
    raw,
    normalized,
    manufacturer,
    manufacturerConfidence: confidence,
    modelNumbers: extractModelNumbers(normalized),
  };
}
