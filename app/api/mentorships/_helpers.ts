import { getUserFromAuthHeader } from "@/backend/middleware/auth";
import { getProfileByUserId } from "@/backend/modules/profile";
import { getRequestById } from "@/backend/services/requestService";
import { MentorshipChannelError } from "@/backend/services/mentorshipChannelService";

type RequestRecord = {
  id: string;
  student_id: string | null;
  assigned_mentor: string | null;
};

export async function getAuthorizedActor(authorization: string | null) {
  const user = await getUserFromAuthHeader(authorization);
  if (!user) {
    throw new MentorshipChannelError("Unauthorized", 401);
  }

  const profile = (await getProfileByUserId(user.user.id)) as { role?: string | null } | null;
  const role = typeof profile?.role === "string" ? profile.role.toLowerCase() : "student";

  return {
    user,
    role,
  };
}

export async function assertMentorshipAccess(
  requestId: string,
  actorId: string,
  role: string
) {
  const requestRecord = (await getRequestById(requestId)) as RequestRecord | null;

  if (!requestRecord) {
    throw new MentorshipChannelError("Mentorship request not found.", 404);
  }

  const isParticipant =
    requestRecord.student_id === actorId || requestRecord.assigned_mentor === actorId;

  if (role !== "admin" && !isParticipant) {
    throw new MentorshipChannelError("Forbidden", 403);
  }

  return requestRecord;
}
