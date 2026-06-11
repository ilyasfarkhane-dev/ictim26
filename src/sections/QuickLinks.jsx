import { motion } from "framer-motion";
import {
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlinePaperAirplane,
  HiOutlineUserGroup,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import Container from "../components/Container";
import { useConference } from "../hooks/useConference";
import { fadeUp, slideFromLeft, staggerContainer } from "../utils/animations";

const iconMap = {
  document: HiOutlineDocumentText,
  calendar: HiOutlineCalendarDays,
  submit: HiOutlinePaperAirplane,
  users: HiOutlineUserGroup,
};

export default function QuickLinks() {
  const { quickLinks } = useConference();

  return (
    <section className="py-16 lg:py-20 bg-white border-b border-border/50">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Navigate
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy">
              Quick Links
            </h2>
            <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed max-w-md">
              Jump to the sections you need — from call for papers to submission
              and committees.
            </p>
            <div className="mt-6 h-1 w-12 rounded-full bg-primary" />
          </motion.div>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="divide-y divide-border border-t border-border"
          >
            {quickLinks.map((link, i) => {
              const Icon = iconMap[link.icon] ?? HiOutlineDocumentText;
              const isExternal = link.href.startsWith("http");

              return (
                <motion.li key={link.id} variants={fadeUp} custom={i * 0.08}>
                  <a
                    href={link.href}
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group flex items-center gap-4 sm:gap-5 py-5 sm:py-6 transition-colors duration-200 cursor-pointer"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-light-blue text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                      <Icon className="w-5 h-5" />
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="block text-base sm:text-lg font-bold text-navy group-hover:text-primary transition-colors duration-200">
                        {link.title}
                      </span>
                      <span className="block mt-0.5 text-sm text-text-secondary leading-relaxed">
                        {link.description}
                      </span>
                    </span>

                    <HiOutlineChevronRight className="w-5 h-5 shrink-0 text-primary opacity-60 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </a>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}
