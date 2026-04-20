"use client"

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type RequestItem = { id: string; studentName: string; projectTitle: string; message?: string; status: "Pending" | "Accepted" | "Rejected" };

function StatusBadge({ status }: { status: string }) {
  const cls = status === "Pending" ? "bg-amber-100 text-amber-700" : status === "Accepted" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
  return <Badge className={cn("rounded-full px-3 py-1 text-sm font-semibold", cls)}>{status}</Badge>;
}

export default function RequestsPage() {
  const [requests, setRequests] = React.useState<RequestItem[]>([
    { id: "r-1", studentName: "Alex Harper", projectTitle: "CampusMap Improvements", message: "Would you mentor our accessibility improvements?", status: "Pending" },
    { id: "r-2", studentName: "Lina Gomez", projectTitle: "ML Coach Enhancements", message: "Looking for model feedback and evaluation help.", status: "Pending" },
  ]);

  const [filter, setFilter] = React.useState<"all" | "pending" | "rejected">("all");

  const filtered = React.useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "pending") return requests.filter(r => r.status === "Pending");
    if (filter === "rejected") return requests.filter(r => r.status === "Rejected");
    return requests;
  }, [requests, filter]);

  function updateRequestStatus(id: string, status: RequestItem["status"]) {
    setRequests((s) => s.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Request ${status.toLowerCase()}.`);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mentorship Requests</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setFilter("all")} className={`text-sm px-3 py-1 rounded-full ${filter === "all" ? "bg-primary text-black font-semibold" : "bg-transparent text-slate-600 border border-slate-100"}`}>All</button>
          <button onClick={() => setFilter("pending")} className={`text-sm px-3 py-1 rounded-full ${filter === "pending" ? "bg-primary text-black font-semibold" : "bg-transparent text-slate-600 border border-slate-100"}`}>Pending</button>
          <button onClick={() => setFilter("rejected")} className={`text-sm px-3 py-1 rounded-full ${filter === "rejected" ? "bg-primary text-black font-semibold" : "bg-transparent text-slate-600 border border-slate-100"}`}>Rejected</button>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {filtered.map((r) => (
          <Card key={r.id} className="p-4 rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">{r.studentName}</div>
                <div className="text-xs text-muted-foreground">{r.projectTitle}</div>
                {r.message ? <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.message}</div> : null}
              </div>
              <div className="flex flex-col items-end gap-3">
                <StatusBadge status={r.status} />
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary text-[#0F0F0F]" onClick={() => updateRequestStatus(r.id, "Accepted")} disabled={r.status !== "Pending"}><Check /></Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateRequestStatus(r.id, "Rejected")} disabled={r.status !== "Pending"}><X /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
