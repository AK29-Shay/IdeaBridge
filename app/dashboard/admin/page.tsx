"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { authFetch } from "@/lib/authFetch";

type PendingApproval = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  expertise: string[];
  statement: string;
  createdAt?: string;
};

type ModerationUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  suspended: boolean;
  moderationStatus: string;
};

type ModerationActivity = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  status: string;
  changedAt?: string;
  type: string;
};

type AdminOverviewResponse = {
  pendingApprovals: PendingApproval[];
  moderationUsers: ModerationUser[];
  recentModerationActivity: ModerationActivity[];
  counters: {
    pendingApprovals: number;
    suspendedAccounts: number;
    moderationEvents: number;
  };
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function AdminPortalPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyTarget, setBusyTarget] = React.useState<string | null>(null);
  const [data, setData] = React.useState<AdminOverviewResponse | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<string | null>(null);

  const loadOverview = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch("/api/admin/overview");
      const body = (await response.json().catch(() => null)) as
        | AdminOverviewResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error((body as { error?: string } | null)?.error || "Failed to load admin overview.");
      }

      setData(body as AdminOverviewResponse);
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load admin overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  async function updateApplicationStatus(applicationId: string, status: "approved" | "rejected") {
    setBusyTarget(`app:${applicationId}`);
    try {
      const response = await authFetch(`/api/admin/mentor-applications/${applicationId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Failed to update application status.");
      }
      toast.success(`Application ${status}.`);
      await loadOverview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update application status.");
    } finally {
      setBusyTarget(null);
    }
  }

  async function moderateUser(
    userId: string,
    action: "suspend" | "reactivate" | "set_status",
    moderationStatus?: "active" | "under_review" | "restricted" | "suspended"
  ) {
    setBusyTarget(`user:${userId}`);
    try {
      const response = await authFetch(`/api/admin/users/${userId}/moderation`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, moderationStatus }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Failed to apply moderation action.");
      }
      toast.success("Moderation action applied.");
      await loadOverview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply moderation action.");
    } finally {
      setBusyTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Operations Console</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review mentor approvals, enforce moderation actions, and monitor platform operational state.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            Environment: Production Controls
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
            {loading ? "Syncing data..." : `Last synced ${formatDate(lastSyncedAt ?? undefined)}`}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Pending Approval Queue"
          value={loading ? "…" : String(data?.counters.pendingApprovals ?? 0)}
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          title="Suspended Accounts"
          value={loading ? "…" : String(data?.counters.suspendedAccounts ?? 0)}
          icon={ShieldAlert}
          tone="rose"
        />
        <StatCard
          title="Recent Moderation Events"
          value={loading ? "…" : String(data?.counters.moderationEvents ?? 0)}
          icon={AlertTriangle}
          tone="violet"
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Mentor Approval Queue</h2>
          <button
            type="button"
            onClick={() => void loadOverview()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
        <div className="space-y-3">
          {(data?.pendingApprovals ?? []).length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              No pending mentor applications.
            </p>
          ) : (
            (data?.pendingApprovals ?? []).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.fullName}</p>
                    <p className="text-sm text-slate-600">{item.email}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Submitted: {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyTarget === `app:${item.id}`}
                      onClick={() => void updateApplicationStatus(item.id, "approved")}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyTarget === `app:${item.id}`}
                      onClick={() => void updateApplicationStatus(item.id, "rejected")}
                      className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                {item.expertise?.length ? (
                  <p className="mt-3 text-xs text-slate-600">
                    Expertise: {item.expertise.join(", ")}
                  </p>
                ) : null}
                {item.statement ? (
                  <p className="mt-2 text-sm text-slate-700">{item.statement}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Account Moderation</h2>
        <div className="space-y-3">
          {(data?.moderationUsers ?? []).slice(0, 15).map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
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
                  disabled={busyTarget === `user:${user.id}` || user.suspended}
                  onClick={() => void moderateUser(user.id, "suspend")}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                >
                  Suspend
                </button>
                <button
                  type="button"
                  disabled={busyTarget === `user:${user.id}` || !user.suspended}
                  onClick={() => void moderateUser(user.id, "reactivate")}
                  className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                >
                  Reactivate
                </button>
                <button
                  type="button"
                  disabled={busyTarget === `user:${user.id}`}
                  onClick={() => void moderateUser(user.id, "set_status", "under_review")}
                  className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                >
                  Mark Under Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Moderation Activity</h2>
        <div className="space-y-2">
          {(data?.recentModerationActivity ?? []).slice(0, 12).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-800">
                  {activity.fullName} · {activity.status}
                </span>
              </div>
              <span className="text-xs text-slate-500">{formatDate(activity.changedAt)}</span>
            </div>
          ))}
          {(data?.recentModerationActivity ?? []).length === 0 ? (
            <p className="text-sm text-slate-600">No recent moderation activity.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "rose" | "violet";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "rose"
      ? "bg-rose-50 text-rose-700"
      : "bg-violet-50 text-violet-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <span className={`rounded-lg p-2 ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

