"use client";

import * as React from "react";
import { Check, X, Users, Clock } from "lucide-react";
import { toast } from "sonner";

type RequestStatus = "Pending" | "Accepted" | "Rejected";
export interface RequestItem {
  id: string;
  studentName: string;
  projectTitle: string;
  message?: string;
  status: RequestStatus;
  sentAt?: string;
}

function statusCfg(status: RequestStatus) {
  switch (status) {
    case "Pending":  return { bg: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400"  };
    case "Accepted": return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    case "Rejected": return { bg: "bg-red-50 text-red-700 border-red-200",         dot: "bg-red-500"    };
  }
}

interface RequestsSectionProps {
  requests: RequestItem[];
  onUpdateRequest: (id: string, status: "Accepted" | "Rejected") => void;
}

export function RequestsSection({ requests, onUpdateRequest }: RequestsSectionProps) {
  const pending  = requests.filter(r => r.status === "Pending").length;
  const accepted = requests.filter(r => r.status === "Accepted").length;
  const rejected = requests.filter(r => r.status === "Rejected").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mentorship Requests</h2>
        <p className="text-sm text-slate-500 mt-0.5">Review and respond to student requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending",  value: pending,  gradient: "from-amber-400 to-orange-500",  light: "from-amber-50 to-orange-50",  border: "border-amber-200",  text: "text-amber-700"  },
          { label: "Accepted", value: accepted, gradient: "from-emerald-400 to-teal-500",  light: "from-emerald-50 to-teal-50",  border: "border-emerald-200",text: "text-emerald-700"},
          { label: "Rejected", value: rejected, gradient: "from-red-400 to-rose-500",      light: "from-red-50 to-rose-50",      border: "border-red-200",    text: "text-red-700"    },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${s.border} bg-gradient-to-br ${s.light} p-5 shadow-sm`}>
            <div className={`text-3xl font-bold ${s.text}`}>{s.value}</div>
            <div className="text-sm text-slate-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {requests.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#FFCBA4]/30 bg-[#FFCBA4]/5 py-16 text-center">
            <Users className="h-10 w-10 text-[#F5A97F] mb-3" />
            <p className="text-slate-600 font-medium">No requests yet</p>
            <p className="text-sm text-slate-400 mt-1">Students will send you mentorship requests here</p>
          </div>
        )}
        {requests.map(r => {
          const cfg = statusCfg(r.status);
          return (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#0F0F0F] flex items-center justify-center text-[#FFCBA4] font-bold text-lg shadow-md shrink-0">
                    {r.studentName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{r.studentName}</div>
                    <div className="text-sm text-[#0F0F0F] font-medium">{r.projectTitle}</div>
                    {r.message && (
                      <p className="mt-2 text-sm text-slate-500 max-w-md line-clamp-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        "{r.message}"
                      </p>
                    )}
                    {r.sentAt && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                        <Clock className="h-3.5 w-3.5" />
                        {r.sentAt}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {r.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onUpdateRequest(r.id, "Accepted"); toast.success(`Accepted ${r.studentName}'s request!`); }}
                      disabled={r.status !== "Pending"}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#0F0F0F] shadow-sm hover:bg-emerald-600 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
                    >
                      <Check className="h-4 w-4" /> Accept
                    </button>
                    <button
                      onClick={() => { onUpdateRequest(r.id, "Rejected"); toast.error(`Rejected ${r.studentName}'s request.`); }}
                      disabled={r.status !== "Pending"}
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
