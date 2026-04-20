"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/types/user";
import type { MentorProfile } from "@/types/mentor";
import type { UserRole } from "@/types/auth";
import type { StudentProfile } from "@/types/student";
import { IDEABRIDGE_STORAGE_KEYS } from "@/lib/constants";
import { supabaseClient } from "@/backend/config/supabaseClient";

type StoredUser = AuthUser;

type AuthContextValue = {
  user: StoredUser | null;
  isReady: boolean;
  login: (params: { email: string; password: string }) => Promise<StoredUser>;
  register: (params: { user: Omit<StoredUser, "id" | "user_id"> & { fullName: string } }) => Promise<void>;
  logout: () => void;
  updateStudentProfile: (profile: StudentProfile) => void;
  updateMentorProfile: (profile: MentorProfile & { fullName?: string; currentYear?: string; studentId?: string }) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function safeParseJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function makeId() {
  // crypto.randomUUID is supported in modern browsers; keep fallback for safety.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

const DEMO_USERS: StoredUser[] = [
  {
    user_id: "demo-student-auth",
    id: "demo-student",
    role: "student",
    fullName: "Demo Student",
    email: "student.demo@ideabridge.dev",
    password: "Demo@123",
    studentProfile: {
      bio: "Student demo profile for login and dashboard testing.",
      skills: ["React", "TypeScript"],
      studyYear: "3rd Year",
      faculty: "Computing",
      specialization: "Software Engineering",
      portfolioLinks: ["https://example.com/student-demo"],
      avatarUrl: "",
    },
  },
  {
    user_id: "demo-mentor-auth",
    id: "demo-mentor",
    role: "mentor",
    fullName: "Demo Mentor",
    email: "mentor.demo@ideabridge.dev",
    password: "Demo@123",
    mentorProfile: {
      bio: "Mentor demo profile for collaboration and guidance testing.",
      skills: ["System Design", "Node.js", "Databases"],
      availability: "Part-time",
      availabilityStatus: "Available in 1-2 days",
      yearsExperience: 6,
      linkedIn: "https://linkedin.com/in/demo-mentor",
      github: "https://github.com/demo-mentor",
      portfolioLinks: ["https://example.com/mentor-demo"],
      availabilityCalendarNote: "Demo slot for QA checks.",
      avatarUrl: "",
    },
    availabilityStatus: "Available in 1-2 days",
  },
];

function cloneUsers(users: StoredUser[]): StoredUser[] {
  return users.map((user) => ({
    ...user,
    studentProfile: user.studentProfile ? { ...user.studentProfile } : undefined,
    mentorProfile: user.mentorProfile
      ? {
          ...user.mentorProfile,
          skills: [...user.mentorProfile.skills],
          portfolioLinks: user.mentorProfile.portfolioLinks ? [...user.mentorProfile.portfolioLinks] : undefined,
        }
      : undefined,
  }));
}

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParseJSON<StoredUser[]>(localStorage.getItem(IDEABRIDGE_STORAGE_KEYS.users));
  return Array.isArray(parsed) ? parsed : [];
}

function setUsers(next: StoredUser[]) {
  localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.users, JSON.stringify(next));
}

function ensureSeedUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const existing = getUsers();
  if (existing.length > 0) return existing;

  const seeded = cloneUsers(DEMO_USERS);
  setUsers(seeded);
  return seeded;
}

function getAuthUserId(): StoredUser | null {
  const parsed = safeParseJSON<{ email: string }>(localStorage.getItem(IDEABRIDGE_STORAGE_KEYS.auth));
  if (!parsed?.email) return null;
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === parsed.email.toLowerCase()) ?? null;
}

async function getProfileByUserId(userId: string) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

async function ensureProfileRow(params: { userId: string; fullName: string; role: UserRole }) {
  const { userId, fullName, role } = params;
  const { data: existing, error: existingError } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }
  if (existing) {
    return existing;
  }

  const { error: profileError } = await supabaseClient.from("profiles").insert({
    user_id: userId,
    full_name: fullName,
    role,
  });
  if (profileError) {
    throw new Error("Profile creation failed: " + profileError.message);
  }

  return getProfileByUserId(userId);
}

function mapProfileToStoredUser(params: {
  profile: any;
  email: string;
  password?: string;
  fallback?: StoredUser | null;
}): StoredUser {
  const { profile, email, password = "", fallback = null } = params;
  const role: UserRole = (profile?.role === "mentor" ? "mentor" : "student") as UserRole;
  return {
    id: profile?.id ?? fallback?.id ?? makeId(),
    user_id: profile?.user_id ?? fallback?.user_id ?? "",
    role,
    fullName: profile?.full_name ?? fallback?.fullName ?? "",
    email,
    password: fallback?.password ?? password,
    studentProfile: fallback?.studentProfile,
    mentorProfile: fallback?.mentorProfile,
    availabilityStatus: fallback?.availabilityStatus,
    currentYear: fallback?.currentYear,
    studentId: fallback?.studentId,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ensureSeedUsers();
    // Load auth state from localStorage on first client render.
    const existing = getAuthUserId();
    setUser(existing);
    setIsReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      async login({ email, password }) {
        const users = ensureSeedUsers();
        const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!match) {
          throw new Error("No account found for this email.");
        }
        if (match.password !== password) {
          throw new Error("Invalid password.");
        }
        // Local fallback users are allowed when Supabase signup is rate-limited.
        if (match.user_id?.startsWith("local_")) {
          localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.auth, JSON.stringify({ email: match.email }));
          setUser(match);
          return match;
        }
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          throw new Error(authError.message);
        }
        const authUserId = authData.user?.id;
        if (!authUserId) {
          throw new Error("Could not resolve authenticated user.");
        }
        const profile = await getProfileByUserId(authUserId);
        const sessionUser = mapProfileToStoredUser({ profile, email: match.email, password, fallback: match });

        localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.auth, JSON.stringify({ email: sessionUser.email }));
        setUser(sessionUser);
        return sessionUser;
      },
      async register({ user: incoming }) {
        const users = ensureSeedUsers();
        const exists = users.some((u) => u.email.toLowerCase() === incoming.email.toLowerCase());
        if (exists) {
          throw new Error("An account with this email already exists.");
        }

        let authUserId: string | undefined;
        const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
          email: incoming.email,
          password: incoming.password,
          options: {
            data: {
              full_name: incoming.fullName,
              role: incoming.role,
            },
          },
        });
        if (signUpError) {
          const msg = signUpError.message.toLowerCase();
          const isRateLimited = msg.includes("rate limit");
          if (!isRateLimited) {
            throw new Error(signUpError.message);
          }
          // If signup emails are throttled, account may already exist.
          // Try signing in and continue with profile creation/fetch.
          const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: incoming.email,
            password: incoming.password,
          });
          if (signInError) {
            // Final fallback: allow local account creation so the app remains usable.
            const localUser: StoredUser = {
              ...incoming,
              id: makeId(),
              user_id: `local_${makeId()}`,
            };
            const nextUsers = [...users, localUser];
            setUsers(nextUsers);
            localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.auth, JSON.stringify({ email: localUser.email }));
            setUser(localUser);
            return;
          }
          authUserId = signInData.user?.id;
        } else {
          authUserId = signUpData.user?.id;
        }
        if (!authUserId) {
          throw new Error("Could not create authentication user.");
        }

        const profile = await ensureProfileRow({
          userId: authUserId,
          fullName: incoming.fullName,
          role: incoming.role,
        });

        const createdUser = mapProfileToStoredUser({
          profile,
          email: incoming.email,
          password: incoming.password,
          fallback: { ...incoming, id: profile?.id ?? makeId(), user_id: authUserId } as StoredUser,
        });
        const nextUsers = [...users, createdUser];
        setUsers(nextUsers);
        localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.auth, JSON.stringify({ email: createdUser.email }));
        setUser(createdUser);
      },
      async logout() {
        await supabaseClient.auth.signOut();
        setUser(null);
      },
      async updateStudentProfile(profile) {
        if (!user) return;
        const { error } = await supabaseClient
          .from("profiles")
          .update({
            ...profile,
            role: "student",
          })
          .eq("user_id", user.id);
        if (error) throw new Error(error.message);
        const updated = await getProfileByUserId(user.id);
        setUser(updated);
      },
      async updateMentorProfile(profileWithExtras) {
        if (!user) return;
        const { fullName, currentYear, studentId, ...mentorProfile } = profileWithExtras as any;
        const { error } = await supabaseClient
          .from("profiles")
          .update({
            ...mentorProfile,
            full_name: fullName ?? user.fullName,
            academic_year: currentYear ?? undefined,
            role: "mentor",
          })
          .eq("user_id", user.id);
        if (error) throw new Error(error.message);
        const updated = await getProfileByUserId(user.id);
        setUser(updated);
      },
    }),
    [user, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

