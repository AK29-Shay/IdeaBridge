import { NextResponse } from "next/server";
import {
  IdeaCommentAttachment,
  IdeaPersistenceError,
  createIdeaComment,
  fetchIdeaThread,
} from "@/backend/services/ideaPersistenceService";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

type CreateCommentBody = {
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  content?: string;
  parent_comment_id?: string | null;
  attachments?: IdeaCommentAttachment[];
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;
    const thread = await fetchIdeaThread(postId);
    return NextResponse.json(thread);
  } catch (error) {
    if (error instanceof IdeaPersistenceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;
    const body = (await request.json()) as CreateCommentBody;

    const created = await createIdeaComment(postId, {
      actorEmail: typeof body.actorEmail === "string" ? body.actorEmail : "",
      actorName: typeof body.actorName === "string" ? body.actorName : undefined,
      actorRole: typeof body.actorRole === "string" ? body.actorRole : undefined,
      content: typeof body.content === "string" ? body.content : "",
      parent_comment_id:
        typeof body.parent_comment_id === "string" ? body.parent_comment_id : body.parent_comment_id ?? null,
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof IdeaPersistenceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create comment." },
      { status: 500 }
    );
  }
}
