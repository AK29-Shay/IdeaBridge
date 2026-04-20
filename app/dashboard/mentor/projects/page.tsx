"use client";

import * as React from "react";

import { ProjectsSection } from "@/components/mentor/ProjectsSection";
import { useMentorshipRequests } from "@/lib/useMentorshipRequests";

export default function MentorProjectsPage() {
  const { requests } = useMentorshipRequests();

  const projects = React.useMemo(
    () =>
      requests
        .filter((request) => request.status === "in_progress" || request.status === "completed")
        .map((request) => ({
          id: request.id,
          title: request.title,
          studentName: request.student?.full_name ?? "Student",
          progressPercent: request.status === "completed" ? 100 : 60,
          status: request.status === "completed" ? "Completed" as const : "In Progress" as const,
          updatedAt: request.updated_at,
        })),
    [requests]
  );

  return <ProjectsSection projects={projects} />;
}
