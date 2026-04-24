"use client";

import { ProjectsSection } from "@/components/student/ProjectsSection";
import { useAuth } from "@/context/AuthContext";
import { useStudentProjects } from "@/lib/useStudentProjects";

export default function StudentProjectsPage() {
  const { user } = useAuth();
  const { projects, updateProject, isLoading, error } = useStudentProjects(user?.email);

  return (
    <ProjectsSection
      projects={projects}
      updateProject={updateProject}
      isLoading={isLoading}
      error={error}
    />
  );
}
