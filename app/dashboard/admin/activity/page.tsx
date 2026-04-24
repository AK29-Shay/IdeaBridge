"use client";

import * as React from "react";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";

import { authFetch } from "@/lib/authFetch";

type ModerationActivity = {
  id: string;
  fullName: string;
  status: string;
  changedAt?: string;
  type: string;
};

type OverviewResponse = {
  recentModerationActivity: ModerationActivity[];
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function AdminActivityPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<ModerationActivity[]>([]);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      try {
        const response = await authFetch("/api/admin/overview");
        const body = (await response.json().catch(() => null)) as OverviewResponse | { error?: string } | null;
        if (!response.ok) {
          throw new Error((body as { error?: string } | null)?.error || "Failed to load activity.");
        }
        if (mounted) {
          setItems((body as OverviewResponse).recentModerationActivity ?? []);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load activity.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Moderation Activity Feed</h1>
        <p className="mt-1 text-sm text-slate-600">Track recent policy and account-control actions.</p>
      </div>
      {loading ? <p className="text-sm text-slate-600">Loading activity...</p> : null}
      <div className="space-y-2">
        {items.slice(0, 40).map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-800">
                {activity.fullName} · {activity.status} · {activity.type}
              </span>
            </div>
            <span className="text-xs text-slate-500">{formatDate(activity.changedAt)}</span>
          </div>
        ))}
      </div>
      {!loading && items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          No recent moderation activity.
        </div>
      ) : null}
    </div>
  );
}

