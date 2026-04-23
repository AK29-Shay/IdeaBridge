"use client";

import * as React from "react";
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

import { getRequestStatusLabel, getRequestStatusTone, isPendingRequest } from "@/lib/requestStatus";
import type { MentorshipRequestRecord } from "@/types/request";

type ProjectItem = {
  id: string;
  title: string;
  studentName: string;
  progressPercent: number;
  status: "In Progress" | "Completed" | "Delayed";
};

type ActivityItem = {
  id: string;
  text: string;
  time: string;
  type: "request" | "project" | "blog" | "profile";
};

type AvailabilityStatus =
  | "Available Now"
  | "Available in 1-2 days"
  | "Available"
  | "Busy"
  | "On Leave"
  | string;

interface DashboardSectionProps {
  mentorName: string;
  availabilityStatus: AvailabilityStatus;
  requests: MentorshipRequestRecord[];
  projects: ProjectItem[];
  onUpdateRequest: (id: string, status: "in_progress" | "cancelled") => Promise<void> | void;
  onTabChange: (tab: string) => void;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", text: "A new mentorship request arrived for review", time: "Today", type: "request" },
  { id: "a2", text: "An active project milestone was updated", time: "Yesterday", type: "project" },
  { id: "a3", text: "Your latest mentor article is available in the blog section", time: "This week", type: "blog" },
  { id: "a4", text: "Profile details can be refreshed anytime from the profile area", time: "This week", type: "profile" },
];

function availabilityConfig(status: AvailabilityStatus) {
  switch (status) {
    case "Available":
    case "Available Now":
      return { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    case "Available in 1-2 days":
      return { bg: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-400" };
    case "Busy":
      return { bg: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" };
    case "On Leave":
      return { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
    default:
      return { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  }
}

function statusBar(status: ProjectItem["status"]) {
  switch (status) {
    case "Completed":
      return "bg-gradient-to-r from-emerald-400 to-teal-500";
    case "In Progress":
      return "bg-gradient-to-r from-amber-400 to-orange-400";
    case "Delayed":
      return "bg-gradient-to-r from-red-400 to-rose-500";
  }
}

function statusBadge(status: ProjectItem["status"]) {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Delayed":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function activityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "request":
      return <Users className="h-3.5 w-3.5" />;
    case "project":
      return <FolderKanban className="h-3.5 w-3.5" />;
    case "blog":
      return <FileText className="h-3.5 w-3.5" />;
    case "profile":
      return <Activity className="h-3.5 w-3.5" />;
  }
}

export function DashboardSection({
  mentorName,
  availabilityStatus,
  requests,
  projects,
  onUpdateRequest,
  onTabChange,
}: DashboardSectionProps) {
  const avCfg = availabilityConfig(availabilityStatus);
  const pending = requests.filter((request) => isPendingRequest(request.status)).length;
  const active = projects.filter((project) => project.status === "In Progress").length;
  const done = projects.filter((project) => project.status === "Completed").length;

  const stats = [
    {
      label: "Open Requests",
      value: pending,
      icon: Clock,
      gradient: "from-[#FFCBA4] to-[#F5A97F]",
      light: "from-white to-white",
      border: "border-[#FFCBA4]/30",
      text: "text-[#0F0F0F]",
    },
    {
      label: "Active Projects",
      value: active,
      icon: FolderKanban,
      gradient: "from-amber-400 to-orange-500",
      light: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    {
      label: "Project Wins",
      value: done,
      icon: CheckCircle2,
      gradient: "from-emerald-400 to-teal-500",
      light: "from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
    },
    {
      label: "Mentorship Flow",
      value: requests.length,
      icon: Users,
      gradient: "from-[#0F0F0F] to-[#1A1A2E]",
      light: "from-white to-white",
      border: "border-[#FFCBA4]/30",
      text: "text-[#0F0F0F]",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F0F0F] via-[#1c0f00] to-[#2a1200] p-8 text-[#FFCBA4] shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-pink-400/20 blur-xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#FFCBA4]/70">Welcome back, Mentor</p>
            <h2 className="mt-0.5 text-3xl font-bold tracking-tight">{mentorName}</h2>
            <p className="mt-1 text-sm text-[#FFCBA4]/60">
              Review requests, guide projects, and stay visible for students who need the right mentor.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${avCfg.bg}`}
          >
            <span className={`h-2 w-2 rounded-full ${avCfg.dot}`} />
            {availabilityStatus}
          </span>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          {[
            { label: "Review Requests", tab: "requests" },
            { label: "Open Chat Space", tab: "mentorships" },
            { label: "Track Projects", tab: "projects" },
            { label: "Write a Blog", tab: "blog" },
          ].map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="flex items-center gap-1.5 rounded-xl border border-[#FFCBA4]/30 bg-[#FFCBA4]/15 px-4 py-2 text-sm font-semibold text-[#FFCBA4] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFCBA4]/25"
            >
              <Zap className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.light} p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
          >
            <div className={`absolute right-3 top-3 rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-md`}>
              <stat.icon className="h-5 w-5 text-[#0F0F0F]" />
            </div>
            <div className={`text-4xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-white px-6 py-4">
              <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                <TrendingUp className="h-4 w-4 text-[#0F0F0F]" />
                Recent Projects
              </h3>
              <button
                onClick={() => onTabChange("projects")}
                className="flex items-center gap-1 text-xs font-semibold text-[#0F0F0F] hover:underline"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {projects.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">
                  No active project records yet.
                </div>
              ) : (
                projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="p-5 transition-colors hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{project.title}</div>
                        <div className="mt-0.5 text-xs text-slate-500">Student: {project.studentName}</div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadge(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Progress</span>
                        <span className="font-bold text-slate-700">{project.progressPercent}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${statusBar(project.status)} transition-all duration-500`}
                          style={{ width: `${project.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-white px-6 py-4">
              <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                <Clock className="h-4 w-4 text-[#F5A97F]" />
                Pending Requests
              </h3>
              <button
                onClick={() => onTabChange("requests")}
                className="flex items-center gap-1 text-xs font-semibold text-[#0F0F0F] hover:underline"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {requests.filter((request) => isPendingRequest(request.status)).length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">
                  No pending requests right now.
                </div>
              ) : (
                requests
                  .filter((request) => isPendingRequest(request.status))
                  .slice(0, 2)
                  .map((request) => {
                    const studentName = request.student?.full_name ?? "Student";
                    const statusTone = getRequestStatusTone(request.status);

                    return (
                      <div
                        key={request.id}
                        className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFCBA4]/20 to-[#FFCBA4]/20 text-sm font-bold text-[#0F0F0F]">
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{studentName}</div>
                            <div className="text-xs text-slate-500">{request.title}</div>
                            <span
                              className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} />
                              {getRequestStatusLabel(request.status)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              void onUpdateRequest(request.id, "in_progress");
                            }}
                            disabled={!isPendingRequest(request.status)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-[#0F0F0F] transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Check className="h-3.5 w-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => {
                              void onUpdateRequest(request.id, "cancelled");
                            }}
                            disabled={!isPendingRequest(request.status)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        <div className="h-fit overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-white to-white px-6 py-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Activity className="h-4 w-4 text-[#0F0F0F]" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3 p-4">
            {RECENT_ACTIVITY.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
              >
                <div className="mt-0.5 shrink-0 rounded-lg bg-gradient-to-br from-[#FFCBA4]/20 to-[#FFCBA4]/20 p-2 text-[#0F0F0F]">
                  {activityIcon(activity.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs leading-relaxed text-slate-700">{activity.text}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
