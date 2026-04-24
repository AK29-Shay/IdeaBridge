import type { AvailabilityStatus } from "@/types/auth";
import type { StudentProject } from "@/types/project";

export const IDEABRIDGE_STORAGE_KEYS = {
  users: "ideabridge_users_v1",
  auth: "ideabridge_auth_v1",
  projects: "ideabridge_projects_v1",
  offlineCredentials: "ideabridge_offline_credentials_v1",
} as const;

const availabilityColorMap: Record<AvailabilityStatus, "green" | "yellow" | "red"> = {
  "Available Now": "green",
  "Available in 1-2 days": "yellow",
  Busy: "red",
  "On Leave": "red",
};

export function getAvailabilityColor(status: AvailabilityStatus): "green" | "yellow" | "red" {
  return availabilityColorMap[status];
}

export const ALL_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "Python",
  "Machine Learning",
  "System Design",
  "Databases",
  "UI/UX",
] as const;

export function defaultProjectStatusFromProgress(progressPercent: number): string {
  if (progressPercent >= 100) return "Completed";
  if (progressPercent >= 70) return "On Track";
  if (progressPercent >= 40) return "In Progress";
  if (progressPercent === 0) return "Not Started";
  return "Delayed";
}

export { };
