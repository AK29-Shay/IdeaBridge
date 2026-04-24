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

type ModerationUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  suspended: boolean;
  moderationStatus: string;
};

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request.headers.get("authorization"));
  if ("error" in adminCheck) return adminCheck.error;

  const { data: pendingRows, error: pendingError } = await supabaseServer
    .from("mentor_applications")
    .select("id,user_id,status,expertise,statement,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(20);

  if (pendingError) {
    return NextResponse.json({ error: pendingError.message }, { status: 500 });
  }

  const { data: recentRows, error: recentError } = await supabaseServer
    .from("mentor_applications")
    .select("id,user_id,status,created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (recentError) {
    return NextResponse.json({ error: recentError.message }, { status: 500 });
  }

  const { data: profileRows, error: profileError } = await supabaseServer
    .from("profiles")
    .select("id,full_name,role,bio")
    .order("full_name", { ascending: true })
    .limit(100);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const userIds = Array.from(
    new Set(
      [
        ...(pendingRows ?? []).map((row) => row.user_id),
        ...(recentRows ?? []).map((row) => row.user_id),
        ...(profileRows ?? []).map((row) => row.id),
      ].filter(Boolean)
    )
  );

  const userLookups = await Promise.all(
    userIds.map(async (userId) => {
      const { data, error } = await supabaseServer.auth.admin.getUserById(userId);
      if (error || !data?.user) return null;
      return data.user;
    })
  );

  const authUserMap = new Map(userLookups.filter(Boolean).map((u) => [u.id, u]));
  const profileMap = new Map((profileRows ?? []).map((row) => [row.id, row]));

  const pendingApprovals = (pendingRows ?? []).map((row) => {
    const profile = profileMap.get(row.user_id);
    const authUser = authUserMap.get(row.user_id);
    return {
      id: row.id,
      userId: row.user_id,
      fullName: profile?.full_name || authUser?.email?.split("@")[0] || "Unknown user",
      email: authUser?.email || "No email",
      expertise: row.expertise ?? [],
      statement: row.statement ?? "",
      createdAt: row.created_at,
    };
  });

  const recentModerationActivity = (recentRows ?? []).map((row) => {
    const profile = profileMap.get(row.user_id);
    const authUser = authUserMap.get(row.user_id);
    return {
      id: row.id,
      userId: row.user_id,
      fullName: profile?.full_name || authUser?.email?.split("@")[0] || "Unknown user",
      email: authUser?.email || "No email",
      status: row.status,
      changedAt: row.created_at,
      type: "mentor_application",
    };
  });

  const moderationUsers: ModerationUser[] = (profileRows ?? [])
    .filter((row) => row.role?.toLowerCase() !== "admin")
    .slice(0, 30)
    .map((row) => {
      const authUser = authUserMap.get(row.id);
      const bannedUntil = authUser?.banned_until;
      const suspended = Boolean(bannedUntil && new Date(bannedUntil).getTime() > Date.now());
      const moderationStatus =
        typeof authUser?.user_metadata?.moderation_status === "string"
          ? authUser.user_metadata.moderation_status
          : suspended
          ? "suspended"
          : "active";

      return {
        id: row.id,
        fullName: row.full_name || authUser?.email?.split("@")[0] || "Unknown user",
        email: authUser?.email || "No email",
        role: row.role || "student",
        suspended,
        moderationStatus,
      };
    });

  return NextResponse.json({
    pendingApprovals,
    moderationUsers,
    recentModerationActivity,
    counters: {
      pendingApprovals: pendingApprovals.length,
      suspendedAccounts: moderationUsers.filter((u) => u.suspended).length,
      moderationEvents: recentModerationActivity.length,
    },
  });
}

