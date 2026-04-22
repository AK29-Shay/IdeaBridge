"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Eye, EyeOff, User, Mail, Lock, Linkedin, GitHub } from "@/components/ui/icons";
import type { AvailabilityStatus } from "@/types/auth";
import { registerSchema } from "@/lib/zod/authSchemas";
import { useAuth } from "@/context/AuthContext";
import { ALL_SKILLS } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { SkillMultiSelect } from "@/components/forms/SkillMultiSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RegisterInput = z.infer<typeof registerSchema>;

function passwordScore(password: string) {
  let score = 0;
  if (!password) return score;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function StrengthBar({ value }: { value: number }) {
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-transparent", "bg-red-400", "bg-orange-400", "bg-yellow-500", "bg-emerald-500"];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              value >= index ? colors[value] : "bg-white/15"
            }`}
          />
        ))}
      </div>
      {value > 0 ? (
        <p
          className={`text-[11px] font-medium ${
            value >= 4
              ? "text-emerald-400"
              : value >= 3
                ? "text-yellow-400"
                : value >= 2
                  ? "text-orange-400"
                  : "text-red-400"
          }`}
        >
          {labels[value]}
        </p>
      ) : null}
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
      <span className="inline-block h-1 w-1 shrink-0 rounded-full bg-red-400" />
      {message}
    </p>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#0F0F0F]/60">
        {label}
      </label>
      {children}
      <ErrorText message={error} />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
      bio: "",
      skills: [],
      mentorAvailability: "Full-time",
      yearsExperience: 0,
      linkedIn: "",
      github: "",
    },
  });

  const role = form.watch("role");
  const password = form.watch("password");
  const strength = passwordScore(password ?? "");

  async function onSubmit(values: RegisterInput) {
    try {
      setIsSubmitting(true);

      type MentorRegistrationProfile = {
        bio: string;
        skills: string[];
        availability: "Full-time" | "Part-time" | "Evenings";
        availabilityStatus: AvailabilityStatus;
        yearsExperience: number;
        linkedIn?: string;
        github?: string;
      };

      const mentorProfile: MentorRegistrationProfile | undefined =
        values.role === "mentor"
          ? {
              bio: values.bio ?? "",
              skills: values.skills ?? [],
              availability: values.mentorAvailability ?? "Full-time",
              availabilityStatus: "Available in 1-2 days",
              yearsExperience: values.yearsExperience ?? 0,
              linkedIn: values.linkedIn || undefined,
              github: values.github || undefined,
            }
          : undefined;

      const registeredUser = await register({
        user: {
          role: values.role,
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          ...(values.role === "student"
            ? {
                studentProfile: {
                  bio: "Student building projects with a structured progress workflow.",
                  skills: ["React", "TypeScript"],
                  portfolioLinks: ["https://portfolio.example.com"],
                  avatarUrl: "",
                },
              }
            : {
                mentorProfile: mentorProfile!,
              }),
        },
      });

      if (registeredUser) {
        toast.success("Account created! Welcome to IdeaBridge.");
        router.push(values.role === "student" ? "/dashboard/student" : "/dashboard/mentor");
        return;
      }

      toast.success("Account created. Please verify your email to continue.");
      router.push("/verify-email");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "h-11 w-full rounded-lg border border-transparent bg-gray-100 px-3 text-sm text-[#0F0F0F] placeholder:text-[#6b6b6b] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F5A97F]/30";
  const iconInputClassName = `pl-9 ${inputClassName}`;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-[#FFF8F3] to-[#FFEFE6]" />
      <div className="fixed right-[-8%] top-[-12%] h-[520px] w-[520px] rounded-full bg-[#FFCBA4]/30 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-12%] left-[-8%] h-[420px] w-[420px] rounded-full bg-[#FFDCC2]/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFCBA4] shadow-lg">
              <span className="text-sm font-bold text-[#0F0F0F]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                IB
              </span>
            </div>
            <span className="text-lg font-bold text-[#0F0F0F]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              IdeaBridge
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-[#0F0F0F]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-[#0F0F0F]/45">Join as a Student or Mentor</p>
        </div>

        <div
          className="relative rounded-2xl p-6 md:p-8"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" error={form.formState.errors.fullName?.message}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F0F0F]/30" />
                  <input id="fullName" placeholder="Your full name" {...form.register("fullName")} className={iconInputClassName} />
                </div>
              </Field>
              <Field label="Email" error={form.formState.errors.email?.message}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F0F0F]/30" />
                  <input id="email" type="email" placeholder="you@university.edu" {...form.register("email")} className={iconInputClassName} />
                </div>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password" error={form.formState.errors.password?.message}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F0F0F]/30" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    {...form.register("password")}
                    className={`${iconInputClassName} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]/30 transition-colors hover:text-[#0F0F0F]/70"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <StrengthBar value={strength} />
              </Field>

              <Field label="Confirm Password" error={form.formState.errors.confirmPassword?.message}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F0F0F]/30" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-type password"
                    {...form.register("confirmPassword")}
                    className={`${iconInputClassName} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]/30 transition-colors hover:text-[#0F0F0F]/70"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#0F0F0F]/60">
                Role
              </label>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {(["student", "mentor"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                          field.value === value
                            ? "border-[#FFCBA4] bg-[#FFCBA4] text-[#0F0F0F] shadow-lg shadow-[#FFCBA4]/20"
                            : "border-white/15 bg-white/5 text-[#0F0F0F]/50 hover:bg-white/8 hover:text-[#0F0F0F]/80"
                        }`}
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {value === "student" ? "Student" : "Mentor"}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {role === "mentor" ? (
              <div className="space-y-4 rounded-xl border border-[#FFCBA4]/20 bg-[#FFCBA4]/5 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C7792F]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFCBA4]" />
                  Mentor Profile
                </div>

                <Field label="Bio (min 20 characters)" error={form.formState.errors.bio?.message}>
                  <Textarea
                    id="bio"
                    placeholder="Describe your expertise and guidance style..."
                    rows={3}
                    {...form.register("bio")}
                    className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-[#0F0F0F] placeholder:text-[#0F0F0F]/25 transition-all focus:border-[#FFCBA4]/60 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]/20"
                  />
                </Field>

                <Field label="Skills (select at least 1)" error={form.formState.errors.skills?.message}>
                  <Controller
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <SkillMultiSelect value={field.value ?? []} onChange={(next) => field.onChange(next)} options={ALL_SKILLS} />
                    )}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Availability" error={form.formState.errors.mentorAvailability?.message}>
                    <Controller
                      control={form.control}
                      name="mentorAvailability"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 rounded-lg border-white/15 bg-white/5 text-[#0F0F0F] focus:border-[#FFCBA4]/60">
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
                  </Field>

                  <Field label="Years of Experience" error={form.formState.errors.yearsExperience?.message}>
                    <input
                      id="yearsExperience"
                      type="number"
                      min={0}
                      max={50}
                      inputMode="numeric"
                      {...form.register("yearsExperience", { valueAsNumber: true })}
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="LinkedIn URL" error={form.formState.errors.linkedIn?.message}>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F0F0F]/30" />
                      <input id="linkedIn" placeholder="https://linkedin.com/in/..." {...form.register("linkedIn")} className={iconInputClassName} />
                    </div>
                  </Field>

                  <Field label="GitHub URL" error={form.formState.errors.github?.message}>
                    <div className="relative">
                      <GitHub className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F0F0F]/30" />
                      <input id="github" placeholder="https://github.com/..." {...form.register("github")} className={iconInputClassName} />
                    </div>
                  </Field>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-[#0F0F0F] py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#0F0F0F]/55">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#C7792F] transition-colors hover:text-[#0F0F0F]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
