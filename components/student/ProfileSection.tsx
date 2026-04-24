"use client";

import * as React from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  User,
  Pencil,
  Save,
  X,
  Link2,
  ExternalLink,
  Globe,
  Plus,
  Tag,
  BookOpen,
  GraduationCap,
  Upload,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { StudentProfile } from "@/types/student";
import {
  PROFILE_PHOTO_ACCEPT,
  uploadProfilePhoto,
  validateProfilePhotoFile,
} from "@/lib/supabaseUploads";

const STUDY_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"];
const FACULTIES = [
  "Faculty of Computing",
  "Faculty of Engineering",
  "Faculty of Science",
  "Faculty of Business",
  "Faculty of Arts",
  "Faculty of Medicine",
  "Faculty of Law",
];
const SPECIALIZATIONS = [
  "Artificial Intelligence",
  "Software Engineering",
  "Cybersecurity",
  "Data Science",
  "Computer Networks",
  "Mobile Development",
  "Web Development",
  "Embedded Systems",
  "Bioinformatics",
  "Cloud Computing",
];
const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Machine Learning", "Deep Learning", "SQL", "MongoDB", "Java", "C++",
  "Docker", "Kubernetes", "Git", "TensorFlow", "PyTorch", "GraphQL",
];

interface ExtendedProfile {
  fullName: string;
  bio: string;
  skills: string[];
  studyYear: string;
  faculty: string;
  specialization: string;
  github: string;
  linkedin: string;
  website: string;
  avatarUrl: string;
}

function Avatar({ url, name, size = 20 }: { url: string; name: string; size?: number }) {
  const dimensions = { width: size * 4, height: size * 4 };
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-full object-cover ring-4 ring-white shadow-xl"
        style={dimensions}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-[#0F0F0F] text-3xl font-bold text-[#FFCBA4] ring-4 ring-white shadow-xl"
      style={dimensions}
    >
      {name?.charAt(0)?.toUpperCase() ?? "S"}
    </div>
  );
}

export function ProfileSection() {
  const { user, updateStudentProfile } = useAuth();
  const [editing, setEditing] = React.useState(false);
  const [skillInput, setSkillInput] = React.useState("");
  const [showSkillSugg, setShowSkillSugg] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const displayName =
    user?.fullName?.trim() ||
    user?.email?.split("@")[0] ||
    "Student";

  const [form, setForm] = React.useState<ExtendedProfile>({
    fullName: user?.fullName ?? "",
    bio: user?.studentProfile?.bio ?? "",
    skills: user?.studentProfile?.skills ?? [],
    studyYear: user?.studentProfile?.studyYear ?? "",
    faculty: user?.studentProfile?.faculty ?? "",
    specialization: user?.studentProfile?.specialization ?? "",
    github: user?.studentProfile?.portfolioLinks?.[0] ?? "",
    linkedin: user?.studentProfile?.portfolioLinks?.[1] ?? "",
    website: user?.studentProfile?.portfolioLinks?.[2] ?? "",
    avatarUrl: user?.studentProfile?.avatarUrl ?? "",
  });

  // Sync when user data changes
  React.useEffect(() => {
    setForm({
      fullName: user?.fullName ?? "",
      bio: user?.studentProfile?.bio ?? "",
      skills: user?.studentProfile?.skills ?? [],
      studyYear: user?.studentProfile?.studyYear ?? "",
      faculty: user?.studentProfile?.faculty ?? "",
      specialization: user?.studentProfile?.specialization ?? "",
      github: user?.studentProfile?.portfolioLinks?.[0] ?? "",
      linkedin: user?.studentProfile?.portfolioLinks?.[1] ?? "",
      website: user?.studentProfile?.portfolioLinks?.[2] ?? "",
      avatarUrl: user?.studentProfile?.avatarUrl ?? "",
    });
  }, [user]);

  function handleChange(key: keyof ExtendedProfile, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || form.skills.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setSkillInput("");
    setShowSkillSugg(false);
  }

  function removeSkill(skill: string) {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
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
      setForm((prev) => ({ ...prev, avatarUrl: uploaded.url }));
      toast.success("Profile photo uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload profile photo.");
    } finally {
      setIsUploadingAvatar(false);
      e.currentTarget.value = "";
    }
  }

  function handleSave() {
    if (!form.bio || form.bio.length < 5) {
      toast.error("Bio is too short. Please write at least a sentence.");
      return;
    }

    const profile: StudentProfile = {
      bio: form.bio,
      skills: form.skills,
      studyYear: form.studyYear || undefined,
      faculty: form.faculty || undefined,
      specialization: form.specialization || undefined,
      portfolioLinks: [form.github, form.linkedin, form.website].filter(Boolean),
      avatarUrl: form.avatarUrl || undefined,
    };
    updateStudentProfile(profile);
    setEditing(false);
    toast.success("Profile saved successfully! ✨");
  }

  async function handleSaveAndWait() {
    if (!form.bio || form.bio.length < 5) {
      toast.error("Bio is too short. Please write at least a sentence.");
      return;
    }

    const profile: StudentProfile = {
      bio: form.bio,
      skills: form.skills,
      studyYear: form.studyYear || undefined,
      faculty: form.faculty || undefined,
      specialization: form.specialization || undefined,
      portfolioLinks: [form.github, form.linkedin, form.website].filter(Boolean),
      avatarUrl: form.avatarUrl || undefined,
    };

    try {
      await updateStudentProfile(profile);
      setEditing(false);
      toast.success("Profile saved successfully! ✨");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile.");
    }
  }

  function handleCancel() {
    // Reset to saved user data
    setForm({
      fullName: user?.fullName ?? "",
      bio: user?.studentProfile?.bio ?? "",
      skills: user?.studentProfile?.skills ?? [],
      studyYear: user?.studentProfile?.studyYear ?? "",
      faculty: user?.studentProfile?.faculty ?? "",
      specialization: user?.studentProfile?.specialization ?? "",
      github: user?.studentProfile?.portfolioLinks?.[0] ?? "",
      linkedin: user?.studentProfile?.portfolioLinks?.[1] ?? "",
      website: user?.studentProfile?.portfolioLinks?.[2] ?? "",
      avatarUrl: user?.studentProfile?.avatarUrl ?? "",
    });
    setEditing(false);
  }

  const filteredSkills = SUGGESTED_SKILLS.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !form.skills.includes(s) && skillInput.length > 0
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <div className="rounded-2xl border border-[#FFCBA4]/40 bg-gradient-to-r from-[#FFF8F3] via-white to-[#FFF3E8] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Student Profile</h2>
            <p className="mt-1 text-sm text-slate-600">Manage your academic and professional details</p>
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={() => {
                  void handleSaveAndWait();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <Save className="h-4 w-4" />
                Save Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avatar + Basic Info */}
      <div className="overflow-hidden rounded-2xl border border-[#FFCBA4]/30 bg-white shadow-sm">
        <div className="relative h-28 bg-gradient-to-r from-[#0F0F0F] via-[#1c0f00] to-[#2a1200]">
          <div className="pointer-events-none absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-end gap-4 -mt-12 mb-4">
            <div className="relative">
              <Avatar url={form.avatarUrl} name={form.fullName || displayName} size={20} />
              {editing && (
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-[#0F0F0F] p-1.5 shadow-md transition-colors hover:bg-[#1c0f00]">
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
              <div className="text-xl font-bold text-slate-800">{form.fullName || displayName}</div>
              <div className="text-sm text-slate-500">{form.faculty || "Faculty not set"} · {form.studyYear || "Year not set"}</div>
            </div>
          </div>

          {/* Full Name (read-only display, name is set at registration) */}
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoField label="Study Year" icon={GraduationCap} editing={editing}>
              {editing ? (
                <select
                  value={form.studyYear}
                  onChange={(e) => handleChange("studyYear", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                >
                  <option value="">Select year...</option>
                  {STUDY_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              ) : (
                <span>{form.studyYear || <span className="text-slate-400">Not set</span>}</span>
              )}
            </InfoField>

            <InfoField label="Faculty" icon={BookOpen} editing={editing}>
              {editing ? (
                <select
                  value={form.faculty}
                  onChange={(e) => handleChange("faculty", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                >
                  <option value="">Select faculty...</option>
                  {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              ) : (
                <span>{form.faculty || <span className="text-slate-400">Not set</span>}</span>
              )}
            </InfoField>

            <InfoField label="Specialization" icon={User} editing={editing}>
              {editing ? (
                <select
                  value={form.specialization}
                  onChange={(e) => handleChange("specialization", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                >
                  <option value="">Select specialization...</option>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span>{form.specialization || <span className="text-slate-400">Not set</span>}</span>
              )}
            </InfoField>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Bio</label>
        {editing ? (
          <textarea
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={4}
            placeholder="Tell mentors about yourself, your academic journey, and what you're passionate about..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all resize-none"
          />
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed">
            {form.bio || <span className="text-slate-400 italic">No bio added yet. Click Edit Profile to add one.</span>}
          </p>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-[#F5A97F]" />
          Skills
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.skills.length === 0 && !editing && (
            <span className="text-sm text-slate-400 italic">No skills added yet.</span>
          )}
          {form.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FFCBA4]/20 to-[#FFCBA4]/20 border border-[#FFCBA4]/30 px-3 py-1.5 text-xs font-semibold text-[#0F0F0F]"
            >
              {skill}
              {editing && (
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-500 transition-colors ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Add a skill (e.g., Python, React)..."
                value={skillInput}
                onChange={(e) => { setSkillInput(e.target.value); setShowSkillSugg(true); }}
                onFocus={() => setShowSkillSugg(true)}
                onBlur={() => setTimeout(() => setShowSkillSugg(false), 150)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
              />
              {showSkillSugg && filteredSkills.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                  {filteredSkills.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => addSkill(s)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#FFCBA4]/10 hover:text-[#0F0F0F] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => addSkill(skillInput)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0F0F0F] px-4 py-2.5 text-sm font-semibold text-[#FFCBA4] hover:bg-[#1c0f00] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        )}
      </div>

      {/* Portfolio Links */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-4">Portfolio Links</label>
        <div className="space-y-3">
          {[
            { key: "github" as const, label: "GitHub", icon: Link2, placeholder: "https://github.com/username", color: "text-slate-700" },
            { key: "linkedin" as const, label: "LinkedIn", icon: ExternalLink, placeholder: "https://linkedin.com/in/username", color: "text-blue-600" },
            { key: "website" as const, label: "Website", icon: Globe, placeholder: "https://yourportfolio.com", color: "text-[#0F0F0F]" },
          ].map(({ key, label, icon: Icon, placeholder, color }) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`rounded-xl border border-slate-200 bg-slate-50 p-2.5 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              {editing ? (
                <input
                  type="url"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                />
              ) : form[key] ? (
                <a
                  href={form[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-[#0F0F0F] hover:underline truncate"
                >
                  {form[key]}
                </a>
              ) : (
                <span className="flex-1 text-sm text-slate-400 italic">{label} not added</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  icon: Icon,
  editing,
  children,
}: {
  label: string;
  icon: React.FC<{ className?: string }>;
  editing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}
