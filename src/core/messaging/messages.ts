import type { DetectedProduct } from '../types';

/**
 * Typed message contracts exchanged between the popup, background service
 * worker, and content scripts. Discriminated on `type`.
 */

/** popup/background -> content script: detect products on the page. */
export interface DetectProductsRequest {
  type: 'DETECT_PRODUCTS';
}

/** content script -> caller: detection result. */
export interface DetectProductsResponse {
  type: 'DETECT_PRODUCTS_RESULT';
  products: DetectedProduct[];
}

/** background -> popup is not used directly; popup pulls pending query from storage. */

/** Any message that can flow over chrome.runtime / tabs messaging. */
export type RuntimeMessage = DetectProductsRequest;

export type RuntimeResponse = DetectProductsResponse;

/** Storage key used to hand a pending query from background to the popup. */
export const PENDING_QUERY_KEY = 'pendingQuery';

export interface PendingQuery {
  text: string;
  timestamp: number;
}
