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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF3E8]/60 to-[#FFF8F3]">
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
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#FFD4B1] bg-white shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center gap-3 border-b border-[#FFD4B1] px-6 py-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-sm font-black text-[#FFCBA4] shadow-md">
                IB
              </div>
              <div>
                <div className="font-bold text-black">IdeaBridge</div>
                <div className="flex items-center gap-1 text-xs font-medium text-[#c97a30]">
                  <Sparkles className="h-3 w-3" />
                  {portalLabel}
                </div>
              </div>
            </Link>
            <button
              type="button"
              aria-label="Close sidebar"
              className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-[#FFF0E6] hover:text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-black via-[#1C1000] to-[#2A1200] p-4 text-[#FFCBA4] shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{user?.fullName ?? "Dashboard User"}</div>
                <div className="truncate text-xs text-[#FFCBA4]/70">{user?.email ?? ""}</div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#FFCBA4]/70">{portalDescription}</p>
          </div>

          <nav className="flex-1 px-4 py-5">
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
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
                        ? "bg-black text-[#FFCBA4] shadow-md"
                        : "text-slate-600 hover:bg-[#FFF0E6] hover:text-black"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-[#FFCBA4]" : "text-[#c97a30]"
                      )}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[#FFD4B1] p-4">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#FFD4B1] bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
              <button
                type="button"
                aria-label="Open navigation"
                className="rounded-xl border border-[#FFD4B1] p-2 text-slate-500 transition hover:bg-[#FFF0E6] hover:text-black lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-black/45">
                  <span>{portalLabel}</span>
                  <span>/</span>
                  <span>{activeItem?.label ?? "Overview"}</span>
                </div>
                <div className="truncate text-sm font-semibold text-black sm:text-base">
                  {activeItem?.label ?? "Overview"}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <Link
                  href="/notifications"
                  className="relative rounded-xl border border-[#FFD4B1] bg-white p-2 text-slate-500 shadow-sm transition hover:bg-[#FFF0E6] hover:text-black"
                >
                  <Bell className="h-4 w-4" />
                </Link>
                <div className="hidden text-right md:block">
                  <div className="text-xs text-black/40">Signed in</div>
                  <div className="text-sm font-semibold text-black">{user?.fullName ?? "IdeaBridge User"}</div>
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
