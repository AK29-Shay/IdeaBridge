import type { UserRole, AvailabilityStatus } from "./auth";
import type { MentorProfile } from "./mentor";
import type { StudentProfile } from "./student";

export interface AuthUser {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  password: string; // dummy-only: stored in localStorage for simulation
  studentProfile?: StudentProfile;
  mentorProfile?: MentorProfile;
  // Mentor profile fields are stored in mentorProfile for mentor accounts
  availabilityStatus?: AvailabilityStatus; // kept for quick access when needed
}

