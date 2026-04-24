import { NextResponse } from "next/server";

import { getUserFromAuthHeader } from "@/backend/middleware/auth";
import { StudentProjectError, updateStudentProject } from "@/backend/services/studentProjectService";
import { getErrorMessage } from "@/lib/errorMessage";

export async function PATCH(request: Request, context: RouteContext<"/api/student-projects/[projectId]">) {
  try {
    const actor = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const body = await request.json();
    const project = await updateStudentProject(actor.user.id, projectId, body);
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof StudentProjectError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update student project.") },
      { status: 500 }
    );
  }
}

