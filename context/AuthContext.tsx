"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/types/user";
import type { MentorProfile } from "@/types/mentor";
import type { UserRole } from "@/types/auth";
import type { StudentProfile } from "@/types/student";
import { IDEABRIDGE_STORAGE_KEYS } from "@/lib/constants";

type StoredUser = AuthUser;

type AuthContextValue = {
  user: StoredUser | null;
  isReady: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { user: Omit<StoredUser, "id"> & { fullName: string } }) => Promise<void>;
  logout: () => void;
  updateStudentProfile: (profile: StudentProfile) => void;
  updateMentorProfile: (profile: MentorProfile) => void;
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

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParseJSON<StoredUser[]>(localStorage.getItem(IDEABRIDGE_STORAGE_KEYS.users));
  return Array.isArray(parsed) ? parsed : [];
}

function setUsers(next: StoredUser[]) {
  localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.users, JSON.stringify(next));
}

function getAuthUserId(): StoredUser | null {
  const parsed = safeParseJSON<{ email: string }>(localStorage.getItem(IDEABRIDGE_STORAGE_KEYS.auth));
  if (!parsed?.email) return null;
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === parsed.email.toLowerCase()) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
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
        const users = getUsers();
        const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!match) {
          throw new Error("No account found for this email.");
        }
        if (match.password !== password) {
          throw new Error("Incorrect password.");
        }

        localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.auth, JSON.stringify({ email: match.email }));
        setUser(match);
      },
      async register({ user: incoming }) {
        const users = getUsers();
        const exists = users.some((u) => u.email.toLowerCase() === incoming.email.toLowerCase());
        if (exists) {
          throw new Error("An account with this email already exists.");
        }

        const newUser: StoredUser = {
          ...incoming,
          id: makeId(),
        };

        setUsers([...users, newUser]);
        localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.auth, JSON.stringify({ email: newUser.email }));
        setUser(newUser);
      },
      logout() {
        localStorage.removeItem(IDEABRIDGE_STORAGE_KEYS.auth);
        setUser(null);
      },
      updateStudentProfile(profile) {
        if (!user) return;
        const updated: StoredUser = {
          ...user,
          role: "student",
          studentProfile: profile,
          mentorProfile: user.mentorProfile,
        };
        const users = getUsers().map((u) => (u.id === updated.id ? updated : u));
        setUsers(users);
        setUser(updated);
      },
      updateMentorProfile(profile) {
        if (!user) return;
        const updated: StoredUser = {
          ...user,
          role: "mentor",
          mentorProfile: profile,
          availabilityStatus: profile.availabilityStatus,
          studentProfile: user.studentProfile,
        };
        const users = getUsers().map((u) => (u.id === updated.id ? updated : u));
        setUsers(users);
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

