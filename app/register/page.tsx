"use client";

import * as React from "react";
import { Eye, EyeOff, User, Mail, Lock, Linkedin, GitHub } from "@/components/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import type { AuthUser } from "@/types/user";
import type { AvailabilityStatus } from "@/types/auth";
import { registerSchema } from "@/lib/zod/authSchemas";
import { useAuth } from "@/context/AuthContext";
import { ALL_SKILLS } from "@/lib/constants";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkillMultiSelect } from "@/components/forms/SkillMultiSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RegisterInput = z.infer<typeof registerSchema>;

/* ── Password strength ── */
function pwScore(password: string) {
  let s = 0;
  if (!password) return s;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
}

function StrengthBar({ value }: { value: number }) {
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-transparent", "bg-red-400", "bg-orange-400", "bg-yellow-500", "bg-emerald-500"];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${value >= i ? colors[value] : "bg-white/15"}`} />
        ))}
      </div>
      {value > 0 && (
        <p className={`text-[11px] font-medium ${value >= 4 ? "text-emerald-400" : value >= 3 ? "text-yellow-400" : value >= 2 ? "text-orange-400" : "text-red-400"}`}>
          {labels[value]}
        </p>
      )}
    </div>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><span className="inline-block h-1 w-1 rounded-full bg-red-400 flex-shrink-0" />{msg}</p>;
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0F0F0F]/60 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      <Err msg={error} />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPw, setShowPw] = React.useState(false);
  const [showCf, setShowCf] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "", email: "", password: "", confirmPassword: "",
      role: "student", bio: "", skills: [],
      mentorAvailability: "Full-time", yearsExperience: 0,
      linkedIn: "", github: "",
    },
  });

  const role = form.watch("role");
  const pw = form.watch("password");
  const strength = pwScore(pw ?? "");

  async function onSubmit(values: RegisterInput) {
    try {
      setSubmitting(true);
      type MP = { bio: string; skills: string[]; availability: "Full-time"|"Part-time"|"Evenings"; availabilityStatus: AvailabilityStatus; yearsExperience: number; linkedIn?: string; github?: string; };
      const mentorProfile: MP | undefined = values.role === "mentor" ? {
        bio: values.bio ?? "",
        skills: values.skills ?? [],
        availability: values.mentorAvailability ?? "Full-time",
        availabilityStatus: "Available in 1-2 days",
        yearsExperience: values.yearsExperience ?? 0,
        linkedIn: values.linkedIn || undefined,
        github: values.github || undefined,
      } : undefined;

      const newUser: Omit<AuthUser, "id"> = {
        role: values.role,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        ...(values.role === "student"
          ? { studentProfile: { bio: "Student building projects with a structured progress workflow.", skills: ["React","TypeScript"], portfolioLinks: ["https://portfolio.example.com"], avatarUrl: "" } }
          : { mentorProfile: mentorProfile! }),
        ...(values.role === "mentor" && mentorProfile ? { availabilityStatus: mentorProfile.availabilityStatus } : {}),
      };
      await register({ user: newUser });
      toast.success("Account created! Welcome to IdeaBridge 🎉");
      router.push(values.role === "student" ? "/dashboard/student" : "/dashboard/mentor");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full h-11 bg-gray-100 border border-transparent text-[#0F0F0F] placeholder:text-[#6b6b6b] rounded-lg px-3 text-sm focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#F5A97F]/30 transition-all";
  const inputIconCls = "pl-9 " + inputCls;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Warm gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#FFF8F3] to-[#FFEFE6]" />
        <div className="fixed top-[-12%] right-[-8%] w-[520px] h-[520px] rounded-full bg-[#FFCBA4]/30 blur-3xl pointer-events-none" />
        <div className="fixed bottom-[-12%] left-[-8%] w-[420px] h-[420px] rounded-full bg-[#FFDCC2]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl">
          {/* Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFCBA4] flex items-center justify-center shadow-lg">
                <span className="text-[#0F0F0F] font-bold text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>IB</span>
              </div>
              <span className="text-[#0F0F0F] font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>IdeaBridge</span>
            </Link>
            <h1 className="text-3xl font-bold text-[#0F0F0F]" style={{ fontFamily: "'Poppins', sans-serif" }}>Create your account</h1>
            <p className="text-[#0F0F0F]/45 text-sm mt-1.5">Join as a Student or Mentor</p>
          </div>

          {/* Card (glassmorphism) */}
          <div className="relative rounded-2xl p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.4)' }}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" error={form.formState.errors.fullName?.message}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/30" />
                    <input id="fullName" placeholder="Your full name" {...form.register("fullName")} className={inputIconCls} />
                  </div>
                </Field>
                <Field label="Email" error={form.formState.errors.email?.message}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/30" />
                    <input id="email" type="email" placeholder="you@university.edu" {...form.register("email")} className={inputIconCls} />
                  </div>
                </Field>
              </div>

              {/* Password + Confirm */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Password" error={form.formState.errors.password?.message}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/30" />
                    <input id="password" type={showPw ? "text" : "password"} placeholder="Min 8 characters" {...form.register("password")} className={inputIconCls + " pr-10"} />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]/30 hover:text-[#0F0F0F]/70 transition-colors" aria-label="Toggle password">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <StrengthBar value={strength} />
                </Field>
                <Field label="Confirm Password" error={form.formState.errors.confirmPassword?.message}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/30" />
                    <input id="confirmPassword" type={showCf ? "text" : "password"} placeholder="Re-type password" {...form.register("confirmPassword")} className={inputIconCls + " pr-10"} />
                    <button type="button" onClick={() => setShowCf(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]/30 hover:text-[#0F0F0F]/70 transition-colors" aria-label="Toggle confirm">
                      {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-[#0F0F0F]/60 uppercase tracking-wider mb-2">Role</label>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3">
                      {(["student", "mentor"] as const).map((r) => (
                        <button key={r} type="button" onClick={() => field.onChange(r)}
                          className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${field.value === r
                            ? "bg-[#FFCBA4] border-[#FFCBA4] text-[#0F0F0F] shadow-lg shadow-[#FFCBA4]/20"
                            : "bg-white/5 border-white/15 text-[#0F0F0F]/50 hover:bg-white/8 hover:text-[#0F0F0F]/80"}`}
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {r === "student" ? "🎓 Student" : "🧑‍💼 Mentor"}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Mentor fields */}
              {role === "mentor" && (
                <div className="space-y-4 rounded-xl border border-[#FFCBA4]/20 bg-[#FFCBA4]/5 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#FFCBA4] uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFCBA4]" />Mentor Profile
                  </div>

                  <Field label="Bio (min 20 characters)" error={form.formState.errors.bio?.message}>
                    <Textarea id="bio" placeholder="Describe your expertise and guidance style..." rows={3}
                      {...form.register("bio")}
                      className="w-full bg-white/5 border border-white/15 text-[#0F0F0F] placeholder:text-[#0F0F0F]/25 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FFCBA4]/60 focus:ring-2 focus:ring-[#FFCBA4]/20 transition-all resize-none" />
                  </Field>

                  <Field label="Skills (select at least 1)" error={form.formState.errors.skills?.message}>
                    <Controller control={form.control} name="skills"
                      render={({ field }) => (
                        <SkillMultiSelect value={field.value ?? []} onChange={(next) => field.onChange(next)} options={ALL_SKILLS} />
                      )} />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Availability" error={form.formState.errors.mentorAvailability?.message}>
                      <Controller control={form.control} name="mentorAvailability"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-11 bg-white/5 border-white/15 text-[#0F0F0F] rounded-lg focus:border-[#FFCBA4]/60">
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Evenings">Evenings</SelectItem>
                            </SelectContent>
                          </Select>
                        )} />
                    </Field>
                    <Field label="Years of Experience" error={form.formState.errors.yearsExperience?.message}>
                      <input id="yearsExperience" type="number" min={0} max={50} inputMode="numeric"
                        {...form.register("yearsExperience", { valueAsNumber: true })}
                        className={inputCls} />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="LinkedIn URL" error={form.formState.errors.linkedIn?.message}>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/30" />
                        <input id="linkedIn" placeholder="https://linkedin.com/in/..." {...form.register("linkedIn")} className={inputIconCls} />
                      </div>
                    </Field>
                    <Field label="GitHub URL" error={form.formState.errors.github?.message}>
                      <div className="relative">
                        <GitHub className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/30" />
                        <input id="github" placeholder="https://github.com/..." {...form.register("github")} className={inputIconCls} />
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#0F0F0F] text-white font-bold text-sm hover:bg-[#1a1a1a] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account…</span>
                  : "Create Account →"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#0F0F0F]/35">
              Already have an account?{" "}
              <Link href="/login" className="text-[#FFCBA4] hover:text-[#0F0F0F] font-semibold transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
  );
}
