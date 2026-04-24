"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Lightbulb,
  BarChart3,
  LayoutDashboard,
  User,
  LogIn,
  Menu,
  X,
  Bell,
  Users,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Explore Ideas", href: "/search", icon: Search },
      { label: "Find Mentors", href: "/mentors", icon: Users },
    ],
  },
  {
    section: "Modules",
    items: [
      { label: "Idea & Guidance", href: "/ideas", icon: Lightbulb },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    section: "Account",
    items: [{ label: "Profile", href: "/profile", icon: User }],
  },
] as const;

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarHidden, setDesktopSidebarHidden] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const shellExcluded = ["/login", "/register", "/forgot-password", "/verify-email", "/auth"];
  const isExcluded = shellExcluded.some((path) => pathname.startsWith(path));
  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#1F2933] app-page-enter">
      <aside
        className={`sticky top-0 h-screen w-64 shrink-0 flex-col border-r border-[#E7DED4] bg-white/80 backdrop-blur transition-all duration-300 ${
          desktopSidebarHidden ? "hidden md:hidden" : "hidden md:flex"
        }`}
      >
        <SidebarContent pathname={pathname} user={user} logout={logout} />
      </aside>

      <AnimatePresence>
        {sidebarOpen ? (
          <>
            <motion.div
              key="shell-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="shell-mobile"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-[#FFD4B1] bg-white/95 shadow-2xl backdrop-blur md:hidden"
            >
              <div className="flex items-center justify-between border-b border-[#FFD4B1] p-4">
                <Brand />
                <button
                  onClick={() => setSidebarOpen(false)}
                  title="Close navigation"
                  aria-label="Close navigation"
                  className="rounded-lg p-2 text-[#8A4E2A]/70 transition-colors hover:bg-[#FFF1E6] hover:text-[#0F0F0F]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavLinks
                  pathname={pathname}
                  userRole={user?.role}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </div>
              <UserFooter user={user} logout={logout} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="premium-glass-header sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            title="Open navigation"
            aria-label="Open navigation"
            className="rounded-lg p-2 text-[#8A4E2A]/70 transition-colors hover:bg-[#FFF1E6] hover:text-[#0F0F0F]"
          >
            <Menu size={20} />
          </button>
          <Brand />
          <Link
            href={user ? "/profile" : "/login"}
            className="rounded-lg p-2 text-[#8A4E2A]/70 transition-colors hover:bg-[#FFF1E6] hover:text-[#0F0F0F]"
          >
            <User size={20} />
          </Link>
        </header>

        <header className="premium-glass-header sticky top-0 z-20 hidden items-center justify-between border-b px-4 py-3 md:flex">
          <button
            onClick={() => setDesktopSidebarHidden((v) => !v)}
            title={desktopSidebarHidden ? "Open navigation" : "Close navigation"}
            aria-label={desktopSidebarHidden ? "Open navigation" : "Close navigation"}
            className="rounded-lg border border-[#E7DED4] bg-white p-2 text-[#6B7280] hover:text-[#1F2933]"
          >
            {desktopSidebarHidden ? <Menu size={16} /> : <X size={16} />}
          </button>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F0F0F] shadow-sm">
        <Sparkles size={16} className="text-[#FFCBA4]" />
      </div>
      <span className="text-base font-bold tracking-tight text-[#0F0F0F]">IdeaBridge</span>
    </Link>
  );
}

function NavLinks({
  pathname,
  userRole,
  onNavigate,
}: {
  pathname: string;
  userRole?: string;
  onNavigate?: () => void;
}) {
  const sections = NAV_ITEMS.map((section) => {
    if (section.section !== "Modules" || userRole !== "admin") {
      return section;
    }

    return {
      ...section,
      items: [...section.items, { label: "Admin Portal", href: "/dashboard/admin", icon: ShieldCheck }],
    };
  });

  return (
    <nav className="space-y-5 p-3">
      {sections.map((section) => (
        <div key={section.section}>
          <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-[#8A4E2A]/55">
            {section.section}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-linear-to-r from-[#FFCBA4] to-[#F5A97F] text-[#0F0F0F] shadow-sm"
                      : "text-[#5D4739] hover:bg-[#FFF1E6] hover:text-[#0F0F0F]"
                  }`}
                >
                  <Icon size={16} className={isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"} />
                  <span className="flex-1">{item.label}</span>
                  {isActive ? <ChevronRight size={14} className="opacity-50" /> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserFooter({
  user,
  logout,
}: {
  user: { email?: string; fullName?: string; role?: string } | null;
  logout: () => Promise<void>;
}) {
  if (!user) {
    return (
      <div className="border-t border-[#FFD4B1] p-4">
        <Link
          href="/login"
          className="flex w-full items-center gap-2 rounded-lg bg-linear-to-r from-[#FFCBA4] to-[#F5A97F] px-3 py-2 text-sm font-semibold text-[#0F0F0F] transition hover:brightness-110"
        >
          <LogIn size={15} />
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-[#FFD4B1] p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F0F0F] text-sm font-bold text-[#FFCBA4]">
          {(user.fullName ?? user.email ?? "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0F0F0F]">{user.fullName ?? user.email}</p>
          <p className="text-[11px] capitalize text-[#8A4E2A]/70">{user.role ?? "Student"}</p>
        </div>
      </div>
      <button
        onClick={() => {
          void logout();
        }}
        className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-[#8A4E2A]/80 transition-colors hover:bg-[#FFF1E6] hover:text-[#0F0F0F]"
      >
        Sign out
      </button>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  logout,
}: {
  pathname: string;
  user: { email?: string; fullName?: string; role?: string } | null;
  logout: () => Promise<void>;
}) {
  return (
    <>
      <div className="border-b border-[#FFD4B1] p-5">
        <Brand />
        <p className="mt-1 text-[11px] text-[#8A4E2A]/70">Connect. Learn. Build.</p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <NavLinks pathname={pathname} userRole={user?.role} />
      </div>

      <UserFooter user={user} logout={logout} />
    </>
  );
}
