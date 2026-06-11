import { motion } from "framer-motion";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import Button from "../components/Button";
import { conference } from "../data/conference";
import { fadeUp } from "../utils/animations";

export default function Testimonials() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-section relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative">
        <SectionHeader
          title="About the Conference"
          subtitle="Organized by the TIM Laboratory at Hassan II University of Casablanca."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass rounded-3xl p-8 sm:p-12 shadow-premium"
        >
          <p className="text-lg sm:text-xl text-navy leading-relaxed font-medium">
            &ldquo;{conference.description}&rdquo;
          </p>

          <div className="mt-8 p-6 rounded-2xl bg-light-blue/50 border border-primary/10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Conference Theme
            </p>
            <p className="text-navy font-medium leading-relaxed">{conference.tagline}</p>
          </div>

          <p className="mt-6 text-text-secondary leading-relaxed">
            {conference.templateNote}{" "}
            <a
              href={conference.templateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline cursor-pointer"
            >
              Springer LNCS proceedings guidelines
            </a>
            .
          </p>

          <div className="mt-8">
            <Button
              variant="secondary"
              href={conference.websiteUrl}
              className="inline-flex"
            >
              Visit Official Website
              <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
