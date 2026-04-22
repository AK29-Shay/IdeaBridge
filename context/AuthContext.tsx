"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";

import type { UserRole } from "@/types/auth";
import type { MentorProfile } from "@/types/mentor";
import type { StudentProfile } from "@/types/student";
import type { AuthUser } from "@/types/user";
import {
  buildLegacyProfileUpsertPayload,
  buildProfileUpsertPayload,
  FULL_PROFILE_SELECT,
  isLegacyProfilesSchemaError,
  LEGACY_PROFILE_SELECT,
  mapProfileRowToAuthUser,
  normalizeRole,
  normalizeProfileRow,
  type ProfileRow,
} from "@/lib/profileMapper";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type RegisterUserInput = {
  role: UserRole;
  fullName: string;
  email: string;
  password: string;
  studentProfile?: StudentProfile;
  mentorProfile?: MentorProfile;
};

type AuthContextValue = {
  user: AuthUser | null;
  session: Session | null;
  isReady: boolean;
  login: (params: { email: string; password: string }) => Promise<AuthUser>;
  register: (params: { user: RegisterUserInput }) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  updateStudentProfile: (profile: StudentProfile) => Promise<AuthUser | null>;
  updateMentorProfile: (profile: MentorProfile) => Promise<AuthUser | null>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function selectProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(FULL_PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (!error) {
    return data ? normalizeProfileRow(data as ProfileRow) : null;
  }

  if (!isLegacyProfilesSchemaError(error.message)) {
    throw new Error(error.message || "Failed to load your profile.");
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("profiles")
    .select(LEGACY_PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (legacyError) {
    throw new Error(legacyError.message || "Failed to load your profile.");
  }

  return legacyData ? normalizeProfileRow(legacyData as ProfileRow) : null;
}

async function upsertProfile(params: {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  studentProfile?: StudentProfile;
  mentorProfile?: MentorProfile;
}) {
  const supabase = getSupabaseBrowserClient();
  const payload = buildProfileUpsertPayload(params);
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload as never, { onConflict: "id" })
    .select(FULL_PROFILE_SELECT)
    .single();

  if (!error) {
    return mapProfileRowToAuthUser({
      profile: normalizeProfileRow(data as ProfileRow),
      email: params.email,
      fallbackFullName: params.fullName,
      fallbackRole: params.role,
    });
  }

  if (!isLegacyProfilesSchemaError(error.message)) {
    throw new Error(error.message || "Failed to save your profile.");
  }

  const legacyPayload = buildLegacyProfileUpsertPayload(payload);
  const { data: legacyData, error: legacyError } = await supabase
    .from("profiles")
    .upsert(legacyPayload as never, { onConflict: "id" })
    .select(LEGACY_PROFILE_SELECT)
    .single();

  if (legacyError) {
    throw new Error(legacyError.message || "Failed to save your profile.");
  }

  return mapProfileRowToAuthUser({
    profile: normalizeProfileRow(legacyData as ProfileRow),
    email: params.email,
    fallbackFullName: params.fullName,
    fallbackRole: params.role,
  });
}

async function loadAuthUserFromSession(sessionUser: User): Promise<AuthUser> {
  const email = sessionUser.email ?? "";
  const fallbackFullName =
    typeof sessionUser.user_metadata?.full_name === "string"
      ? sessionUser.user_metadata.full_name
      : email.split("@")[0] ?? "Member";
  const fallbackRole = normalizeRole(sessionUser.user_metadata?.role);

  const existing = await selectProfile(sessionUser.id);
  if (existing) {
    return mapProfileRowToAuthUser({
      profile: existing,
      email,
      fallbackFullName,
      fallbackRole,
    });
  }

  return upsertProfile({
    id: sessionUser.id,
    email,
    fullName: fallbackFullName,
    role: fallbackRole,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  const loadSessionUser = React.useCallback(async (sessionUser: User | null) => {
    if (!sessionUser) {
      React.startTransition(() => {
        setUser(null);
      });
      return null;
    }

    const nextUser = await loadAuthUserFromSession(sessionUser);
    React.startTransition(() => {
      setUser(nextUser);
    });
    return nextUser;
  }, []);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    async function initialize() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        await loadSessionUser(initialSession?.user ?? null);

        if (cancelled) return;

        React.startTransition(() => {
          setSession(initialSession);
          setIsReady(true);
        });
      } catch {
        if (cancelled) return;
        React.startTransition(() => {
          setSession(null);
          setUser(null);
          setIsReady(true);
        });
      }
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      React.startTransition(() => {
        setSession(nextSession);
      });
      void (async () => {
        try {
          await loadSessionUser(nextSession?.user ?? null);
        } finally {
          if (cancelled) return;
          React.startTransition(() => {
            setIsReady(true);
          });
        }
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadSessionUser]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isReady,
      async login({ email, password }) {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          throw new Error(error?.message || "Login failed.");
        }

        React.startTransition(() => {
          setSession(data.session);
        });

        return loadSessionUser(data.user).then((nextUser) => {
          if (!nextUser) {
            throw new Error("Unable to load your profile.");
          }
          return nextUser;
        });
      },
      async register({ user: incoming }) {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signUp({
          email: incoming.email,
          password: incoming.password,
          options: {
            data: {
              full_name: incoming.fullName,
              role: incoming.role,
            },
          },
        });

        if (error || !data.user) {
          throw new Error(error?.message || "Registration failed.");
        }

        if (data.session) {
          React.startTransition(() => {
            setSession(data.session);
          });
          const registeredUser = await upsertProfile({
            id: data.user.id,
            email: incoming.email,
            fullName: incoming.fullName,
            role: incoming.role,
            studentProfile: incoming.studentProfile,
            mentorProfile: incoming.mentorProfile,
          });

          React.startTransition(() => {
            setUser(registeredUser);
          });
          return registeredUser;
        }

        React.startTransition(() => {
          setUser(null);
        });
        return null;
      },
      async logout() {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw new Error(error.message || "Failed to sign out.");
        }

        React.startTransition(() => {
          setSession(null);
          setUser(null);
        });
      },
      async refreshUser() {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();
        return loadSessionUser(sessionUser);
      },
      async updateStudentProfile(profile) {
        if (!user) return null;
        const updated = await upsertProfile({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: "student",
          studentProfile: profile,
        });

        React.startTransition(() => {
          setUser(updated);
        });
        return updated;
      },
      async updateMentorProfile(profile) {
        if (!user) return null;
        const updated = await upsertProfile({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: "mentor",
          mentorProfile: profile,
        });

        React.startTransition(() => {
          setUser(updated);
        });
        return updated;
      },
    }),
    [user, session, isReady, loadSessionUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
