"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Lock, Eye, EyeOff } from "@/components/ui/icons";

import { resetPasswordSchema } from "@/lib/zod/authSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetInput = z.infer<typeof resetPasswordSchema>;

function passwordStrength(password: string) {
  let score = 0;
  if (!password) return score;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function PasswordStrengthBar({ value }: { value: number }) {
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-slate-200",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-500",
  ];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              value >= i ? colors[value] : "bg-white/20"
            }`}
          />
        ))}
      </div>
      {value > 0 && (
        <p
          className={`text-xs font-medium ${
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
      )}
    </div>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
      <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
      {msg}
    </p>
  );
}

export default function ResetPasswordPage() {
  const params = useParams() as { token?: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token ?? "";
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const form = useForm<ResetInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      token: token,
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPasswordValue = form.watch("newPassword");
  const pwStrength = passwordStrength(newPasswordValue ?? "");

  React.useEffect(() => {
    if (token) form.setValue("token", token);
  }, [token, form]);

  function onSubmit(_values: ResetInput) {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push(
          `/login?next=${encodeURIComponent(searchParams.get("next") ?? "")}`
        );
      }, 2500);
    }, 1200);
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-[#FFF8F3]" />
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#FFCBA4]/40 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#0F0F0F]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F0F0F] shadow-md mb-4">
            <span className="text-[#FFCBA4] font-bold text-xl">IB</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F0F0F] tracking-tight">
            Reset your password
          </h1>
          <p className="text-[#0F0F0F]/60 mt-1.5 text-sm">
            Create a new strong password for your account
          </p>
        </div>

        <div className="bg-white border border-[#FFCBA4]/30 rounded-2xl shadow-2xl p-6 md:p-8">
          {!success ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <input type="hidden" {...form.register("token")} />

              {/* Token badge */}
              {token && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs text-emerald-300">Valid reset token detected</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <Label
                  htmlFor="newPassword"
                  className="text-[#0F0F0F]/80 text-sm font-medium mb-1.5 block"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/40" />
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="Min 8 chars, uppercase, number, symbol"
                    {...form.register("newPassword")}
                    className="pl-9 pr-10 bg-white/10 border-white/20 text-[#0F0F0F] placeholder:text-[#0F0F0F]/30 rounded-lg focus:border-[#FFCBA4] focus:ring-2 focus:ring-[#FFCBA4]/30 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]/40 hover:text-[#0F0F0F]/80 transition-colors"
                    aria-label="Toggle new password"
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <PasswordStrengthBar value={pwStrength} />
                <ErrorMsg msg={form.formState.errors.newPassword?.message} />
              </div>

              {/* Confirm Password */}
              <div>
                <Label
                  htmlFor="confirmNewPassword"
                  className="text-[#0F0F0F]/80 text-sm font-medium mb-1.5 block"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/40" />
                  <Input
                    id="confirmNewPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-type your new password"
                    {...form.register("confirmNewPassword")}
                    className="pl-9 pr-10 bg-white/10 border-white/20 text-[#0F0F0F] placeholder:text-[#0F0F0F]/30 rounded-lg focus:border-[#FFCBA4] focus:ring-2 focus:ring-[#FFCBA4]/30 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]/40 hover:text-[#0F0F0F]/80 transition-colors"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ErrorMsg msg={form.formState.errors.confirmNewPassword?.message} />
              </div>

              {/* Password requirements */}
              <div className="bg-[#FFF8F3] border border-[#FFCBA4]/30 rounded-xl p-3.5">
                <p className="text-xs text-[#0F0F0F]/50 font-medium mb-2">Password must include:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { rule: /[A-Z]/, label: "Uppercase letter" },
                    { rule: /[a-z]/, label: "Lowercase letter" },
                    { rule: /[0-9]/, label: "Number" },
                    { rule: /[^A-Za-z0-9]/, label: "Symbol (!@#…)" },
                  ].map(({ rule, label }) => {
                    const passes = rule.test(newPasswordValue ?? "");
                    return (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${passes ? "bg-emerald-500/30" : "bg-white/10"}`}>
                          {passes && (
                            <svg className="w-2 h-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs ${passes ? "text-emerald-400" : "text-[#0F0F0F]/40"}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                id="reset-password-submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#0F0F0F] text-[#FFCBA4] font-semibold text-sm hover:brightness-125 transition-all duration-200 shadow-lg shadow-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Resetting password…
                  </span>
                ) : (
                  "Reset Password →"
                )}
              </button>

              <p className="text-center text-sm text-[#0F0F0F]/50">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-[#F5A97F] hover:text-[#0F0F0F] font-medium transition-colors"
                >
                  ← Back to login
                </button>
              </p>
            </form>
          ) : (
            /* Success state */
            <div className="text-center space-y-5 py-4 animate-fade-up">
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0F0F0F]">Password Reset Successfully!</h2>
                <p className="mt-2 text-[#0F0F0F]/60 text-sm">
                  Your password has been updated. Redirecting you to login…
                </p>
              </div>
              <div className="flex justify-center">
                <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0F0F0F] to-[#FFCBA4] rounded-full animate-[grow_2.5s_linear_forwards]" style={{ animation: "width 2.5s linear forwards" }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full py-3 rounded-xl bg-[#0F0F0F] text-[#FFCBA4] font-semibold text-sm hover:brightness-125 transition-all duration-200 shadow-lg"
              >
                Go to Login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
