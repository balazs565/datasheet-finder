import type { GeneratedQuery } from '../types';
import { SearchProviderError } from './types';
import type { ProviderId } from '../types';

/**
 * Pick a subset of generated queries to actually run, highest-weight first.
 *
 * Ranking purely by weight means the broad, high-recall queries lead and the
 * `site:` queries (lower weight) only get included once there's room — they
 * supplement the search rather than restricting it to the manufacturer domain.
 * This avoids the failure mode where a product whose datasheet isn't on the OEM
 * site returns nothing.
 */
export function selectApiQueries(queries: GeneratedQuery[], limit = 3): GeneratedQuery[] {
  return [...queries].sort((a, b) => b.weight - a.weight).slice(0, limit);
}

/** Fetch JSON with a timeout and uniform error wrapping. */
export async function fetchJson<T>(
  url: string,
  init: RequestInit,
  providerId: ProviderId,
  timeoutMs = 12000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new SearchProviderError(
        `${providerId} API returned ${res.status} ${res.statusText}${
          body ? `: ${body.slice(0, 200)}` : ''
        }`,
        providerId,
      );
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof SearchProviderError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new SearchProviderError(`${providerId} request timed out`, providerId, err);
    }
    throw new SearchProviderError(
      `${providerId} request failed: ${(err as Error).message}`,
      providerId,
      err,
    );
  } finally {
    clearTimeout(timer);
  }
}
