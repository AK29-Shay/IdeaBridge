export type MentorshipParticipant = {
  id: string;
  fullName: string;
  avatarUrl: string;
  role: "Student" | "Mentor" | "Admin";
};

export type MentorshipBookingSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  label: string;
  proposedBy: "student" | "mentor";
  status: "open" | "confirmed";
};

export type MentorshipBookingState = {
  slots: MentorshipBookingSlot[];
  confirmedSlotId: string | null;
  confirmedAt: string | null;
};

export type MentorshipChannelSummary = {
  requestId: string;
  channelId: string;
  title: string;
  description: string;
  requestStatus: "in_progress" | "completed";
  student: MentorshipParticipant;
  mentor: MentorshipParticipant;
  booking: MentorshipBookingState;
  createdAt: string;
  updatedAt: string;
};

export type MentorshipMessage = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  authorRole: "Student" | "Mentor" | "Admin";
  content: string;
  createdAt: string;
};
