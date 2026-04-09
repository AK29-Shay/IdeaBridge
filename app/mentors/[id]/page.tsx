"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getAvailabilityColor } from "@/lib/constants";
import { getStoredMentors } from "@/lib/storage";
import type { AvailabilityStatus } from "@/types/auth";

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

  const mentorsList = React.useMemo(() => getStoredMentors(), []);
  const mentor = React.useMemo(() => mentorsList.find((m) => m.id === mentorId) ?? null, [mentorId, mentorsList]);

  const [availabilityOpen, setAvailabilityOpen] = React.useState(false);
  const [requestOpen, setRequestOpen] = React.useState(false);

  if (!mentor) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Mentor not found</CardTitle>
            <CardDescription>Use the mentors directory to browse available mentors.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push("/mentors")}>
              Back to directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availabilityStatus = mentor.profile.availabilityStatus;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Mentor Profile</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{mentor.fullName}</h1>
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
          <Button className="rounded-xl" onClick={() => setAvailabilityOpen(true)}>
            Check Availability
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              if (!user) {
                toast.error("Please login as a Student to request mentorship.");
                router.push(`/login?next=${encodeURIComponent(`/mentors/${mentor.id}`)}`);
                return;
              }
              if (user.role !== "student") {
                toast.error("Only Students can request mentorship.");
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
        <Card className="border-border/70 bg-background/70">
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
            <CardDescription>Dummy content for production UI flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{mentor.profile.bio}</p>

            <div className="flex flex-wrap gap-2">
              {mentor.profile.skills.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full bg-accent/15 border-accent/30">
                  {s}
                </Badge>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Experience</div>
                <div className="mt-1 text-sm font-semibold">{mentor.profile.yearsExperience} years</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="text-xs text-muted-foreground">Rating</div>
                <div className="mt-1 text-sm font-semibold">{mentor.rating.toFixed(1)} / 5</div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Portfolio</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {mentor.profile.portfolioLinks && mentor.profile.portfolioLinks.length ? (
                  mentor.profile.portfolioLinks.map((link) => (
                    <a key={link} href={link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">
                      {link}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No portfolio links.</span>
                )}
              </div>
            </div>

            {mentor.profile.availabilityCalendarNote ? (
              <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Calendar note</div>
                <div className="mt-2 text-sm text-muted-foreground">{mentor.profile.availabilityCalendarNote}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <MentorCard
            mentor={mentor}
            className="border-border/70 bg-background/70"
            availabilityBadgeVariant={false}
          />
          <Card className="border-border/70 bg-background/70">
            <CardHeader>
              <CardTitle className="text-lg">Next steps</CardTitle>
              <CardDescription>Use the actions above to check scheduling and request mentorship.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>1. Check Availability to see dummy open dates and time slots.</div>
              <div>2. Request Mentorship with milestone goals and a preferred start date.</div>
              <div>3. Your mentor responds using structured, milestone-driven notes.</div>
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
        onSubmit={async () => {
          toast.success("Mentorship request submitted (dummy).");
        }}
      />
    </div>
  );
}

