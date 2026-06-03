import type { DocTypeId, ProductAnalysis, ResultSource, SearchResult, Settings } from '../types';
import { DOC_TYPES } from '../doc-types';
import { hostnameOf, isSameOrSubdomain, looksLikePdf } from '../util/url';

/** Known retailer / aggregator / mirror domains that should rank lower. */
const RETAILER_DOMAINS = [
  'amazon.', 'ebay.', 'walmart.', 'bestbuy.', 'newegg.', 'aliexpress.',
  'cdw.com', 'insight.com', 'bhphotovideo.', 'target.com', 'costco.com',
];

const MIRROR_DOMAINS = [
  'manualslib.com', 'manualsonline.com', 'scribd.com', 'slideshare.net',
  'datasheetspdf.com', 'alldatasheet.com', 'pdf4pro.com', 'studylib.net',
  'docslib.org', 'yumpu.com',
];

const BRIEF_KEYWORDS = ['product brief', 'brief', 'overview', 'quickspecs'];
const MANUAL_KEYWORDS = ['manual', 'user guide', 'userguide', 'guide', 'handbook', 'install'];

function matchesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/** Raw result fields a provider yields before ranking. */
export interface RawResult {
  title: string;
  url: string;
  snippet?: string;
}

/**
 * Classify a single raw result into a source tier and assign a 0–100
 * confidence. Deterministic and pure so it can be unit-tested.
 */
export function scoreResult(
  raw: RawResult,
  analysis: ProductAnalysis,
  settings: Settings,
  docType: DocTypeId = 'datasheet',
): { source: ResultSource; confidence: number; isPdf: boolean; domain: string } {
  const host = hostnameOf(raw.url);
  const text = `${raw.title} ${raw.url} ${raw.snippet ?? ''}`.toLowerCase();
  const isPdf = looksLikePdf(raw.url, raw.title, raw.snippet);
  const manufacturerDomain = analysis.manufacturer?.domain;
  const isOfficialHost = manufacturerDomain
    ? isSameOrSubdomain(host, manufacturerDomain)
    : false;

  // Keywords that signal a match for the document type being searched.
  const hasDatasheetKw = matchesAny(text, DOC_TYPES[docType].rankKeywords);
  const hasBriefKw = matchesAny(text, BRIEF_KEYWORDS);
  const hasManualKw = matchesAny(text, MANUAL_KEYWORDS);

  const isRetailer = RETAILER_DOMAINS.some((d) => host.includes(d));
  const isMirror = MIRROR_DOMAINS.some((d) => host.includes(d));

  let source: ResultSource;
  let score = 30; // baseline

  if (isOfficialHost && isPdf && hasDatasheetKw) {
    source = 'official';
    score = 96;
  } else if (isOfficialHost && isPdf) {
    source = 'official';
    score = 88;
  } else if (isOfficialHost && hasDatasheetKw) {
    source = 'official';
    score = 78;
  } else if (isOfficialHost && (hasBriefKw || hasManualKw)) {
    source = hasBriefKw ? 'brief' : 'manual';
    score = 70;
  } else if (isOfficialHost) {
    source = 'official';
    score = 62;
  } else if (isMirror) {
    source = 'mirror';
    score = isPdf ? 38 : 28;
  } else if (isRetailer) {
    source = 'retailer';
    score = isPdf ? 34 : 24;
  } else if (isPdf && hasDatasheetKw) {
    source = 'unknown';
    score = 58;
  } else if (isPdf) {
    source = 'unknown';
    score = 48;
  } else if (hasManualKw) {
    source = 'manual';
    score = 44;
  } else {
    source = 'unknown';
    score = 30;
  }

  // Bonus when product model number appears in title/url (strong relevance).
  if (analysis.modelNumbers.some((m) => text.includes(m.toLowerCase()))) {
    score += 6;
  }

  // Optional manufacturer prioritization boost.
  if (settings.prioritizeManufacturer && isOfficialHost) {
    score += 6;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { source, confidence: score, isPdf, domain: host };
}

/**
 * Rank an array of raw results: score, sort by confidence (PDFs break ties),
 * de-duplicate by URL, and cap to `settings.maxResults`.
 */
export function rankResults(
  raws: RawResult[],
  analysis: ProductAnalysis,
  settings: Settings,
  provider: SearchResult['provider'],
  docType: DocTypeId = 'datasheet',
): SearchResult[] {
  const seen = new Set<string>();
  const scored: SearchResult[] = [];

  for (const raw of raws) {
    const key = raw.url.split('#')[0];
    if (seen.has(key)) continue;
    seen.add(key);
    const { source, confidence, isPdf, domain } = scoreResult(raw, analysis, settings, docType);
    scored.push({
      title: raw.title,
      url: raw.url,
      domain,
      snippet: raw.snippet,
      isPdf,
      source,
      confidence,
      provider,
      docType,
    });
  }

  scored.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    if (a.isPdf !== b.isPdf) return a.isPdf ? -1 : 1;
    return 0;
  });

  return scored.slice(0, settings.maxResults);
}
