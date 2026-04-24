"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { authFetch } from "@/lib/authFetch";

type PendingApproval = {
  id: string;
  fullName: string;
  email: string;
  expertise: string[];
  statement: string;
  createdAt?: string;
};

type OverviewResponse = {
  pendingApprovals: PendingApproval[];
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function AdminApprovalsPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyTarget, setBusyTarget] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<PendingApproval[]>([]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch("/api/admin/overview");
      const body = (await response.json().catch(() => null)) as OverviewResponse | { error?: string } | null;
      if (!response.ok) throw new Error((body as { error?: string } | null)?.error || "Failed to load queue.");
      setItems((body as OverviewResponse).pendingApprovals ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load approval queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setBusyTarget(id);
    try {
      const response = await authFetch(`/api/admin/mentor-applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error || "Failed to update application.");
      toast.success(`Application ${status}.`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update application.");
    } finally {
      setBusyTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mentor Approvals</h1>
        <p className="mt-1 text-sm text-slate-600">Approve or reject pending mentor applications.</p>
      </div>
      {loading ? <p className="text-sm text-slate-600">Loading queue...</p> : null}
      {(items ?? []).map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{item.fullName}</p>
              <p className="text-sm text-slate-600">{item.email}</p>
              <p className="mt-1 text-xs text-slate-500">Submitted: {formatDate(item.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyTarget === item.id}
                onClick={() => void updateStatus(item.id, "approved")}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                type="button"
                disabled={busyTarget === item.id}
                onClick={() => void updateStatus(item.id, "rejected")}
                className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
          {item.expertise?.length ? (
            <p className="mt-3 text-xs text-slate-600">Expertise: {item.expertise.join(", ")}</p>
          ) : null}
          {item.statement ? <p className="mt-2 text-sm text-slate-700">{item.statement}</p> : null}
        </div>
      ))}
      {!loading && items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          No pending applications.
        </div>
      ) : null}
    </div>
  );
}

