import type { DocTypeId } from '../core/types';
import { DOC_TYPES, DOC_TYPE_ORDER } from '../core/doc-types';

interface Props {
  /** Currently selected document types. */
  selected: DocTypeId[];
  onChange: (selected: DocTypeId[]) => void;
  disabled?: boolean;
}

/**
 * Checkbox group letting the user pick one or more document types to search
 * for. Selections are mutually independent — any combination is valid — but at
 * least one must stay checked.
 */
export function DocTypeSelector({ selected, onChange, disabled }: Props) {
  const toggle = (id: DocTypeId) => {
    const next = selected.includes(id)
      ? selected.filter((t) => t !== id)
      : [...selected, id];
    // Never allow an empty selection — keep the last box checked.
    if (next.length === 0) return;
    onChange(DOC_TYPE_ORDER.filter((t) => next.includes(t)));
  };

  return (
    <fieldset className="doctype-selector" disabled={disabled}>
      <legend className="section-label">Document types</legend>
      <div className="doctype-options">
        {DOC_TYPE_ORDER.map((id) => {
          const config = DOC_TYPES[id];
          const checked = selected.includes(id);
          return (
            <label key={id} className={`doctype-option ${checked ? 'is-checked' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(id)}
              />
              <span className="doctype-check" aria-hidden>
                {checked ? '✓' : ''}
              </span>
              <span className="doctype-label">{config.optionLabel}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
