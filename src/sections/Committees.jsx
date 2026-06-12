import { motion } from "framer-motion";
import {
  HiOutlineUserGroup,
  HiOutlineGlobeAlt,
  HiOutlineUser,
  HiOutlineBuildingOffice2,
  HiOutlineEnvelope,
} from "react-icons/hi2";
import Container from "../components/Container";
import { useConference } from "../hooks/useConference";
import { getVisibleMembers, memberInitial } from "../lib/committees";
import { isCommitteesSectionEnabled } from "../lib/sectionSettings";
import { fadeUp, staggerContainer } from "../utils/animations";

function MemberAvatar({ name, size = "md" }) {
  const sizeClass =
    size === "lg"
      ? "h-12 w-12 text-base"
      : size === "sm"
        ? "h-9 w-9 text-sm"
        : "h-10 w-10 text-sm";

  return (
    <span
      className={`${sizeClass} shrink-0 inline-flex items-center justify-center rounded-full bg-light-blue text-primary font-bold`}
      aria-hidden="true"
    >
      {memberInitial(name)}
    </span>
  );
}

function Affiliation({ text }) {
  return (
    <p className="mt-2 flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
      <HiOutlineGlobeAlt className="w-4 h-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}

function SectionEyebrow({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{children}</p>
  );
}

function ChairCard({ member, index }) {
  return (
    <motion.article
      variants={fadeUp}
      custom={index * 0.06}
      className="rounded-2xl bg-section border border-border p-5 sm:p-6 transition-colors duration-200 hover:border-primary/20"
    >
      <div className="flex items-start gap-4">
        <MemberAvatar name={member.name} size="lg" />
        <div className="min-w-0">
          <h4 className="text-base font-bold text-navy leading-snug">{member.name}</h4>
          <Affiliation text={member.affiliation} />
        </div>
      </div>
    </motion.article>
  );
}

function ReviewerItem({ member, index }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.04}
      className="flex items-start gap-3 py-1"
    >
      <MemberAvatar name={member.name} size="sm" />
      <div className="min-w-0">
        <p className="text-sm font-bold text-navy leading-snug">{member.name}</p>
        <Affiliation text={member.affiliation} />
      </div>
    </motion.div>
  );
}

function OrganizingCard({ role, icon: Icon, title, affiliation, email }) {
  return (
    <motion.article
      variants={fadeUp}
      className="flex flex-col rounded-2xl bg-white border border-border p-6 sm:p-7 shadow-sm hover:border-primary/20 transition-colors duration-200"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-light-blue text-primary">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-primary">{role}</p>
      <h4 className="mt-2 text-lg font-bold text-navy leading-snug">{title}</h4>
      {affiliation && <Affiliation text={affiliation} />}
      {email && (
        <a
          href={`mailto:${email}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors duration-200 cursor-pointer"
        >
          <HiOutlineEnvelope className="w-4 h-4 shrink-0" aria-hidden="true" />
          {email}
        </a>
      )}
    </motion.article>
  );
}

function BlockDivider({ children, className = "" }) {
  return (
    <div className={`border-t-4 border-primary pt-12 lg:pt-14 ${className}`}>{children}</div>
  );
}

function SidebarTitle({ icon: Icon, eyebrow, title }) {
  return (
    <div className="lg:sticky lg:top-28">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-blue text-primary">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      )}
      {eyebrow && <div className="mt-6">{eyebrow}</div>}
      <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-navy leading-tight">{title}</h3>
      <div className="mt-5 h-1 w-12 rounded-full bg-primary" />
    </div>
  );
}

export default function Committees() {
  const { conference, committees, sectionSettings } = useConference();

  if (!isCommitteesSectionEnabled(sectionSettings)) return null;

  const programChairs = getVisibleMembers(committees.programChairs);
  const externalReviewers = getVisibleMembers(committees.externalReviewers);
  const organizing = {
    programChairs: getVisibleMembers(committees.organizing?.programChairs),
    institution: committees.organizing?.institution ?? { name: "", address: "" },
  };

  return (
    <section id="committees" className="py-20 lg:py-28 bg-white">
      <Container>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center max-w-3xl mx-auto mb-14 lg:mb-16"
        >
          <SectionEyebrow>Committees</SectionEyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy">
            Committee Members
          </h2>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">
            Distinguished researchers and academics guiding {conference.name}
          </p>
        </motion.div>

        <BlockDivider>
          <div className="grid lg:grid-cols-[minmax(0,280px)_1fr] gap-8 lg:gap-12 items-start">
            <SidebarTitle
              icon={HiOutlineUserGroup}
              title="Program Committee Chairs"
            />
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid sm:grid-cols-2 gap-4 lg:gap-5"
            >
              {programChairs.map((member, i) => (
                <ChairCard key={member.id} member={member} index={i} />
              ))}
            </motion.div>
          </div>
        </BlockDivider>

        <BlockDivider className="mt-16 lg:mt-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center max-w-2xl mx-auto mb-10 lg:mb-12"
          >
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-blue text-primary">
                <HiOutlineUserGroup className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-6">
              <SectionEyebrow>Committees</SectionEyebrow>
            </div>
            <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-navy">
              External Reviewers &amp; Advisors
            </h3>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 lg:gap-y-8"
          >
            {externalReviewers.map((member, i) => (
              <ReviewerItem key={member.id} member={member} index={i} />
            ))}
          </motion.div>
        </BlockDivider>

        <BlockDivider className="mt-16 lg:mt-20">
          <div className="grid lg:grid-cols-[minmax(0,280px)_1fr] gap-8 lg:gap-12 items-start">
            <SidebarTitle
              eyebrow={<SectionEyebrow>Committees</SectionEyebrow>}
              title="Organizing Committee"
            />
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid sm:grid-cols-2 gap-5 lg:gap-6"
            >
              {organizing.programChairs.map((chair) => (
                <OrganizingCard
                  key={chair.id}
                  role="Program Chair"
                  icon={HiOutlineUser}
                  title={chair.name}
                  affiliation={chair.affiliation}
                  email={chair.email}
                />
              ))}
              <OrganizingCard
                role="Organizing Institution"
                icon={HiOutlineBuildingOffice2}
                title={organizing.institution.name}
                affiliation={organizing.institution.address}
              />
            </motion.div>
          </div>
        </BlockDivider>
      </Container>
    </section>
  );
}
