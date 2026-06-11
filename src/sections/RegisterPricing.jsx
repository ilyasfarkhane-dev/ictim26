import { motion } from "framer-motion";
import {
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import CloudinaryImage from "../components/CloudinaryImage";
import Container from "../components/Container";
import Button from "../components/Button";
import { useConference } from "../hooks/useConference";
import { fadeUp, staggerContainer } from "../utils/animations";

function SectionSidebar({ step, label, title, subtitle, note }) {
  return (
    <div className="rounded-2xl bg-light-blue/50 border border-primary/10 p-8 lg:p-10 lg:sticky lg:top-28">
      {step && (
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">
          {step}
        </p>
      )}
      {label && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {label}
        </p>
      )}
      <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-navy leading-tight">
        {title}
      </h3>
      <p className="mt-4 text-sm text-text-secondary leading-relaxed">{subtitle}</p>
      {note && (
        <p className="mt-4 text-sm font-semibold text-amber-600">{note}</p>
      )}
    </div>
  );
}

function PricingCard({ registrationPricing, conference }) {
  const { plan } = registrationPricing;

  return (
    <motion.article
      variants={fadeUp}
      className="max-w-sm rounded-2xl bg-white border border-border p-7 sm:p-8 shadow-premium hover:border-primary/20 transition-colors duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-blue text-primary">
          <HiOutlineUserGroup className="w-6 h-6" />
        </div>
        <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {plan.badge}
        </span>
      </div>

      <h4 className="mt-6 text-sm font-bold uppercase tracking-wider text-navy">
        {plan.title}
      </h4>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="text-sm font-medium text-text-secondary">{plan.currency}</span>
        <span className="text-4xl font-bold text-primary tabular-nums">{plan.price}</span>
      </p>

      <ul className="mt-8 space-y-3.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <HiOutlineCheckCircle className="w-5 h-5 shrink-0 text-primary mt-0.5" />
            <span className="text-sm text-text-secondary leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          variant="primary"
          size="md"
          href={conference.registrationUrl}
          className="w-full"
        >
          Register
          <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
        </Button>
      </div>
    </motion.article>
  );
}

function WorkshopCard({ workshop, index, conference }) {
  return (
    <motion.article
      variants={fadeUp}
      custom={index * 0.08}
      className="flex flex-col rounded-2xl bg-white border border-border overflow-hidden shadow-sm hover:shadow-premium hover:border-primary/20 transition-all duration-300"
    >
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <CloudinaryImage
          src={workshop.image}
          alt={workshop.title}
          width={800}
          height={400}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        <div className="relative h-full flex flex-col justify-between p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
            {conference.name}
          </p>
          <p className="text-sm font-bold text-white leading-snug line-clamp-2 pr-16">
            {workshop.title}
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <p className="text-xs text-text-secondary">{workshop.subtitle}</p>
        <h4 className="mt-2 text-base font-bold text-navy leading-snug">
          {workshop.title}
        </h4>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-3">
          {workshop.description}
        </p>

        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Facilitator
          </p>
          <p className="mt-1 text-sm font-bold text-navy">{workshop.facilitator.name}</p>
          <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
            {workshop.facilitator.credentials}
          </p>
        </div>

        <ul className="mt-4 space-y-2">
          {workshop.objectives.map((objective) => (
            <li key={objective} className="flex items-start gap-2">
              <HiOutlineCheckCircle className="w-4 h-4 shrink-0 text-primary mt-0.5" />
              <span className="text-xs text-text-secondary leading-relaxed">{objective}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineClock className="w-4 h-4 text-primary" />
              {workshop.duration}
            </span>
            <span className="font-bold text-primary tabular-nums">
              {workshop.price} {workshop.currency}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          href={conference.registrationUrl}
          className="mt-4 w-full"
        >
          Register
          <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
        </Button>
      </div>
    </motion.article>
  );
}

export default function RegisterPricing() {
  const { conference, registrationPricing, workshops } = useConference();

  return (
    <section id="register-pricing" className="py-20 lg:py-28 bg-section">
      <Container className="space-y-20 lg:space-y-28">
        <div className="grid lg:grid-cols-[minmax(0,300px)_1fr] gap-8 lg:gap-12 items-start">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <SectionSidebar
              step="Step 1"
              title="Conference Registration Fees"
              subtitle={`Choose your registration type for ${conference.name}.`}
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <PricingCard registrationPricing={registrationPricing} conference={conference} />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,300px)_1fr] gap-8 lg:gap-12 items-start">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <SectionSidebar
              label="Practical Workshops"
              title="Workshop Registration"
              subtitle={`Intensive practical sessions during ${conference.name} — limited seats available.`}
              note="Limited spots"
            />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {workshops.map((workshop, i) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                index={i}
                conference={conference}
              />
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
