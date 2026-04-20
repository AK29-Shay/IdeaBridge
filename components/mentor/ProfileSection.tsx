"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { ALL_SKILLS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillMultiSelect } from "@/components/forms/SkillMultiSelect";
import { Textarea } from "@/components/ui/textarea";

const mentorProfileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  availability: z.enum(["Full-time", "Part-time", "Evenings"]),
  yearsExperience: z.preprocess((value) => Number(value), z.number().min(0, "Minimum 0")),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  avatarUrl: z.string().optional(),
});

type MentorProfileInput = z.infer<typeof mentorProfileSchema>;
type MentorProfileFormValues = z.input<typeof mentorProfileSchema>;
type MentorProfileSubmitValues = z.output<typeof mentorProfileSchema>;

export function MentorProfileSection() {
  const { user, updateMentorProfile } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);

  const defaultValues = React.useMemo<MentorProfileFormValues>(
    () => ({
      fullName: user?.fullName ?? "",
      bio: user?.mentorProfile?.bio ?? "",
      availability: user?.mentorProfile?.availability ?? "Part-time",
      yearsExperience: user?.mentorProfile?.yearsExperience ?? 0,
      skills: user?.mentorProfile?.skills ?? [],
      avatarUrl: user?.mentorProfile?.avatarUrl ?? "",
    }),
    [user]
  );

  const form = useForm<MentorProfileFormValues, unknown, MentorProfileSubmitValues>({
    resolver: zodResolver(mentorProfileSchema),
    mode: "onChange",
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  async function onSubmit(values: MentorProfileSubmitValues) {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateMentorProfile({
        ...values,
        fullName: values.fullName,
        availabilityStatus: user.availabilityStatus ?? "Available in 1-2 days",
      });
      toast.success("Mentor profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update mentor profile.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;

  const { errors } = form.formState;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your mentor profile information</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg font-semibold">
                  {form.watch("fullName")?.charAt(0)?.toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <Label htmlFor="avatarUrl">Profile Photo URL</Label>
                <Input id="avatarUrl" placeholder="https://example.com/avatar.jpg" {...form.register("avatarUrl")} />
                {errors.avatarUrl && <p className="text-sm text-destructive">{String(errors.avatarUrl.message)}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Name</Label>
              <Input id="fullName" {...form.register("fullName")} />
              {errors.fullName && <p className="text-sm text-destructive">{String(errors.fullName.message)}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} placeholder="Write a short mentor bio..." {...form.register("bio")} />
              {errors.bio && <p className="text-sm text-destructive">{String(errors.bio.message)}</p>}
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
                {errors.availability && <p className="text-sm text-destructive">{String(errors.availability.message)}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input id="yearsExperience" type="number" min={0} {...form.register("yearsExperience", { valueAsNumber: true })} />
                {errors.yearsExperience && <p className="text-sm text-destructive">{String(errors.yearsExperience.message)}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <Controller
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <SkillMultiSelect value={field.value ?? []} onChange={field.onChange} options={ALL_SKILLS} />
                )}
              />
              {errors.skills && <p className="text-sm text-destructive">{String(errors.skills.message)}</p>}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset(defaultValues)} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const ProfileSection = MentorProfileSection;
