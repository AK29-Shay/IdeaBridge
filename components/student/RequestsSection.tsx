"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock3,
  FileSearch,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";

import { getRequestStatusLabel, getRequestStatusTone, isActiveRequest, isClosedRequest, isPendingRequest } from "@/lib/requestStatus";
import { useMentorshipRequests } from "@/lib/useMentorshipRequests";
import { useAuth } from "@/context/AuthContext";
import { getProjectsForUser, setProjectsForUser } from "@/lib/storage";
import type { Mentor } from "@/types/mentor";
import type { StudentProject } from "@/types/project";
import type { MentorshipRequestRecord } from "@/types/request";

type RequestFormState = {
  title: string;
  domain: string;
  description: string;
  type: "full_project" | "specific_idea";
  deadline: string;
  assignedMentorId: string;
};

const INITIAL_FORM: RequestFormState = {
  title: "",
  domain: "",
  description: "",
  type: "full_project",
  deadline: "",
  assignedMentorId: "",
};

export function RequestsSection() {
  const { requests, createRequest, isLoading } = useMentorshipRequests();
  const { user } = useAuth();
  const [mentors, setMentors] = React.useState<Mentor[]>([]);
  const [isLoadingMentors, setIsLoadingMentors] = React.useState(true);
  const [mentorQuery, setMentorQuery] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [form, setForm] = React.useState<RequestFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadMentors() {
      setIsLoadingMentors(true);

      try {
        const response = await fetch("/api/mentors/search?limit=48", { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
              ? payload.error
              : "Failed to load mentors.";
          throw new Error(message);
        }

        if (!cancelled) {
          setMentors(Array.isArray(payload) ? (payload as Mentor[]) : []);
        }
      } catch (error) {
        if (!cancelled) {
          setMentors([]);
          toast.error(error instanceof Error ? error.message : "Failed to load mentors.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMentors(false);
        }
      }
    }

    void loadMentors();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMentor = React.useMemo(
    () => mentors.find((mentor) => mentor.id === form.assignedMentorId) ?? null,
    [mentors, form.assignedMentorId]
  );

  const filteredMentors = React.useMemo(() => {
    const query = mentorQuery.trim().toLowerCase();
    if (!query) return mentors.slice(0, 6);

    return mentors
      .filter((mentor) => {
        const haystack = [
          mentor.fullName,
          mentor.profile.bio,
          mentor.profile.skills.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 6);
  }, [mentors, mentorQuery]);

  const pendingCount = requests.filter((request) => isPendingRequest(request.status)).length;
  const activeCount = requests.filter((request) => isActiveRequest(request.status)).length;
  const closedCount = requests.filter((request) => isClosedRequest(request.status)).length;

  function updateForm<K extends keyof RequestFormState>(key: K, value: RequestFormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function syncProjectFromRequest(request: MentorshipRequestRecord) {
    const email = user?.email?.trim().toLowerCase();
    if (!email) return;

    const existingProjects = getProjectsForUser(email);
    const now = new Date().toISOString();
    const nextProject: StudentProject = {
      id: request.id,
      title: request.title,
      mentorId: request.assigned_mentor ?? undefined,
      progressPercent: 0,
      status: "Not Started",
      milestoneNotes: request.description ?? "",
      updatedAt: now,
    };

    const alreadyExists = existingProjects.some((project) => project.id === request.id);
    const mergedProjects = alreadyExists
      ? existingProjects.map((project) =>
          project.id === request.id
            ? {
                ...project,
                title: request.title,
                mentorId: request.assigned_mentor ?? project.mentorId,
                milestoneNotes: project.milestoneNotes || request.description || "",
                updatedAt: now,
              }
            : project
        )
      : [nextProject, ...existingProjects];

    setProjectsForUser(email, mergedProjects);
  }

  React.useEffect(() => {
    const email = user?.email?.trim().toLowerCase();
    if (!email || requests.length === 0) return;

    const existingProjects = getProjectsForUser(email);
    const existingIds = new Set(existingProjects.map((project) => project.id));
    const now = new Date().toISOString();

    const missingProjects: StudentProject[] = requests
      .filter((request) => !existingIds.has(request.id))
      .map((request) => ({
        id: request.id,
        title: request.title,
        mentorId: request.assigned_mentor ?? undefined,
        progressPercent: 0,
        status: "Not Started",
        milestoneNotes: request.description ?? "",
        updatedAt: now,
      }));

    if (missingProjects.length === 0) return;
    setProjectsForUser(email, [...missingProjects, ...existingProjects]);
  }, [requests, user?.email]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.assignedMentorId) {
      toast.error("Please choose a mentor for this request.");
      return;
    }

    if (!form.title.trim() || !form.domain.trim() || form.description.trim().length < 10) {
      toast.error("Add a title, domain, and a clear description before sending the request.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdRequest = await createRequest({
        title: form.title.trim(),
        description: form.description.trim(),
        domain: form.domain.trim(),
        deadline: form.deadline || undefined,
        type: form.type,
        assigned_mentor: form.assignedMentorId,
      });
      syncProjectFromRequest(createdRequest);

      setForm(INITIAL_FORM);
      setMentorQuery("");
      setShowSuggestions(false);
      toast.success("Mentorship request sent successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send mentorship request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mentorship Requests</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Send structured requests to mentors and track each response from one place.
          </p>
        </div>
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 rounded-xl border border-[#FFD4B1] bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#FFF0E6]"
        >
          <Users className="h-4 w-4 text-[#c97a30]" />
          Browse Mentors
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Awaiting Response",
            value: pendingCount,
            border: "border-amber-200",
            bg: "from-amber-50 to-orange-50",
            text: "text-amber-700",
          },
          {
            label: "Active Mentorships",
            value: activeCount,
            border: "border-emerald-200",
            bg: "from-emerald-50 to-teal-50",
            text: "text-emerald-700",
          },
          {
            label: "Closed Requests",
            value: closedCount,
            border: "border-slate-200",
            bg: "from-slate-50 to-white",
            text: "text-slate-700",
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

      <div className="overflow-hidden rounded-2xl border border-[#FFD4B1] bg-white shadow-sm">
        <div className="border-b border-[#FFD4B1] bg-[#FFF8F3] px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800">
            <Send className="h-4 w-4 text-[#c97a30]" />
            Create a Mentorship Request
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Pick a mentor, define the project context, and send a complete request in one step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Request Title</label>
                <input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Example: Guidance for AI-powered project collaboration platform"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Project Domain</label>
                  <input
                    value={form.domain}
                    onChange={(event) => updateForm("domain", event.target.value)}
                    placeholder="AI, Web Engineering, Mobile, Cloud..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Request Type</label>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      updateForm("type", event.target.value as RequestFormState["type"])
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
                  >
                    <option value="full_project">Full project mentorship</option>
                    <option value="specific_idea">Specific idea guidance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  rows={5}
                  placeholder="Describe the project goal, current challenge, and the kind of guidance you need from the mentor."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Choose Mentor</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={mentorQuery}
                    onChange={(event) => {
                      setMentorQuery(event.target.value);
                      updateForm("assignedMentorId", "");
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      window.setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    placeholder={isLoadingMentors ? "Loading mentors..." : "Search by mentor name or skill"}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
                  />
                  {showSuggestions && filteredMentors.length > 0 ? (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                      {filteredMentors.map((mentor) => (
                        <button
                          key={mentor.id}
                          type="button"
                          onMouseDown={() => {
                            updateForm("assignedMentorId", mentor.id);
                            setMentorQuery(mentor.fullName);
                            setShowSuggestions(false);
                          }}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#FFF4EB]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-[#FFCBA4]">
                            {mentor.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800">{mentor.fullName}</div>
                            <div className="truncate text-xs text-slate-500">
                              {mentor.profile.skills.slice(0, 3).join(", ") || "General mentorship"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Preferred Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) => updateForm("deadline", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
                />
              </div>

              <div className="rounded-2xl border border-[#FFD4B1] bg-[#FFF8F3] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Sparkles className="h-4 w-4 text-[#c97a30]" />
                  Selected Mentor
                </div>
                {selectedMentor ? (
                  <div className="mt-3 space-y-2">
                    <div className="text-base font-bold text-black">{selectedMentor.fullName}</div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {selectedMentor.profile.bio || "Experienced mentor available for project guidance."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.profile.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-[#FFD4B1] bg-white px-3 py-1 text-xs font-semibold text-[#8A4E2A]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Search for a mentor and pick one from the suggestions to attach this request.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending Request..." : "Send Mentorship Request"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800">
            <FileSearch className="h-4 w-4 text-[#c97a30]" />
            Request History
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">Loading your requests...</div>
          ) : requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No requests yet. Use the form above to send your first mentorship request.
            </div>
          ) : (
            requests.map((request) => {
              const statusTone = getRequestStatusTone(request.status);
              const mentorName =
                request.mentor?.full_name ??
                mentors.find((mentor) => mentor.id === request.assigned_mentor)?.fullName ??
                "Mentor not assigned";

              return (
                <article
                  key={request.id}
                  className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr,auto]"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-base font-bold text-slate-800">{request.title}</h4>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`} />
                        {getRequestStatusLabel(request.status)}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {request.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                        {request.domain || "General"}
                      </span>
                      <span className="rounded-full bg-[#FFF4EB] px-3 py-1 font-semibold text-[#8A4E2A]">
                        {request.type === "specific_idea" ? "Specific idea" : "Full project"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {mentorName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        Sent {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      {request.deadline ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Due {new Date(request.deadline).toLocaleDateString()}
                        </span>
                      ) : null}
                      {isActiveRequest(request.status) || isClosedRequest(request.status) ? (
                        <Link
                          href={`/dashboard/student/mentorships?request=${encodeURIComponent(request.id)}`}
                          className="rounded-full bg-[#0F0F0F] px-3 py-1 font-semibold text-[#FFCBA4] transition hover:brightness-110"
                        >
                          Open mentorship space
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
