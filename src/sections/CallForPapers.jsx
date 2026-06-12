import { motion } from "framer-motion";
import {
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import Container from "../components/Container";
import Button from "../components/Button";
import { useConference } from "../hooks/useConference";
import { isCallForPapersSectionEnabled } from "../lib/sectionSettings";
import { fadeUp, slideFromLeft, slideFromRight, staggerContainer } from "../utils/animations";

function InfoCard({ icon: Icon, title, items, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className="rounded-2xl bg-section border border-border p-6 sm:p-7"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-light-blue text-primary">
          <Icon className="w-5 h-5" />
        </span>
        <h3 className="text-lg font-bold text-navy">{title}</h3>
      </div>

      <ul className="space-y-3.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <HiOutlineCheckCircle className="w-5 h-5 shrink-0 text-primary mt-0.5" />
            <span className="text-sm text-text-secondary leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function CallForPapers() {
  const { callForPapers, sectionSettings } = useConference();

  if (!isCallForPapersSectionEnabled(sectionSettings)) return null;

  const { cta } = callForPapers;

  return (
    <section id="call-for-papers" className="py-20 lg:py-28 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Call for Papers
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy">
              Call for Papers
            </h2>
            <p className="mt-5 text-base sm:text-lg text-text-secondary leading-relaxed max-w-lg">
              {callForPapers.intro}
            </p>
            <div className="mt-8">
              {cta.href ? (
                <Button
                  variant="primary"
                  size="lg"
                  href={cta.href}
                  className="inline-flex"
                >
                  {cta.label}
                  <HiOutlineArrowTopRightOnSquare className="w-5 h-5" />
                </Button>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-5"
          >
            <InfoCard
              icon={HiOutlineBookOpen}
              title="Publication"
              items={callForPapers.publication}
              delay={0}
            />
            <InfoCard
              icon={HiOutlineClipboardDocumentList}
              title="Submission Requirements"
              items={callForPapers.requirements}
              delay={0.1}
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
