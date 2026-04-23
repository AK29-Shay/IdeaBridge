"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getAvailabilityColor } from "@/lib/constants";
import type { AvailabilityStatus } from "@/types/auth";
import type { Mentor } from "@/types/mentor";
import { authFetch } from "@/lib/authFetch";
import { MentorCard } from "@/components/cards/MentorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckAvailabilityModal } from "@/components/modals/CheckAvailabilityModal";
import { RequestMentorshipModal } from "@/components/modals/RequestMentorshipModal";
import { useAuth } from "@/context/AuthContext";

function availabilityLargeBadge(status: AvailabilityStatus) {
  const color = getAvailabilityColor(status);
  if (color === "green") return "bg-emerald-500/15 text-emerald-800 border-emerald-500/30";
  if (color === "yellow") return "bg-amber-500/15 text-amber-800 border-amber-500/30";
  return "bg-red-500/15 text-red-800 border-red-500/30";
}

export default function MentorDetailPage() {
  const params = useParams() as { id?: string };
  const mentorId = params.id ?? "";
  const router = useRouter();
  const { user } = useAuth();
  const [mentor, setMentor] = React.useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = React.useState(false);
  const [requestOpen, setRequestOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadMentor() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`/api/mentors/search?id=${encodeURIComponent(mentorId)}`, { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as Mentor | { error?: string } | null;

        if (!response.ok) {
          const message =
            payload &&
            typeof payload === "object" &&
            !Array.isArray(payload) &&
            "error" in payload
              ? payload.error
              : undefined;
          throw new Error(message || "Failed to load mentor.");
        }

        if (!cancelled) {
          setMentor(payload && !Array.isArray(payload) ? (payload as Mentor) : null);
        }
      } catch (error) {
        if (!cancelled) {
          setMentor(null);
          setLoadError(error instanceof Error ? error.message : "Failed to load mentor.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (mentorId) {
      void loadMentor();
    }

    return () => {
      cancelled = true;
    };
  }, [mentorId]);

  async function submitMentorshipRequest(values: {
    projectTitle: string;
    goals: string;
    preferredStartDate: string;
    message: string;
  }) {
    if (!mentor) {
      throw new Error("Mentor not found.");
    }

    const response = await authFetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: values.projectTitle,
        description: `${values.goals}\n\n${values.message}`.trim(),
        domain: "Mentorship",
        deadline: values.preferredStartDate || undefined,
        type: "full_project",
        assigned_mentor: mentor.id,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to submit mentorship request.");
    }

    toast.success("Mentorship request submitted.");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card className="border-[#FFD4B1] bg-white/88">
          <CardContent className="p-6 text-sm text-[#8A4E2A]">Loading mentor profile...</CardContent>
        </Card>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card className="border-[#FFD4B1] bg-white/88">
          <CardHeader>
            <CardTitle>Mentor not found</CardTitle>
            <CardDescription>{loadError ?? "Use the mentors directory to browse available mentors."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="border-[#FFD4B1] bg-[#FFF8F2] text-[#8A4E2A] hover:bg-[#FFF1E6]" onClick={() => router.push("/mentors")}>
              Back to directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availabilityStatus = mentor.profile.availabilityStatus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF4EA] to-[#FFEBDD] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-medium text-[#8A4E2A]">Mentor Profile</div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0F0F0F]">{mentor.fullName}</h1>
            <div className="mt-3">
              <Badge
                variant="outline"
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${availabilityLargeBadge(availabilityStatus)}`}
              >
                Availability: {availabilityStatus}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <Button className="rounded-xl bg-[#0F0F0F] text-[#FFCBA4] hover:brightness-110" onClick={() => setAvailabilityOpen(true)}>
              Check Availability
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-[#FFD4B1] bg-[#FFF8F2] text-[#8A4E2A] hover:bg-[#FFF1E6]"
              onClick={() => {
                if (!user) {
                  toast.error("Please login as a student to request mentorship.");
                  router.push(`/login?next=${encodeURIComponent(`/mentors/${mentor.id}`)}`);
                  return;
                }
                if (user.role !== "student") {
                  toast.error("Only students can request mentorship.");
                  return;
                }
                setRequestOpen(true);
              }}
            >
              Request Mentorship
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr,420px]">
          <Card className="border-[#FFD4B1] bg-white/90 shadow-[0_24px_45px_-38px_rgba(63,31,7,0.35)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#0F0F0F]">About</CardTitle>
              <CardDescription>Detailed mentor profile backed by the IdeaBridge profiles service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-[#5D4739]">{mentor.profile.bio}</p>

              <div className="flex flex-wrap gap-2">
                {mentor.profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="rounded-full border border-[#FFD4B1] bg-[#FFF1E6] text-[#8A4E2A]">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#FFD7BC] bg-[#FFF8F2] px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-[#8A4E2A]/70">Experience</div>
                  <div className="mt-1 text-sm font-semibold text-[#0F0F0F]">{mentor.profile.yearsExperience} years</div>
                </div>
                <div className="rounded-xl border border-[#FFD7BC] bg-[#FFF8F2] px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-[#8A4E2A]/70">Rating</div>
                  <div className="mt-1 text-sm font-semibold text-[#0F0F0F]">{mentor.rating.toFixed(1)} / 5</div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-[#8A4E2A]/70">Portfolio</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mentor.profile.portfolioLinks && mentor.profile.portfolioLinks.length ? (
                    mentor.profile.portfolioLinks.map((link) => (
                      <a key={link} href={link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#B95D35] hover:underline">
                        {link}
                      </a>
                    ))
                  ) : (
                    <span className="text-sm text-[#5D4739]">No portfolio links added yet.</span>
                  )}
                </div>
              </div>

              {mentor.profile.availabilityCalendarNote ? (
                <div className="rounded-xl border border-[#FFD7BC] bg-[#FFF8F2] px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-[#8A4E2A]/70">Calendar note</div>
                  <div className="mt-2 text-sm text-[#5D4739]">{mentor.profile.availabilityCalendarNote}</div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <MentorCard
              mentor={mentor}
              className="border-[#FFD4B1] bg-white/92 shadow-[0_24px_45px_-38px_rgba(63,31,7,0.35)]"
              availabilityBadgeVariant={false}
            />
            <Card className="border-[#FFD4B1] bg-white/90 shadow-[0_24px_45px_-38px_rgba(63,31,7,0.35)]">
              <CardHeader>
                <CardTitle className="text-lg text-[#0F0F0F]">Next steps</CardTitle>
                <CardDescription>Move from discovery into a structured mentorship request.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#5D4739]">
                <div>1. Review availability and mentor focus areas.</div>
                <div>2. Submit a request with your project goals and preferred start date.</div>
                <div>3. Follow the request through your dashboard and notifications.</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <CheckAvailabilityModal
          open={availabilityOpen}
          onOpenChange={setAvailabilityOpen}
          mentorName={mentor.fullName}
          availabilityStatus={availabilityStatus}
        />

        <RequestMentorshipModal
          open={requestOpen}
          onOpenChange={setRequestOpen}
          mentorName={mentor.fullName}
          mentorAvailabilityStatus={availabilityStatus}
          defaultProjectTitle={"IdeaBridge student project"}
          onSubmit={submitMentorshipRequest}
        />
      </div>
    </div>
  );
}
