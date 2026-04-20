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
  study_year: string | null;
  faculty: string | null;
  specialization: string | null;
  portfolio_links: string[] | null;
  availability_status: string | null;
  years_experience: number | null;
  linked_in: string | null;
  github_url: string | null;
  availability_calendar_note: string | null;
};

const DEFAULT_AVAILABILITY_STATUS: AvailabilityStatus = "Available in 1-2 days";

export function normalizeRole(value: unknown): UserRole {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
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
  const role = normalizeRole(params.profile.role ?? params.fallbackRole);
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
  const activeProfile = isMentor ? params.mentorProfile : params.studentProfile;

  return {
    id: params.id,
    full_name: params.fullName,
    avatar_url: activeProfile?.avatarUrl ?? null,
    bio: activeProfile?.bio ?? null,
    skills: activeProfile?.skills ?? [],
    availability: isMentor ? params.mentorProfile?.availability ?? null : null,
    role: isMentor ? "Mentor" : "Student",
    study_year: !isMentor ? params.studentProfile?.studyYear ?? null : null,
    faculty: !isMentor ? params.studentProfile?.faculty ?? null : null,
    specialization: !isMentor ? params.studentProfile?.specialization ?? null : null,
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
