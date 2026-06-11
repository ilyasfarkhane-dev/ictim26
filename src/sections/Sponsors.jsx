import { motion } from "framer-motion";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import CloudinaryImage from "../components/CloudinaryImage";
import { useConference } from "../hooks/useConference";
import { fadeUp, staggerContainer } from "../utils/animations";

export default function Sponsors() {
  const { partners } = useConference();

  return (
    <section id="sponsors" className="py-20 lg:py-28">
      <Container>
        <SectionHeader
          title="Partners & Publications"
          subtitle="ICTIM proceedings are published through Springer's CCIS series with extended papers in Scopus-indexed journals."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {partners.map((partner, i) => (
            <motion.div
              key={partner.id}
              variants={fadeUp}
              custom={i * 0.05}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center justify-center h-24 rounded-2xl bg-section border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-300 cursor-pointer group gap-2"
            >
              <CloudinaryImage
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={48}
                crop="fit"
                className="h-7 w-auto grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
              <span className="text-xs text-text-secondary font-medium text-center px-2">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
