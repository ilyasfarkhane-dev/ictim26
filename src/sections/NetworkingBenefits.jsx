import { motion } from "framer-motion";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import { benefits } from "../data/benefits";
import { fadeUp, staggerContainer } from "../utils/animations";

export default function NetworkingBenefits() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <SectionHeader
          title="Why Attend ICTIM"
          subtitle="A premier academic conference bridging theory, practice, and the power of AI."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.id}
                variants={fadeUp}
                custom={i * 0.08}
                whileHover={{ y: -4 }}
                className="group p-7 rounded-2xl bg-white border border-border hover:border-primary/20 hover:shadow-premium transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-blue text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-navy">{benefit.title}</h3>
                <p className="mt-2 text-text-secondary leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
