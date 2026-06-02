interface Props {
  confidence: number;
}

/** Tier label + color for a 0–100 confidence score. */
function tier(confidence: number): { label: string; varName: string } {
  if (confidence >= 80) return { label: 'High', varName: '--tier-high' };
  if (confidence >= 50) return { label: 'Medium', varName: '--tier-med' };
  return { label: 'Low', varName: '--tier-low' };
}

/** Compact confidence indicator with a colored dot and score. */
export function ConfidenceBadge({ confidence }: Props) {
  const t = tier(confidence);
  return (
    <span className="confidence" title={`${t.label} confidence (${confidence}/100)`}>
      <span
        className="confidence-dot"
        style={{ background: `var(${t.varName})` }}
        aria-hidden
      />
      <span style={{ color: `var(${t.varName})` }}>{confidence}</span>
    </span>
  );
}
