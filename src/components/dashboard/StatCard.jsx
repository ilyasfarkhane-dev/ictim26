export default function StatCard({ label, value, change, positive = true, sparkline }) {
  return (
    <div className="dash-card p-5">
      <p className="text-sm text-dash-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-dash-text tabular-nums">{value}</p>
      {change && (
        <span
          className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}
        >
          {change}
        </span>
      )}
      {sparkline && <div className="mt-4 h-8">{sparkline}</div>}
    </div>
  );
}
