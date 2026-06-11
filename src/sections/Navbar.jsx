import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineBars3, HiOutlineXMark, HiOutlineChevronDown } from "react-icons/hi2";
import Logo from "../components/Logo";
import Button from "../components/Button";
import Container from "../components/Container";
import NavDropdown from "../components/NavDropdown";
import { useConference } from "../hooks/useConference";
import { useScrollPosition } from "../hooks/useScrollPosition";

export default function Navbar() {
  const { navLinks, conference, editionsDropdown } = useConference();
  const scrolled = useScrollPosition(40);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileEditionsOpen, setMobileEditionsOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileEditionsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6">
      <Container className="max-w-7xl !px-0">
        <nav
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
            scrolled
              ? "glass shadow-premium border border-white/60"
              : "bg-transparent"
          }`}
        >
          <Logo />

          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 4).map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-text-secondary hover:text-navy transition-colors duration-200 cursor-pointer group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-4/5" />
                </a>
              </li>
            ))}

            <NavDropdown
              label={editionsDropdown.label}
              items={editionsDropdown.items}
            />

            {navLinks.slice(4).map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-text-secondary hover:text-navy transition-colors duration-200 cursor-pointer group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-4/5" />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" href="#contact">
              Contact
            </Button>
            <Button variant="primary" size="sm" href="#register-pricing">
              Registration
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-navy hover:bg-section transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <HiOutlineXMark className="w-6 h-6" />
            ) : (
              <HiOutlineBars3 className="w-6 h-6" />
            )}
          </button>
        </nav>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden mt-2 mx-4 glass rounded-2xl shadow-premium overflow-hidden"
          >
            <ul className="py-2">
              {navLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={closeMobile}
                    className="block px-6 py-3 text-sm font-medium text-navy hover:bg-light-blue/40 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}

              <li>
                <button
                  type="button"
                  onClick={() => setMobileEditionsOpen((prev) => !prev)}
                  aria-expanded={mobileEditionsOpen}
                  className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium text-navy hover:bg-light-blue/40 transition-colors cursor-pointer"
                >
                  {editionsDropdown.label}
                  <HiOutlineChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${mobileEditionsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {mobileEditionsOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-light-blue/20"
                    >
                      {editionsDropdown.items.map((item) => (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            onClick={closeMobile}
                            className="flex flex-col px-8 py-2.5 text-sm text-navy hover:bg-light-blue/40 transition-colors cursor-pointer"
                          >
                            <span className="font-semibold">{item.label}</span>
                            {item.subtitle && (
                              <span className="text-xs text-text-secondary mt-0.5">
                                {item.subtitle}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>

              {navLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={closeMobile}
                    className="block px-6 py-3 text-sm font-medium text-navy hover:bg-light-blue/40 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 px-4 pb-4 border-t border-border pt-4">
              <a
                href={`mailto:${conference.contact.emails[0]}`}
                className="text-xs text-text-secondary text-center px-2"
              >
                {conference.contact.emails[0]}
              </a>
              <Button variant="primary" size="sm" href="#register-pricing" className="w-full" onClick={closeMobile}>
                Registration
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
