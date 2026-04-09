"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, BookOpen, Zap, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import type { StudentProject } from "@/types/project";

interface DashboardSectionProps {
  projects: StudentProject[];
  onTabChange: (tab: string) => void;
}

export function DashboardSection({ projects, onTabChange }: DashboardSectionProps) {
  const [mentorSearch, setMentorSearch] = React.useState("");
  const [mentorSearchError, setMentorSearchError] = React.useState<string | null>(null);

  const total = projects.length;
  const active = projects.filter((p) => p.status === "In Progress" || p.status === "On Track" || p.status === "Delayed").length;
  const completed = projects.filter((p) => p.status === "Completed").length;

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

  function handleMentorSearch(e: React.FormEvent) {
    e.preventDefault();
    const val = mentorSearch.trim();
    if (!val) {
      setMentorSearchError("Please enter a search term.");
      toast.error("Please enter a search term.");
      return;
    }
    if (val.length < 2) {
      setMentorSearchError("Search must be at least 2 characters.");
      toast.error("Search must be at least 2 characters.");
      return;
    }
    setMentorSearchError(null);
    toast.success(`Searching for mentors matching "${val}"...`);
    setMentorSearch("");
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F0F0F] via-[#1c0f00] to-[#2a1200] p-8 text-[#FFCBA4] shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/2 h-32 w-32 rounded-full bg-pink-400/20 blur-xl" />
        <div className="relative flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#FFCBA4]/70 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Welcome back</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to build something great? 👋
          </h2>
          <p className="mt-1 text-[#FFCBA4]/60 text-sm">
            Track your projects, connect with mentors, and showcase your progress.
          </p>
          <button
            onClick={() => onTabChange("projects")}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-[#FFCBA4]/20 px-5 py-2.5 text-sm font-semibold text-[#FFCBA4] backdrop-blur-sm border border-[#FFCBA4]/30 hover:bg-[#FFCBA4]/30 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
          >
            <TrendingUp className="h-4 w-4" />
            View My Projects
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`group relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-br ${s.bg} p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default`}
          >
            <div className={`absolute right-3 top-3 rounded-xl bg-gradient-to-br ${s.gradient} p-2.5 shadow-md`}>
              <s.icon className="h-5 w-5 text-[#0F0F0F]" />
            </div>
            <div className={`text-4xl font-bold ${s.text}`}>{s.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Find a Mentor */}
      <div className="rounded-2xl border border-[#FFCBA4]/30 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-white to-white px-6 py-4 border-b border-[#FFCBA4]/30">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#0F0F0F]" />
            Find a Mentor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Search by name, skill, or specialization</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleMentorSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g., Machine Learning, Dr. Smith, Deep Learning..."
                value={mentorSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setMentorSearch(v);
                  const trimmed = v.trim();
                  if (!trimmed) setMentorSearchError(null);
                  else if (trimmed.length < 2) setMentorSearchError("Search must be at least 2 characters.");
                  else setMentorSearchError(null);
                }}
                aria-invalid={mentorSearchError ? "true" : "false"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                type="submit"
                disabled={Boolean(mentorSearchError) || !mentorSearch.trim()}
                className={`rounded-xl px-6 py-3 text-sm font-semibold text-[#FFCBA4] shadow-sm transition-all duration-200 ${
                  mentorSearchError || !mentorSearch.trim()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#0F0F0F] to-[#1c0f00] hover:brightness-110 hover:-translate-y-0.5"
                }`}
              >
                Search
              </button>
              {mentorSearchError ? <div className="text-sm text-destructive">{mentorSearchError}</div> : null}
            </div>
          </form>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          onClick={() => onTabChange("projects")}
          className="group cursor-pointer rounded-2xl border border-[#FFCBA4]/30 bg-gradient-to-br from-white to-white p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
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
          className="group cursor-pointer rounded-2xl border border-[#FFCBA4]/30 bg-gradient-to-br from-white to-white p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
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
      </div>
    </div>
  );
}
