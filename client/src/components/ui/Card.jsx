export default function Card({ title, action, children, className = "", padded = true }) {
  return (
    <div className={`rounded-2xl border border-ink-100 bg-paper-raised shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          {title && <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>}
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  );
}
