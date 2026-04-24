"use client";

import * as React from "react";
import { toast } from "sonner";
import { FolderOpen } from "lucide-react";

import type { ProjectProgressStatus } from "@/types/auth";
import type { StudentProject } from "@/types/project";
import { ProjectCard } from "@/components/cards/ProjectCard";
import ProjectThread from "@/components/ideas/ProjectThread";
import { UpdateProgressModal } from "@/components/modals/UpdateProgressModal";
import { getStoredMentors } from "@/lib/storage";
import { mockThreadData } from "@/lib/ideas/mockThread";

interface ProjectsSectionProps {
  projects: StudentProject[];
  updateProject: (
    projectId: string,
    patch: Partial<Pick<StudentProject, "progressPercent" | "status" | "milestoneNotes" | "updatedAt">>
  ) => Promise<StudentProject>;
  isLoading?: boolean;
  error?: string | null;
}

export function ProjectsSection({ projects, updateProject, isLoading = false, error = null }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = React.useState<StudentProject | null>(null);
  const [detailProjectId, setDetailProjectId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const mentorById = React.useMemo(() => {
    const map = new Map<string, ReturnType<typeof getStoredMentors>[number]>();
    getStoredMentors().forEach((mentor) => map.set(mentor.id, mentor));
    return map;
  }, []);

  type ProgressValues = {
    progressPercent: number;
    status: ProjectProgressStatus;
    milestoneNotes: string;
    dateUpdated: string;
  };

  async function saveProgress(values: ProgressValues) {
    if (!selectedProject) return;

    const next = await updateProject(selectedProject.id, {
      progressPercent: values.progressPercent,
      status: values.status,
      milestoneNotes: values.milestoneNotes,
      updatedAt: new Date(values.dateUpdated).toISOString(),
    });

    setSelectedProject(next);
    toast.success("Progress updated successfully!");
  }

  React.useEffect(() => {
    if (projects.length === 0) {
      setDetailProjectId(null);
      return;
    }

    if (!detailProjectId || !projects.some((project) => project.id === detailProjectId)) {
      setDetailProjectId(projects[0].id);
    }
  }, [projects, detailProjectId]);

  const detailProject = React.useMemo(
    () => projects.find((project) => project.id === detailProjectId) ?? null,
    [projects, detailProjectId]
  );

  const detailMentorName = detailProject?.mentorId ? mentorById.get(detailProject.mentorId)?.fullName : undefined;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track and update your project milestones</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-2xl border border-[#FFCBA4]/30 bg-white/80" />
          ))}
        </div>
      ) : projects.length === 0 ? (
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
              isSelected={detailProjectId === project.id}
              onOpenDetails={() => setDetailProjectId(project.id)}
              onUpdate={() => {
                setSelectedProject(project);
                setDetailProjectId(project.id);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {detailProject ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-[#FFCBA4]/40 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{detailProject.title}</h3>
                <p className="mt-1 text-sm text-slate-500">Detailed project view</p>
              </div>
              <span className="rounded-full border border-[#FFCBA4]/50 bg-[#FFF4EB] px-3 py-1 text-xs font-semibold text-[#8A4E2A]">
                {detailProject.status}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project ID</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{detailProject.id}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mentor</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{detailMentorName ?? "No mentor assigned"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{detailProject.progressPercent}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Updated</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {new Date(detailProject.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Milestone Notes</p>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                {detailProject.milestoneNotes || "No milestone notes yet."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#FFCBA4]/30 bg-white px-3 py-5 sm:px-6">
            <ProjectThread comments={mockThreadData} />
          </div>
        </section>
      ) : null}

      <UpdateProgressModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        project={selectedProject}
        onSave={saveProgress}
      />
    </div>
  );
}
