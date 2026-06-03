/** Small URL helpers shared across ranking and providers. */

/** Extract the hostname from a URL, or '' if it can't be parsed. */
export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/** Strip a leading "www." for domain comparisons. */
export function bareDomain(host: string): string {
  return host.replace(/^www\./, '');
}

/** True if `host` is the manufacturer domain or a subdomain of it. */
export function isSameOrSubdomain(host: string, domain: string): boolean {
  const h = bareDomain(host.toLowerCase());
  const d = bareDomain(domain.toLowerCase());
  return h === d || h.endsWith(`.${d}`);
}

/**
 * True only for `http:`/`https:` URLs. Used as a safety gate before navigating
 * to or framing a user/result-supplied URL, so `javascript:`, `data:`, `file:`
 * and other schemes are never loaded by the extension.
 */
export function isHttpUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** Heuristic check that a URL points at a PDF. */
export function looksLikePdf(url: string, title = '', snippet = ''): boolean {
  const u = url.toLowerCase();
  if (/\.pdf(\?|#|$)/.test(u)) return true;
  if (u.includes('format=pdf') || u.includes('filetype=pdf')) return true;
  const text = `${title} ${snippet}`.toLowerCase();
  return text.includes('.pdf');
}
