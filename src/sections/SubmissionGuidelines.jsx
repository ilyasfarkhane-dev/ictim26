import { motion } from "framer-motion";
import {
  HiOutlineArrowUpTray,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentList,
  HiOutlineScale,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import Container from "../components/Container";
import { useConference } from "../hooks/useConference";
import { fadeUp, staggerContainer } from "../utils/animations";

const iconMap = {
  platform: HiOutlineArrowUpTray,
  format: HiOutlineDocumentText,
  requirements: HiOutlineClipboardDocumentList,
};

function CheckList({ items }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <HiOutlineCheckCircle className="w-5 h-5 shrink-0 text-primary mt-0.5" />
          <span className="text-sm text-text-secondary leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PillarCard({ pillar, index }) {
  const Icon = iconMap[pillar.icon];
  const isExternal = pillar.pillHref.startsWith("http");

  return (
    <motion.article
      variants={fadeUp}
      custom={index * 0.08}
      className="flex flex-col"
    >
      <a
        href={pillar.pillHref}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="self-start inline-flex items-center rounded-full bg-light-blue px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer"
      >
        {pillar.pill}
      </a>

      <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-light-blue text-primary">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-navy">{pillar.title}</h3>
      <CheckList items={pillar.items} />
    </motion.article>
  );
}

function EthicsCard({ icon: Icon, title, items, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className="p-6 sm:p-8"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-blue text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
      <CheckList items={items} />
    </motion.div>
  );
}

export default function SubmissionGuidelines() {
  const { conference, submissionGuidelines } = useConference();

  return (
    <section id="submission-guidelines" className="py-20 lg:py-28 bg-white">
      <Container>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center max-w-3xl mx-auto mb-14 lg:mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Submission
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy">
            Submission Guidelines
          </h2>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">
            Everything you need to know about submitting your research to {conference.name}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-10 lg:gap-12"
        >
          {submissionGuidelines.pillars.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} />
          ))}
        </motion.div>

        <div className="mt-16 lg:mt-20 border-t-2 border-primary/20" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 lg:mt-16 grid lg:grid-cols-[minmax(0,280px)_1fr] gap-8 lg:gap-12 items-stretch"
        >
          <div className="rounded-2xl bg-light-blue/60 border border-primary/10 p-8 lg:p-10 flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Submission
            </p>
            <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-navy leading-tight">
              Quality &amp; Ethics Standards
            </h3>
            <div className="mt-5 h-1 w-12 rounded-full bg-primary" />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid sm:grid-cols-2 rounded-2xl bg-section border border-border overflow-hidden"
          >
            <EthicsCard
              icon={HiOutlineScale}
              title="Evaluation Criteria"
              items={submissionGuidelines.evaluationCriteria}
              delay={0}
            />
            <EthicsCard
              icon={HiOutlineShieldCheck}
              title="Plagiarism & Integrity"
              items={submissionGuidelines.plagiarismIntegrity}
              delay={0.1}
            />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
