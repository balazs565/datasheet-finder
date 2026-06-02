import { useState } from 'react';
import { colorFromString, faviconUrl, initials } from '../core/util/favicon';

interface Props {
  /** Manufacturer name (used for the initials fallback + color). */
  name: string | null;
  /** Domain to fetch the favicon from. */
  domain: string;
  size?: number;
}

/**
 * Shows a manufacturer/site logo via favicon, falling back to a colored
 * initials avatar when the favicon can't load or there's no domain.
 */
export function ManufacturerLogo({ name, domain, size = 28 }: Props) {
  const [failed, setFailed] = useState(false);
  const label = name ?? domain;
  const dimension = { width: size, height: size, borderRadius: size * 0.28 } as const;

  if (failed || !domain) {
    return (
      <div
        className="mfr-logo mfr-logo-fallback"
        style={{ ...dimension, background: colorFromString(label || '?'), fontSize: size * 0.42 }}
        title={label}
        aria-label={label}
      >
        {initials(label || '?')}
      </div>
    );
  }

  return (
    <img
      className="mfr-logo"
      style={dimension}
      src={faviconUrl(domain, Math.max(32, size * 2))}
      alt={label}
      title={label}
      onError={() => setFailed(true)}
    />
  );
}
