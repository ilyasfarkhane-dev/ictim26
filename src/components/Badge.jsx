import { motion } from "framer-motion";
import { fadeIn } from "../utils/animations";

export default function Badge({ children, className = "" }) {
  return (
    <motion.span
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={`inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      {children}
    </motion.span>
  );
}
