"use client";

import * as React from "react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import type { MentorProfile } from "@/types/mentor";

import { studentProfileFormSchema, mentorProfileFormSchema } from "@/lib/zod/profileFormSchemas";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { ALL_SKILLS } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkillMultiSelect } from "@/components/forms/SkillMultiSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StudentProfileInput = z.infer<typeof studentProfileFormSchema>;
type MentorProfileInput = z.infer<typeof mentorProfileFormSchema>;

function toPortfolioText(links?: string[]) {
  return (links ?? []).join("\n");
}

function parsePortfolioText(text?: string) {
  const lines = (text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? lines : undefined;
}

function StudentProfileForm() {
  const { user, updateStudentProfile } = useAuth();

  const form = useForm({
    resolver: zodResolver(studentProfileFormSchema),
    mode: "onChange",
    defaultValues: {
      bio: user?.studentProfile?.bio ?? "",
      skills: user?.studentProfile?.skills ?? [],
      portfolioLinksText: toPortfolioText(user?.studentProfile?.portfolioLinks),
      avatarUrl: user?.studentProfile?.avatarUrl ?? "",
    },
  });

  React.useEffect(() => {
    if (!user) return;
    form.reset({
      bio: user.studentProfile?.bio ?? "",
      skills: user.studentProfile?.skills ?? [],
      portfolioLinksText: toPortfolioText(user.studentProfile?.portfolioLinks),
      avatarUrl: user.studentProfile?.avatarUrl ?? "",
    });
  }, [user, form]);

  

  function submit(values: StudentProfileInput) {
    if (!user) return;
    updateStudentProfile({
      bio: values.bio,
      skills: values.skills,
      portfolioLinks: parsePortfolioText(values.portfolioLinksText),
      avatarUrl: values.avatarUrl || undefined,
    });
    toast.success("Profile updated.");
  }

  if (!user) return null;

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" {...form.register("bio")} placeholder="Your bio (20+ characters)" />
        {form.formState.errors.bio ? <div className="text-sm text-destructive">{form.formState.errors.bio.message}</div> : null}
      </div>

      <div className="space-y-2">
        <Label>Skills</Label>
        <Controller
          control={form.control}
          name="skills"
          render={({ field }) => (
            <SkillMultiSelect
              value={field.value ?? []}
              onChange={(next) => field.onChange(next)}
              options={ALL_SKILLS}
            />
          )}
        />
        {form.formState.errors.skills ? (
          <div className="text-sm text-destructive">{form.formState.errors.skills.message}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolioLinksText">Portfolio links</Label>
        <Textarea
          id="portfolioLinksText"
          {...form.register("portfolioLinksText")}
          placeholder={"One URL per line (example):\nhttps://github.com/...\nhttps://your-site.com/..."}
        />
        {form.formState.errors.portfolioLinksText ? (
          <div className="text-sm text-destructive">{form.formState.errors.portfolioLinksText.message}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input id="avatarUrl" placeholder="https://..." {...form.register("avatarUrl")} />
        {form.formState.errors.avatarUrl ? (
          <div className="text-sm text-destructive">{form.formState.errors.avatarUrl.message}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" className="rounded-xl bg-primary hover:brightness-110">
          Save Profile
        </Button>
      </div>
    </form>
  );
}

function MentorProfileForm() {
  const { user, updateMentorProfile } = useAuth();

  const existing: MentorProfile | undefined = user?.mentorProfile;

  const form = useForm({
    resolver: zodResolver(mentorProfileFormSchema),
    mode: "onChange",
    defaultValues: {
      bio: existing?.bio ?? "",
      skills: existing?.skills ?? [],
      portfolioLinksText: toPortfolioText(existing?.portfolioLinks),
      avatarUrl: existing?.avatarUrl ?? "",
      availabilityStatus: existing?.availabilityStatus ?? "Available in 1-2 days",
      availabilityCalendarNote: existing?.availabilityCalendarNote ?? "",
    },
  });

  React.useEffect(() => {
    if (!user) return;
    form.reset({
      bio: user.mentorProfile?.bio ?? "",
      skills: user.mentorProfile?.skills ?? [],
      portfolioLinksText: toPortfolioText(user.mentorProfile?.portfolioLinks),
      avatarUrl: user.mentorProfile?.avatarUrl ?? "",
      availabilityStatus: user.mentorProfile?.availabilityStatus ?? "Available in 1-2 days",
      availabilityCalendarNote: user.mentorProfile?.availabilityCalendarNote ?? "",
    });
  }, [user, form]);

  

  function submit(values: MentorProfileInput) {
    if (!user) return;
    const base: MentorProfile = user.mentorProfile ?? {
      bio: values.bio,
      skills: values.skills,
      availability: "Evenings",
      availabilityStatus: values.availabilityStatus,
      yearsExperience: 0,
      linkedIn: "",
      github: "",
      portfolioLinks: [],
      availabilityCalendarNote: values.availabilityCalendarNote,
      avatarUrl: values.avatarUrl || "",
    };

    updateMentorProfile({
      ...base,
      bio: values.bio,
      skills: values.skills,
      portfolioLinks: parsePortfolioText(values.portfolioLinksText),
      avatarUrl: values.avatarUrl || undefined,
      availabilityStatus: values.availabilityStatus,
      availabilityCalendarNote: values.availabilityCalendarNote || undefined,
    });
    toast.success("Profile updated.");
  }

  if (!user) return null;

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" {...form.register("bio")} placeholder="Your bio (20+ characters)" />
        {form.formState.errors.bio ? <div className="text-sm text-destructive">{form.formState.errors.bio.message}</div> : null}
      </div>

      <div className="space-y-2">
        <Label>Skills</Label>
        <Controller
          control={form.control}
          name="skills"
          render={({ field }) => (
            <SkillMultiSelect value={field.value ?? []} onChange={(next) => field.onChange(next)} options={ALL_SKILLS} />
          )}
        />
        {form.formState.errors.skills ? (
          <div className="text-sm text-destructive">{form.formState.errors.skills.message}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolioLinksText">Portfolio links</Label>
        <Textarea
          id="portfolioLinksText"
          {...form.register("portfolioLinksText")}
          placeholder={"One URL per line (example):\nhttps://github.com/...\nhttps://your-site.com/..."}
        />
        {form.formState.errors.portfolioLinksText ? (
          <div className="text-sm text-destructive">{form.formState.errors.portfolioLinksText.message}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input id="avatarUrl" placeholder="https://..." {...form.register("avatarUrl")} />
        {form.formState.errors.avatarUrl ? (
          <div className="text-sm text-destructive">{form.formState.errors.avatarUrl.message}</div>
        ) : null}
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Mentor-only availability status</div>
          <Badge variant="secondary" className="rounded-full">
            Visible in directory
          </Badge>
        </div>

        <div className="space-y-2">
          <Label>Current Availability Status</Label>
          <Controller
            control={form.control}
            name="availabilityStatus"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available Now">Available Now</SelectItem>
                  <SelectItem value="Available in 1-2 days">Available in 1-2 days</SelectItem>
                  <SelectItem value="Busy">Busy</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.availabilityStatus ? (
            <div className="text-sm text-destructive">{form.formState.errors.availabilityStatus.message}</div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="availabilityCalendarNote">Optional calendar note</Label>
          <Textarea
            id="availabilityCalendarNote"
            {...form.register("availabilityCalendarNote")}
            placeholder="Add any helpful scheduling note (optional)."
          />
          {form.formState.errors.availabilityCalendarNote ? (
            <div className="text-sm text-destructive">{form.formState.errors.availabilityCalendarNote.message}</div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" className="rounded-xl bg-primary hover:brightness-110">
          Save Profile
        </Button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}

function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Edit your profile</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profile</h1>
        </div>
        <div>
          <Badge variant="secondary" className="rounded-full">
            Role: {user.role === "student" ? "Student" : "Mentor"}
          </Badge>
        </div>
      </div>

      <Card className="mt-6 border-border/70 bg-background/70">
        <CardHeader>
          <CardTitle className="text-lg">{user.role === "student" ? "Student Details" : "Mentor Details"}</CardTitle>
          <CardDescription>Update your bio, skills, and portfolio links with validated inputs.</CardDescription>
        </CardHeader>
        <CardContent>
          {user.role === "student" ? <StudentProfileForm /> : <MentorProfileForm />}
        </CardContent>
      </Card>
    </div>
  );
}

