const VARIANTS = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 focus-visible:outline-ink-900 disabled:bg-ink-300",
  accent:
    "bg-pulse-500 text-white hover:bg-pulse-600 focus-visible:outline-pulse-600 disabled:bg-ink-300",
  ghost:
    "bg-transparent text-ink-700 hover:bg-ink-100 border border-ink-300 disabled:text-ink-300",
  danger:
    "bg-transparent text-status-rejected hover:bg-status-rejected-bg border border-status-rejected/30",
  success:
    "bg-transparent text-status-approved hover:bg-status-approved-bg border border-status-approved/30",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
