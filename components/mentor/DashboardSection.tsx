"use client";

import * as React from "react";
import {
  Users, FolderKanban, Clock, CheckCircle2, Zap, FileText,
  TrendingUp, Activity, ChevronRight, Check, X,
} from "lucide-react";
import { toast } from "sonner";

type RequestItem = { id: string; studentName: string; projectTitle: string; status: "Pending" | "Accepted" | "Rejected" };
type ProjectItem = { id: string; title: string; studentName: string; progressPercent: number; status: "In Progress" | "Completed" | "Delayed" };
type ActivityItem = { id: string; text: string; time: string; type: "request" | "project" | "blog" | "profile" };
type AvailabilityStatus = "Available Now" | "Available in 1-2 days" | "Available" | "Busy" | "On Leave" | string;

interface DashboardSectionProps {
  mentorName: string;
  availabilityStatus: AvailabilityStatus;
  requests: RequestItem[];
  projects: ProjectItem[];
  onUpdateRequest: (id: string, status: "Accepted" | "Rejected") => void;
  onTabChange: (tab: string) => void;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", text: "Alex Harper sent a mentorship request", time: "2 hrs ago", type: "request" },
  { id: "a2", text: "Priya N. updated progress on Quantum Notes to 65%", time: "Yesterday", type: "project" },
  { id: "a3", text: "You published blog: 'Effective Code Review Strategies'", time: "2 days ago", type: "blog" },
  { id: "a4", text: "Lina Gomez request accepted", time: "3 days ago", type: "request" },
  { id: "a5", text: "ML Coach project marked Completed", time: "4 days ago", type: "project" },
];

function availabilityConfig(status: AvailabilityStatus) {
  switch (status) {
    case "Available":
    case "Available Now":        return { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    case "Available in 1-2 days": return { bg: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-400"   };
    case "Busy":                 return { bg: "bg-amber-100 text-amber-700 border-amber-200",     dot: "bg-amber-500"  };
    case "On Leave":             return { bg: "bg-slate-100 text-slate-600 border-slate-200",     dot: "bg-slate-400"  };
    default:                     return { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  }
}

function statusBar(status: ProjectItem["status"]) {
  switch (status) {
    case "Completed": return "bg-gradient-to-r from-emerald-400 to-teal-500";
    case "In Progress": return "bg-gradient-to-r from-amber-400 to-orange-400";
    case "Delayed": return "bg-gradient-to-r from-red-400 to-rose-500";
  }
}

function statusBadge(status: ProjectItem["status"]) {
  switch (status) {
    case "Completed":   return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Delayed":     return "bg-red-50 text-red-700 border-red-200";
  }
}

function activityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "request": return <Users className="h-3.5 w-3.5" />;
    case "project": return <FolderKanban className="h-3.5 w-3.5" />;
    case "blog":    return <FileText className="h-3.5 w-3.5" />;
    case "profile": return <Activity className="h-3.5 w-3.5" />;
  }
}

export function DashboardSection({ mentorName, availabilityStatus, requests, projects, onUpdateRequest, onTabChange }: DashboardSectionProps) {
  const avCfg = availabilityConfig(availabilityStatus);
  const pending = requests.filter(r => r.status === "Pending").length;
  const active  = projects.filter(p => p.status === "In Progress").length;
  const done    = projects.filter(p => p.status === "Completed").length;

  // Reordered stats to emphasize Pending Requests first
  const stats = [
    { label: "Pending Requests",value: pending,           icon: Clock,          gradient: "from-[#FFCBA4] to-[#F5A97F]",      light: "from-white to-white",      border: "border-[#FFCBA4]/30",   text: "text-[#0F0F0F]"   },
    { label: "Active Projects",value: active,             icon: FolderKanban,  gradient: "from-amber-400 to-orange-500",   light: "from-amber-50 to-orange-50",   border: "border-amber-200",  text: "text-amber-700"  },
    { label: "Total Mentees", value: requests.length + 4, icon: Users,         gradient: "from-[#0F0F0F] to-[#1A1A2E]",  light: "from-white to-white",  border: "border-[#FFCBA4]/30", text: "text-[#0F0F0F]" },
    { label: "Completed",      value: done,               icon: CheckCircle2,  gradient: "from-emerald-400 to-teal-500",   light: "from-emerald-50 to-teal-50",   border: "border-emerald-200",text: "text-emerald-700"},
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F0F0F] via-[#1c0f00] to-[#2a1200] p-6 text-[#FFCBA4] shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-pink-400/20 blur-xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[#FFCBA4]/70 text-sm font-medium">Welcome back</p>
            <h2 className="text-2xl font-semibold tracking-tight mt-0.5">{mentorName}</h2>
            <p className="text-[#FFCBA4]/60 text-sm mt-1">Your mentorship activity at a glance.</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${avCfg.bg}`}>
            <span className={`h-2 w-2 rounded-full ${avCfg.dot}`} />
            {availabilityStatus}
          </span>
        </div>

        {/* Quick Actions (reduced to avoid competing CTAs) */}
        <div className="relative mt-4 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => onTabChange("requests")}
            className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/20 transition"
          >
            <Clock className="h-4 w-4" />
            View Requests
          </button>
          <button
            onClick={() => onTabChange("projects")}
            className="flex items-center gap-2 rounded-xl bg-transparent border border-white/10 px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/5 transition"
          >
            <FolderKanban className="h-4 w-4" />
            View Projects
          </button>
          <div className="ml-auto text-sm text-[#FFCBA4]/80">You have <span className="font-semibold">{pending}</span> pending requests</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-br ${s.light} p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${s.label === 'Pending Requests' && pending > 0 ? 'ring-1 ring-[#F5A97F]/30' : ''}`}>
            <div className={`absolute right-3 top-3 rounded-xl bg-gradient-to-br ${s.gradient} p-2.5 shadow-md`}>
              <s.icon className="h-5 w-5 text-[#0F0F0F]" />
            </div>
            <div className={`text-4xl font-bold ${s.text}`}>{s.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="space-y-6">
          {/* Recent projects preview */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between bg-gradient-to-r from-white to-white px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#0F0F0F]" />
                Recent Projects
              </h3>
              <button onClick={() => onTabChange("projects")} className="flex items-center gap-1 text-xs font-semibold text-[#0F0F0F] hover:underline">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {projects.slice(0, 3).map(p => (
                <div key={p.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{p.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Student: {p.studentName}</div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span className="font-bold text-slate-700">{p.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${statusBar(p.status)} transition-all duration-500`} style={{ width: `${p.progressPercent}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending requests preview */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between bg-gradient-to-r from-white to-white px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#F5A97F]" />
                Pending Requests
              </h3>
              <button onClick={() => onTabChange("requests")} className="flex items-center gap-1 text-xs font-semibold text-[#0F0F0F] hover:underline">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {requests.filter(r => r.status === "Pending").slice(0, 2).map(r => (
                <div key={r.id} className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FFCBA4]/20 to-[#FFCBA4]/20 flex items-center justify-center font-bold text-[#0F0F0F] text-sm">
                      {r.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-800">{r.studentName}</div>
                      <div className="text-xs text-slate-500">{r.projectTitle}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onUpdateRequest(r.id, "Accepted"); toast.success(`Request from ${r.studentName} accepted!`); }}
                      disabled={r.status !== "Pending"}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-[#0F0F0F] hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => { onUpdateRequest(r.id, "Rejected"); toast.error(`Request from ${r.studentName} rejected.`); }}
                      disabled={r.status !== "Pending"}
                      className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
              {requests.filter(r => r.status === "Pending").length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">No pending requests 🎉</div>
              )}
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden h-fit">
          <div className="bg-gradient-to-r from-white to-white px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#0F0F0F]" />
              Recent Activity
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {RECENT_ACTIVITY.map(a => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                <div className="mt-0.5 rounded-lg bg-gradient-to-br from-[#FFCBA4]/20 to-[#FFCBA4]/20 p-2 text-[#0F0F0F] shrink-0">
                  {activityIcon(a.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed">{a.text}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
