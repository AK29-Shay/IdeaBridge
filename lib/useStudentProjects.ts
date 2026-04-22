"use client";

import * as React from "react";

import { getProjectsForUser, setProjectsForUser } from "@/lib/storage";
import type { StudentProject } from "@/types/project";

export function useStudentProjects(email?: string) {
  const [projects, setProjectsState] = React.useState<StudentProject[]>([]);

  React.useEffect(() => {
    if (!email) {
      setProjectsState([]);
      return;
    }

    setProjectsState(getProjectsForUser(email));
  }, [email]);

  const setProjects = React.useCallback(
    (nextProjects: StudentProject[]) => {
      setProjectsState(nextProjects);

      if (email) {
        setProjectsForUser(email, nextProjects);
      }
    },
    [email]
  );

  return {
    projects,
    setProjects,
  };
}
