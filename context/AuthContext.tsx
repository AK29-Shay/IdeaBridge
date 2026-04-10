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
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { user: Omit<StoredUser, "id"> & { fullName: string } }) => Promise<void>;
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

// Supabase-based auth helpers
// Supabase-based auth helpers
async function getProfileByUserId(user_id: string) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("user_id", user_id)
    .single();
  console.log("[AuthContext] Profile fetch result (helper):", data);
  console.log("[AuthContext] Profile fetch error (helper):", error);
  if (error) return null;
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load auth state from Supabase session on first client render.
    const session = supabaseClient.auth.getSession();
    session.then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getProfileByUserId(session.user.id);
        setUser(profile);
      }
      setIsReady(true);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      async login({ email, password }) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        console.log("[AuthContext] Login response:", { data, error });
        if (error || !data.user) {
          throw new Error(error?.message || "Login failed");
        }
        // Fetch profile by user_id
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .single();
        console.log("[AuthContext] Profile fetch result (login):", profile);
        console.log("[AuthContext] Profile fetch error (login):", profileError);
        if (profileError || !profile) {
          throw new Error("Could not fetch user profile/role");
        }
        setUser(profile);
      },
      async register({ user: incoming }) {
        // Register with Supabase Auth
        const { data, error } = await supabaseClient.auth.signUp({
          email: incoming.email,
          password: incoming.password,
        });
        console.log("[AuthContext] Register response:", { data, error });
        if (error || !data.user) {
          throw new Error(error?.message || "Registration failed");
        }
        // Insert profile row (basic fields only, no email column)
        const { error: profileError } = await supabaseClient.from("profiles").insert({
          user_id: data.user.id, // foreign key to auth.users.id
          full_name: incoming.fullName,
          role: incoming.role,
        });
        console.log("[AuthContext] Profile insert result (register):", { profileError });
        if (profileError) {
          throw new Error("Profile creation failed: " + profileError.message);
        }
        // Fetch and set user profile
        const { data: profile, error: fetchError } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .single();
        console.log("[AuthContext] Profile fetch result (register):", profile);
        console.log("[AuthContext] Profile fetch error (register):", fetchError);
        if (fetchError || !profile) {
          throw new Error("Could not fetch user profile/role after registration");
        }
        setUser(profile);
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

