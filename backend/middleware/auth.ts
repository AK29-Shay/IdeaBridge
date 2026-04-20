import type { User } from "@supabase/supabase-js";

import supabaseServer from "../config/supabaseServer";

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      sub?: string;
      exp?: number;
    };
    return payload;
  } catch {
    return null;
  }
}

export async function getUserFromAuthHeader(authorization?: string | null) {
  if (!authorization) return null;
  const match = authorization.match(/Bearer\s+(.+)/i);
  const token = match ? match[1] : authorization.trim();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload?.sub) return null;

  if (typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
  }

  try {
    const { data, error } = await supabaseServer.auth.admin.getUserById(payload.sub);
    if (error || !data?.user) return null;
    return { user: data.user as User, token };
  } catch {
    return null;
  }
}

export function requireRole(
  userProfile: { role?: string | null } | null | undefined,
  allowed: string[]
) {
  if (!userProfile?.role) return false;
  return allowed.includes(userProfile.role);
}
