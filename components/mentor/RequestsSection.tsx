"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Clock, Users, X } from "lucide-react";

import { getRequestStatusLabel, getRequestStatusTone, isActiveRequest, isClosedRequest, isPendingRequest } from "@/lib/requestStatus";
import type { MentorshipRequestRecord } from "@/types/request";

interface RequestsSectionProps {
  requests: MentorshipRequestRecord[];
  onUpdateRequest: (id: string, status: "in_progress" | "cancelled") => Promise<void> | void;
}

export function RequestsSection({ requests, onUpdateRequest }: RequestsSectionProps) {
  const pending = requests.filter((request) => isPendingRequest(request.status)).length;
  const active = requests.filter((request) => isActiveRequest(request.status)).length;
  const closed = requests.filter((request) => isClosedRequest(request.status)).length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mentorship Requests</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Review incoming requests, accept strong matches, and keep response times healthy.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Pending",
            value: pending,
            gradient: "from-amber-50 to-orange-50",
            border: "border-amber-200",
            text: "text-amber-700",
          },
          {
            label: "Active",
            value: active,
            gradient: "from-emerald-50 to-teal-50",
            border: "border-emerald-200",
            text: "text-emerald-700",
          },
          {
            label: "Closed",
            value: closed,
            gradient: "from-slate-50 to-white",
            border: "border-slate-200",
            text: "text-slate-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.gradient} p-5 shadow-sm`}
          >
            <div className={`text-3xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className="mt-0.5 text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#FFCBA4]/30 bg-[#FFCBA4]/5 py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-[#F5A97F]" />
            <p className="font-medium text-slate-600">No requests yet</p>
            <p className="mt-1 text-sm text-slate-400">Students will appear here once they request mentorship.</p>
          </div>
        ) : (
          requests.map((request) => {
            const statusTone = getRequestStatusTone(request.status);
            const studentName = request.student?.full_name ?? "Student";

            return (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F0F0F] text-lg font-bold text-[#FFCBA4] shadow-md">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{studentName}</div>
                      <div className="text-sm font-medium text-[#0F0F0F]">{request.title}</div>
                      <p className="mt-2 max-w-2xl rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-500">
                        {request.description || "No additional details were provided."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="rounded-full bg-[#FFF4EB] px-3 py-1 font-semibold text-[#8A4E2A]">
                          {request.domain || "General"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                          {request.type === "specific_idea" ? "Specific idea" : "Full project"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {isActiveRequest(request.status) || isClosedRequest(request.status) ? (
                          <Link
                            href={`/dashboard/mentor/mentorships?request=${encodeURIComponent(request.id)}`}
                            className="rounded-full bg-[#0F0F0F] px-3 py-1 font-semibold text-[#FFCBA4] transition hover:brightness-110"
                          >
                            Open mentorship space
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} />
                      {getRequestStatusLabel(request.status)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => void onUpdateRequest(request.id, "in_progress")}
                        disabled={!isPendingRequest(request.status)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#0F0F0F] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      >
                        <Check className="h-4 w-4" /> Accept
                      </button>
                      <button
                        onClick={() => void onUpdateRequest(request.id, "cancelled")}
                        disabled={!isPendingRequest(request.status)}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
