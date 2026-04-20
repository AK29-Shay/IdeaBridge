import type { UserRole, AvailabilityStatus } from "./auth";
import type { MentorProfile } from "./mentor";
import type { StudentProfile } from "./student";

export interface AuthUser {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  studentProfile?: StudentProfile;
  mentorProfile?: MentorProfile;
  availabilityStatus?: AvailabilityStatus;
}

