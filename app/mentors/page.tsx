"use client";

import * as React from "react";
import Link from "next/link";

import type { AvailabilityStatus } from "@/types/auth";
import type { Mentor } from "@/types/mentor";
import { ALL_SKILLS } from "@/lib/constants";
import { MentorCard } from "@/components/cards/MentorCard";
import { CheckAvailabilityModal } from "@/components/modals/CheckAvailabilityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const availabilityStatusValues: (AvailabilityStatus | "Any")[] = [
  "Any",
  "Available Now",
  "Available in 1-2 days",
  "Busy",
  "On Leave",
];

export default function MentorsDirectoryPage() {
  const [search, setSearch] = React.useState("");
  const [skill, setSkill] = React.useState<string>("Any");
  const [ratingMin, setRatingMin] = React.useState<string>("Any");
  const [availability, setAvailability] = React.useState<AvailabilityStatus | "Any">("Any");
  const [mentorsList, setMentorsList] = React.useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [selectedMentorId, setSelectedMentorId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && query !== search) {
      setSearch(query);
    }
  }, [search]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadMentors() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/mentors/search?limit=48", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as Mentor[] | { error?: string } | null;

        if (!response.ok) {
          const message =
            payload &&
            typeof payload === "object" &&
            !Array.isArray(payload) &&
            "error" in payload
              ? payload.error
              : undefined;
          throw new Error(message || "Failed to load mentors.");
        }

        if (!cancelled) {
          setMentorsList(Array.isArray(payload) ? payload : []);
        }
      } catch (error) {
        if (!cancelled) {
          setMentorsList([]);
          setLoadError(error instanceof Error ? error.message : "Failed to load mentors.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadMentors();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMentor = React.useMemo(
    () => mentorsList.find((mentor) => mentor.id === selectedMentorId) ?? null,
    [selectedMentorId, mentorsList]
  );

  const filtered = React.useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const minRating = ratingMin === "Any" ? null : Number(ratingMin);

    return mentorsList.filter((mentor) => {
      if (normalizedQuery) {
        const haystack = `${mentor.fullName} ${mentor.profile.bio} ${mentor.profile.skills.join(" ")}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }

      if (skill !== "Any" && !mentor.profile.skills.includes(skill)) {
        return false;
      }

      if (availability !== "Any" && mentor.profile.availabilityStatus !== availability) {
        return false;
      }

      if (minRating !== null && mentor.rating < minRating) {
        return false;
      }

      return true;
    });
  }, [availability, mentorsList, ratingMin, search, skill]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF4EA] to-[#FFEBDD] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[30px] border border-[#FFD4B1] bg-white/88 p-6 shadow-[0_30px_65px_-46px_rgba(63,31,7,0.35)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-medium text-[#8A4E2A]">Mentors Directory</div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0F0F0F]">Find mentors by skills and availability</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5D4739]">
                Browse mentor profiles, compare expertise, and move straight into a guided mentorship request flow.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full border border-[#FFD4B1] bg-[#FFF1E6] px-4 py-2 text-[#8A4E2A]">
              {filtered.length} mentors
            </Badge>
          </div>
        </section>

        <Card className="mt-6 border-[#FFD4B1] bg-white/88 shadow-[0_24px_50px_-40px_rgba(63,31,7,0.35)]">
          <CardHeader>
            <CardTitle className="text-lg text-[#0F0F0F]">Filter mentor matches</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
            <div className="space-y-2">
              <Label htmlFor="mentorSearch">Search</Label>
              <Input
                id="mentorSearch"
                placeholder="Search by name, bio, or skill"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="border-[#FFD7BC] bg-[#FFF8F2]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Skills</Label>
                <Select value={skill} onValueChange={setSkill}>
                  <SelectTrigger className="border-[#FFD7BC] bg-[#FFF8F2]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    {ALL_SKILLS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={ratingMin} onValueChange={setRatingMin}>
                  <SelectTrigger className="border-[#FFD7BC] bg-[#FFF8F2]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="4.8">4.8+</SelectItem>
                    <SelectItem value="4.6">4.6+</SelectItem>
                    <SelectItem value="4.5">4.5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Availability Status</Label>
                <Select value={availability} onValueChange={(value) => setAvailability(value as AvailabilityStatus | "Any")}>
                  <SelectTrigger className="border-[#FFD7BC] bg-[#FFF8F2]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityStatusValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loadError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-[#FFD4B1] bg-white/88 px-6 py-10 text-center text-sm text-[#8A4E2A]">
            Loading mentors...
          </div>
        ) : filtered.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                className="border-[#FFD4B1] bg-white/92 shadow-[0_24px_45px_-38px_rgba(63,31,7,0.35)]"
                actionSlot={
                  <div className="flex flex-col gap-2">
                    <Button className="rounded-xl bg-[#0F0F0F] text-[#FFCBA4] hover:brightness-110" onClick={() => setSelectedMentorId(mentor.id)}>
                      Check Availability
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl border-[#FFD4B1] bg-[#FFF8F2] text-[#8A4E2A] hover:bg-[#FFF1E6]">
                      <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <Card className="mt-8 border-[#FFD4B1] bg-white/88">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-[#0F0F0F]">No mentors found</h2>
              <p className="mt-1 text-sm text-[#5D4739]">Try changing your filters or broadening the search terms.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl border-[#FFD4B1] bg-[#FFF8F2] text-[#8A4E2A] hover:bg-[#FFF1E6]"
                onClick={() => {
                  setSearch("");
                  setSkill("Any");
                  setRatingMin("Any");
                  setAvailability("Any");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedMentor ? (
          <CheckAvailabilityModal
            open={!!selectedMentorId}
            onOpenChange={(next) => {
              if (!next) {
                setSelectedMentorId(null);
              }
            }}
            mentorName={selectedMentor.fullName}
            availabilityStatus={selectedMentor.profile.availabilityStatus}
          />
        ) : null}
      </div>
    </div>
  );
}
