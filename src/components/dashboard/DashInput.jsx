export function DashInput({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-dash-text">{label}</span>
      )}
      <input
        className={`w-full rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm text-dash-text placeholder:text-dash-muted focus:outline-none focus:ring-2 focus:ring-dash-primary/30 focus:border-dash-primary transition-colors duration-200 dash-focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-dash-bg/50 ${className}`}
        {...props}
      />
    </label>
  );
}

export function DashTextarea({ label, className = "", rows = 4, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-dash-text">{label}</span>
      )}
      <textarea
        rows={rows}
        className={`w-full rounded-xl border border-dash-border bg-white px-4 py-2.5 text-sm text-dash-text placeholder:text-dash-muted focus:outline-none focus:ring-2 focus:ring-dash-primary/30 focus:border-dash-primary transition-colors duration-200 resize-y dash-focus-ring ${className}`}
        {...props}
      />
    </label>
  );
}
