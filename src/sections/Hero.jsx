import { motion } from "framer-motion";
import {
  HiOutlineArrowRight,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
} from "react-icons/hi2";
import Badge from "../components/Badge";
import Button from "../components/Button";
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
import { getVisibleHeroSponsors } from "../lib/heroSponsors";
import { getVisibleHeroCtas } from "../lib/heroContent";

const STAT_ICONS = [
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
];

function HeroMetaCard({ icon: Icon, children }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-4xl border border-slate-200/90 bg-white px-4 py-3 shadow-md">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold leading-snug text-navy">{children}</span>
    </div>
  );
}

function HeroSponsorStrip({ sponsors }) {
  return (
    <div className="mt-4 flex w-full items-stretch overflow-hidden rounded-full border border-slate-200/90 bg-white py-4 shadow-md">
      {sponsors.map((sponsor, i) => (
        <div
          key={sponsor.id}
          className={`flex min-w-0 flex-1 items-center justify-center px-4 ${
            i > 0 ? "border-l border-slate-200" : ""
          }`}
        >
          <img
            src={sponsor.logoUrl}
            alt={sponsor.name}
            className="h-7 w-auto max-w-[8rem] shrink-0 object-contain"
          />
        </div>
      ))}
    </div>
  );
}

function HeroStatCard({ icon: Icon, value, label }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-primary px-4 py-4 shadow-lg">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-tight text-white">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-white/75">{label}</p>
      </div>
    </div>
  );
}

export default function Hero() {
  const { heroContent, heroHighlights, heroSponsors, heroImages } = useConference();
  const heroBackground = normalizeHeroImage(heroImages);
  const bgSrc = resolveHeroSrc(heroBackground.src);
  const hasBackground = Boolean(bgSrc);
  const visibleHighlights = getVisibleHeroHighlights(heroHighlights);
  const visibleSponsors = getVisibleHeroSponsors(heroSponsors);
  const visibleCtas = getVisibleHeroCtas(heroContent);

  return (
    <section
      id="home"
      className="relative isolate pt-28 pb-16 sm:pb-20 lg:pt-32 lg:pb-24 overflow-x-hidden"
    >
      {hasBackground ? (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-[right_center] bg-no-repeat"
            style={{ backgroundImage: `url(${bgSrc})` }}
            role="img"
            aria-label={heroBackground.alt || DEFAULT_HERO_ALT}
          />
          <div
            className="absolute inset-0 z-[1] pointer-events-none  md:hidden"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 z-[1] pointer-events-none hidden md:block "
            aria-hidden="true"
          />
        </>
      ) : (
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:pl-12 lg:pr-8 xl:pl-16 xl:pr-8 2xl:pl-20">
        <motion.div
          variants={slideFromLeft}
          initial="hidden"
          animate="visible"
          className="max-w-3xl [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]"
        >
          {heroContent.badge && <Badge>{heroContent.badge}</Badge>}

          {heroContent.fullName && (
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-800 sm:text-xs">
              {heroContent.fullName}
            </p>
          )}

          {heroContent.title && (
            <h1 className="mt-3 bg-gradient-to-b from-sky-600 via-blue-500 to-blue-900 bg-clip-text text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-transparent [text-shadow:none] sm:text-5xl lg:text-6xl xl:text-7xl">
              {heroContent.title}
            </h1>
          )}

          {heroContent.subtitle && (
            <p className="mt-3 text-xl font-bold leading-snug text-blue-800 sm:text-2xl">
              {heroContent.subtitle}
            </p>
          )}

          {heroContent.tagline && (
            <p className="mt-4 flex gap-3 text-base italic leading-relaxed text-blue-500 sm:text-lg">
              <span className="shrink-0 font-light not-italic text-blue-400/90" aria-hidden="true">
                |
              </span>
              <span>{heroContent.tagline}</span>
            </p>
          )}

          {heroContent.publication && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-800 sm:text-base">
              {heroContent.publication}
            </p>
          )}

          {(heroContent.dates || heroContent.venue) && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              {heroContent.dates && (
                <HeroMetaCard icon={HiOutlineCalendarDays}>{heroContent.dates}</HeroMetaCard>
              )}
              {heroContent.venue && (
                <HeroMetaCard icon={HiOutlineMapPin}>{heroContent.venue}</HeroMetaCard>
              )}
            </div>
          )}

          {visibleSponsors.length > 0 && <HeroSponsorStrip sponsors={visibleSponsors} />}

          {visibleHighlights.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className={`mt-4 grid gap-3 ${
                visibleHighlights.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {visibleHighlights.map((stat, i) => {
                const Icon = STAT_ICONS[i % STAT_ICONS.length];
                return (
                  <motion.div
                    key={`${stat.label}-${stat.value}`}
                    variants={fadeUp}
                    custom={0.1 + i * 0.06}
                  >
                    <HeroStatCard icon={Icon} value={stat.value} label={stat.label} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {visibleCtas.length > 0 && (
            <div className="mt-8 flex flex-row flex-wrap items-center gap-3 sm:gap-4">
              {visibleCtas.map((cta) => {
                const isPrimary = cta.variant !== "secondary";
                return (
                  <Button
                    key={cta.id}
                    variant={isPrimary ? "primary" : "secondary"}
                    size="lg"
                    href={cta.href}
                    className={
                      isPrimary
                        ? "shrink-0 cursor-pointer"
                        : "shrink-0 cursor-pointer border-blue-800/50 text-blue-800 bg-blue-800/10 hover:bg-blue-800/20 hover:border-blue-800/70 shadow-sm"
                    }
                  >
                    {cta.label}
                    {isPrimary && <HiOutlineArrowRight className="h-5 w-5" />}
                  </Button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
