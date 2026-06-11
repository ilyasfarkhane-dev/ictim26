import { motion } from "framer-motion";
import {
  HiOutlineArrowRight,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
} from "react-icons/hi2";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Container from "../components/Container";
import MetaPill from "../components/MetaPill";
import { useConference } from "../hooks/useConference";
import {
  fadeUp,
  slideFromLeft,
  slideFromRight,
  staggerContainer,
  floatAnimation,
} from "../utils/animations";
import CloudinaryImage from "../components/CloudinaryImage";
import { useReducedMotion } from "../hooks/useReducedMotion";

export default function Hero() {
  const { conference, heroHighlights, heroImages } = useConference();
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-6rem)] flex items-center pt-28 pb-20 lg:pt-32 lg:pb-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-light-blue/30 via-white to-white" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle, #2563eb 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-16 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-32 right-0 w-[28rem] h-[28rem] bg-accent/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />

      <Container>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 xl:gap-14 items-center">
          {/* Copy */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 xl:col-span-5"
          >
            <Badge>International Conference · TIM Laboratory</Badge>

            <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-primary">
              {conference.fullName}
            </p>

            <h1 className="mt-4 text-[2.75rem] sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-extrabold tracking-tight text-navy leading-[1.05]">
              {conference.name}
            </h1>

            <p className="mt-3 text-xl sm:text-2xl font-bold text-gradient leading-snug">
              Information Technology & Modeling
            </p>

            <p className="mt-5 text-base sm:text-lg font-medium text-navy/80 leading-relaxed border-l-4 border-primary pl-4">
              {conference.tagline}
            </p>

            <p className="mt-4 text-base text-text-secondary leading-relaxed max-w-lg">
              {conference.publication}
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <MetaPill icon={HiOutlineCalendarDays}>{conference.dates}</MetaPill>
              <MetaPill icon={HiOutlineMapPin}>{conference.venue}</MetaPill>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mt-8 grid grid-cols-2 gap-3 max-w-md"
            >
              {heroHighlights.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  custom={0.15 + i * 0.06}
                  className="rounded-xl border border-border bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm"
                >
                  <p className="text-lg font-bold text-primary">{stat.value}</p>
                  <p className="text-xs font-medium text-text-secondary mt-0.5">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-3 sm:gap-4">
              <Button variant="primary" size="lg" href="#call-for-papers">
                Call for Papers
                <HiOutlineArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="secondary" size="lg" href="#important-dates">
                Important Dates
              </Button>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            animate="visible"
            custom={0.12}
            className="lg:col-span-6 xl:col-span-7 relative"
          >
            <div className="relative grid grid-cols-12 grid-rows-6 gap-3 sm:gap-4 min-h-[22rem] sm:min-h-[26rem] lg:min-h-[32rem]">
              {/* Main image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="col-span-7 row-span-6 relative overflow-hidden rounded-2xl shadow-premium ring-1 ring-white/60"
              >
                <CloudinaryImage
                  src={heroImages.main.src}
                  alt={heroImages.main.alt}
                  width={900}
                  height={1200}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-primary/10" />
              </motion.div>

              {/* Secondary stack */}
              <div className="col-span-5 row-span-6 grid grid-rows-3 gap-3 sm:gap-4">
                {heroImages.secondary.map((img, i) => (
                  <motion.div
                    key={img.alt}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.1, duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl shadow-premium ring-1 ring-white/60"
                  >
                    <CloudinaryImage
                      src={img.src}
                      alt={img.alt}
                      width={600}
                      height={400}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating glass stats */}
            {!reducedMotion && (
              <>
                <motion.div
                  {...floatAnimation}
                  className="absolute -left-2 sm:-left-6 top-1/4 glass rounded-2xl px-5 py-4 shadow-glow hidden sm:block"
                >
                  <p className="text-2xl font-bold text-primary">8th</p>
                  <p className="text-xs font-medium text-text-secondary">Edition</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                  }}
                  className="absolute -right-2 sm:right-0 bottom-8 glass rounded-2xl px-5 py-4 shadow-glow"
                >
                  <p className="text-2xl font-bold text-primary">CCIS</p>
                  <p className="text-xs font-medium text-text-secondary">Springer</p>
                </motion.div>
              </>
            )}

            <div className="absolute -z-10 -inset-6 bg-gradient-to-br from-primary/8 via-transparent to-accent/10 rounded-[2rem] blur-sm" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
