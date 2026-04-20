"use client";

import { useRouter } from "next/navigation";

import { DashboardSection } from "@/components/student/DashboardSection";
import { useAuth } from "@/context/AuthContext";
import { useStudentProjects } from "@/lib/useStudentProjects";

const STUDENT_ROUTE_MAP: Record<string, string> = {
  dashboard: "/dashboard/student",
  projects: "/dashboard/student/projects",
  requests: "/dashboard/student/requests",
  profile: "/dashboard/student/profile",
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { projects } = useStudentProjects(user?.email);

  return (
    <DashboardSection
      projects={projects}
      onTabChange={(tab) => {
        router.push(STUDENT_ROUTE_MAP[tab] ?? "/dashboard/student");
      }}
    />
  );
}
