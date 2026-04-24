import { NextResponse } from "next/server";

import supabaseAdmin from "@/lib/supabase/admin";
import { getUserFromAuthHeader } from "@/backend/middleware/auth";
import { getErrorMessage } from "@/lib/errorMessage";

type StudentProjectRow = {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  status: string;
  progress_percent: number;
  milestone_notes: string | null;
  mentor_id: string | null;
  created_at: string;
  updated_at: string;
};

type UpdateProjectBody = {
  title?: unknown;
  description?: unknown;
  status?: unknown;
  progressPercent?: unknown;
  milestoneNotes?: unknown;
  mentorId?: unknown;
};

function mapProject(row: StudentProjectRow) {
  return {
    id: row.id,
    studentId: row.student_id,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    progressPercent: row.progress_percent,
    milestoneNotes: row.milestone_notes ?? "",
    mentorId: row.mentor_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseProgressPercent(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
    throw new Error("progressPercent must be an integer between 0 and 100.");
  }
  return parsed;
}

function parsePatch(body: UpdateProjectBody) {
  const patch: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      throw new Error("title must be a non-empty string.");
    }
    patch.title = body.title.trim();
  }

  if (body.description !== undefined) {
    patch.description = typeof body.description === "string" ? body.description.trim() : null;
  }

  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !body.status.trim()) {
      throw new Error("status must be a non-empty string.");
    }
    patch.status = body.status.trim();
  }

  if (body.progressPercent !== undefined) {
    patch.progress_percent = parseProgressPercent(body.progressPercent);
  }

  if (body.milestoneNotes !== undefined) {
    if (typeof body.milestoneNotes !== "string") {
      throw new Error("milestoneNotes must be a string.");
    }
    patch.milestone_notes = body.milestoneNotes;
  }

  if (body.mentorId !== undefined) {
    patch.mentor_id = typeof body.mentorId === "string" && body.mentorId.trim() ? body.mentorId.trim() : null;
  }

  return patch;
}

export async function PATCH(request: Request, context: RouteContext<"/api/projects/[id]">) {
  try {
    const actor = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as UpdateProjectBody;
    const patch = parsePatch(body);
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("student_projects")
      .update(patch as never)
      .eq("id", id)
      .eq("student_id", actor.user.id)
      .select("id,student_id,title,description,status,progress_percent,milestone_notes,mentor_id,created_at,updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to update project." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json(mapProject(data as StudentProjectRow));
  } catch (error) {
    const message = getErrorMessage(error, "Invalid project payload.");
    return NextResponse.json(
      { error: message },
      { status: message.includes("must") || message.includes("No valid fields") ? 400 : 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/projects/[id]">) {
  try {
    const actor = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { data, error } = await supabaseAdmin
      .from("student_projects")
      .delete()
      .eq("id", id)
      .eq("student_id", actor.user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to delete project." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to delete project.") },
      { status: 500 }
    );
  }
}
