"use client";

import * as React from "react";
import { FolderKanban, User2, CalendarDays } from "lucide-react";

export interface ProjectItem {
  id: string;
  title: string;
  studentName: string;
  progressPercent: number;
  status: "In Progress" | "Completed" | "Delayed";
  updatedAt?: string;
}

function statusCfg(status: ProjectItem["status"]) {
  switch (status) {
    case "Completed":   return { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-gradient-to-r from-emerald-400 to-teal-500",  dot: "bg-emerald-500" };
    case "In Progress": return { badge: "bg-amber-50 text-amber-700 border-amber-200",       bar: "bg-gradient-to-r from-amber-400 to-orange-500",   dot: "bg-amber-500"   };
    case "Delayed":     return { badge: "bg-red-50 text-red-700 border-red-200",             bar: "bg-gradient-to-r from-red-400 to-rose-500",       dot: "bg-red-500"     };
  }
}

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const active   = projects.filter(p => p.status === "In Progress").length;
  const done     = projects.filter(p => p.status === "Completed").length;
  const delayed  = projects.filter(p => p.status === "Delayed").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mentored Projects</h2>
        <p className="text-sm text-slate-500 mt-0.5">Monitor accepted requests and active project outcomes.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "In Progress", value: active,  gradient: "from-amber-400 to-orange-500", light: "from-amber-50 to-orange-50",   border: "border-amber-200",   text: "text-amber-700"   },
          { label: "Completed",   value: done,    gradient: "from-emerald-400 to-teal-500", light: "from-emerald-50 to-teal-50",   border: "border-emerald-200", text: "text-emerald-700" },
          { label: "Delayed",     value: delayed, gradient: "from-red-400 to-rose-500",     light: "from-red-50 to-rose-50",       border: "border-red-200",     text: "text-red-700"     },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${s.border} bg-gradient-to-br ${s.light} p-5 shadow-sm`}>
            <div className={`text-3xl font-bold ${s.text}`}>{s.value}</div>
            <div className="text-sm text-slate-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Project cards */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#FFCBA4]/30 bg-[#FFCBA4]/5 py-16 text-center">
          <FolderKanban className="h-10 w-10 text-[#F5A97F] mb-3" />
          <p className="text-slate-600 font-medium">No active mentored projects yet</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map(p => {
            const cfg = statusCfg(p.status);
            return (
              <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                {/* colour accent strip */}
                <div className={`h-1.5 w-full ${cfg.bar}`} />
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-800">{p.title}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <User2 className="h-3 w-3" />
                        {p.studentName}
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {p.status}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-bold text-slate-700">{p.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`} style={{ width: `${p.progressPercent}%` }} />
                    </div>
                  </div>

                  {p.updatedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays className="h-3 w-3" />
                      Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
