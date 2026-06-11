const variants = {
  primary: "bg-dash-primary text-white hover:bg-dash-primary-dark",
  secondary: "bg-white text-dash-text border border-dash-border hover:bg-dash-bg",
  danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  ghost: "text-dash-muted hover:bg-dash-bg hover:text-dash-text",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export default function DashButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dash-focus-ring ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
