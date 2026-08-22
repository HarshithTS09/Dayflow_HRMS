const STATUS_STYLES = {
  present: { bg: "var(--color-status-present-bg)", fg: "var(--color-status-present)" },
  absent: { bg: "var(--color-status-absent-bg)", fg: "var(--color-status-absent)" },
  "half-day": { bg: "var(--color-status-half-bg)", fg: "var(--color-status-half)" },
  leave: { bg: "var(--color-status-leave-bg)", fg: "var(--color-status-leave)" },
  pending: { bg: "var(--color-status-pending-bg)", fg: "var(--color-status-pending)" },
  approved: { bg: "var(--color-status-approved-bg)", fg: "var(--color-status-approved)" },
  rejected: { bg: "var(--color-status-rejected-bg)", fg: "var(--color-status-rejected)" },
};

export default function StatusBadge({ status, children }) {
  const style = STATUS_STYLES[status] || {
    bg: "var(--color-ink-100)",
    fg: "var(--color-ink-700)",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.fg }} />
      {children || status}
    </span>
  );
}
