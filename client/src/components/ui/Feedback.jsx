export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 px-6 py-10 text-center">
      <p className="font-display text-sm font-bold text-ink-700">{title}</p>
      {description && <p className="max-w-xs text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-ink-300 border-t-pulse-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingBlock({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-500">
      <Spinner />
      {label}
    </div>
  );
}

export function Alert({ variant = "error", children }) {
  const styles = {
    error: "bg-status-rejected-bg text-status-rejected border-status-rejected/20",
    success: "bg-status-approved-bg text-status-approved border-status-approved/20",
    warning: "bg-status-pending-bg text-status-pending border-status-pending/20",
  };
  return (
    <div className={`rounded-lg border px-3.5 py-2.5 text-sm font-medium ${styles[variant]}`}>
      {children}
    </div>
  );
}
