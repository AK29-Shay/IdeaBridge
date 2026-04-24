import { NextResponse } from "next/server";

import {
  createMentorshipMessage,
  listMentorshipMessages,
  MentorshipChannelError,
} from "@/backend/services/mentorshipChannelService";
import { createNotification } from "@/backend/services/notificationService";
import { getErrorMessage } from "@/lib/errorMessage";
import { assertMentorshipAccess, getAuthorizedActor } from "@/app/api/mentorships/_helpers";

export async function GET(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params;
    const { user, role } = await getAuthorizedActor(request.headers.get("authorization"));
    await assertMentorshipAccess(requestId, user.user.id, role);

    const messages = await listMentorshipMessages(requestId);
    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof MentorshipChannelError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load mentorship messages.") },
      { status: 400 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params;
    const { user, role } = await getAuthorizedActor(request.headers.get("authorization"));
    const requestRecord = await assertMentorshipAccess(requestId, user.user.id, role);
    const body = await request.json();

    const message = await createMentorshipMessage(requestId, {
      actorEmail: user.user.email ?? "",
      actorName:
        typeof user.user.user_metadata?.full_name === "string"
          ? user.user.user_metadata.full_name
          : undefined,
      actorRole: role,
      content:
        typeof body?.content === "string" ? body.content : "",
    });

    const recipientId =
      requestRecord.student_id === user.user.id
        ? requestRecord.assigned_mentor
        : requestRecord.student_id;

    if (recipientId) {
      await createNotification({
        user_id: recipientId,
        type: "mentorship_message",
        payload: {
          request_id: requestId,
          title: "New mentorship message",
          author: message.authorName,
        },
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof MentorshipChannelError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to send mentorship message.") },
      { status: 400 }
    );
  }
}
