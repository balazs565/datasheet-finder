/**
 * Product-name normalization.
 *
 * Removes marketing / category noise while preserving brand tokens and model
 * numbers. Pure functions — no DOM, no chrome APIs — so this is trivially
 * unit-testable.
 *
 * Example: "Brother MFC-L5715DN printer" -> "Brother MFC-L5715DN"
 */

/** Lower-cased noise words removed from product names. */
const NOISE_WORDS = new Set<string>([
  // categories
  'printer', 'laptop', 'notebook', 'desktop', 'computer', 'monitor', 'display',
  'router', 'switch', 'firewall', 'server', 'nas', 'storage', 'scanner', 'camera',
  'phone', 'smartphone', 'tablet', 'ups', 'access', 'point', 'adapter', 'cpu',
  'processor', 'gpu', 'graphics', 'card', 'motherboard', 'drive', 'ssd', 'hdd',
  // marketing / retail
  'buy', 'cheap', 'best', 'price', 'review', 'reviews', 'sale', 'deal', 'deals',
  'new', 'used', 'refurbished', 'official', 'genuine', 'original', 'wireless',
  'wired', 'gaming', 'pro', 'plus', 'series', 'edition', 'model', 'the', 'a', 'an',
  'with', 'and', 'for', 'inch', 'inches',
]);

/** Strip surrounding quotes/brackets and collapse whitespace. */
function stripWrappers(input: string): string {
  return input
    .replace(/[“”„"'`()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * A token looks like a model number when it contains a digit, or mixes
 * letters with digits/dashes (e.g. "MFC-L5715DN", "RB5009", "i7-13700K").
 */
export function looksLikeModelNumber(token: string): boolean {
  const t = token.replace(/[.,;:]$/, '');
  if (t.length < 2) return false;
  const hasDigit = /\d/.test(t);
  const hasLetter = /[a-z]/i.test(t);
  if (hasDigit && (hasLetter || /[-/]/.test(t))) return true;
  // pure long digit runs (e.g. "5715") also count
  if (/^\d{3,}$/.test(t)) return true;
  return false;
}

/** Extract tokens that look like model numbers, preserving original casing. */
export function extractModelNumbers(input: string): string[] {
  const out: string[] = [];
  for (const tok of stripWrappers(input).split(' ')) {
    const clean = tok.replace(/[.,;:]+$/, '');
    if (looksLikeModelNumber(clean)) out.push(clean);
  }
  return out;
}

/**
 * Normalize a raw product name:
 *  - strip wrappers / punctuation noise
 *  - drop category & marketing words (unless they look like model numbers)
 *  - preserve order, brand tokens and model numbers
 *  - collapse whitespace, trim trailing separators
 */
export function normalizeProductName(input: string): string {
  const cleaned = stripWrappers(input);
  if (!cleaned) return '';

  const kept: string[] = [];
  for (const rawTok of cleaned.split(' ')) {
    const tok = rawTok.replace(/[.,;:]+$/, '');
    if (!tok) continue;
    const lower = tok.toLowerCase();
    const isNoise = NOISE_WORDS.has(lower);
    if (isNoise && !looksLikeModelNumber(tok)) continue;
    kept.push(tok);
  }

  // If everything was treated as noise, fall back to the cleaned input so we
  // never produce an empty query from non-empty input.
  const result = kept.join(' ').trim();
  return result || cleaned;
}
