import { motion } from "framer-motion";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import CloudinaryImage from "../components/CloudinaryImage";
import { useConference } from "../hooks/useConference";
import { fadeUp, staggerContainer } from "../utils/animations";

export default function Speakers() {
  const { speakers } = useConference();

  return (
    <section id="speakers" className="py-20 lg:py-28">
      <Container>
        <SectionHeader
          title="Speakers"
          subtitle="Renowned professors and researchers from leading universities worldwide."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {speakers.map((speaker, i) => (
            <motion.article
              key={speaker.id}
              variants={fadeUp}
              custom={i * 0.08}
              whileHover={{ y: -6 }}
              className="group glass rounded-2xl p-5 shadow-sm hover:shadow-glow transition-all duration-300"
            >
              <div className="relative overflow-hidden rounded-xl">
                <CloudinaryImage
                  src={speaker.image}
                  alt={speaker.name}
                  width={400}
                  height={450}
                  className="w-full h-56 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-bold text-navy">{speaker.name}</h3>
                <p className="text-sm text-primary font-medium mt-0.5">{speaker.position}</p>
                <p className="text-sm text-text-secondary mt-1">{speaker.company}</p>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {speaker.bio}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
