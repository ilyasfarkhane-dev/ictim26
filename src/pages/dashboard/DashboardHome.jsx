import { Link } from "react-router-dom";
import {
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
  HiOutlineSparkles,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import StatCard from "../../components/dashboard/StatCard";
import { useConference } from "../../hooks/useConference";
import { useAuth } from "../../context/AuthContext";

function MiniSparkline({ color = "#1e40af" }) {
  return (
    <svg viewBox="0 0 120 32" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,24 20,18 40,22 60,10 80,14 100,6 120,12"
      />
    </svg>
  );
}

const quickActions = [
  { to: "/dashboard/hero", label: "Hero Section", icon: HiOutlineSparkles, desc: "Images & highlights" },
  { to: "/dashboard/speakers", label: "Manage Speakers", icon: HiOutlineUserGroup, desc: "Keynote & panelists" },
  { to: "/dashboard/topics", label: "Edit Topics", icon: HiOutlineTag, desc: "Research areas" },
  { to: "/dashboard/workshops", label: "Workshops", icon: HiOutlineAcademicCap, desc: "Registration cards" },
  { to: "/dashboard/dates", label: "Important Dates", icon: HiOutlineCalendarDays, desc: "Timeline steps" },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const {
    conference,
    speakers,
    topics,
    workshops,
    participationSteps,
    isLive,
    source,
  } = useConference();

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dash-text">Welcome back, {name}!</h1>
          <p className="mt-1 text-sm text-dash-muted">{today}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white border border-dash-border px-4 py-2 text-sm text-dash-muted">
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500" : "bg-amber-400"}`} />
            {isLive ? "Supabase connected" : "Local fallback"}
          </span>
          <span className="rounded-full bg-white border border-dash-border px-4 py-2 text-sm font-medium text-dash-text">
            {conference.dates}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Speakers"
          value={speakers.length}
          change={`${speakers.length} active`}
          sparkline={<MiniSparkline />}
        />
        <StatCard
          label="Research Topics"
          value={topics.length}
          change="Conference scope"
          sparkline={<MiniSparkline />}
        />
        <StatCard
          label="Workshops"
          value={workshops.length}
          change="Registration open"
          sparkline={<MiniSparkline />}
        />
        <StatCard
          label="Important Dates"
          value={participationSteps.length}
          change="Timeline steps"
          positive
          sparkline={<MiniSparkline />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dash-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dash-text">Content overview</h2>
            <span className="text-xs font-medium text-dash-muted uppercase tracking-wide">
              Source: {source}
            </span>
          </div>
          <div className="space-y-1">
            {[
              { label: "Conference", value: conference.name },
              { label: "Venue", value: conference.venue },
              { label: "Organizer", value: conference.organizer },
              { label: "Edition", value: `#${conference.edition}` },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl border-b border-dash-border last:border-0 hover:bg-blue-50/50 transition-colors duration-200"
              >
                <span className="text-sm text-dash-muted">{row.label}</span>
                <span className="text-sm font-medium text-dash-text text-right max-w-[60%] truncate">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card p-6">
          <h2 className="text-lg font-bold text-dash-text mb-1">Quick actions</h2>
          <p className="text-sm text-dash-muted mb-5">Jump to a section</p>
          <div className="space-y-1">
            {quickActions.map(({ to, label, icon: Icon, desc }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dash-text hover:bg-blue-50/80 transition-colors duration-200 cursor-pointer dash-focus-ring"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-dash-primary group-hover:bg-blue-100 transition-colors duration-200">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-xs text-dash-muted truncate">{desc}</span>
                </span>
                <HiOutlineChevronRight className="w-4 h-4 text-dash-muted group-hover:text-dash-primary transition-colors duration-200 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
