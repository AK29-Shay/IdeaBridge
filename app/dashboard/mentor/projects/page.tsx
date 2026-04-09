"use client"

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type ProjectItem = { id: string; title: string; studentName: string; progressPercent: number; status: "In Progress" | "Completed" | "Delayed" };

export default function ProjectsPage() {
  const [projects] = React.useState<ProjectItem[]>([
    { id: "p-1", title: "Quantum Notes", studentName: "Priya N.", progressPercent: 65, status: "In Progress" },
    { id: "p-2", title: "CampusMap", studentName: "Noah W.", progressPercent: 35, status: "Delayed" },
    { id: "p-3", title: "ML Coach", studentName: "Ava T.", progressPercent: 92, status: "Completed" },
  ]);

  return (
    <div>
      <h2 className="text-lg font-semibold">My Projects</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id} className="p-4 rounded-xl hover:shadow-md transition-transform transform hover:-translate-y-1">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">Student: {p.studentName}</div>
                </div>
                <Badge className={p.status === "Completed" ? "bg-emerald-100 text-emerald-700" : p.status === "In Progress" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>{p.status}</Badge>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-medium">{p.progressPercent}%</span>
                </div>
                <Progress value={p.progressPercent} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
