"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, ShieldCheck, Users, X } from "lucide-react";

import { authFetch } from "@/lib/authFetch";
import { getRequestStatusLabel, getRequestStatusTone } from "@/lib/requestStatus";

type AdminMentorApplication = {
  id: string;
  user_id: string;
  cv_url: string | null;
  expertise: string[];
  statement: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  applicant?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
};

type AdminRequest = {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  status: "open" | "in_progress" | "completed" | "cancelled";
  type: "full_project" | "specific_idea" | null;
  created_at: string;
  deadline: string | null;
  student?: { full_name: string | null } | null;
  mentor?: { full_name: string | null } | null;
};

function parseClientError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

function applicationTone(status: AdminMentorApplication["status"]) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function applicationLabel(status: AdminMentorApplication["status"]) {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}

export function AdminPortal() {
  const [applications, setApplications] = React.useState<AdminMentorApplication[]>([]);
  const [requests, setRequests] = React.useState<AdminRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingApplicationId, setIsUpdatingApplicationId] = React.useState<string | null>(null);
  const [isUpdatingRequestId, setIsUpdatingRequestId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [applicationsResponse, requestsResponse] = await Promise.all([
        authFetch("/api/admin/mentor-applications", { cache: "no-store" }),
        authFetch("/api/admin/requests", { cache: "no-store" }),
      ]);

      const [applicationsPayload, requestsPayload] = await Promise.all([
        applicationsResponse.json().catch(() => null),
        requestsResponse.json().catch(() => null),
      ]);

      if (!applicationsResponse.ok) {
        throw new Error(parseClientError(applicationsPayload, "Failed to load mentor applications."));
      }

      if (!requestsResponse.ok) {
        throw new Error(parseClientError(requestsPayload, "Failed to load platform requests."));
      }

      setApplications(Array.isArray(applicationsPayload) ? (applicationsPayload as AdminMentorApplication[]) : []);
      setRequests(Array.isArray(requestsPayload) ? (requestsPayload as AdminRequest[]) : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load the admin portal.");
      setApplications([]);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function updateApplication(applicationId: string, status: "approved" | "rejected") {
    setIsUpdatingApplicationId(applicationId);
    try {
      const response = await authFetch("/api/admin/mentor-applications", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          application_id: applicationId,
          status,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseClientError(payload, "Failed to update mentor application."));
      }

      toast.success(status === "approved" ? "Mentor application approved." : "Mentor application rejected.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update mentor application.");
    } finally {
      setIsUpdatingApplicationId(null);
    }
  }

  async function updateRequest(requestId: string, status: "in_progress" | "completed" | "cancelled") {
    setIsUpdatingRequestId(requestId);
    try {
      const response = await authFetch("/api/requests/status", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          status,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseClientError(payload, "Failed to update request status."));
      }

      toast.success("Request status updated.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update request status.");
    } finally {
      setIsUpdatingRequestId(null);
    }
  }

  const pendingApplications = applications.filter((item) => item.status === "pending").length;
  const activeRequests = requests.filter((item) => item.status === "in_progress").length;
  const pendingRequests = requests.filter((item) => item.status === "open").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Portal</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review mentor applications, moderate mentorship flow, and keep platform operations moving.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Pending applications",
            value: pendingApplications,
            border: "border-amber-200",
            bg: "from-amber-50 to-orange-50",
            text: "text-amber-700",
          },
          {
            label: "Open requests",
            value: pendingRequests,
            border: "border-sky-200",
            bg: "from-sky-50 to-cyan-50",
            text: "text-sky-700",
          },
          {
            label: "Active mentorships",
            value: activeRequests,
            border: "border-emerald-200",
            bg: "from-emerald-50 to-teal-50",
            text: "text-emerald-700",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border ${card.border} bg-gradient-to-br ${card.bg} p-5 shadow-sm`}
          >
            <div className={`text-3xl font-bold ${card.text}`}>{card.value}</div>
            <div className="mt-0.5 text-sm text-slate-600">{card.label}</div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#FFD4B1] bg-white shadow-sm">
        <div className="border-b border-[#FFD4B1] bg-[#FFF8F3] px-6 py-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-[#c97a30]" />
            Mentor approval queue
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Approve strong mentor candidates and keep rejected applications auditable.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">Loading mentor applications...</div>
          ) : applications.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">No mentor applications have been submitted yet.</div>
          ) : (
            applications.map((application) => (
              <article key={application.id} className="space-y-4 px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-bold text-slate-800">
                        {application.applicant?.full_name ?? "Mentor candidate"}
                      </h3>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${applicationTone(application.status)}`}>
                        {applicationLabel(application.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {application.expertise.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[#FFD4B1] bg-[#FFF4EB] px-3 py-1 text-xs font-semibold text-[#8A4E2A]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <p className="max-w-3xl text-sm leading-6 text-slate-600">
                      {application.statement || "No motivation statement was submitted."}
                    </p>

                    <div className="text-xs text-slate-500">
                      Submitted {new Date(application.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={application.status !== "pending" || isUpdatingApplicationId === application.id}
                      onClick={() => void updateApplication(application.id, "approved")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#0F0F0F] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={application.status !== "pending" || isUpdatingApplicationId === application.id}
                      onClick={() => void updateApplication(application.id, "rejected")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Users className="h-4 w-4 text-[#c97a30]" />
            Platform request moderation
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Step in when response queues stall, or close out requests that are already resolved.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">Loading mentorship requests...</div>
          ) : requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">No mentorship requests are available right now.</div>
          ) : (
            requests.map((request) => {
              const tone = getRequestStatusTone(request.status);
              return (
                <article key={request.id} className="space-y-4 px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-bold text-slate-800">{request.title}</h3>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                          {getRequestStatusLabel(request.status)}
                        </span>
                      </div>

                      <p className="max-w-3xl text-sm leading-6 text-slate-600">
                        {request.description || "No additional details were provided."}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="rounded-full bg-[#FFF4EB] px-3 py-1 font-semibold text-[#8A4E2A]">
                          {request.domain || "General"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                          {request.type === "specific_idea" ? "Specific idea" : "Full project"}
                        </span>
                        <span>Student: {request.student?.full_name ?? "Unknown student"}</span>
                        <span>Mentor: {request.mentor?.full_name ?? "Awaiting mentor"}</span>
                        <span>Created {new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={request.status === "in_progress" || isUpdatingRequestId === request.id}
                        onClick={() => void updateRequest(request.id, "in_progress")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Mark Active
                      </button>
                      <button
                        type="button"
                        disabled={request.status === "completed" || isUpdatingRequestId === request.id}
                        onClick={() => void updateRequest(request.id, "completed")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        disabled={request.status === "cancelled" || isUpdatingRequestId === request.id}
                        onClick={() => void updateRequest(request.id, "cancelled")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
