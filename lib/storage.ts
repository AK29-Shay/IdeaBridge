import type { AuthUser } from "@/types/user";
import type { Mentor } from "@/types/mentor";
import type { StudentProject } from "@/types/project";
import { IDEABRIDGE_STORAGE_KEYS } from "./constants";
import { DUMMY_STUDENT_PROJECTS } from "./dummyData";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getStoredUsers(): AuthUser[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<AuthUser[]>(localStorage.getItem(IDEABRIDGE_STORAGE_KEYS.users));
  return Array.isArray(parsed) ? parsed : [];
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
