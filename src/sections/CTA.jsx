import { motion } from "framer-motion";
import { HiOutlineArrowRight } from "react-icons/hi2";
import Container from "../components/Container";
import Button from "../components/Button";
import { useConference } from "../hooks/useConference";
import { fadeUp } from "../utils/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";

export default function CTA() {
  const { conference } = useConference();
  const reducedMotion = useReducedMotion();

  return (
    <section id="cta" className="py-20 lg:py-28">
      <Container>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-cta px-8 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24 text-center"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            {!reducedMotion && (
              <>
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-10 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm"
                />
                <motion.div
                  animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-12 right-16 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm"
                />
              </>
            )}
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Register for {conference.name}
            </h2>
            <p className="mt-5 text-lg text-white/80 leading-relaxed">
              {conference.dates} · {conference.venue}
            </p>
            <p className="mt-3 text-white/70">
              Submit your research and join the international community at Hassan II University.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button variant="white" size="lg" href={conference.registrationUrl}>
                Register Now
                <HiOutlineArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                href="#topics"
                className="!text-white !border-white/30 hover:!bg-white/10"
              >
                View Topics
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
