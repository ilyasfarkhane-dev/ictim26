import { motion } from "framer-motion";
import {
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineArrowUpTray,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import Button from "../components/Button";
import { useConference } from "../hooks/useConference";
import { fadeUp, staggerContainer } from "../utils/animations";

const iconMap = {
  search: HiOutlineArrowUpTray,
  document: HiOutlineDocumentText,
  check: HiOutlineCheckCircle,
  edit: HiOutlinePencilSquare,
  calendar: HiOutlineCalendarDays,
};

function DateCard({ item, isLast, variant = "desktop" }) {
  const Icon = iconMap[item.icon];

  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
        isLast
          ? "bg-primary border-primary text-white shadow-glow lg:-mt-1 lg:scale-[1.03]"
          : "bg-white/90 backdrop-blur-sm border-border hover:border-primary/25 hover:shadow-premium"
      }`}
    >
      {variant === "desktop" && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-section shadow-sm ${
              isLast ? "bg-white text-primary" : "bg-primary text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>
      )}

      {variant === "mobile" && (
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isLast ? "bg-white/20 text-white" : "bg-light-blue text-primary"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-widest ${
              isLast ? "text-white/75" : "text-primary"
            }`}
          >
            Step {item.step}
          </span>
        </div>
      )}

      <span
        className={`${variant === "desktop" ? "block" : "hidden"} text-xs font-bold uppercase tracking-widest ${
          isLast ? "text-white/75" : "text-primary"
        }`}
      >
        Step {item.step}
      </span>

      <time
        dateTime={item.date}
        className={`mt-2 text-xl sm:text-2xl font-extrabold tracking-tight leading-none ${
          isLast ? "text-white" : "text-navy"
        }`}
      >
        {item.date}
      </time>

      <h3
        className={`mt-3 text-sm sm:text-base font-bold leading-snug ${
          isLast ? "text-white" : "text-navy"
        }`}
      >
        {item.title}
      </h3>

      <p
        className={`mt-2 text-sm leading-relaxed flex-1 ${
          isLast ? "text-white/80" : "text-text-secondary"
        }`}
      >
        {item.description}
      </p>
    </article>
  );
}

export default function ImportantDates() {
  const { participationSteps } = useConference();

  return (
    <section
      id="important-dates"
      className="relative py-20 lg:py-24 overflow-hidden border-y border-border/50"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-section via-white to-section" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-10" />

      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-16">
          <SectionHeader
            title="Important Dates"
            subtitle="Key milestones for authors and attendees — plan your submission and travel for ICTIM'26."
            align="left"
            className="mb-0"
          />
         
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="hidden lg:block relative pt-8"
        >
          <div className="grid grid-cols-5 gap-4">
            {participationSteps.map((item, i) => (
              <motion.div key={item.id} variants={fadeUp} custom={i * 0.07}>
                <DateCard
                  item={item}
                  isLast={i === participationSteps.length - 1}
                  variant="desktop"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="lg:hidden relative"
        >
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30" />

          <div className="space-y-5 pl-12">
            {participationSteps.map((item, i) => (
              <motion.div key={item.id} variants={fadeUp} custom={i * 0.07} className="relative">
                <div
                  className={`absolute -left-12 top-6 flex h-3 w-3 rounded-full border-2 border-white shadow-glow ${
                    i === participationSteps.length - 1 ? "bg-primary" : "bg-accent"
                  }`}
                />
                <DateCard
                  item={item}
                  isLast={i === participationSteps.length - 1}
                  variant="mobile"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
