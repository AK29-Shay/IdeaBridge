import type { AuthUser } from "@/types/user";
import type { Mentor } from "@/types/mentor";
import type { StudentProject } from "@/types/project";
import { IDEABRIDGE_STORAGE_KEYS } from "./constants";
import { DUMMY_STUDENT_PROJECTS } from "./dummyData";
import type { MentorProfile } from "@/types/mentor";
import type { StudentProfile } from "@/types/student";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const DEMO_PASSWORD = "Demo@123";

const DEMO_STUDENT_PROFILE: StudentProfile = {
  bio: "Student demo account for IdeaBridge offline mode.",
  skills: ["Next.js", "TypeScript", "Supabase"],
  studyYear: "3rd Year",
  faculty: "Computing",
  specialization: "Software Engineering",
  portfolioLinks: [],
  avatarUrl: "",
};

const DEMO_MENTOR_PROFILE: MentorProfile = {
  bio: "Mentor demo account for IdeaBridge offline mode.",
  skills: ["React", "Next.js", "System Design", "UI/UX"],
  availability: "Part-time",
  availabilityStatus: "Available in 1-2 days",
  yearsExperience: 7,
  linkedIn: "https://linkedin.com/in/ideabridge-demo-mentor",
  github: "https://github.com/ideabridge-demo-mentor",
  portfolioLinks: [],
  availabilityCalendarNote: "Available for guided demo sessions.",
  avatarUrl: "",
};

const DEMO_USERS: AuthUser[] = [
  {
    id: "demo-student",
    role: "student",
    fullName: "Student Demo",
    email: "student.demo@ideabridge.dev",
    studentProfile: DEMO_STUDENT_PROFILE,
  },
  {
    id: "demo-mentor",
    role: "mentor",
    fullName: "Mentor Demo",
    email: "mentor.demo@ideabridge.dev",
    mentorProfile: DEMO_MENTOR_PROFILE,
    availabilityStatus: DEMO_MENTOR_PROFILE.availabilityStatus,
  },
] as const;

type OfflineCredentialRecord = {
  email: string;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mergeUsers(users: AuthUser[]) {
  const map = new Map<string, AuthUser>();
  for (const user of users) {
    map.set(normalizeEmail(user.email), user);
  }

  return [...map.values()];
}

export function getStoredUsers(): AuthUser[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<AuthUser[]>(localStorage.getItem(IDEABRIDGE_STORAGE_KEYS.users));
  const stored = Array.isArray(parsed) ? parsed : [];
  return mergeUsers([...DEMO_USERS, ...stored]);
}

function setStoredUsers(users: AuthUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.users, JSON.stringify(mergeUsers(users)));
}

function getStoredOfflineCredentials(): OfflineCredentialRecord[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<OfflineCredentialRecord[]>(
    localStorage.getItem(IDEABRIDGE_STORAGE_KEYS.offlineCredentials)
  );
  return Array.isArray(parsed) ? parsed : [];
}

function setStoredOfflineCredentials(records: OfflineCredentialRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.offlineCredentials, JSON.stringify(records));
}

export function getOfflineAuthUser(email: string, password: string): AuthUser | null {
  const normalizedEmail = normalizeEmail(email);

  if (password !== DEMO_PASSWORD) {
    const savedCredential = getStoredOfflineCredentials().find(
      (entry) => normalizeEmail(entry.email) === normalizedEmail && entry.password === password
    );
    if (!savedCredential) {
      return null;
    }

    return getStoredUsers().find((user) => normalizeEmail(user.email) === normalizedEmail) ?? null;
  }

  return DEMO_USERS.find((user) => normalizeEmail(user.email) === normalizedEmail) ?? null;
}

export function saveOfflineCredential(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const current = getStoredOfflineCredentials().filter(
    (entry) => normalizeEmail(entry.email) !== normalizedEmail
  );
  current.push({
    email: normalizedEmail,
    password,
  });
  setStoredOfflineCredentials(current);
}

export function hasStoredUserWithEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return getStoredUsers().some((user) => normalizeEmail(user.email) === normalizedEmail);
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const parsed = safeParse<AuthUser | string>(localStorage.getItem(IDEABRIDGE_STORAGE_KEYS.auth));

  if (!parsed) {
    return null;
  }

  if (typeof parsed === "string") {
    return getStoredUsers().find((user) => normalizeEmail(user.email) === normalizeEmail(parsed)) ?? null;
  }

  if (typeof parsed === "object" && typeof parsed.email === "string") {
    return getStoredUsers().find((user) => normalizeEmail(user.email) === normalizeEmail(parsed.email)) ?? parsed;
  }

  return null;
}

export function setStoredAuthUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  upsertStoredUser(user);
  localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.auth, JSON.stringify(user));
}

export function clearStoredAuthUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(IDEABRIDGE_STORAGE_KEYS.auth);
}

export function upsertStoredUser(user: AuthUser) {
  const nextUsers = mergeUsers([user, ...getStoredUsers().filter((entry) => normalizeEmail(entry.email) !== normalizeEmail(user.email))]);
  setStoredUsers(nextUsers);
}

export function updateStoredUserProfile(user: AuthUser) {
  upsertStoredUser(user);
  const active = getStoredAuthUser();
  if (active && normalizeEmail(active.email) === normalizeEmail(user.email)) {
    localStorage.setItem(IDEABRIDGE_STORAGE_KEYS.auth, JSON.stringify(user));
  }
}

export function getStoredMentors(): Mentor[] {
  const users = getStoredUsers();
  return users
    .filter((u) => u.role === "mentor" && u.mentorProfile)
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      rating: 4.5,
      profile: u.mentorProfile!,
    }));
}

export function getProjectsForUser(email: string): StudentProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${IDEABRIDGE_STORAGE_KEYS.projects}_${email.toLowerCase()}`);
    if (!raw) {
      // Seed with sample projects for first-time users
      const defaults = DUMMY_STUDENT_PROJECTS.map((p) => ({ ...p }));
      localStorage.setItem(`${IDEABRIDGE_STORAGE_KEYS.projects}_${email.toLowerCase()}`, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StudentProject[];
  } catch {
    return [];
  }
}

export function setProjectsForUser(email: string, projects: StudentProject[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${IDEABRIDGE_STORAGE_KEYS.projects}_${email.toLowerCase()}`, JSON.stringify(projects));
}
