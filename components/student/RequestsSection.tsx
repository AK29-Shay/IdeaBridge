"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, Clock, CheckCircle2, XCircle, UserSearch, Users } from "lucide-react";

type RequestStatus = "Pending" | "Accepted" | "Rejected";

interface MentorRequest {
  id: string;
  mentorName: string;
  status: RequestStatus;
  sentAt: string;
}

const INITIAL_REQUESTS: MentorRequest[] = [
  { id: "r1", mentorName: "Dr. Aria Chen", status: "Pending", sentAt: "2026-03-25" },
  { id: "r2", mentorName: "Prof. Malik Johnson", status: "Accepted", sentAt: "2026-03-20" },
  { id: "r3", mentorName: "Ms. Priya Nair", status: "Rejected", sentAt: "2026-03-15" },
];

const SUGGESTED_MENTORS = [
  "Dr. Ahmed Hassan",
  "Prof. Sarah Kim",
  "Dr. Ravi Shankar",
  "Ms. Emily Zhou",
  "Prof. Lucas Mendes",
];

function statusConfig(status: RequestStatus) {
  switch (status) {
    case "Pending":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-400",
        icon: Clock,
      };
    case "Accepted":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };
    case "Rejected":
      return {
        bg: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
        icon: XCircle,
      };
  }
}

export function RequestsSection() {
  const [requests, setRequests] = React.useState<MentorRequest[]>(INITIAL_REQUESTS);
  const [mentorInput, setMentorInput] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const filtered = SUGGESTED_MENTORS.filter((m) =>
    m.toLowerCase().includes(mentorInput.toLowerCase()) && mentorInput.length > 0
  );

  function sendRequest(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a mentor name.");
      return;
    }
    const alreadySent = requests.find(
      (r) => r.mentorName.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadySent) {
      toast.error(`Request to ${trimmed} was already sent.`);
      return;
    }
    const newReq: MentorRequest = {
      id: `r_${Date.now()}`,
      mentorName: trimmed,
      status: "Pending",
      sentAt: new Date().toISOString().slice(0, 10),
    };
    setRequests([newReq, ...requests]);
    setMentorInput("");
    setShowSuggestions(false);
    toast.success(`Mentorship request sent to ${trimmed}! 🎉`);
  }

  const pending = requests.filter((r) => r.status === "Pending").length;
  const accepted = requests.filter((r) => r.status === "Accepted").length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mentorship Requests</h2>
        <p className="text-sm text-slate-500 mt-0.5">Send requests & track their status</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total Requests", value: requests.length, gradient: "from-[#0F0F0F] to-[#1c0f00]", light: "from-white to-white", border: "border-[#FFCBA4]/30", text: "text-[#0F0F0F]" },
          { label: "Pending", value: pending, gradient: "from-amber-400 to-orange-500", light: "from-amber-50 to-orange-50", border: "border-amber-200", text: "text-amber-700" },
          { label: "Accepted", value: accepted, gradient: "from-emerald-400 to-teal-500", light: "from-emerald-50 to-teal-50", border: "border-emerald-200", text: "text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.border} bg-gradient-to-br ${s.light} p-5 shadow-sm`}>
            <div className={`text-3xl font-bold ${s.text}`}>{s.value}</div>
            <div className="text-sm text-slate-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Send Request */}
      <div className="rounded-2xl border border-[#FFCBA4]/30 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-white to-white px-6 py-4 border-b border-[#FFCBA4]/30">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Send className="h-4 w-4 text-[#0F0F0F]" />
            Send a Mentorship Request
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Type a mentor name or pick from suggestions</p>
        </div>
        <div className="p-6 relative">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Mentor name..."
                value={mentorInput}
                onChange={(e) => {
                  setMentorInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] focus:border-transparent transition-all"
              />
              {/* Autocomplete */}
              {showSuggestions && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  {filtered.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={() => {
                        setMentorInput(name);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#FFCBA4]/10 hover:text-[#0F0F0F] transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => sendRequest(mentorInput)}
              className="flex items-center gap-2 rounded-xl bg-[#0F0F0F] px-5 py-3 text-sm font-semibold text-[#FFCBA4] shadow-sm hover:brightness-125 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-white to-white px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#0F0F0F]" />
            Request History
          </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {requests.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No requests sent yet. Send your first request above!
            </div>
          ) : (
            requests.map((req) => {
              const cfg = statusConfig(req.status);
              const Icon = cfg.icon;
              return (
                <div key={req.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FFCBA4]/20 to-[#FFCBA4]/20 flex items-center justify-center text-[#0F0F0F] font-bold text-sm shadow-inner">
                      {req.mentorName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{req.mentorName}</div>
                      <div className="text-xs text-slate-400">Sent on {req.sentAt}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {req.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
