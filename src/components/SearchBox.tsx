import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onDetect?: () => void;
  loading: boolean;
  detecting?: boolean;
}

/** Search input + actions. Enter triggers search; autofocuses on mount. */
export function SearchBox({
  value,
  onChange,
  onSearch,
  onDetect,
  loading,
  detecting,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="searchbox">
      <div className={`searchbox-input ${focused ? 'is-focused' : ''}`}>
        <span className="searchbox-icon" aria-hidden>
          🔎
        </span>
        <input
          ref={ref}
          className="searchbox-field"
          type="text"
          placeholder="Paste a product name, e.g. Brother MFC-L5715DN"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
          aria-label="Product name"
        />
        {value && (
          <button
            className="btn-ghost btn-icon searchbox-clear"
            onClick={() => onChange('')}
            title="Clear"
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>
      <button
        className="btn btn-primary"
        onClick={onSearch}
        disabled={loading || !value.trim()}
      >
        {loading ? 'Searching…' : 'Search'}
      </button>
      {onDetect && (
        <button
          className="btn"
          onClick={onDetect}
          disabled={detecting}
          title="Detect product from the current page"
        >
          {detecting ? '…' : 'Detect'}
        </button>
      )}
    </div>
  );
}
