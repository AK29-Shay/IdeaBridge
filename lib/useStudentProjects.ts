"use client";

import * as React from "react";

import { authFetch } from "@/lib/authFetch";
import type { StudentProject } from "@/types/project";

type ProjectPatch = Partial<Pick<StudentProject, "title" | "mentorId" | "progressPercent" | "status" | "milestoneNotes" | "updatedAt">>;

export function useStudentProjects(email?: string) {
  const [projects, setProjectsState] = React.useState<StudentProject[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!email) {
      setProjectsState([]);
      setError(null);
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/projects", {
        cache: "no-store",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string" ? payload.error : "Failed to load student projects."
        );
      }

      const nextProjects = Array.isArray(payload) ? (payload as StudentProject[]) : [];
      setProjectsState(nextProjects);
      return nextProjects;
    } catch (rawError) {
      const message = rawError instanceof Error ? rawError.message : "Failed to load student projects.";
      setError(message);
      setProjectsState([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const setProjects = React.useCallback(
    (nextProjects: StudentProject[]) => {
      setProjectsState(nextProjects);
    },
    []
  );

  const updateProject = React.useCallback(
    async (projectId: string, patch: ProjectPatch) => {
      const response = await authFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Failed to update project.");
      }

      const updatedProject = payload as StudentProject;
      setProjectsState((currentProjects) =>
        currentProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project))
      );
      return updatedProject;
    },
    []
  );

  return {
    projects,
    setProjects,
    updateProject,
    refresh,
    isLoading,
    error,
  };
}
