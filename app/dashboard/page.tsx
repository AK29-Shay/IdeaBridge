"use client";

import Link from "next/link";
import { ArrowRight, ChartColumnBig, GraduationCap, UserRound } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

type RoleCard = {
  id: "student" | "mentor" | "analytics";
  roleMatch?: "student" | "mentor";
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ROLE_CARDS: RoleCard[] = [
  {
    id: "student",
    roleMatch: "student",
    label: "Student Dashboard",
    description: "Manage your ideas, projects, and mentorship requests.",
    href: "/dashboard/student",
    icon: GraduationCap,
  },
  {
    id: "mentor",
    roleMatch: "mentor",
    label: "Mentor Dashboard",
    description: "Review requests, track mentee progress, and update your profile.",
    href: "/dashboard/mentor",
    icon: UserRound,
  },
  {
    id: "analytics",
    label: "Analytics Component",
    description: "Open the merged Member 4 + New Update analytics dashboard.",
    href: "/dashboard/analytics",
    icon: ChartColumnBig,
  },
];

export default function DashboardIndexPage() {
  const { user, isReady } = useAuth();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="rounded-3xl border border-[#FFCBA4]/30 bg-[#0f172a]/75 p-6 shadow-sm backdrop-blur sm:p-8">
        <h1 className="text-2xl font-extrabold text-[#fecdac] sm:text-3xl">Choose Your Dashboard</h1>
        <p className="mt-2 text-sm text-[#fecdac]/70 sm:text-base">
          Open the dashboard for each user type from here.
        </p>
        {isReady && user ? (
          <p className="mt-3 inline-flex rounded-full bg-[#FFCBA4]/20 px-3 py-1 text-xs font-semibold text-[#fecdac]">
            Signed in as {user.fullName} ({user.role})
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {ROLE_CARDS.map(({ id, roleMatch, label, description, href, icon: Icon }) => {
            const isCurrentRole = isReady && roleMatch ? user?.role === roleMatch : false;
            return (
              <Link
                key={id}
                href={href}
                className="group rounded-2xl border border-[#FFCBA4]/35 bg-linear-to-br from-[#0f172a] to-[#111827] p-5 transition hover:-translate-y-0.5 hover:border-[#F5A97F] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-[#FFCBA4] p-2.5 text-[#0f0f0f] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  {isCurrentRole ? (
                    <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      Your Role
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-4 text-lg font-bold text-[#fecdac]">{label}</h2>
                <p className="mt-1 text-sm text-[#fecdac]/70">{description}</p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#fecdac]">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}