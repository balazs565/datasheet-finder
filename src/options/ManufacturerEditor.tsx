import { useState } from 'react';
import type { Manufacturer } from '../core/types';

interface Props {
  custom: Manufacturer[];
  onChange: (list: Manufacturer[]) => void;
}

/** Add/remove custom manufacturer entries (name → domain + aliases). */
export function ManufacturerEditor({ custom, onChange }: Props) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [aliases, setAliases] = useState('');

  const add = () => {
    const cleanName = name.trim();
    const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanName || !cleanDomain) return;
    const aliasList = aliases
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);
    if (!aliasList.includes(cleanName.toLowerCase())) {
      aliasList.unshift(cleanName.toLowerCase());
    }
    const next = [
      ...custom.filter((m) => m.name.toLowerCase() !== cleanName.toLowerCase()),
      { name: cleanName, domain: cleanDomain, aliases: aliasList },
    ];
    onChange(next);
    setName('');
    setDomain('');
    setAliases('');
  };

  const remove = (n: string) =>
    onChange(custom.filter((m) => m.name.toLowerCase() !== n.toLowerCase()));

  return (
    <div className="mfr-editor">
      <div className="mfr-add">
        <input
          className="input"
          placeholder="Name (e.g. Contoso)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Domain (e.g. contoso.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <input
          className="input"
          placeholder="Aliases, comma-separated (optional)"
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn btn-primary" onClick={add} disabled={!name || !domain}>
          Add
        </button>
      </div>

      {custom.length === 0 ? (
        <p className="muted mfr-empty">No custom manufacturers yet.</p>
      ) : (
        <ul className="mfr-list">
          {custom.map((m) => (
            <li key={m.name}>
              <div>
                <strong>{m.name}</strong>{' '}
                <span className="subtle">→ {m.domain}</span>
                {m.aliases.length > 0 && (
                  <span className="muted mfr-aliases"> · {m.aliases.join(', ')}</span>
                )}
              </div>
              <button className="btn btn-sm" onClick={() => remove(m.name)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
