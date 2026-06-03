/** Browser-side actions shared by the popup and viewer. */

import { isHttpUrl } from './url';

/** Open an http(s) URL in a new tab. Other schemes are ignored for safety. */
export function openInNewTab(url: string): void {
  if (!isHttpUrl(url)) return;
  void chrome.tabs.create({ url });
}

/** Open the in-extension PDF viewer for an http(s) URL. */
export function openViewer(url: string, title?: string): void {
  if (!isHttpUrl(url)) return;
  const base = chrome.runtime.getURL('src/viewer/index.html');
  const params = new URLSearchParams({ url });
  if (title) params.set('title', title);
  void chrome.tabs.create({ url: `${base}?${params.toString()}` });
}

/** Copy text to the clipboard, resolving to success boolean. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Trigger a download via the downloads API (falls back to a tab). */
export function downloadUrl(url: string, filename?: string): void {
  // CSV/data: downloads from the popup are allowed; otherwise require http(s).
  if (!url.startsWith('data:') && !isHttpUrl(url)) return;
  if (chrome.downloads?.download) {
    chrome.downloads.download(filename ? { url, filename } : { url });
  } else {
    openInNewTab(url);
  }
}

/** Derive a sensible PDF filename from a URL. */
export function filenameFromUrl(url: string, fallback = 'datasheet.pdf'): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split('/').filter(Boolean).pop();
    if (last && /\.pdf$/i.test(last)) return decodeURIComponent(last);
    if (last) return `${decodeURIComponent(last)}.pdf`;
  } catch {
    /* ignore */
  }
  return fallback;
}
