import { NextResponse } from "next/server";
import {
  BlogStorageError,
  createStoredBlog,
  listStoredBlogs,
  mentorBlogsTableHint,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorEmail = normalizeEmail(searchParams.get("authorEmail"));

    const data = await listStoredBlogs(authorEmail);
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
        error: error instanceof Error ? error.message : "Failed to fetch mentor blogs.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BlogPayload;

    const authorEmail = normalizeEmail(body.authorEmail);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!authorEmail || !title || !content) {
      return NextResponse.json(
        { error: "authorEmail, title, and content are required." },
        { status: 400 }
      );
    }

    const data = await createStoredBlog({
      authorEmail,
      title,
      content,
      imageUrl: body.imageUrl,
      videoUrl: body.videoUrl,
    });

    return NextResponse.json(data, { status: 201 });
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
        error: error instanceof Error ? error.message : "Failed to create mentor blog.",
      },
      { status: 500 }
    );
  }
}
