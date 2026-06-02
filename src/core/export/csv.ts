import type { SearchResult } from '../types';

/** Escape a single CSV field per RFC 4180. */
function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Convert ranked results into a CSV string with a header row. */
export function resultsToCsv(results: SearchResult[]): string {
  const header = ['Title', 'Domain', 'URL', 'PDF', 'Source', 'Confidence', 'Provider'];
  const rows = results.map((r) =>
    [
      r.title,
      r.domain,
      r.url,
      r.isPdf ? 'yes' : 'no',
      r.source,
      String(r.confidence),
      r.provider,
    ]
      .map(escapeCsv)
      .join(','),
  );
  return [header.join(','), ...rows].join('\r\n');
}

/** Build a data URL for a CSV download (works inside extension pages). */
export function csvDataUrl(csv: string): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}
