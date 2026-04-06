"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Sparkles, FolderOpen } from "lucide-react";
import type { StudentProject } from "@/types/project";
import type { ProjectProgressStatus } from "@/types/auth";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { UpdateProgressModal } from "@/components/modals/UpdateProgressModal";
import { getStoredMentors, setProjectsForUser } from "@/lib/storage";


interface ProjectsSectionProps {
  projects: StudentProject[];
  setProjects: (p: StudentProject[]) => void;
  userEmail: string;
}

export function ProjectsSection({ projects, setProjects, userEmail }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = React.useState<StudentProject | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const mentorById = React.useMemo(() => {
    const map = new Map<string, ReturnType<typeof getStoredMentors>[number]>();
    getStoredMentors().forEach((m) => map.set(m.id, m));
    return map;
  }, []);

  // Sample projects loader removed — production data only.

  type ProgressValues = {
    progressPercent: number;
    status: ProjectProgressStatus;
    milestoneNotes: string;
    dateUpdated: string;
  };

  function saveProgress(values: ProgressValues) {
    if (!selectedProject) return;
    const next: StudentProject = {
      ...selectedProject,
      progressPercent: values.progressPercent,
      status: values.status,
      milestoneNotes: values.milestoneNotes,
      updatedAt: new Date(values.dateUpdated).toISOString(),
    };
    const nextProjects = projects.map((p) => (p.id === selectedProject.id ? next : p));
    setProjects(nextProjects);
    setProjectsForUser(userEmail, nextProjects);
    toast.success("Progress updated successfully! 🎉");
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track and update your project milestones</p>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#FFCBA4]/30 bg-gradient-to-br from-white to-white py-20 text-center">
          <div className="rounded-2xl bg-[#0F0F0F] p-4 shadow-lg mb-4">
            <FolderOpen className="h-8 w-8 text-[#FFCBA4]" />
          </div>
          <div className="text-lg font-semibold text-slate-700">No projects yet</div>
          <div className="mt-1 text-sm text-slate-500">Create your first project to start tracking milestones</div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              mentorName={project.mentorId ? mentorById.get(project.mentorId)?.fullName : undefined}
              onUpdate={() => {
                setSelectedProject(project);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <UpdateProgressModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        project={selectedProject}
        onSave={saveProgress}
      />
    </div>
  );
}
