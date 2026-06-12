import { motion } from "framer-motion";
import {
  HiOutlineArrowRight,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
} from "react-icons/hi2";
import Badge from "../components/Badge";
import Button from "../components/Button";
import MetaPill from "../components/MetaPill";
import { useConference } from "../hooks/useConference";
import {
  fadeUp,
  slideFromLeft,
  staggerContainer,
} from "../utils/animations";
import {
  DEFAULT_HERO_ALT,
  normalizeHeroImage,
  resolveHeroSrc,
} from "../lib/heroImages";
import { getVisibleHeroHighlights } from "../lib/heroHighlights";

export default function Hero() {
  const { conference, heroHighlights, heroImages } = useConference();
  const heroBackground = normalizeHeroImage(heroImages);
  const bgSrc = resolveHeroSrc(heroBackground.src);
  const visibleHighlights = getVisibleHeroHighlights(heroHighlights);

  return (
    <section
      id="home"
      className="relative isolate pt-28 pb-16 sm:pb-20 lg:pt-32 lg:pb-24 overflow-x-hidden"
    >
      {/* Background photo */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-right md:bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgSrc})` }}
        role="img"
        aria-label={heroBackground.alt || DEFAULT_HERO_ALT}
      />

      {/* Gray overlay — flat on mobile, gradient on md+ for left-aligned copy */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gray-900/55 md:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[1] pointer-events-none hidden md:block bg-gradient-to-r from-gray-900/65 via-gray-900/45 to-gray-900/15"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:pl-12 lg:pr-8 xl:pl-16 xl:pr-8 2xl:pl-20">
        <motion.div
          variants={slideFromLeft}
          initial="hidden"
          animate="visible"
          className="[text-shadow:0_2px_12px_rgba(0,0,0,0.45)]"
        >
          <Badge>International Conference · TIM Laboratory</Badge>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-white/90">
            {conference.fullName}
          </p>

          <h1 className="mt-4 text-[2.75rem] sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-extrabold tracking-tight text-white leading-[1.05]">
            {conference.name}
          </h1>

          <p className="mt-3 text-xl sm:text-2xl font-bold text-white leading-snug">
            Information Technology & Modeling
          </p>

          <p className="mt-5 text-base sm:text-lg font-medium text-white/90 leading-relaxed border-l-4 border-white/70 pl-4">
            {conference.tagline}
          </p>

          <p className="mt-4 text-base text-white/80 leading-relaxed max-w-lg">
            {conference.publication}
          </p>

          <div className="mt-7 flex flex-row flex-nowrap items-center gap-2.5">
            <MetaPill icon={HiOutlineCalendarDays}>{conference.dates}</MetaPill>
            <MetaPill icon={HiOutlineMapPin}>{conference.venue}</MetaPill>
          </div>

          {visibleHighlights.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className={`mt-8 grid gap-3 max-w-md ${
                visibleHighlights.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {visibleHighlights.map((stat, i) => (
                <motion.div
                  key={`${stat.label}-${stat.value}`}
                  variants={fadeUp}
                  custom={0.15 + i * 0.06}
                  className="rounded-xl border border-white/25 bg-black/35 backdrop-blur-sm px-4 py-3 shadow-sm"
                >
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs font-medium text-white/75 mt-0.5">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-10 flex flex-row flex-nowrap items-center gap-3 sm:gap-4">
            <Button variant="primary" size="lg" href="#call-for-papers" className="shrink-0">
              Call for Papers
              <HiOutlineArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="lg" href="#important-dates" className="shrink-0 border-white/50 text-white bg-white/10 hover:bg-white/20 hover:border-white/70 shadow-sm">
              Important Dates
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
