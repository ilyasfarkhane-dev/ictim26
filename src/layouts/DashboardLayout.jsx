import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineCalendarDays,
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlinePhoto,
  HiOutlineSparkles,
  HiOutlineArrowRightOnRectangle,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import { useConference } from "../hooks/useConference";

const menuItems = [
  { to: "/dashboard", label: "Home", icon: HiOutlineHome, end: true },
  { to: "/dashboard/hero", label: "Hero", icon: HiOutlineSparkles },
  { to: "/dashboard/speakers", label: "Speakers", icon: HiOutlineUserGroup },
  { to: "/dashboard/topics", label: "Topics", icon: HiOutlineTag },
  { to: "/dashboard/dates", label: "Important Dates", icon: HiOutlineCalendarDays },
  { to: "/dashboard/workshops", label: "Workshops", icon: HiOutlineAcademicCap },
  { to: "/dashboard/sponsors", label: "Sponsors", icon: HiOutlineBuildingOffice2 },
  { to: "/dashboard/content", label: "Content", icon: HiOutlineDocumentText },
  { to: "/dashboard/media", label: "Media", icon: HiOutlinePhoto },
];

const otherItems = [
  { to: "/dashboard/settings", label: "Settings", icon: HiOutlineCog6Tooth },
];

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer ${
          isActive
            ? "bg-emerald-50 text-dash-primary border-l-[3px] border-dash-primary -ml-px"
            : "text-dash-muted hover:bg-dash-bg hover:text-dash-text"
        }`
      }
    >
      <Icon className="w-5 h-5 shrink-0" />
      {label}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { signOut, user } = useAuth();
  const { conference, isLive } = useConference();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/dashboard/login");
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";

  return (
    <div className="min-h-screen bg-dash-bg flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-dash-border p-5">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-primary text-white font-bold text-sm">
            IC
          </div>
          <div>
            <p className="font-bold text-dash-text leading-tight">ICTIM CMS</p>
            <p className="text-[10px] text-dash-muted uppercase tracking-wider">Dashboard</p>
          </div>
        </div>

        <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-wider text-dash-muted">
          Menu
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <p className="px-4 mt-8 mb-2 text-[10px] font-bold uppercase tracking-wider text-dash-muted">
          Others
        </p>
        <nav className="space-y-1">
          {otherItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-dash-muted hover:bg-dash-bg hover:text-dash-text transition-colors cursor-pointer"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            Log out
          </button>

          <div className="rounded-2xl bg-slate-900 p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-emerald-500/20" />
            <p className="relative text-sm font-bold">Manage {conference.name}</p>
            <p className="relative mt-1 text-xs text-white/70">
              {isLive ? "Live from Supabase" : "Using local defaults"}
            </p>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 transition-colors cursor-pointer"
            >
              View website
              <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-dash-bg/80 backdrop-blur-md border-b border-dash-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-muted" />
                <input
                  type="search"
                  placeholder="Search anything"
                  className="w-full rounded-xl border border-dash-border bg-white pl-11 pr-4 py-2.5 text-sm text-dash-text placeholder:text-dash-muted focus:outline-none focus:ring-2 focus:ring-dash-primary/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="p-2.5 rounded-xl border border-dash-border bg-white text-dash-muted hover:text-dash-text transition-colors cursor-pointer"
              >
                <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="relative p-2.5 rounded-xl border border-dash-border bg-white text-dash-muted hover:text-dash-text transition-colors cursor-pointer"
              >
                <HiOutlineBell className="w-5 h-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-dash-border">
                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-dash-primary">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dash-text leading-tight">{displayName}</p>
                  <p className="text-xs text-dash-muted">Conference Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
