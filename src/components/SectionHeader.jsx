import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";

export default function SectionHeader({
  title,
  subtitle,
  align = "center",
  className = "",
}) {
  const alignClass =
    align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`mb-14 lg:mb-16 max-w-3xl ${alignClass} ${className}`}>
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          custom={0.1}
          viewport={{ once: true, margin: "-80px" }}
          className="mt-4 text-lg text-text-secondary leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
