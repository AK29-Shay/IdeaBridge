import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface RouteContext {
  params: Promise<{ postId: string }>;
}

// GET /api/posts/[postId]/comments - Fetch the full recursive comment thread
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;

    const { data, error } = await supabaseAdmin.rpc("fetch_thread", {
      p_post_id: postId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build nested tree from flat rows
    const map = new Map<string, Record<string, unknown>>();
    const roots: Record<string, unknown>[] = [];

    for (const row of (data as Record<string, unknown>[])) {
      map.set(row.id as string, { ...row, replies: [] });
    }

    for (const row of (data as Record<string, unknown>[])) {
      const node = map.get(row.id as string)!;
      if (row.parent_comment_id && map.has(row.parent_comment_id as string)) {
        (map.get(row.parent_comment_id as string)!.replies as unknown[]).push(node);
      } else {
        roots.push(node);
      }
    }

    return NextResponse.json(roots);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/posts/[postId]/comments - Add a comment to a post
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { postId } = await params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, parent_comment_id } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_comment_id: parent_comment_id ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
