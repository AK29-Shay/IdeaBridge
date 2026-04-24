import { NextResponse } from "next/server";

import supabaseServer from "@/backend/config/supabaseServer";
import { getUserFromAuthHeader } from "@/backend/middleware/auth";

async function requireAdmin(authorization?: string | null) {
  const authUser = await getUserFromAuthHeader(authorization);
  if (!authUser) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", authUser.user.id)
    .maybeSingle();

  if (profileError) {
    return { error: NextResponse.json({ error: profileError.message }, { status: 500 }) };
  }

  const role = typeof profile?.role === "string" ? profile.role.toLowerCase() : "";
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { authUser };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request.headers.get("authorization"));
  if ("error" in adminCheck) return adminCheck.error;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    action?: "suspend" | "reactivate" | "set_status";
    moderationStatus?: "active" | "under_review" | "restricted" | "suspended";
  } | null;

  const action = body?.action;
  if (!action) {
    return NextResponse.json({ error: "Action is required." }, { status: 400 });
  }

  const { data: currentUser, error: userError } = await supabaseServer.auth.admin.getUserById(id);
  if (userError || !currentUser?.user) {
    return NextResponse.json({ error: userError?.message || "User not found." }, { status: 404 });
  }

  const currentMeta = (currentUser.user.user_metadata ?? {}) as Record<string, unknown>;
  let nextStatus = typeof currentMeta.moderation_status === "string" ? currentMeta.moderation_status : "active";

  const updatePayload: {
    ban_duration?: string;
    user_metadata?: Record<string, unknown>;
  } = {};

  if (action === "suspend") {
    updatePayload.ban_duration = "876000h";
    nextStatus = "suspended";
  } else if (action === "reactivate") {
    updatePayload.ban_duration = "none";
    nextStatus = "active";
  } else if (action === "set_status") {
    const allowed = ["active", "under_review", "restricted", "suspended"];
    if (!body?.moderationStatus || !allowed.includes(body.moderationStatus)) {
      return NextResponse.json({ error: "Invalid moderation status." }, { status: 400 });
    }
    nextStatus = body.moderationStatus;
  }

  updatePayload.user_metadata = {
    ...currentMeta,
    moderation_status: nextStatus,
    moderated_at: new Date().toISOString(),
  };

  const { data: updatedUser, error: updateError } = await supabaseServer.auth.admin.updateUserById(
    id,
    updatePayload
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    user: updatedUser.user,
    moderationStatus: nextStatus,
  });
}

