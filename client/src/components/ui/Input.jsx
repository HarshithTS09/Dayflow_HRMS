export default function Input({ label, id, error, hint, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border bg-paper-raised px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 transition-colors focus:border-pulse-500 focus:outline-none ${
          error ? "border-status-rejected" : "border-ink-300"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-status-rejected">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
