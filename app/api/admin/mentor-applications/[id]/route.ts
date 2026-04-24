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
    status?: "approved" | "rejected" | "pending";
  } | null;
  const status = body?.status;

  if (!status || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { data: application, error: appUpdateError } = await supabaseServer
    .from("mentor_applications")
    .update({ status })
    .eq("id", id)
    .select("id,user_id,status,created_at")
    .maybeSingle();

  if (appUpdateError) {
    return NextResponse.json({ error: appUpdateError.message }, { status: 500 });
  }

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (status === "approved") {
    const { error: profileUpdateError } = await supabaseServer
      .from("profiles")
      .update({ role: "Mentor" })
      .eq("id", application.user_id);
    if (profileUpdateError) {
      return NextResponse.json({ error: profileUpdateError.message }, { status: 500 });
    }

    const { data: authUser, error: authLookupError } = await supabaseServer.auth.admin.getUserById(application.user_id);
    if (authLookupError) {
      return NextResponse.json({ error: authLookupError.message }, { status: 500 });
    }

    const { error: metadataUpdateError } = await supabaseServer.auth.admin.updateUserById(application.user_id, {
      user_metadata: {
        ...(authUser.user?.user_metadata ?? {}),
        role: "mentor",
      },
    });
    if (metadataUpdateError) {
      return NextResponse.json({ error: metadataUpdateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ application });
}

