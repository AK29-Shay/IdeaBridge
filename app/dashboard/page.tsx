"use client";

import Link from "next/link";
import { ArrowRight, ChartColumnBig, GraduationCap, ShieldCheck, Sparkles, UserRound } from "lucide-react";

import type { UserRole } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";

type RoleCard = {
  id: "student" | "mentor" | "admin" | "analytics";
  roleMatch?: UserRole;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  panel: string;
};

const ROLE_CARDS: RoleCard[] = [
  {
    id: "student",
    roleMatch: "student",
    label: "Student Dashboard",
    description: "Manage projects, request mentorship, and keep your profile ready for collaboration.",
    href: "/dashboard/student",
    icon: GraduationCap,
    accent: "text-amber-600 bg-amber-100",
    panel: "border-amber-200 hover:border-amber-400",
  },
  {
    id: "mentor",
    roleMatch: "mentor",
    label: "Mentor Dashboard",
    description: "Review student requests, guide active work, publish blogs, and update your mentor profile.",
    href: "/dashboard/mentor",
    icon: UserRound,
    accent: "text-emerald-600 bg-emerald-100",
    panel: "border-emerald-200 hover:border-emerald-400",
  },
  {
    id: "admin",
    roleMatch: "admin",
    label: "Admin Portal",
    description: "Approve mentor applications, moderate requests, and monitor platform operations.",
    href: "/dashboard/admin",
    icon: ShieldCheck,
    accent: "text-sky-600 bg-sky-100",
    panel: "border-sky-200 hover:border-sky-400",
  },
  {
    id: "analytics",
    label: "Analytics Dashboard",
    description: "Open the merged analytics view for platform activity, content performance, and trends.",
    href: "/dashboard/analytics",
    icon: ChartColumnBig,
    accent: "text-violet-600 bg-violet-100",
    panel: "border-violet-200 hover:border-violet-400",
  },
];

export default function DashboardIndexPage() {
  const { user, isReady } = useAuth();

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFF8F3] to-[#FFEFE6]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-[#FFD4B1] bg-white p-6 shadow-sm sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD4B1] bg-[#FFF8F3] px-3 py-1.5 text-xs font-semibold text-[#c97a30]">
            <Sparkles className="h-3.5 w-3.5" />
            Unified Portal Navigation
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
            Open the right workspace for your role
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60 sm:text-base">
            Student, mentor, and analytics experiences now live under one shared dashboard system with consistent navigation and styling.
          </p>

          {isReady && user ? (
            <p className="mt-4 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-[#FFCBA4]">
              Signed in as {user.fullName} ({user.role})
            </p>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ROLE_CARDS.map(({ id, roleMatch, label, description, href, icon: Icon, accent, panel }) => {
              const isCurrentRole = isReady && roleMatch ? user?.role === roleMatch : false;

              return (
                <Link
                  key={id}
                  href={href}
                  className={`group rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${panel}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`rounded-xl p-2.5 shadow-sm ${accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isCurrentRole ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        Your Role
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-black">{label}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-black/60">{description}</p>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-black">
                    Open Dashboard
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
