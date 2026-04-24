"use client";

import * as React from "react";
import { toast } from "sonner";

import { authFetch } from "@/lib/authFetch";

type ModerationUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  suspended: boolean;
  moderationStatus: string;
};

type OverviewResponse = {
  moderationUsers: ModerationUser[];
};

export default function AdminModerationPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyTarget, setBusyTarget] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<ModerationUser[]>([]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch("/api/admin/overview");
      const body = (await response.json().catch(() => null)) as OverviewResponse | { error?: string } | null;
      if (!response.ok) throw new Error((body as { error?: string } | null)?.error || "Failed to load users.");
      setUsers((body as OverviewResponse).moderationUsers ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load moderation users.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function moderateUser(
    userId: string,
    action: "suspend" | "reactivate" | "set_status",
    moderationStatus?: "active" | "under_review" | "restricted" | "suspended"
  ) {
    setBusyTarget(userId);
    try {
      const response = await authFetch(`/api/admin/users/${userId}/moderation`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, moderationStatus }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error || "Failed moderation action.");
      toast.success("Moderation action applied.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed moderation action.");
    } finally {
      setBusyTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Moderation</h1>
        <p className="mt-1 text-sm text-slate-600">Suspend, reactivate, and mark user risk statuses.</p>
      </div>
      {loading ? <p className="text-sm text-slate-600">Loading users...</p> : null}
      {users.slice(0, 25).map((user) => (
        <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="font-medium text-slate-900">{user.fullName}</p>
            <p className="text-xs text-slate-600">
              {user.email} · {String(user.role).toLowerCase()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Status: {user.moderationStatus}
              {user.suspended ? " (suspended)" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busyTarget === user.id || user.suspended}
              onClick={() => void moderateUser(user.id, "suspend")}
              className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              Suspend
            </button>
            <button
              type="button"
              disabled={busyTarget === user.id || !user.suspended}
              onClick={() => void moderateUser(user.id, "reactivate")}
              className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
            >
              Reactivate
            </button>
            <button
              type="button"
              disabled={busyTarget === user.id}
              onClick={() => void moderateUser(user.id, "set_status", "under_review")}
              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
            >
              Mark Under Review
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

