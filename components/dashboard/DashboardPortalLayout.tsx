"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Bell, LogOut, Menu, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type DashboardPortalLayoutProps = {
  portalLabel: string;
  portalDescription: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardPortalLayout({
  portalLabel,
  portalDescription,
  navItems,
  children,
}: DashboardPortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [desktopSidebarHidden, setDesktopSidebarHidden] = React.useState(false);

  const activeItem =
    navItems.find((item) => isActivePath(pathname, item.href)) ?? navItems[0] ?? null;
  const profileHref =
    user?.role === "mentor"
      ? "/dashboard/mentor/profile"
      : user?.role === "student"
      ? "/dashboard/student/profile"
      : user?.role === "admin"
      ? "/dashboard/admin"
      : "/profile";

  const initials = React.useMemo(() => {
    const fullName = user?.fullName?.trim() ?? "";
    if (!fullName) return "IB";

    return fullName
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.fullName]);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out successfully.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to log out.");
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] app-page-enter">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E7DED4] bg-white shadow-xl transition-all duration-300 lg:relative lg:translate-x-0 lg:shadow-none",
            desktopSidebarHidden ? "lg:hidden" : "w-72",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center gap-3 border-b border-[#E7DED4] px-6 py-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-sm font-black text-[#FFCBA4] shadow-md">
                IB
              </div>
              <div>
                <div className="font-bold text-[#1F2933]">IdeaBridge</div>
                <div className="flex items-center gap-1 text-xs font-medium text-[#C86B4A]">
                  <Sparkles className="h-3 w-3" />
                  {portalLabel}
                </div>
              </div>
            </Link>
            <button
              type="button"
              aria-label="Close sidebar"
              className="ml-auto rounded-lg p-2 text-[#6B7280] transition hover:bg-[#FAF7F2] hover:text-[#1F2933]"
              onClick={() => {
                if (window.matchMedia("(min-width: 1024px)").matches) {
                  setDesktopSidebarHidden(true);
                } else {
                  setSidebarOpen(false);
                }
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-4 mt-4 siri-border p-4 text-[#1F2933] shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{user?.fullName ?? "Dashboard User"}</div>
                <div className="truncate text-xs text-[#6B7280]">{user?.email ?? ""}</div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6B7280]">{portalDescription}</p>
          </div>

          <nav className="flex-1 px-4 py-5">
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              Navigation
            </div>
            <div className="space-y-1.5">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = isActivePath(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-[#C86B4A] text-white shadow-md"
                        : "text-[#6B7280] hover:bg-[#FAF7F2] hover:text-[#1F2933]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-white" : "text-[#E8B86D]"
                      )}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[#E7DED4] p-4">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#C86B4A] transition hover:bg-[#FAF7F2]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="premium-glass-header sticky top-0 z-20 border-b px-4 py-4 sm:px-6">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
              <button
                type="button"
                aria-label={desktopSidebarHidden ? "Open navigation panel" : "Close navigation panel"}
                className="hidden rounded-xl border border-[#E7DED4] p-2 text-[#6B7280] transition hover:bg-white hover:text-[#1F2933] lg:inline-flex"
                onClick={() => setDesktopSidebarHidden((v) => !v)}
              >
                {desktopSidebarHidden ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
              <button
                type="button"
                aria-label="Open navigation"
                className="rounded-xl border border-[#E7DED4] p-2 text-[#6B7280] transition hover:bg-white hover:text-[#1F2933] lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
                  <span>{portalLabel}</span>
                  <span>/</span>
                  <span>{activeItem?.label ?? "Overview"}</span>
                </div>
                <div className="truncate text-sm font-semibold text-[#1F2933] sm:text-base">
                  {activeItem?.label ?? "Overview"}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <Link
                  href="/notifications"
                  className="relative rounded-xl border border-[#E7DED4] bg-white p-2 text-[#6B7280] shadow-sm transition hover:bg-[#FAF7F2] hover:text-[#1F2933]"
                >
                  <Bell className="h-4 w-4" />
                </Link>
                <div className="hidden text-right md:block">
                  <div className="text-xs text-[#6B7280]">Signed in</div>
                  <div className="text-sm font-semibold text-[#1F2933]">{user?.fullName ?? "IdeaBridge User"}</div>
                </div>
                <Link
                  href={profileHref}
                  title="Open profile"
                  aria-label="Open profile"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-[#FFCBA4] shadow-md transition hover:scale-[1.03] hover:brightness-110"
                >
                  {initials}
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
