import supabaseAdmin from "@/lib/supabase/admin";
import { DUMMY_STUDENT_PROJECTS } from "@/lib/dummyData";
import type { ProjectProgressStatus } from "@/types/auth";
import type { StudentProject } from "@/types/project";

type StudentProjectRow = {
  id: string;
  user_id: string;
  title: string;
  mentor_id: string | null;
  progress_percent: number;
  status: ProjectProgressStatus;
  milestone_notes: string;
  updated_at: string;
};

type ProjectPatch = Partial<{
  title: string;
  mentorId: string | null;
  progressPercent: number;
  status: ProjectProgressStatus;
  milestoneNotes: string;
  updatedAt: string;
}>;

const fallbackProjectsByUser = new Map<string, StudentProject[]>();

export class StudentProjectError extends Error {
  constructor(
    message: string,
    public readonly status = 400
  ) {
    super(message);
    this.name = "StudentProjectError";
  }
}

function mapRow(row: StudentProjectRow): StudentProject {
  return {
    id: row.id,
    title: row.title,
    mentorId: row.mentor_id ?? undefined,
    progressPercent: row.progress_percent,
    status: row.status,
    milestoneNotes: row.milestone_notes,
    updatedAt: row.updated_at,
  };
}

function buildSeedRows(userId: string) {
  return DUMMY_STUDENT_PROJECTS.map((project) => ({
    id: `${userId}-${project.id}`,
    user_id: userId,
    title: project.title,
    mentor_id: project.mentorId ?? null,
    progress_percent: project.progressPercent,
    status: project.status,
    milestone_notes: project.milestoneNotes,
    updated_at: project.updatedAt,
  }));
}

function buildSeedProjects(userId: string) {
  return DUMMY_STUDENT_PROJECTS.map((project) => ({
    ...project,
    id: `${userId}-${project.id}`,
  }));
}

function isMissingStudentProjectsTable(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return error.code === "PGRST205" || error.code === "42P01" || message.includes("student_projects");
}

function getFallbackProjects(userId: string) {
  const existing = fallbackProjectsByUser.get(userId);
  if (existing) return existing;

  const seeded = buildSeedProjects(userId);
  fallbackProjectsByUser.set(userId, seeded);
  return seeded;
}

function assertKnownProjectStatus(status: unknown): asserts status is ProjectProgressStatus {
  const allowed = ["Not Started", "In Progress", "On Track", "Delayed", "Completed"];
  if (typeof status !== "string" || !allowed.includes(status)) {
    throw new StudentProjectError("Invalid project status.");
  }
}

function normalizePatch(input: ProjectPatch) {
  const patch: Record<string, unknown> = {};

  if (typeof input.title === "string") {
    const title = input.title.trim();
    if (title.length < 2) {
      throw new StudentProjectError("Project title must be at least 2 characters.");
    }
    patch.title = title;
  }

  if (input.mentorId !== undefined) {
    patch.mentor_id = typeof input.mentorId === "string" && input.mentorId.trim() ? input.mentorId.trim() : null;
  }

  if (input.progressPercent !== undefined) {
    const progress = Number(input.progressPercent);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      throw new StudentProjectError("Progress must be an integer between 0 and 100.");
    }
    patch.progress_percent = progress;
  }

  if (input.status !== undefined) {
    assertKnownProjectStatus(input.status);
    patch.status = input.status;
  }

  if (typeof input.milestoneNotes === "string") {
    const milestoneNotes = input.milestoneNotes.trim();
    if (milestoneNotes.length < 5 || milestoneNotes.length > 500) {
      throw new StudentProjectError("Milestone notes must be 5 to 500 characters.");
    }
    patch.milestone_notes = milestoneNotes;
  }

  if (typeof input.updatedAt === "string" && input.updatedAt.trim()) {
    const date = new Date(input.updatedAt);
    if (Number.isNaN(date.getTime())) {
      throw new StudentProjectError("Updated date must be valid.");
    }
    patch.updated_at = date.toISOString();
  }

  return patch;
}

async function selectProjects(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("student_projects")
    .select("id,user_id,title,mentor_id,progress_percent,status,milestone_notes,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingStudentProjectsTable(error)) {
      return getFallbackProjects(userId);
    }

    throw new StudentProjectError(error.message || "Failed to load student projects.", 500);
  }

  return ((data ?? []) as StudentProjectRow[]).map(mapRow);
}

export async function listStudentProjects(userId: string) {
  const existing = await selectProjects(userId);
  if (existing.length > 0) {
    return existing;
  }

  const { error } = await supabaseAdmin
    .from("student_projects")
    .upsert(buildSeedRows(userId) as never, { onConflict: "id" });
  if (error) {
    if (isMissingStudentProjectsTable(error)) {
      return getFallbackProjects(userId);
    }

    throw new StudentProjectError(error.message || "Failed to seed student projects.", 500);
  }

  return selectProjects(userId);
}

export async function updateStudentProject(userId: string, projectId: string, input: ProjectPatch) {
  const patch = normalizePatch(input);
  if (Object.keys(patch).length === 0) {
    throw new StudentProjectError("No project updates were provided.");
  }

  const { data, error } = await supabaseAdmin
    .from("student_projects")
    .update(patch as never)
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("id,user_id,title,mentor_id,progress_percent,status,milestone_notes,updated_at")
    .maybeSingle();

  if (error) {
    if (isMissingStudentProjectsTable(error)) {
      const currentProjects = getFallbackProjects(userId);
      const currentProject = currentProjects.find((project) => project.id === projectId);
      if (!currentProject) {
        throw new StudentProjectError("Student project was not found.", 404);
      }

      const updatedProject: StudentProject = {
        ...currentProject,
        title: typeof input.title === "string" ? input.title : currentProject.title,
        mentorId: input.mentorId === undefined ? currentProject.mentorId : input.mentorId ?? undefined,
        progressPercent:
          typeof input.progressPercent === "number" ? input.progressPercent : currentProject.progressPercent,
        status: input.status ?? currentProject.status,
        milestoneNotes: typeof input.milestoneNotes === "string" ? input.milestoneNotes : currentProject.milestoneNotes,
        updatedAt: input.updatedAt ?? currentProject.updatedAt,
      };

      fallbackProjectsByUser.set(
        userId,
        currentProjects.map((project) => (project.id === projectId ? updatedProject : project))
      );
      return updatedProject;
    }

    throw new StudentProjectError(error.message || "Failed to update student project.", 500);
  }

  if (!data) {
    throw new StudentProjectError("Student project was not found.", 404);
  }

  return mapRow(data as StudentProjectRow);
}
