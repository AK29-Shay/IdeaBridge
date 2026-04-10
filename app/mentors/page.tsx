"use client";

import * as React from "react";
import Link from "next/link";

import { ALL_SKILLS } from "@/lib/constants";
import { getStoredMentors } from "@/lib/storage";
import type { AvailabilityStatus } from "@/types/auth";
import type { Mentor } from "@/types/mentor";
import { MentorCard } from "@/components/cards/MentorCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckAvailabilityModal } from "@/components/modals/CheckAvailabilityModal";

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

  React.useEffect(() => {
    // Local storage is client-only; load mentors after mount to avoid hydration mismatch.
    setMentorsList(getStoredMentors());
  }, []);

  const [selectedMentorId, setSelectedMentorId] = React.useState<string | null>(null);
  const selectedMentor = React.useMemo(() => mentorsList.find((m) => m.id === selectedMentorId) ?? null, [selectedMentorId, mentorsList]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = ratingMin === "Any" ? null : Number(ratingMin);
    return mentorsList.filter((m) => {
      if (q) {
        const hay = `${m.fullName} ${m.profile.bio} ${m.profile.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (skill !== "Any" && !m.profile.skills.includes(skill)) return false;
      if (availability !== "Any" && m.profile.availabilityStatus !== availability) return false;
      if (min !== null && m.rating < min) return false;
      return true;
    });
  }, [search, skill, availability, ratingMin]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Mentors Directory</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Find mentors by skills and availability</h1>
        </div>
        <Badge variant="secondary" className="rounded-full">
          {filtered.length} mentors
        </Badge>
      </div>

      <Card className="mt-6 border-border/70 bg-background/70">
        <CardContent className="p-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
            <div className="space-y-2">
              <Label htmlFor="mentorSearch">Search</Label>
              <Input
                id="mentorSearch"
                placeholder="Search by name, bio, or skill"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Skills</Label>
                <Select value={skill} onValueChange={(v) => setSkill(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    {ALL_SKILLS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={ratingMin} onValueChange={(v) => setRatingMin(v)}>
                  <SelectTrigger>
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
                <Select
                  value={availability}
                  onValueChange={(v) => setAvailability(v as AvailabilityStatus | "Any")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityStatusValues.map((status) => (
                      <SelectItem key={status} value={status as AvailabilityStatus | "Any"}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              actionSlot={
                <div className="flex flex-col gap-2">
                  <Button
                    className="rounded-xl"
                    onClick={() => {
                      setSelectedMentorId(mentor.id);
                    }}
                  >
                    Check Availability
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <Card className="mt-8 border-border/70">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">No mentors found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your filters, or register a mentor account to populate this directory.
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl"
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
            if (!next) setSelectedMentorId(null);
          }}
          mentorName={selectedMentor.fullName}
          availabilityStatus={selectedMentor.profile.availabilityStatus}
        />
      ) : null}
    </div>
  );
}

