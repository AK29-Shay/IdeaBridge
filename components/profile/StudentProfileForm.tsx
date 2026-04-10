"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SkillMultiSelect } from "@/components/forms/SkillMultiSelect";
import { ALL_SKILLS } from "@/lib/constants";

const studentSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  skills: z.array(z.string()).optional(),
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  profileImage: z.string().url().optional().or(z.literal("")),
  studyYear: z.string().optional(),
  faculty: z.string().optional(),
  specialization: z.string().optional(),
});

type StudentInput = z.infer<typeof studentSchema>;

export default function StudentProfileForm({
  isEdit = true,
  initialImage,
  onImageChange,
}: {
  isEdit?: boolean;
  initialImage?: string | null;
  onImageChange?: (url?: string) => void;
}) {
  const { user, updateStudentProfile } = useAuth();
  const [saving, setSaving] = React.useState(false);

  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    mode: "onChange",
    defaultValues: {
      fullName: user?.fullName ?? "",
      bio: (user as any)?.studentProfile?.bio ?? "",
      skills: (user as any)?.studentProfile?.skills ?? [],
      github: (user as any)?.studentProfile?.portfolioLinks?.[0] ?? "",
      linkedin: (user as any)?.studentProfile?.portfolioLinks?.[1] ?? "",
      profileImage: initialImage ?? (user as any)?.studentProfile?.avatarUrl ?? "",
      studyYear: (user as any)?.studentProfile?.studyYear ?? "",
      faculty: (user as any)?.studentProfile?.faculty ?? "",
      specialization: (user as any)?.studentProfile?.specialization ?? "",
    },
  });

  React.useEffect(() => {
    if (!user) return;
    const u = user as any;
    form.reset({
      fullName: user.fullName ?? "",
      bio: u.studentProfile?.bio ?? "",
      skills: u.studentProfile?.skills ?? [],
      github: u.studentProfile?.portfolioLinks?.[0] ?? "",
      linkedin: u.studentProfile?.portfolioLinks?.[1] ?? "",
      profileImage: initialImage ?? u.studentProfile?.avatarUrl ?? "",
      studyYear: u.studentProfile?.studyYear ?? "",
      faculty: u.studentProfile?.faculty ?? "",
      specialization: u.studentProfile?.specialization ?? "",
    });
  }, [user, initialImage, form]);

  async function onSubmit(values: StudentInput) {
    if (!user) return;
    setSaving(true);
    try {
      const profile = {
        bio: values.bio,
        skills: values.skills ?? [],
        portfolioLinks: [values.github, values.linkedin].filter(Boolean),
        avatarUrl: values.profileImage || undefined,
        studyYear: values.studyYear || undefined,
        faculty: values.faculty || undefined,
        specialization: values.specialization || undefined,
      } as any;

      updateStudentProfile(profile);
      toast.success("Student profile saved.");
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
            <div className="text-sm text-slate-500">{values.studyYear || "Year not set"} · {values.faculty || "Faculty not set"}</div>
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
            <div className="text-sm font-medium text-slate-700">GitHub</div>
            <div className="mt-1 text-sm text-slate-600">{values.github ? <a href={values.github} className="text-blue-600 hover:underline">{values.github}</a> : <span className="text-slate-400 italic">Not set</span>}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700">LinkedIn</div>
            <div className="mt-1 text-sm text-slate-600">{values.linkedin ? <a href={values.linkedin} className="text-blue-600 hover:underline">{values.linkedin}</a> : <span className="text-slate-400 italic">Not set</span>}</div>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">GitHub (optional)</label>
          <input {...form.register("github")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">LinkedIn (optional)</label>
          <input {...form.register("linkedin")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Profile image URL</label>
        <input {...form.register("profileImage")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Study Year</label>
          <input {...form.register("studyYear")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Faculty</label>
          <input {...form.register("faculty")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Specialization</label>
          <input {...form.register("specialization")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#f4c79f] px-5 py-2 text-sm font-semibold text-[#0F0F0F] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
