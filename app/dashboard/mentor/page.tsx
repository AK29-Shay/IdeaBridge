"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DashboardSection } from "@/components/mentor/DashboardSection";
import type { ProjectItem } from "@/components/mentor/ProjectsSection";
import { useAuth } from "@/context/AuthContext";
import { useMentorshipRequests } from "@/lib/useMentorshipRequests";

const MENTOR_ROUTE_MAP: Record<string, string> = {
  dashboard: "/dashboard/mentor",
  requests: "/dashboard/mentor/requests",
  projects: "/dashboard/mentor/projects",
  blog: "/dashboard/mentor/blog",
  profile: "/dashboard/mentor/profile",
};

function deriveMentorProjects(requests: ReturnType<typeof useMentorshipRequests>["requests"]): ProjectItem[] {
  return requests
    .filter((request) => request.status === "in_progress" || request.status === "completed")
    .map((request) => ({
      id: request.id,
      title: request.title,
      studentName: request.student?.full_name ?? "Student",
      progressPercent: request.status === "completed" ? 100 : 60,
      status: request.status === "completed" ? "Completed" : "In Progress",
      updatedAt: request.updated_at,
    }));
}

export default function MentorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, updateRequestStatus } = useMentorshipRequests();

  const projects = React.useMemo(() => deriveMentorProjects(requests), [requests]);

  return (
    <DashboardSection
      mentorName={user?.fullName ?? "Mentor"}
      availabilityStatus={user?.mentorProfile?.availabilityStatus ?? user?.availabilityStatus ?? "Available Now"}
      requests={requests}
      projects={projects}
      onUpdateRequest={async (requestId, status) => {
        try {
          await updateRequestStatus(requestId, status);
          toast.success(status === "in_progress" ? "Request accepted." : "Request declined.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to update request.");
        }
      }}
      onTabChange={(tab) => {
        router.push(MENTOR_ROUTE_MAP[tab] ?? "/dashboard/mentor");
      }}
    />
  );
}
