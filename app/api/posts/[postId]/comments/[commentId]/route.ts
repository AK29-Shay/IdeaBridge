import { NextResponse } from "next/server";
import {
  IdeaPersistenceError,
  deleteIdeaComment,
  updateIdeaComment,
} from "@/backend/services/ideaPersistenceService";

type RouteContext = {
  params: Promise<{ postId: string; commentId: string }>;
};

type UpdateCommentBody = {
  actorEmail?: string;
  content?: string;
};

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { postId, commentId } = await context.params;
    const body = (await request.json()) as UpdateCommentBody;

    const updated = await updateIdeaComment(
      postId,
      commentId,
      normalizeEmail(body.actorEmail),
      typeof body.content === "string" ? body.content : ""
    );

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof IdeaPersistenceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update comment." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { postId, commentId } = await context.params;
    const { searchParams } = new URL(request.url);
    const actorEmail = normalizeEmail(searchParams.get("actorEmail"));

    const result = await deleteIdeaComment(postId, commentId, actorEmail);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof IdeaPersistenceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete comment." },
      { status: 500 }
    );
  }
}
