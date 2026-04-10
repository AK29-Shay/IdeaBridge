"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/context/AuthContext";
import { ALL_SKILLS } from "@/lib/constants";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SkillMultiSelect } from "@/components/forms/SkillMultiSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mentorProfileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  availability: z.enum(["Full-time", "Part-time", "Evenings"]),
  yearsExperience: z.preprocess((v) => Number(v), z.number().min(0, "Minimum 0")),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  avatarUrl: z.string().optional(),
});

type MentorProfileInput = z.infer<typeof mentorProfileSchema>;

export function MentorProfileSection() {
  const { user, updateMentorProfile } = useAuth();

  const form = useForm<MentorProfileInput>({
    resolver: zodResolver(mentorProfileSchema) as any,
    mode: "onChange",
    defaultValues: {
      fullName: user?.fullName ?? "",
      bio: user?.mentorProfile?.bio ?? "",
      availability: user?.mentorProfile?.availability ?? "Part-time",
      yearsExperience: user?.mentorProfile?.yearsExperience ?? 0,
      skills: user?.mentorProfile?.skills ?? [],
      avatarUrl: user?.mentorProfile?.avatarUrl ?? "",
    },
  });

  React.useEffect(() => {
    if (!user) return;

    form.reset({
      fullName: user.fullName ?? "",
      bio: user.mentorProfile?.bio ?? "",
      availability: user.mentorProfile?.availability ?? "Part-time",
      yearsExperience: user.mentorProfile?.yearsExperience ?? 0,
      skills: user.mentorProfile?.skills ?? [],
      avatarUrl: user.mentorProfile?.avatarUrl ?? "",
    });
  }, [user, form]);

  function onSubmit(values: MentorProfileInput) {
    if (!user) return;

    updateMentorProfile({
      fullName: values.fullName,
      bio: values.bio,
      skills: values.skills,
      availability: values.availability,
      yearsExperience: values.yearsExperience,
      avatarUrl: values.avatarUrl || undefined,
      availabilityStatus: "Available Now",
    });

    toast.success("Mentor profile updated successfully");
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your mentor profile information</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg font-semibold">
                  {form.watch("fullName")?.charAt(0)?.toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <Label htmlFor="avatarUrl">Profile Photo URL</Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  {...form.register("avatarUrl")}
                />
                {form.formState.errors.avatarUrl && (
                  <p className="text-sm text-destructive">
                    {String((form.formState.errors.avatarUrl as any)?.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Name</Label>
              <Input id="fullName" {...form.register("fullName")} />
              {form.formState.errors.fullName && (
                <p className="text-sm text-destructive">
                  {String((form.formState.errors.fullName as any)?.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Write a short mentor bio..."
                {...form.register("bio")}
              />
              {form.formState.errors.bio && (
                <p className="text-sm text-destructive">
                  {String((form.formState.errors.bio as any)?.message)}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Availability</Label>
                <Controller
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Evenings">Evenings</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.availability && (
                  <p className="text-sm text-destructive">
                    {String((form.formState.errors.availability as any)?.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min={0}
                  {...form.register("yearsExperience", { valueAsNumber: true })}
                />
                {form.formState.errors.yearsExperience && (
                  <p className="text-sm text-destructive">
                    {String((form.formState.errors.yearsExperience as any)?.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <Controller
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <SkillMultiSelect
                    value={field.value ?? []}
                    onChange={field.onChange}
                    options={ALL_SKILLS}
                  />
                )}
              />
              {form.formState.errors.skills && (
                <p className="text-sm text-destructive">
                  {String((form.formState.errors.skills as any)?.message)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit">Save Profile</Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Provide a compatible named export `ProfileSection` for existing imports.
export const ProfileSection = MentorProfileSection;