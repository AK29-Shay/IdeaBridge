import { NextResponse } from "next/server";
import {
  BlogStorageError,
  deleteStoredBlog,
  mentorBlogsTableHint,
  updateStoredBlog,
} from "@/backend/services/blogPersistenceService";

type BlogPayload = {
  title?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  authorEmail?: string;
};

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as BlogPayload;

    const authorEmail = normalizeEmail(body.authorEmail);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!id || !authorEmail || !title || !content) {
      return NextResponse.json(
        { error: "id, authorEmail, title, and content are required." },
        { status: 400 }
      );
    }

    const data = await updateStoredBlog(id, {
      authorEmail,
      title,
      content,
      imageUrl: body.imageUrl,
      videoUrl: body.videoUrl,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BlogStorageError) {
      return NextResponse.json(
        {
          error: error.message,
          hint: mentorBlogsTableHint(error),
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update mentor blog.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const authorEmail = normalizeEmail(searchParams.get("authorEmail"));

    if (!id || !authorEmail) {
      return NextResponse.json(
        { error: "id and authorEmail are required." },
        { status: 400 }
      );
    }

    await deleteStoredBlog(id, authorEmail);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof BlogStorageError) {
      return NextResponse.json(
        {
          error: error.message,
          hint: mentorBlogsTableHint(error),
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete mentor blog.",
      },
      { status: 500 }
    );
  }
}
