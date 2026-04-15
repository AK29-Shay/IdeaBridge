"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { StudentProject } from "@/types/project";
import { cn } from "@/lib/utils";
import { ArrowUpRight, User2, CalendarDays } from "lucide-react";

function statusConfig(status: StudentProject["status"]) {
  switch (status) {
    case "Completed":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
        dot: "bg-emerald-500",
      };
    case "On Track":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        bar: "bg-gradient-to-r from-[#FFCBA4] to-[#F5A97F]",
        dot: "bg-blue-500",
      };
    case "Delayed":
      return {
        badge: "bg-red-50 text-red-700 border-red-200",
        bar: "bg-gradient-to-r from-red-400 to-rose-500",
        dot: "bg-red-500",
      };
    case "In Progress":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        bar: "bg-gradient-to-r from-amber-400 to-orange-500",
        dot: "bg-amber-500",
      };
    case "Not Started":
    default:
      return {
        badge: "bg-slate-100 text-slate-500 border-slate-200",
        bar: "bg-slate-300",
        dot: "bg-slate-400",
      };
  }
}

export function ProjectCard({
  project,
  mentorName,
  onUpdate,
  onOpenDetails,
  isSelected,
}: {
  project: StudentProject;
  mentorName?: string;
  onUpdate: () => void;
  onOpenDetails?: () => void;
  isSelected?: boolean;
}) {
  const cfg = statusConfig(project.status);

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (!onOpenDetails) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className={cn(
        "group relative overflow-hidden border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 rounded-2xl",
        onOpenDetails ? "cursor-pointer" : "",
        isSelected ? "ring-2 ring-[#FFCBA4] ring-offset-2" : ""
      )}
    >
      {/* Top accent strip */}
      <div className={cn("h-1 w-full", cfg.bar)} />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-base font-bold text-slate-800 truncate">{project.title}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{mentorName ?? "No Mentor Assigned"}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5",
              cfg.badge
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
            {project.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5 pt-2">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Progress</span>
            <span className="font-bold text-slate-700">{project.progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", cfg.bar)}
              style={{ width: `${project.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Milestone notes */}
        {project.milestoneNotes && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
            <div className="text-xs font-semibold text-slate-500 mb-1">Latest Note</div>
            <p className="text-xs text-slate-600 line-clamp-2">{project.milestoneNotes}</p>
          </div>
        )}

        {/* Updated at */}
        {project.updatedAt && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays className="h-3 w-3" />
            <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
        )}

        {/* Update button */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onUpdate();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F0F0F] py-2.5 text-xs font-semibold text-[#FFCBA4] shadow-sm hover:brightness-125 hover:-translate-y-0.5 transition-all duration-200"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Update Progress
        </button>
      </CardContent>
    </Card>
  );
}
