import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineChevronDown } from "react-icons/hi2";

export default function NavDropdown({ label, items, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-800 hover:text-blue-900 transition-colors duration-200 cursor-pointer group"
      >
        {label}
        <HiOutlineChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full bg-blue-800 transition-all duration-300 group-hover:w-4/5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseLeave={() => setOpen(false)}
            className="absolute top-full left-0 mt-2 w-56 rounded-xl glass shadow-premium border border-white/60 py-2 overflow-hidden z-50"
          >
            {items.map((item) => (
              <a
                key={item.id ?? item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={handleLinkClick}
                className="flex flex-col px-4 py-2.5 hover:bg-light-blue/50 transition-colors duration-150 cursor-pointer"
              >
                <span className="text-sm font-semibold text-blue-800">{item.label}</span>
                {item.subtitle && (
                  <span className="text-xs text-text-secondary mt-0.5">{item.subtitle}</span>
                )}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
