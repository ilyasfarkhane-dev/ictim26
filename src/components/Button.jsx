import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-primary text-white hover:bg-secondary shadow-premium hover:shadow-glow",
  secondary:
    "bg-white text-navy border border-border hover:border-primary/30 hover:bg-light-blue/30 shadow-sm",
  ghost: "bg-transparent text-navy hover:bg-section border border-transparent hover:border-border",
  white: "bg-white text-primary hover:bg-light-blue shadow-premium",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
