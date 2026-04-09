import type { ProjectProgressStatus } from "./auth";

export interface StudentProject {
  id: string;
  title: string;
  mentorId?: string;
  progressPercent: number; // 0-100
  status: ProjectProgressStatus;
  milestoneNotes: string;
  updatedAt: string; // ISO date string
}

