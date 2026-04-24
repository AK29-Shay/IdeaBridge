"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, Lightbulb, Search, Sparkles, TrendingUp, Zap } from "lucide-react";

import type { StudentProject } from "@/types/project";

interface DashboardSectionProps {
  projects: StudentProject[];
  onTabChange: (tab: string) => void;
}

export function DashboardSection({ projects, onTabChange }: DashboardSectionProps) {
  const router = useRouter();
  const [mentorSearch, setMentorSearch] = React.useState("");
  const [mentorSearchError, setMentorSearchError] = React.useState<string | null>(null);

  const total = projects.length;
  const active = projects.filter(
    (project) =>
      project.status === "In Progress" ||
      project.status === "On Track" ||
      project.status === "Delayed"
  ).length;
  const completed = projects.filter((project) => project.status === "Completed").length;

  const stats = [
    {
      label: "Total Projects",
      value: total,
      icon: BookOpen,
      gradient: "from-[#0F0F0F] to-[#1A1A2E]",
      bg: "from-white to-white",
      border: "border-[#FFCBA4]/30",
      text: "text-[#0F0F0F]",
    },
    {
      label: "Active Projects",
      value: active,
      icon: Zap,
      gradient: "from-amber-400 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      gradient: "from-emerald-400 to-teal-500",
      bg: "from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
    },
  ];

  function handleMentorSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = mentorSearch.trim();

    if (!query) {
      setMentorSearchError("Please enter a search term.");
      toast.error("Please enter a search term.");
      return;
    }

    if (query.length < 2) {
      setMentorSearchError("Search must be at least 2 characters.");
      toast.error("Search must be at least 2 characters.");
      return;
    }

    setMentorSearchError(null);
    router.push(`/mentors?q=${encodeURIComponent(query)}`);
    setMentorSearch("");
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F0F0F] via-[#1c0f00] to-[#2a1200] p-8 text-[#FFCBA4] shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/2 h-32 w-32 rounded-full bg-pink-400/20 blur-xl" />
        <div className="relative flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-[#FFCBA4]/70">
            <Sparkles className="h-4 w-4" />
            <span>Welcome back</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Ready to build something great?</h2>
          <p className="mt-1 text-sm text-[#FFCBA4]/60">
            Track your projects, connect with mentors, and showcase your progress.
          </p>
          <button
            onClick={() => onTabChange("projects")}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-[#FFCBA4]/30 bg-[#FFCBA4]/20 px-5 py-2.5 text-sm font-semibold text-[#FFCBA4] shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFCBA4]/30"
          >
            <TrendingUp className="h-4 w-4" />
            View My Projects
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`group relative cursor-default overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.bg} p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
          >
            <div className={`absolute right-3 top-3 rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-md`}>
              <stat.icon className="h-5 w-5 text-[#0F0F0F]" />
            </div>
            <div className={`text-4xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#FFCBA4]/30 bg-white shadow-sm">
        <div className="border-b border-[#FFCBA4]/30 bg-gradient-to-r from-white to-white px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800">
            <Search className="h-4 w-4 text-[#0F0F0F]" />
            Find a Mentor
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">Search by name, skill, or specialization</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleMentorSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g., Machine Learning, Dr. Smith, Deep Learning..."
                value={mentorSearch}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setMentorSearch(nextValue);
                  const trimmed = nextValue.trim();

                  if (!trimmed) {
                    setMentorSearchError(null);
                  } else if (trimmed.length < 2) {
                    setMentorSearchError("Search must be at least 2 characters.");
                  } else {
                    setMentorSearchError(null);
                  }
                }}
                aria-invalid={mentorSearchError ? "true" : "false"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
              />
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                type="submit"
                disabled={Boolean(mentorSearchError) || !mentorSearch.trim()}
                className={`rounded-xl px-6 py-3 text-sm font-semibold text-[#FFCBA4] shadow-sm transition-all duration-200 ${
                  mentorSearchError || !mentorSearch.trim()
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-gradient-to-r from-[#0F0F0F] to-[#1c0f00] hover:-translate-y-0.5 hover:brightness-110"
                }`}
              >
                Search
              </button>
              {mentorSearchError ? <div className="text-sm text-destructive">{mentorSearchError}</div> : null}
            </div>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div
          onClick={() => onTabChange("projects")}
          className="group cursor-pointer rounded-2xl border border-[#FFCBA4]/30 bg-gradient-to-br from-white to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#0F0F0F] to-[#1A1A2E] p-2.5 shadow">
              <Zap className="h-5 w-5 text-[#0F0F0F]" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Update Progress</div>
              <div className="text-xs text-slate-500">Log your latest milestone</div>
            </div>
          </div>
        </div>
        <div
          onClick={() => onTabChange("requests")}
          className="group cursor-pointer rounded-2xl border border-[#FFCBA4]/30 bg-gradient-to-br from-white to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#FFCBA4] to-[#F5A97F] p-2.5 shadow">
              <BookOpen className="h-5 w-5 text-[#0F0F0F]" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Send Mentor Request</div>
              <div className="text-xs text-slate-500">Connect with your ideal guide</div>
            </div>
          </div>
        </div>
        <div
          onClick={() => onTabChange("mentorships")}
          className="group cursor-pointer rounded-2xl border border-[#FFCBA4]/30 bg-gradient-to-br from-white to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#F5A97F] to-[#E28A5D] p-2.5 shadow">
              <Sparkles className="h-5 w-5 text-[#0F0F0F]" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Open Mentorship Space</div>
              <div className="text-xs text-slate-500">Chat with mentors and confirm your next session</div>
            </div>
          </div>
        </div>
        <div
          onClick={() => onTabChange("recommendations")}
          className="group cursor-pointer rounded-2xl border border-[#FFCBA4]/30 bg-gradient-to-br from-white to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#FFD28F] to-[#F5A97F] p-2.5 shadow">
              <Lightbulb className="h-5 w-5 text-[#0F0F0F]" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Recommendations</div>
              <div className="text-xs text-slate-500">Save ideas and discover similar high-signal threads</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
