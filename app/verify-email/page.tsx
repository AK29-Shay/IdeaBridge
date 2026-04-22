"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [countdown, setCountdown] = React.useState(5);

  // Auto-redirect countdown
  React.useEffect(() => {
    if (countdown <= 0) {
      router.push("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-[#FFF8F3]" />
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#FFCBA4]/40 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#0F0F0F]/5 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F0F0F] shadow-md mb-4">
            <span className="text-[#0F0F0F] font-bold text-xl">IB</span>
          </div>
        </div>

        <div className="bg-white border border-[#FFCBA4]/30 rounded-2xl shadow-2xl p-8 text-center">
          {/* Animated success icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer ring animation */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-400/40">
                {/* Checkmark */}
                <svg
                  className="w-12 h-12 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Success message */}
          <h1 className="text-2xl font-bold text-[#0F0F0F] mb-2 leading-tight">
            Your email has been verified successfully ✅
          </h1>
          <p className="text-[#0F0F0F]/60 text-sm mb-6 leading-relaxed">
            Welcome to IdeaBridge! Your account is now active and ready to use.
            You can start exploring projects, connect with mentors, and build
            your portfolio.
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative flex items-center justify-center w-10 h-10">
              <svg className="absolute inset-0 w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="rgba(15,15,15,0.1)"
                  strokeWidth="2"
                />
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="2"
                  strokeDasharray={`${(countdown / 5) * 100.5} 100.5`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1s linear" }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-[#0F0F0F] font-bold text-sm">{countdown}</span>
            </div>
            <p className="text-[#0F0F0F]/50 text-sm">
              Redirecting to login…
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: "🎯", label: "Track Projects" },
              { icon: "🤝", label: "Find Mentors" },
              { icon: "📝", label: "Read Blogs" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-[#FFF8F3] border border-[#FFCBA4]/30"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-[#0F0F0F]/60 font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/login"
            id="verify-email-go-to-login"
            className="block w-full py-3 rounded-xl bg-[#0F0F0F] text-[#FFCBA4] font-semibold text-sm hover:brightness-125 transition-all duration-200 shadow-lg shadow-black/20 text-center"
          >
            Go to Login →
          </Link>

          <p className="mt-4 text-xs text-[#0F0F0F]/30">
            Didn&apos;t receive a verification email?{" "}
            <button
              type="button"
              className="text-[#F5A97F] hover:text-[#0F0F0F] transition-colors"
              onClick={() => alert("Verification email resent! (Demo)")}
            >
              Resend email
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
