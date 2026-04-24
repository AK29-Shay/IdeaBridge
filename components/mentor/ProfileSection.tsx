"use client";

import * as React from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Save, X, Plus, Tag, Upload, Link2, ExternalLink, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { MentorProfile } from "@/types/mentor";
import {
  PROFILE_PHOTO_ACCEPT,
  uploadProfilePhoto,
  validateProfilePhotoFile,
} from "@/lib/supabaseUploads";

/* ───── Schema ───── */
const profileSchema = z.object({
  fullName:           z.string().min(2, "Full name is required."),
  bio:                z.string().min(10, "Bio must be at least 10 characters."),
  skills:             z.array(z.string()).min(1, "Add at least one skill."),
  availability:       z.enum(["Full-time", "Part-time", "Evenings"]),
  availabilityStatus: z.enum(["Available Now", "Available in 1-2 days", "Busy", "On Leave"]),
  yearsExperience:    z.coerce.number().min(0, "Min 0").max(50, "Max 50"),
  linkedIn:           z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  github:             z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  avatarUrl:          z.string().optional(),
});
type ProfileFormValues = z.input<typeof profileSchema>;
type ProfileInput = z.output<typeof profileSchema>;

const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "Machine Learning",
  "Deep Learning", "Data Science", "SQL", "MongoDB", "Java", "C++", "TensorFlow",
  "PyTorch", "Docker", "Kubernetes", "System Design", "Agile", "Cloud Computing",
];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

export function ProfileSection() {
  const { user, updateMentorProfile } = useAuth();
  const [editing, setEditing] = React.useState(false);
  const [skillInput, setSkillInput] = React.useState("");
  const [showSkillSugg, setShowSkillSugg] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const displayName =
    user?.fullName?.trim() ||
    user?.email?.split("@")[0] ||
    "Mentor";

  const defaultProfile = user?.mentorProfile;

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } =
    useForm<ProfileFormValues, unknown, ProfileInput>({
      resolver: zodResolver(profileSchema),
      mode: "onChange",
      defaultValues: {
        fullName:           user?.fullName ?? "",
        bio:                defaultProfile?.bio ?? "",
        skills:             defaultProfile?.skills ?? [],
        availability:       defaultProfile?.availability ?? "Full-time",
        availabilityStatus: defaultProfile?.availabilityStatus ?? "Available Now",
        yearsExperience:    defaultProfile?.yearsExperience ?? 0,
        linkedIn:           defaultProfile?.linkedIn ?? "",
        github:             defaultProfile?.github ?? "",
        avatarUrl:          defaultProfile?.avatarUrl ?? "",
      },
    });

  const skills          = watch("skills") ?? [];
  const avatarUrl       = watch("avatarUrl") ?? "";
  const avStatus        = watch("availabilityStatus");

  function addSkill(s: string) {
    const t = s.trim();
    if (!t || skills.includes(t)) return;
    setValue("skills", [...skills, t], { shouldValidate: true });
    setSkillInput("");
    setShowSkillSugg(false);
  }
  function removeSkill(s: string) {
    setValue("skills", skills.filter(k => k !== s), { shouldValidate: true });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateProfilePhotoFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadProfilePhoto(file);
      setValue("avatarUrl", uploaded.url, { shouldValidate: true });
      toast.success("Profile photo uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload profile photo.");
    } finally {
      setIsUploadingAvatar(false);
      e.currentTarget.value = "";
    }
  }

  function onSubmit(data: ProfileInput) {
    const profile: MentorProfile = {
      bio:                      data.bio,
      skills:                   data.skills,
      availability:             data.availability,
      availabilityStatus:       data.availabilityStatus,
      yearsExperience:          data.yearsExperience,
      linkedIn:                 data.linkedIn || undefined,
      github:                   data.github || undefined,
      avatarUrl:                data.avatarUrl || undefined,
    };
    updateMentorProfile(profile);
    setEditing(false);
    toast.success("Profile saved! ✨");
  }

  async function onSubmitAndWait(data: ProfileInput) {
    const profile: MentorProfile = {
      bio:                      data.bio,
      skills:                   data.skills,
      availability:             data.availability,
      availabilityStatus:       data.availabilityStatus,
      yearsExperience:          data.yearsExperience,
      linkedIn:                 data.linkedIn || undefined,
      github:                   data.github || undefined,
      avatarUrl:                data.avatarUrl || undefined,
    };

    try {
      await updateMentorProfile(profile);
      setEditing(false);
      toast.success("Profile saved! ✨");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile.");
    }
  }

  function handleCancel() {
    reset();
    setEditing(false);
  }

  const filteredSkills = SUGGESTED_SKILLS.filter(s =>
    s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s) && skillInput.length > 0
  );

  const avStatusColor = {
    "Available Now":       "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Available in 1-2 days": "bg-blue-100 text-blue-700 border-blue-200",
    "Busy":                "bg-amber-100 text-amber-700 border-amber-200",
    "On Leave":            "bg-slate-100 text-slate-600 border-slate-200",
  }[avStatus ?? "Available Now"];

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <div className="rounded-2xl border border-[#FFCBA4]/40 bg-gradient-to-r from-[#FFF8F3] via-white to-[#FFF3E8] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mentor Profile</h2>
            <p className="mt-1 text-sm text-slate-600">Manage your mentor information</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F0F0F] px-5 py-2.5 text-sm font-semibold text-[#FFCBA4] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-125"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                form="profile-form"
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <Save className="h-4 w-4" /> Save Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <form id="profile-form" onSubmit={handleSubmit(onSubmitAndWait)} className="space-y-5">
        {/* Avatar + banner */}
        <div className="overflow-hidden rounded-2xl border border-[#FFCBA4]/30 bg-white shadow-sm">
          <div className="relative h-28 bg-gradient-to-r from-[#0F0F0F] via-[#1c0f00] to-[#2a1200]">
            <div className="pointer-events-none absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 30% 60%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-wrap items-end gap-4 -mt-12 mb-4">
              <div className="relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-xl"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-[#0F0F0F] flex items-center justify-center text-[#FFCBA4] font-black text-3xl ring-4 ring-white shadow-xl">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                {editing && (
                  <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-[#0F0F0F] p-1.5 shadow-md hover:bg-[#1c0f00] transition-colors">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#FFCBA4]" />
                    ) : (
                      <Upload className="h-3 w-3 text-[#FFCBA4]" />
                    )}
                    <input
                      type="file"
                      accept={PROFILE_PHOTO_ACCEPT}
                      className="hidden"
                      disabled={isUploadingAvatar}
                      onChange={(e) => {
                        void handleImageUpload(e);
                      }}
                    />
                  </label>
                )}
              </div>
              <div className="mb-2">
                <div className="text-xl font-bold text-slate-800">{displayName}</div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${avStatusColor}`}>
                  {avStatus}
                </span>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Full Name
              </label>
              {editing ? (
                <>
                  <input {...register("fullName")} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all" />
                  <FieldError msg={errors.fullName?.message} />
                </>
              ) : (
                <p className="text-sm text-slate-700">{displayName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700">Bio <span className="text-red-500">*</span></label>
          {editing ? (
            <>
              <textarea
                {...register("bio")}
                rows={4}
                placeholder="Describe your expertise, teaching style, and what you offer mentees..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all resize-none"
              />
              <FieldError msg={errors.bio?.message} />
            </>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">
              {watch("bio") || <span className="text-slate-400 italic">No bio yet. Click Edit Profile.</span>}
            </p>
          )}
        </div>

        {/* Skills */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-[#F5A97F]" />
            Skills <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.length === 0 && !editing && (
              <span className="text-sm text-slate-400 italic">No skills added yet.</span>
            )}
            {skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FFCBA4]/20 to-[#FFCBA4]/20 border border-[#FFCBA4]/30 px-3 py-1.5 text-xs font-semibold text-[#0F0F0F]">
                {s}
                {editing && (
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {errors.skills && <p className="text-xs text-red-500 mb-2">{errors.skills.message as string}</p>}
          {editing && (
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={e => { setSkillInput(e.target.value); setShowSkillSugg(true); }}
                  onFocus={() => setShowSkillSugg(true)}
                  onBlur={() => setTimeout(() => setShowSkillSugg(false), 150)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                />
                {showSkillSugg && filteredSkills.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-44 overflow-y-auto">
                    {filteredSkills.map(s => (
                      <button key={s} type="button" onMouseDown={() => addSkill(s)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#FFCBA4]/10 hover:text-[#0F0F0F] transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => addSkill(skillInput)} className="flex items-center gap-1.5 rounded-xl bg-[#0F0F0F] px-4 py-2.5 text-sm font-semibold text-[#FFCBA4] hover:bg-[#1c0f00] transition-colors">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          )}
        </div>

        {/* Availability + experience */}
        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3">
          {/* Availability type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Availability</label>
            {editing ? (
              <Controller
                name="availability"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all">
                    {["Full-time", "Part-time", "Evenings"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              />
            ) : (
              <p className="text-sm text-slate-700">{watch("availability") || "–"}</p>
            )}
          </div>

          {/* Availability status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
            {editing ? (
              <Controller
                name="availabilityStatus"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all">
                    {["Available Now", "Available in 1-2 days", "Busy", "On Leave"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              />
            ) : (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${avStatusColor}`}>
                {watch("availabilityStatus") || "–"}
              </span>
            )}
          </div>

          {/* Years of experience */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Years of Experience</label>
            {editing ? (
              <>
                <input
                  {...register("yearsExperience")}
                  type="number"
                  min={0}
                  max={50}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                />
                <FieldError msg={errors.yearsExperience?.message} />
              </>
            ) : (
              <p className="text-sm text-slate-700">{Number(watch("yearsExperience") ?? 0)} yrs</p>
            )}
          </div>
        </div>

        {/* Portfolio Links */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-4">Portfolio Links</label>
          <div className="space-y-3">
            {([
              { field: "github" as const,   label: "GitHub",   icon: Link2,         placeholder: "https://github.com/username",          color: "text-slate-700" },
              { field: "linkedIn" as const, label: "LinkedIn", icon: ExternalLink,   placeholder: "https://linkedin.com/in/username",     color: "text-blue-600"  },
            ] as const).map(({ field, label, icon: Icon, placeholder, color }) => (
              <div key={field} className="flex items-center gap-3">
                <div className={`rounded-xl border border-slate-200 bg-slate-50 p-2.5 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {editing ? (
                  <>
                    <input
                      {...register(field)}
                      type="url"
                      placeholder={placeholder}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                    />
                  </>
                ) : watch(field) ? (
                  <a href={watch(field) as string} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0F0F0F] hover:underline truncate">
                    {watch(field) as string}
                  </a>
                ) : (
                  <span className="text-sm text-slate-400 italic">{label} not added</span>
                )}
                <FieldError msg={errors[field]?.message} />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
