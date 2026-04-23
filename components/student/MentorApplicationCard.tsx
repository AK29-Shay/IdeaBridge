"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import { authFetch } from "@/lib/authFetch";

type MentorApplicationRecord = {
  id: string;
  cv_url: string | null;
  expertise: string[];
  statement: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function parseClientError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

function statusTone(status: MentorApplicationRecord["status"]) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function statusLabel(status: MentorApplicationRecord["status"]) {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Pending review";
  }
}

export function MentorApplicationCard() {
  const [application, setApplication] = React.useState<MentorApplicationRecord | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [expertiseText, setExpertiseText] = React.useState("");
  const [statement, setStatement] = React.useState("");
  const [cvUrl, setCvUrl] = React.useState("");

  const loadApplication = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authFetch("/api/mentor-application", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as MentorApplicationRecord | { error?: string } | null;

      if (!response.ok) {
        throw new Error(parseClientError(payload, "Failed to load mentor application."));
      }

      const next = payload && !Array.isArray(payload) && "status" in payload ? (payload as MentorApplicationRecord) : null;
      setApplication(next);

      if (next) {
        setExpertiseText(next.expertise.join(", "));
        setStatement(next.statement ?? "");
        setCvUrl(next.cv_url ?? "");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load mentor application.");
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expertise = expertiseText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (expertise.length === 0) {
      toast.error("Add at least one expertise area.");
      return;
    }

    if (statement.trim().length < 20) {
      toast.error("Please add a short statement about why you want to mentor.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authFetch("/api/mentor-application", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          expertise,
          statement: statement.trim(),
          cv_url: cvUrl.trim() || undefined,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(parseClientError(payload, "Failed to submit mentor application."));
      }

      toast.success("Mentor application submitted.");
      await loadApplication();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit mentor application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#FFD4B1] bg-white shadow-sm">
      <div className="border-b border-[#FFD4B1] bg-[#FFF8F3] px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <ShieldCheck className="h-4 w-4 text-[#c97a30]" />
          Mentor Application
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Apply to become a mentor and let the admin portal review your expertise and availability.
        </p>
      </div>

      <div className="space-y-5 p-6">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-[#FFD4B1] bg-[#FFF8F3] px-4 py-5 text-sm text-slate-500">
            Loading application status...
          </div>
        ) : application ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(application.status)}`}>
                {statusLabel(application.status)}
              </span>
              <span className="text-xs text-slate-500">
                Submitted {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Expertise</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {application.expertise.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#FFD4B1] bg-white px-3 py-1 text-xs font-semibold text-[#8A4E2A]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Statement</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{application.statement || "No statement provided."}</p>
            </div>

            {application.cv_url ? (
              <a
                href={application.cv_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#B95D35] hover:underline"
              >
                <Sparkles className="h-4 w-4" />
                Open supporting CV / portfolio
              </a>
            ) : null}

            {application.status === "approved" ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Mentor access unlocked
                </div>
                <p className="mt-1">
                  Your profile has been promoted. Sign out and back in if you do not immediately see the mentor workspace.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Expertise areas</label>
              <input
                value={expertiseText}
                onChange={(event) => setExpertiseText(event.target.value)}
                placeholder="AI, Product Strategy, Supabase, UX Research"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Why do you want to mentor?</label>
              <textarea
                rows={4}
                value={statement}
                onChange={(event) => setStatement(event.target.value)}
                placeholder="Summarize your strengths, the type of students you can guide, and the outcomes you can help deliver."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">CV or portfolio URL</label>
              <input
                type="url"
                value={cvUrl}
                onChange={(event) => setCvUrl(event.target.value)}
                placeholder="https://github.com/your-profile or a public CV link"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-[#FFCBA4] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Apply for mentor review"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
