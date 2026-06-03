/**
 * Cross-context contracts for Datasheet Finder.
 *
 * Product detection no longer uses runtime messaging — it is injected on demand
 * via `chrome.scripting.executeScript` and returns its result directly (see
 * `src/content/detect.ts`). What remains here is the storage hand-off the
 * background service worker uses to pass a pending query to the popup.
 */

/** Storage key used to hand a pending query from background to the popup. */
export const PENDING_QUERY_KEY = 'pendingQuery';

export interface PendingQuery {
  text: string;
  timestamp: number;
}
