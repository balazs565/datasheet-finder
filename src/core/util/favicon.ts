import { bareDomain } from './url';

/**
 * Build a favicon URL for a domain via Google's public s2 favicon service.
 * No bundled assets, always current. Components fall back to an initials
 * avatar if the image fails to load.
 */
export function faviconUrl(domain: string, size = 64): string {
  const d = bareDomain(domain.toLowerCase());
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=${size}`;
}

/** Deterministic accent color from a string, for initials avatars. */
export function colorFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

/** First letters for an initials avatar (max 2). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
