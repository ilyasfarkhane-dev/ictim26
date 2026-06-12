import { motion } from "framer-motion";
import { HiOutlineArrowUpRight, HiOutlineArrowRight } from "react-icons/hi2";
import Container from "../components/Container";
import SectionHeader from "../components/SectionHeader";
import Button from "../components/Button";
import { useConference } from "../hooks/useConference";
import { getVisibleTopics } from "../lib/topics";
import { fadeUp, staggerContainer } from "../utils/animations";

function TopicCard({ topic, index }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      variants={fadeUp}
      custom={index * 0.05}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col justify-between min-h-[9.5rem] p-5 sm:p-6 rounded-2xl bg-primary hover:bg-secondary border border-primary hover:border-secondary shadow-premium hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex justify-end">
        <span className="text-xs font-bold text-white/50 tabular-nums">{number}</span>
      </div>

      <h3 className="relative mt-2 text-sm sm:text-base font-bold text-white leading-snug pr-2">
        {topic.name}
      </h3>

      <div className="relative mt-5 flex items-center justify-between">
        <span className="text-xs font-medium text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Research area
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition-all duration-300 group-hover:bg-white group-hover:text-primary">
          <HiOutlineArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </span>
      </div>
    </motion.article>
  );
}

export default function EventCategories() {
  const { topics } = useConference();
  const visibleTopics = getVisibleTopics(topics);

  return (
    <section id="topics" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-white" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-14">
          <SectionHeader
            title="Conference Topics"
            subtitle="Submit your research in any of the following areas. English is the official language of the conference and all submissions."
            align="left"
            className="mb-0"
          />
          <Button variant="primary" size="sm" href="#call-for-papers" className="shrink-0 self-start lg:self-auto">
            Call for Papers
            <HiOutlineArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-4"
        >
          {visibleTopics.map((topic, i) => (
            <TopicCard key={topic.id} topic={topic} index={i} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
