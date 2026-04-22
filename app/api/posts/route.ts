import { NextResponse } from "next/server";
import {
  IdeaPersistenceError,
  createIdeaPost,
  listIdeaPosts,
} from "@/backend/services/ideaPersistenceService";

type CreatePostBody = {
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  post_mode?: "request" | "post";
  post_type?: "full_project" | "idea" | "ai_driven" | "campus_req";
  title?: string;
  description?: string;
  tech_stack?: string[];
  dynamic_content?: Record<string, unknown>;
};

function asMode(value: unknown): "request" | "post" {
  return value === "request" ? "request" : "post";
}

function asPostType(value: unknown): "full_project" | "idea" | "ai_driven" | "campus_req" {
  if (value === "full_project" || value === "ai_driven" || value === "campus_req") {
    return value;
  }
  return "idea";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get("mode");
    const mode = modeParam === "request" || modeParam === "post" ? modeParam : undefined;

    const limitRaw = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined;

    const data = await listIdeaPosts({ mode, limit });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof IdeaPersistenceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch posts." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePostBody;

    const created = await createIdeaPost({
      actorEmail: typeof body.actorEmail === "string" ? body.actorEmail : "",
      actorName: typeof body.actorName === "string" ? body.actorName : undefined,
      actorRole: typeof body.actorRole === "string" ? body.actorRole : undefined,
      post_mode: asMode(body.post_mode),
      post_type: asPostType(body.post_type),
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : "",
      tech_stack: Array.isArray(body.tech_stack) ? body.tech_stack : [],
      dynamic_content:
        body.dynamic_content && typeof body.dynamic_content === "object" && !Array.isArray(body.dynamic_content)
          ? body.dynamic_content
          : {},
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof IdeaPersistenceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create post." },
      { status: 500 }
    );
  }
}
