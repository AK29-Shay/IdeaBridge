import type { AvailabilityStatus } from "./auth";

export type MentorRegistrationAvailability = "Full-time" | "Part-time" | "Evenings";

export interface MentorProfile {
  bio: string;
  skills: string[];
  availability: MentorRegistrationAvailability;
  availabilityStatus: AvailabilityStatus;
  yearsExperience: number;
  linkedIn?: string;
  github?: string;
  portfolioLinks?: string[];
  availabilityCalendarNote?: string;
  avatarUrl?: string;
}

export interface Mentor {
  id: string;
  fullName: string;
  email: string;
  rating: number; // 0-5
  profile: MentorProfile;
}

