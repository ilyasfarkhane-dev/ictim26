export default function MetaPill({ icon: Icon, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 text-white/90 shrink-0" />}
      {children}
    </span>
  );
}
