"use client";

import { ProjectsSection } from "@/components/student/ProjectsSection";
import { useAuth } from "@/context/AuthContext";
import { useStudentProjects } from "@/lib/useStudentProjects";

export default function StudentProjectsPage() {
  const { user } = useAuth();
  const { projects, setProjects } = useStudentProjects(user?.email);

  return (
    <ProjectsSection
      projects={projects}
      setProjects={setProjects}
      userEmail={user?.email ?? ""}
    />
  );
}
