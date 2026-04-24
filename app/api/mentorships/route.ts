import { NextResponse } from "next/server";

import { listMentorshipChannelsForUser, MentorshipChannelError } from "@/backend/services/mentorshipChannelService";
import { getAuthorizedActor } from "./_helpers";
import { getErrorMessage } from "@/lib/errorMessage";

export async function GET(request: Request) {
  try {
    const { user, role } = await getAuthorizedActor(request.headers.get("authorization"));
    const channels = await listMentorshipChannelsForUser(user.user.id, role);
    return NextResponse.json(channels);
  } catch (error) {
    if (error instanceof MentorshipChannelError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load mentorship spaces.") },
      { status: 400 }
    );
  }
}
