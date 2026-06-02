import type {
  DetectProductsResponse,
  RuntimeMessage,
} from '../core/messaging/messages';
import type { DetectedProduct } from '../core/types';

/**
 * Content script: detects likely product names on the current page on demand.
 * Injected by the popup via chrome.scripting; communicates over runtime
 * messaging. Pure DOM reads — never mutates the page.
 */

/** Regex for tokens that look like model numbers (e.g. MFC-L5715DN, RB5009). */
const MODEL_RE = /\b([A-Z0-9]{2,}(?:[-/][A-Z0-9]+){1,3})\b/g;

function clip(text: string, max = 80): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max).trim() : t;
}

function metaContent(selector: string): string | null {
  const el = document.querySelector<HTMLMetaElement>(selector);
  return el?.content?.trim() || null;
}

function detectProducts(): DetectedProduct[] {
  const candidates: DetectedProduct[] = [];
  const push = (name: string, source: DetectedProduct['source'], confidence: number) => {
    const clean = clip(name);
    if (clean.length >= 3) candidates.push({ name: clean, source, confidence });
  };

  // Current text selection is the strongest signal.
  const selection = window.getSelection()?.toString().trim();
  if (selection) push(selection, 'selection', 90);

  // Structured metadata.
  const ogTitle = metaContent('meta[property="og:title"]');
  if (ogTitle) push(ogTitle, 'og:title', 70);

  const metaTitle =
    metaContent('meta[name="title"]') || metaContent('meta[itemprop="name"]');
  if (metaTitle) push(metaTitle, 'meta', 60);

  // Page title and first H1.
  if (document.title) push(document.title, 'title', 55);
  const h1 = document.querySelector('h1')?.textContent;
  if (h1) push(h1, 'heading', 50);

  // Boost any candidate that contains a model-number pattern.
  for (const c of candidates) {
    MODEL_RE.lastIndex = 0;
    if (MODEL_RE.test(c.name)) c.confidence = Math.min(95, c.confidence + 15);
  }

  // De-duplicate by lower-cased name, keep highest confidence, sort desc.
  const byName = new Map<string, DetectedProduct>();
  for (const c of candidates) {
    const key = c.name.toLowerCase();
    const prev = byName.get(key);
    if (!prev || c.confidence > prev.confidence) byName.set(key, c);
  }
  return [...byName.values()].sort((a, b) => b.confidence - a.confidence).slice(0, 6);
}

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (r: DetectProductsResponse) => void) => {
    if (message.type === 'DETECT_PRODUCTS') {
      sendResponse({ type: 'DETECT_PRODUCTS_RESULT', products: detectProducts() });
    }
    return true;
  },
);
