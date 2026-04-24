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

type CreateProjectBody = {
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
  if (value === undefined) return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
    throw new Error("progressPercent must be an integer between 0 and 100.");
  }
  return parsed;
}

function parseBody(input: CreateProjectBody) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) {
    throw new Error("title is required.");
  }

  const description = typeof input.description === "string" ? input.description.trim() : null;
  const status = typeof input.status === "string" && input.status.trim() ? input.status.trim() : "planning";
  const milestoneNotes = typeof input.milestoneNotes === "string" ? input.milestoneNotes : "";
  const mentorId = typeof input.mentorId === "string" && input.mentorId.trim() ? input.mentorId.trim() : null;

  return {
    title,
    description,
    status,
    progress_percent: parseProgressPercent(input.progressPercent),
    milestone_notes: milestoneNotes,
    mentor_id: mentorId,
  };
}

export async function GET(request: Request) {
  try {
    const actor = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("student_projects")
      .select("id,student_id,title,description,status,progress_percent,milestone_notes,mentor_id,created_at,updated_at")
      .eq("student_id", actor.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to load projects." }, { status: 500 });
    }

    return NextResponse.json(((data ?? []) as StudentProjectRow[]).map(mapProject));
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load projects.") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateProjectBody;
    const payload = parseBody(body);

    const { data, error } = await supabaseAdmin
      .from("student_projects")
      .insert({
        student_id: actor.user.id,
        ...payload,
      } as never)
      .select("id,student_id,title,description,status,progress_percent,milestone_notes,mentor_id,created_at,updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to create project." }, { status: 500 });
    }

    return NextResponse.json(mapProject(data as StudentProjectRow));
  } catch (error) {
    const message = getErrorMessage(error, "Invalid project payload.");
    return NextResponse.json(
      { error: message },
      { status: message.includes("required") || message.includes("progressPercent") ? 400 : 500 }
    );
  }
}
