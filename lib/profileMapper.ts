import type { AvailabilityStatus, UserRole } from "@/types/auth";
import type { MentorProfile } from "@/types/mentor";
import type { StudentProfile } from "@/types/student";
import type { AuthUser } from "@/types/user";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  availability: string | null;
  role: string | null;
  study_year?: string | null;
  faculty?: string | null;
  specialization?: string | null;
  portfolio_links?: string[] | null;
  availability_status?: string | null;
  years_experience?: number | null;
  linked_in?: string | null;
  github_url?: string | null;
  availability_calendar_note?: string | null;
};

const DEFAULT_AVAILABILITY_STATUS: AvailabilityStatus = "Available in 1-2 days";
const LEGACY_SCHEMA_FIELDS = [
  "study_year",
  "faculty",
  "specialization",
  "portfolio_links",
  "availability_status",
  "years_experience",
  "linked_in",
  "github_url",
  "availability_calendar_note",
] as const;

export const FULL_PROFILE_SELECT = [
  "id",
  "full_name",
  "avatar_url",
  "bio",
  "skills",
  "availability",
  "role",
  "study_year",
  "faculty",
  "specialization",
  "portfolio_links",
  "availability_status",
  "years_experience",
  "linked_in",
  "github_url",
  "availability_calendar_note",
].join(",");

export const LEGACY_PROFILE_SELECT = [
  "id",
  "full_name",
  "avatar_url",
  "bio",
  "skills",
  "availability",
  "role",
].join(",");

export function normalizeRole(value: unknown): UserRole {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "admin") return "admin";
  return raw === "mentor" ? "mentor" : "student";
}

export function normalizeAvailabilityStatus(value: unknown): AvailabilityStatus {
  if (
    value === "Available Now" ||
    value === "Available in 1-2 days" ||
    value === "Busy" ||
    value === "On Leave"
  ) {
    return value;
  }

  return DEFAULT_AVAILABILITY_STATUS;
}

export function isLegacyProfilesSchemaError(message: unknown) {
  if (typeof message !== "string") return false;

  const lower = message.toLowerCase();
  if (!lower.includes("profile")) return false;

  return LEGACY_SCHEMA_FIELDS.some((field) => lower.includes(field));
}

export function normalizeProfileRow(profile: Partial<ProfileRow> & Pick<ProfileRow, "id">): ProfileRow {
  return {
    id: profile.id,
    full_name: profile.full_name ?? null,
    avatar_url: profile.avatar_url ?? null,
    bio: profile.bio ?? null,
    skills: profile.skills ?? [],
    availability: profile.availability ?? null,
    role: profile.role ?? null,
    study_year: profile.study_year ?? null,
    faculty: profile.faculty ?? null,
    specialization: profile.specialization ?? null,
    portfolio_links: profile.portfolio_links ?? [],
    availability_status: profile.availability_status ?? null,
    years_experience: profile.years_experience ?? null,
    linked_in: profile.linked_in ?? null,
    github_url: profile.github_url ?? null,
    availability_calendar_note: profile.availability_calendar_note ?? null,
  };
}

export function buildStudentProfile(profile: ProfileRow): StudentProfile {
  return {
    bio: profile.bio ?? "",
    skills: profile.skills ?? [],
    studyYear: profile.study_year ?? undefined,
    faculty: profile.faculty ?? undefined,
    specialization: profile.specialization ?? undefined,
    portfolioLinks: profile.portfolio_links ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
  };
}

export function buildMentorProfile(profile: ProfileRow): MentorProfile {
  return {
    bio: profile.bio ?? "",
    skills: profile.skills ?? [],
    availability:
      profile.availability === "Part-time" || profile.availability === "Evenings"
        ? profile.availability
        : "Full-time",
    availabilityStatus: normalizeAvailabilityStatus(profile.availability_status),
    yearsExperience: profile.years_experience ?? 0,
    linkedIn: profile.linked_in ?? undefined,
    github: profile.github_url ?? undefined,
    portfolioLinks: profile.portfolio_links ?? undefined,
    availabilityCalendarNote: profile.availability_calendar_note ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
  };
}

export function mapProfileRowToAuthUser(params: {
  profile: ProfileRow;
  email: string;
  fallbackFullName?: string | null;
  fallbackRole?: string | null;
}): AuthUser {
  const role =
    params.fallbackRole === "admin"
      ? "admin"
      : normalizeRole(params.profile.role ?? params.fallbackRole);
  const fullName = params.profile.full_name ?? params.fallbackFullName ?? params.email.split("@")[0] ?? "Member";

  return {
    id: params.profile.id,
    role,
    fullName,
    email: params.email,
    studentProfile: role === "student" ? buildStudentProfile(params.profile) : undefined,
    mentorProfile: role === "mentor" ? buildMentorProfile(params.profile) : undefined,
    availabilityStatus:
      role === "mentor" ? normalizeAvailabilityStatus(params.profile.availability_status) : undefined,
  };
}

export function buildProfileUpsertPayload(params: {
  id: string;
  fullName: string;
  role: UserRole;
  studentProfile?: StudentProfile;
  mentorProfile?: MentorProfile;
}) {
  const isMentor = params.role === "mentor";
  const isAdmin = params.role === "admin";
  const activeProfile = isMentor
    ? params.mentorProfile
    : isAdmin
    ? undefined
    : params.studentProfile;

  return {
    id: params.id,
    full_name: params.fullName,
    avatar_url: activeProfile?.avatarUrl ?? null,
    bio: activeProfile?.bio ?? null,
    skills: activeProfile?.skills ?? [],
    availability: isMentor ? params.mentorProfile?.availability ?? null : null,
    role: isAdmin ? "Admin" : isMentor ? "Mentor" : "Student",
    study_year: !isMentor && !isAdmin ? params.studentProfile?.studyYear ?? null : null,
    faculty: !isMentor && !isAdmin ? params.studentProfile?.faculty ?? null : null,
    specialization: !isMentor && !isAdmin ? params.studentProfile?.specialization ?? null : null,
    portfolio_links: activeProfile?.portfolioLinks ?? [],
    availability_status: isMentor ? params.mentorProfile?.availabilityStatus ?? DEFAULT_AVAILABILITY_STATUS : null,
    years_experience: isMentor ? params.mentorProfile?.yearsExperience ?? 0 : null,
    linked_in: isMentor ? params.mentorProfile?.linkedIn ?? null : null,
    github_url: isMentor ? params.mentorProfile?.github ?? null : null,
    availability_calendar_note: isMentor
      ? params.mentorProfile?.availabilityCalendarNote ?? null
      : null,
  };
}

export function buildLegacyProfileUpsertPayload(
  payload: ReturnType<typeof buildProfileUpsertPayload>
) {
  return {
    id: payload.id,
    full_name: payload.full_name,
    avatar_url: payload.avatar_url,
    bio: payload.bio,
    skills: payload.skills,
    availability: payload.availability,
    role: payload.role,
  };
}
