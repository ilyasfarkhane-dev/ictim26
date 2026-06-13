import { motion } from "framer-motion";
import {
  HiOutlineUserGroup,
  HiOutlineGlobeAlt,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineAcademicCap,
  HiOutlineStar,
  HiOutlineMegaphone,
  HiOutlineGlobeAmericas,
  HiOutlineClipboardDocumentList,
  HiOutlineBookOpen,
  HiOutlineMicrophone,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";
import Container from "../components/Container";
import { useConference } from "../hooks/useConference";
import {
  COMMITTEE_GROUPS,
  countAllVisibleCommitteeMembers,
  getVisibleGroupMembers,
  isCommitteeGroupEnabled,
  memberInitial,
} from "../lib/committees";
import { isCommitteesSectionEnabled } from "../lib/sectionSettings";
import { fadeUp, staggerContainer } from "../utils/animations";

const GROUP_ICONS = {
  honoraryChairs: HiOutlineStar,
  conferenceChair: HiOutlineUser,
  conferenceCoChair: HiOutlineUser,
  sponsorshipChairs: HiOutlineCurrencyDollar,
  webChairs: HiOutlineGlobeAmericas,
  publicityChairs: HiOutlineMegaphone,
  registrationChairs: HiOutlineClipboardDocumentList,
  publicationChairs: HiOutlineBookOpen,
  speakersSessionChairs: HiOutlineMicrophone,
  organizingSenior: HiOutlineUser,
  organizingJuniors: HiOutlineUserGroup,
  scientific: HiOutlineAcademicCap,
};

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
  if (!text?.trim()) return null;

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

function MemberCard({ member, index, showEmail = false }) {
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
          {showEmail && member.email?.trim() && (
            <a
              href={`mailto:${member.email}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors duration-200 cursor-pointer"
            >
              <HiOutlineEnvelope className="w-4 h-4 shrink-0" aria-hidden="true" />
              {member.email}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function CompactMemberItem({ member, index }) {
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

function BlockDivider({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function SidebarTitle({ icon: Icon, title, memberCount }) {
  return (
    <div className="lg:sticky lg:top-28">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-blue text-primary">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      )}
      <div className="mt-6">
        <SectionEyebrow>Committees</SectionEyebrow>
      </div>
      <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-navy leading-tight">{title}</h3>
      {memberCount > 0 && (
        <p className="mt-3 inline-flex items-center rounded-full bg-light-blue px-3 py-1 text-xs font-semibold text-primary tabular-nums">
          {memberCount} member{memberCount === 1 ? "" : "s"}
        </p>
      )}
      <div className="mt-5 h-1 w-12 rounded-full bg-primary" />
    </div>
  );
}

function CommitteeBlock({
  icon,
  title,
  members,
  layout = "grid",
  showEmail = false,
  isFirst = false,
  emptyMessage = "Members will be announced soon.",
}) {
  return (
    <BlockDivider
      className={
        isFirst ? "border-t-0 pt-0" : "mt-16 lg:mt-20 border-t-4 border-primary pt-12 lg:pt-14"
      }
    >
      <div className="grid lg:grid-cols-[minmax(0,280px)_1fr] gap-8 lg:gap-12 items-start">
        <SidebarTitle icon={icon} title={title} memberCount={members.length} />
        {members.length === 0 ? (
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="rounded-2xl border border-dashed border-border bg-section px-6 py-8 text-sm text-text-secondary leading-relaxed"
          >
            {emptyMessage}
          </motion.p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className={
              layout === "compact"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 lg:gap-y-8"
                : "grid sm:grid-cols-2 gap-4 lg:gap-5"
            }
          >
            {members.map((member, i) =>
              layout === "compact" ? (
                <CompactMemberItem key={member.id} member={member} index={i} />
              ) : (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={i}
                  showEmail={showEmail}
                />
              )
            )}
          </motion.div>
        )}
      </div>
    </BlockDivider>
  );
}

export default function Committees() {
  const { conference, committees, sectionSettings } = useConference();

  if (!isCommitteesSectionEnabled(sectionSettings)) return null;

  const enabledSections = COMMITTEE_GROUPS.filter((group) =>
    isCommitteeGroupEnabled(committees, group.id)
  )
    .map((group) => ({
      key: group.id,
      icon: GROUP_ICONS[group.id] ?? HiOutlineUserGroup,
      title: group.description,
      members: getVisibleGroupMembers(committees, group.id),
      layout: group.layout,
      showEmail: group.showEmail,
    }))
    .filter((section) => section.members.length > 0);

  if (enabledSections.length === 0) return null;

  const totalMembers = countAllVisibleCommitteeMembers(committees);

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
          {totalMembers > 0 && (
            <p className="mt-3 text-sm font-medium text-primary tabular-nums">
              {totalMembers} committee member{totalMembers === 1 ? "" : "s"}
            </p>
          )}
        </motion.div>

        {enabledSections.map((section, index) => (
          <CommitteeBlock
            key={section.key}
            icon={section.icon}
            title={section.title}
            members={section.members}
            layout={section.layout}
            showEmail={section.showEmail}
            isFirst={index === 0}
          />
        ))}
      </Container>
    </section>
  );
}
