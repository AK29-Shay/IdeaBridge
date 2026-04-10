"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IDEABRIDGE_STORAGE_KEYS } from "@/lib/constants";

const DEV_MENTOR = {
  id: "dev-mentor-1",
  role: "mentor",
  fullName: "Dev Mentor",
  email: "mentor@local.test",
  password: "password",
  mentorProfile: {
    bio: "Experienced mentor for student projects.",
    skills: ["React", "Node.js"],
    availability: "Part-time",
    availabilityStatus: "Available Now",
    yearsExperience: 5,
    linkedIn: "",
    github: "",
    avatarUrl: "",
  },
  currentYear: "Alumni",
  studentId: "S-DEV-001",
  availabilityStatus: "Available Now",
};

const DEV_STUDENT = {
  id: "dev-student-1",
  role: "student",
  fullName: "Dev Student",
  email: "student@local.test",
  password: "password",
  studentProfile: {
    bio: "Curious learner building projects.",
    skills: ["HTML", "CSS"],
    portfolioLinks: [],
    avatarUrl: "",
  },
  currentYear: "Year 2",
  studentId: "S-DEV-002",
};

export default function DevSeedPage() {
  const router = useRouter();

  function seedAndRedirect(kind: "mentor" | "student") {
    if (typeof window === "undefined") return;
    try {
      const usersKey = IDEABRIDGE_STORAGE_KEYS.users;
      const authKey = IDEABRIDGE_STORAGE_KEYS.auth;
      const users = JSON.parse(localStorage.getItem(usersKey) || "[]");
      const payload = kind === "mentor" ? DEV_MENTOR : DEV_STUDENT;
      const exists = users.some((u: any) => u.email === payload.email);
      if (!exists) users.push(payload);
      localStorage.setItem(usersKey, JSON.stringify(users));
      localStorage.setItem(authKey, JSON.stringify({ email: payload.email }));
      // redirect to appropriate dashboard
      router.replace(kind === "mentor" ? "/dashboard/mentor" : "/dashboard/student");
    } catch (err) {
      console.error("Dev seed failed:", err);
    }
  }

  useEffect(() => {
    // Only auto-seed in development
    if (process.env.NODE_ENV === "development") {
      // don't auto-redirect; offer controls so developer can choose student vs mentor
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Dev Seed</h1>
        <p className="mt-2 text-sm text-slate-600">
          This page creates a local test mentor account in localStorage and redirects to the mentor
          dashboard. It's intended for local development only.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => seedAndRedirect("mentor")}
            className="rounded-xl bg-[#0F0F0F] px-4 py-2 text-sm font-semibold text-[#FFCBA4]"
          >
            Seed Dev Mentor and Open Mentor Dashboard
          </button>
          <button
            onClick={() => seedAndRedirect("student")}
            className="rounded-xl bg-[#0F0F0F] px-4 py-2 text-sm font-semibold text-[#FFCBA4]"
          >
            Seed Dev Student and Open Student Dashboard
          </button>
          <button
            onClick={() => router.replace("/")}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
