import { NextResponse } from "next/server";

import { refineIdeaDraft } from "@/backend/services/ideaRefinementService";
import { getErrorMessage } from "@/lib/errorMessage";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = refineIdeaDraft({
      title: body?.title,
      description: body?.description,
      techStack: Array.isArray(body?.techStack) ? body.techStack : [],
      variant: body?.variant,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to refine the idea draft.") },
      { status: 400 }
    );
  }
}
