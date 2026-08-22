export default function Select({ label, id, error, options, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border bg-paper-raised px-3.5 py-2.5 text-sm text-ink-900 transition-colors focus:border-pulse-500 focus:outline-none ${
          error ? "border-status-rejected" : "border-ink-300"
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-status-rejected">{error}</p>}
    </div>
  );
}
