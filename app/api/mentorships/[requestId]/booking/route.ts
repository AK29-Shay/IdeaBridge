import { NextResponse } from "next/server";

import {
  MentorshipChannelError,
  updateMentorshipBooking,
} from "@/backend/services/mentorshipChannelService";
import { createNotification } from "@/backend/services/notificationService";
import { getErrorMessage } from "@/lib/errorMessage";
import { assertMentorshipAccess, getAuthorizedActor } from "@/app/api/mentorships/_helpers";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params;
    const { user, role } = await getAuthorizedActor(request.headers.get("authorization"));
    const requestRecord = await assertMentorshipAccess(requestId, user.user.id, role);
    const body = await request.json();

    if (body?.action === "propose") {
      if (role !== "mentor" && role !== "admin") {
        return NextResponse.json(
          { error: "Only mentors can propose mentorship slots." },
          { status: 403 }
        );
      }

      const slots = Array.isArray(body?.slots) ? body.slots : [];
      const updated = await updateMentorshipBooking(requestId, {
        action: "propose",
        proposedBy: "mentor",
        slots,
      });

      if (requestRecord.student_id) {
        await createNotification({
          user_id: requestRecord.student_id,
          type: "booking_slots_proposed",
          payload: {
            request_id: requestId,
            title: updated.title,
          },
        });
      }

      return NextResponse.json(updated);
    }

    if (body?.action === "confirm") {
      if (role !== "student" && role !== "admin") {
        return NextResponse.json(
          { error: "Only students can confirm mentorship slots." },
          { status: 403 }
        );
      }

      const slotId = typeof body?.slotId === "string" ? body.slotId : "";
      const updated = await updateMentorshipBooking(requestId, {
        action: "confirm",
        slotId,
      });

      if (requestRecord.assigned_mentor) {
        await createNotification({
          user_id: requestRecord.assigned_mentor,
          type: "booking_confirmed",
          payload: {
            request_id: requestId,
            title: updated.title,
          },
        });
      }

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unsupported booking action." }, { status: 400 });
  } catch (error) {
    if (error instanceof MentorshipChannelError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update mentorship booking.") },
      { status: 400 }
    );
  }
}
