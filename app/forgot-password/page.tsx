"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Mail } from "@/components/ui/icons";

import { forgotPasswordSchema } from "@/lib/zod/authSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotInput = z.infer<typeof forgotPasswordSchema>;

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
      <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
      {msg}
    </p>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [sent, setSent] = React.useState(false);
  const [sentEmail, setSentEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ForgotInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotInput) {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setSentEmail(values.email);
      setSent(true);
      setIsLoading(false);
      toast.success("Password reset link sent!");
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
            Forgot password?
          </h1>
          <p className="text-[#0F0F0F]/60 mt-1.5 text-sm">
            No worries — we&apos;ll send you reset instructions
          </p>
        </div>

        <div className="bg-white border border-[#FFCBA4]/30 rounded-2xl shadow-2xl p-6 md:p-8">
          {!sent ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label
                  htmlFor="forgot-email"
                  className="text-[#0F0F0F]/80 text-sm font-medium mb-1.5 block"
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/40" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@university.edu"
                    {...form.register("email")}
                    className="pl-9 bg-white/10 border-white/20 text-[#0F0F0F] placeholder:text-[#0F0F0F]/30 rounded-lg focus:border-[#FFCBA4] focus:ring-2 focus:ring-[#FFCBA4]/30 h-11"
                  />
                </div>
                <ErrorMsg msg={form.formState.errors.email?.message} />
              </div>

              <button
                type="submit"
                id="forgot-password-submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#0F0F0F] text-[#FFCBA4] font-semibold text-sm hover:brightness-125 transition-all duration-200 shadow-lg shadow-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Send Reset Link →"
                )}
              </button>

              <p className="text-center text-sm text-[#0F0F0F]/50">
                Remembered it?{" "}
                <Link
                  href="/login"
                  className="text-[#F5A97F] hover:text-[#0F0F0F] font-medium transition-colors"
                >
                  Back to login
                </Link>
              </p>
            </form>
          ) : (
            /* Success state */
            <div className="text-center space-y-5 py-4 animate-fade-up">
              {/* Animated checkmark */}
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                  <span className="text-4xl">📧</span>
                  <div className="absolute -top-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 border-2 border-white">
                    <svg
                      className="w-3.5 h-3.5 text-[#0F0F0F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0F0F0F]">Check your inbox!</h2>
                <p className="mt-2 text-[#0F0F0F]/60 text-sm leading-relaxed">
                  Password reset link sent to
                </p>
                <p className="mt-1 text-[#F5A97F] font-semibold text-sm break-all">
                  {sentEmail}
                </p>
              </div>

              <div className="bg-[#FFF8F3] border border-[#FFCBA4]/30 rounded-xl p-3.5 text-left space-y-1.5">
                <p className="text-xs text-[#0F0F0F]/60 font-medium">Next steps:</p>
                <ul className="space-y-1">
                  {[
                    "Check your email inbox (and spam folder)",
                    "Click the reset link in the email",
                    "Create your new strong password",
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[#0F0F0F]/50">
                      <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-[#FFCBA4]/20 text-[#F5A97F] font-bold text-[9px]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Simulate clicking the link — goes to reset page */}
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/reset-password/demo-reset-token?email=${encodeURIComponent(sentEmail)}`
                  )
                }
                className="w-full py-3 rounded-xl bg-[#0F0F0F] text-[#FFCBA4] font-semibold text-sm hover:brightness-125 transition-all duration-200 shadow-lg shadow-black/20"
              >
                Open Reset Link (Demo)
              </button>

              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-sm text-[#0F0F0F]/40 hover:text-[#0F0F0F]/70 transition-colors"
              >
                ← Try a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
