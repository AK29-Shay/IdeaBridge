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
  User,
  LogIn,
  Menu,
  X,
  Bell,
  Users,
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
      { label: "Analytics", href: "/dashboard", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: User },
    ],
  },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Pages that should not show the shell (auth flow pages)
  const SHELL_EXCLUDED = ["/login", "/register", "/forgot-password", "/verify-email", "/auth"];
  const isExcluded = SHELL_EXCLUDED.some((p) => pathname.startsWith(p));
  if (isExcluded) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card shrink-0 sticky top-0 h-screen">
        <SidebarContent pathname={pathname} user={user} logout={logout} />
      </aside>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 bg-card border-r border-border flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Brand />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavLinks pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
              </div>
              <UserFooter user={user} logout={logout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile only) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu size={20} />
          </button>
          <Brand />
          <Link
            href={user ? "/profile" : "/login"}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <User size={20} />
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
        <Sparkles size={16} className="text-primary-foreground" />
      </div>
      <span className="font-bold text-base tracking-tight">IdeaBridge</span>
    </Link>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="p-3 space-y-5">
      {NAV_ITEMS.map((section) => (
        <div key={section.section}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-1">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={16} className={isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
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
  logout: () => void;
}) {
  if (!user) {
    return (
      <div className="p-4 border-t border-border">
        <Link
          href="/login"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <LogIn size={15} />
          Sign In
        </Link>
      </div>
    );
  }
  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
          {(user.fullName ?? user.email ?? "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{user.fullName ?? user.email}</p>
          <p className="text-[11px] text-muted-foreground capitalize">{user.role ?? "Student"}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="w-full text-left text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
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
  logout: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="p-5 border-b border-border">
        <Brand />
        <p className="text-[11px] text-muted-foreground mt-1">Connect. Learn. Build.</p>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2">
        <NavLinks pathname={pathname} />
      </div>

      {/* User Footer */}
      <UserFooter user={user} logout={logout} />
    </>
  );
}
