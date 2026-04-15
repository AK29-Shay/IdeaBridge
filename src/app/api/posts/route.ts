import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    // Verify Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    // Get user from the token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { post_mode, post_type, title, description, tech_stack, dynamic_content } = body;

    if (!title || !post_mode || !post_type) {
      return NextResponse.json({ error: "Missing required fields: title, post_mode, post_type" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("posts")
      .insert({
        user_id: user.id,
        post_mode,
        post_type,
        title,
        description: description ?? null,
        tech_stack: tech_stack ?? [],
        dynamic_content: dynamic_content ?? {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/posts - Fetch all posts
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select(`
        *,
        profiles (
          full_name,
          avatar_url,
          role
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
