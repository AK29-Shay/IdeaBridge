"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SkillMultiSelect } from "@/components/forms/SkillMultiSelect";
import { ALL_SKILLS } from "@/lib/constants";

const mentorSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  skills: z.array(z.string()).optional(),
  academicYear: z.string().optional(),
  faculty: z.string().optional(),
  availability: z.string().optional(),
  availabilityStatus: z.string().min(1, "Select availability status"),
  yearsExperience: z.number().min(0).optional(),
  portfolioLinks: z.string().optional(),
  availabilityCalendarNote: z.string().optional(),
  profileImage: z.string().url().optional().or(z.literal("")),
});

type MentorInput = z.infer<typeof mentorSchema>;

function parseLinks(text?: string) {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

export default function MentorProfileForm({
  isEdit = true,
  initialImage,
  onImageChange,
}: {
  isEdit?: boolean;
  initialImage?: string | null;
  onImageChange?: (url?: string) => void;
}): React.JSX.Element {
  const { user, updateMentorProfile } = useAuth();
  const [saving, setSaving] = React.useState(false);

  const form = useForm<MentorInput>({
    resolver: zodResolver(mentorSchema),
    mode: "onChange",
    defaultValues: {
      fullName: user?.fullName ?? "",
      bio: (user as any)?.mentorProfile?.bio ?? "",
      skills: (user as any)?.mentorProfile?.skills ?? [],
      academicYear: (user as any)?.mentorProfile?.academicYear ?? "",
      faculty: (user as any)?.mentorProfile?.faculty ?? "",
      availability: (user as any)?.mentorProfile?.availability ?? "",
      availabilityStatus: (user as any)?.mentorProfile?.availabilityStatus ?? "Available in 1-2 days",
      yearsExperience: (user as any)?.mentorProfile?.yearsExperience ?? 0,
      portfolioLinks: ((user as any)?.mentorProfile?.portfolioLinks ?? []).join("\n"),
      availabilityCalendarNote: (user as any)?.mentorProfile?.availabilityCalendarNote ?? "",
      profileImage: initialImage ?? (user as any)?.mentorProfile?.avatarUrl ?? "",
    },
  });

  React.useEffect(() => {
    if (!user) return;
    const u = user as any;
    form.reset({
      fullName: user.fullName ?? "",
      bio: u.mentorProfile?.bio ?? "",
      skills: u.mentorProfile?.skills ?? [],
      academicYear: u.mentorProfile?.academicYear ?? "",
      faculty: u.mentorProfile?.faculty ?? "",
      availability: u.mentorProfile?.availability ?? "",
      availabilityStatus: u.mentorProfile?.availabilityStatus ?? "Available in 1-2 days",
      yearsExperience: u.mentorProfile?.yearsExperience ?? 0,
      portfolioLinks: (u.mentorProfile?.portfolioLinks ?? []).join("\n"),
      availabilityCalendarNote: u.mentorProfile?.availabilityCalendarNote ?? "",
      profileImage: initialImage ?? u.mentorProfile?.avatarUrl ?? "",
    });
  }, [user, initialImage, form]);

  async function onSubmit(values: MentorInput) {
    if (!user) return;
    setSaving(true);
    try {
      const payload: any = {
        bio: values.bio,
        skills: values.skills ?? [],
        availability: values.availability ?? "",
        availabilityStatus: values.availabilityStatus,
        yearsExperience: values.yearsExperience ?? 0,
        portfolioLinks: parseLinks(values.portfolioLinks),
        availabilityCalendarNote: values.availabilityCalendarNote || undefined,
        avatarUrl: values.profileImage || undefined,
      };

      updateMentorProfile(payload);
      toast.success("Mentor profile saved.");
      onImageChange?.(values.profileImage || undefined);
    } catch (err) {
      toast.error("Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }
  if (!isEdit) {
    const values = form.getValues();
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-[#f4c79f] flex items-center justify-center text-white text-2xl font-bold">
            {values.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={values.profileImage} alt={values.fullName} className="h-full w-full object-cover" />
            ) : (
              <span>{(values.fullName || "").split(" ").map((s:any)=>s[0]).slice(0,2).join("")}</span>
            )}
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-800">{values.fullName || "Unnamed"}</div>
            <div className="text-sm text-slate-500">{values.academicYear || "Year not set"} · {values.faculty || "Faculty not set"}</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700">Bio</div>
          <p className="mt-2 text-sm text-slate-600">{values.bio || <span className="text-slate-400 italic">No bio added yet.</span>}</p>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700">Skills</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(values.skills || []).length === 0 ? (
              <span className="text-sm text-slate-400 italic">No skills added yet.</span>
            ) : (
              (values.skills || []).map((s:any)=>(
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FFCBA4]/20 to-[#FFCBA4]/20 border border-[#FFCBA4]/30 px-3 py-1.5 text-xs font-semibold text-[#0F0F0F]">{s}</span>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-slate-700">Availability status</div>
            <div className="mt-1 text-sm text-slate-600">{values.availabilityStatus}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700">Years experience</div>
            <div className="mt-1 text-sm text-slate-600">{values.yearsExperience ?? 0} years</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700">Portfolio Links</div>
          <div className="mt-2 text-sm text-slate-600 space-y-1">
            {(values.portfolioLinks || "").split("\n").filter(Boolean).map((l:any)=> (
              <div key={l}><a href={l} className="text-blue-600 hover:underline">{l}</a></div>
            ))}
            {!(values.portfolioLinks || "").trim() && <div className="text-slate-400 italic">No links</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Full name</label>
        <input {...form.register("fullName")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        {form.formState.errors.fullName && <div className="text-sm text-red-600 mt-1">{form.formState.errors.fullName.message}</div>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Bio</label>
        <textarea {...form.register("bio")} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        {form.formState.errors.bio && <div className="text-sm text-red-600 mt-1">{form.formState.errors.bio.message}</div>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Skills</label>
        <Controller
          control={form.control}
          name="skills"
          render={({ field }) => (
            <SkillMultiSelect value={field.value ?? []} onChange={(v) => field.onChange(v)} options={ALL_SKILLS} />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Academic Year</label>
          <input {...form.register("academicYear")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Faculty</label>
          <input {...form.register("faculty")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Availability</label>
          <input {...form.register("availability")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Availability status</label>
        <select {...form.register("availabilityStatus")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2">
          <option value="Available Now">Available Now</option>
          <option value="Available in 1-2 days">Available in 1-2 days</option>
          <option value="Busy">Busy</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Years experience</label>
          <input type="number" {...form.register("yearsExperience", { valueAsNumber: true })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Portfolio Links (one per line)</label>
          <textarea {...form.register("portfolioLinks")} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Availability calendar note (optional)</label>
        <textarea {...form.register("availabilityCalendarNote")} rows={2} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Profile image URL</label>
        <input {...form.register("profileImage")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </div>

      <div className="flex items-center justify-end">
        <button type="submit" disabled={saving} className="rounded-xl bg-[#f4c79f] px-5 py-2 text-sm font-semibold text-[#0F0F0F] disabled:opacity-60">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
