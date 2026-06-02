import type { ReactNode } from 'react';

/** Centered loading state with a spinner. */
export function LoadingState({ message = 'Searching…' }: { message?: string }) {
  return (
    <div className="state">
      <div className="spinner" />
      <p className="muted">{message}</p>
    </div>
  );
}

/** Empty state with an icon glyph, title and optional hint/children. */
export function EmptyState({
  icon = '🔍',
  title,
  hint,
  children,
}: {
  icon?: string;
  title: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="state">
      <div className="state-icon" aria-hidden>
        {icon}
      </div>
      <p className="state-title">{title}</p>
      {hint && <p className="muted state-hint">{hint}</p>}
      {children}
    </div>
  );
}

/** Error state with a retry affordance. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state">
      <div className="state-icon" aria-hidden>
        ⚠️
      </div>
      <p className="state-title">Something went wrong</p>
      <p className="muted state-hint">{message}</p>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
