import { NextResponse } from "next/server";

import { getUserFromAuthHeader } from "@/backend/middleware/auth";
import { listStudentProjects, StudentProjectError } from "@/backend/services/studentProjectService";
import { getErrorMessage } from "@/lib/errorMessage";

export async function GET(request: Request) {
  try {
    const actor = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await listStudentProjects(actor.user.id);
    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof StudentProjectError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load student projects.") },
      { status: 500 }
    );
  }
}

