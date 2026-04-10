"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Mail, Lock, Eye, EyeOff } from "@/components/ui/icons";

import { loginSchema } from "@/lib/zod/authSchemas";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginInput = z.infer<typeof loginSchema>;

type StoredUser = {
  id: string;
  role: "student" | "mentor";
  fullName: string;
  email: string;
  password: string;
  studentProfile?: Record<string, unknown>;
  mentorProfile?: Record<string, unknown>;
};

function getUsersFromStorage(): StoredUser[] {
  try {
    const raw = localStorage.getItem("ideabridge_users_v1");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
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

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  async function handleSubmit(values: LoginInput) {
    setIsLoading(true);
    try {
      await login({ email: values.email, password: values.password });

      const redirectTo =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next") ?? ""
          : "";

      const users = getUsersFromStorage();
      const match = users.find(
        (u) => u.email.toLowerCase() === values.email.toLowerCase()
      );
      const nextRole = match?.role ?? user?.role;
      if (!nextRole) throw new Error("Unable to determine your role.");

      toast.success("Welcome back to IdeaBridge! 🚀");
      router.push(
        redirectTo ||
          (nextRole === "student" ? "/dashboard/student" : "/dashboard/mentor")
      );
    } catch (rawError: unknown) {
      const message =
        rawError instanceof Error ? rawError.message : "Login failed.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }



  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-[#FFF8F3]" />

      {/* Decorative blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#FFCBA4]/40 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#0F0F0F]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFCBA4] shadow-md mb-4">
            <span className="text-[#0F0F0F] font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>IB</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F0F0F] tracking-tight">
            Welcome back
          </h1>
          <p className="text-[#0F0F0F]/60 mt-1.5 text-sm">
            Sign in to your IdeaBridge account
          </p>
        </div>


        {/* Card */}
        <div className="bg-white border border-[#FFCBA4]/30 rounded-2xl shadow-2xl p-6">
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Email */}
            <div>
              <Label
                htmlFor="login-email"
                className="text-[#0F0F0F]/80 text-sm font-medium mb-1.5 block"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/40" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@university.edu"
                  {...form.register("email")}
                  className="pl-9 bg-white/10 border-white/20 text-[#0F0F0F] placeholder:text-[#0F0F0F]/30 rounded-lg focus:border-[#FFCBA4] focus:ring-2 focus:ring-[#FFCBA4]/30 h-11"
                />
              </div>
              <ErrorMsg msg={form.formState.errors.email?.message} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label
                  htmlFor="login-password"
                  className="text-[#0F0F0F]/80 text-sm font-medium"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#C7792F] hover:text-[#0F0F0F] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F0F0F]/40" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  {...form.register("password")}
                  className="pl-9 pr-10 bg-white/10 border-white/20 text-[#0F0F0F] placeholder:text-[#0F0F0F]/30 rounded-lg focus:border-[#FFCBA4] focus:ring-2 focus:ring-[#FFCBA4]/30 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]/40 hover:text-[#0F0F0F]/80 transition-colors"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <ErrorMsg msg={form.formState.errors.password?.message} />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
              <input
                id="rememberMe"
                type="checkbox"
                {...form.register("rememberMe")}
                className="h-4 w-4 rounded border-white/30 bg-white/10 text-[#0F0F0F] focus:ring-[#0F0F0F]/40 cursor-pointer"
              />
              <Label
                htmlFor="rememberMe"
                className="text-[#0F0F0F]/60 text-sm font-normal cursor-pointer"
              >
                Remember me 
              </Label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#0F0F0F] text-[#FFCBA4] font-semibold text-sm hover:brightness-125 transition-all duration-200 shadow-lg shadow-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[#0F0F0F]/50">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#C7792F] hover:text-[#0F0F0F] font-medium transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
