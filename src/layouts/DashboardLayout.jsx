import { useState } from "react";
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
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBars3,
  HiOutlineXMark,
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

function NavItem({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer dash-focus-ring ${
          isActive
            ? "dash-nav-active -ml-px"
            : "text-dash-muted hover:bg-blue-50/80 hover:text-dash-text"
        }`
      }
    >
      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
      {label}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  const { signOut, user } = useAuth();
  const { conference, isLive } = useConference();
  const navigate = useNavigate();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";

  const handleSignOut = async () => {
    await signOut();
    navigate("/dashboard/login");
    onNavigate?.();
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-primary text-white font-bold text-sm shadow-sm">
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
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </nav>

      <p className="px-4 mt-8 mb-2 text-[10px] font-bold uppercase tracking-wider text-dash-muted">
        Others
      </p>
      <nav className="space-y-1">
        {otherItems.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-dash-muted hover:bg-blue-50/80 hover:text-dash-text transition-colors duration-200 cursor-pointer dash-focus-ring"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" aria-hidden="true" />
          Log out
        </button>

        <div className="rounded-2xl bg-gradient-to-br from-dash-primary to-dash-primary-dark p-5 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
          <p className="relative text-sm font-bold">Manage {conference.name}</p>
          <p className="relative mt-1 text-xs text-white/75 flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-amber-300"}`}
            />
            {isLive ? "Live from Supabase" : "Using local defaults"}
          </p>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25 transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            View website
            <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex items-center gap-3 px-2 pt-2 lg:hidden">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-dash-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dash-text leading-tight truncate">
              {displayName}
            </p>
            <p className="text-xs text-dash-muted">Conference Admin</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-dash-bg flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-dash-border p-5">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            onClick={closeMobile}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white p-5 shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobile}
              className="absolute top-4 right-4 p-2 rounded-lg text-dash-muted hover:bg-blue-50 hover:text-dash-text transition-colors cursor-pointer dash-focus-ring"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={closeMobile} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-dash-border px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-dash-border bg-white text-dash-muted hover:text-dash-text hover:bg-blue-50/80 transition-colors duration-200 cursor-pointer dash-focus-ring"
            >
              <HiOutlineBars3 className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-dash-muted uppercase tracking-wider hidden sm:block">
                Conference CMS
              </p>
              <p className="text-sm font-semibold text-dash-text truncate">
                {displayName}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-dash-border">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-dash-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-dash-text leading-tight">{displayName}</p>
                <p className="text-xs text-dash-muted">Conference Admin</p>
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
