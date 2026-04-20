export type MentorshipRequestStatus = "open" | "in_progress" | "completed" | "cancelled";

export type MentorshipRequestType = "full_project" | "specific_idea";

export interface RequestProfileRef {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
}

export interface MentorshipRequestRecord {
  id: string;
  student_id: string | null;
  title: string;
  description: string | null;
  domain: string | null;
  deadline: string | null;
  type: MentorshipRequestType | null;
  status: MentorshipRequestStatus;
  assigned_mentor: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  student?: RequestProfileRef | null;
  mentor?: RequestProfileRef | null;
}

export type CreateMentorshipRequestInput = {
  title: string;
  description: string;
  domain: string;
  deadline?: string;
  type: MentorshipRequestType;
  assigned_mentor?: string;
};
