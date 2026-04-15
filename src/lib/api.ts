// ============================================================
// IdeaBridge: Supabase Client Functions
// All frontend-to-database interaction lives here.
// ============================================================

import { supabase } from "./supabase";
import type { Post, Comment, CommentNode, ThreadRow, PostMode, PostType, DynamicContent } from "../types/database";

// ---- Payload types for creating records ----

interface CreatePostPayload {
  post_mode: PostMode;
  post_type: PostType;
  title: string;
  description?: string;
  tech_stack?: string[];
  dynamic_content?: DynamicContent;
}

// ============================================================
// POSTS
// ============================================================

/**
 * Creates a new post, serializing the dynamic frontend form state
 * into the JSONB `dynamic_content` column.
 */
export async function createPost(data: CreatePostPayload): Promise<Post> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("User must be logged in to create a post.");

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      post_mode: data.post_mode,
      post_type: data.post_type,
      title: data.title,
      description: data.description ?? null,
      tech_stack: data.tech_stack ?? [],
      dynamic_content: data.dynamic_content ?? {},
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create post: ${error.message}`);
  return post as Post;
}

/**
 * Fetches all posts, joined with the author's profile.
 */
export async function fetchPosts() {
  const { data, error } = await supabase
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

  if (error) throw new Error(`Failed to fetch posts: ${error.message}`);
  return data;
}

/**
 * Fetches a single post by ID, joined with the author's profile.
 */
export async function fetchPostById(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        role
      )
    `)
    .eq("id", postId)
    .single();

  if (error) throw new Error(`Failed to fetch post: ${error.message}`);
  return data;
}


// ============================================================
// COMMENTS
// ============================================================

/**
 * Inserts a new comment into a thread.
 * @param postId  - The ID of the parent post.
 * @param content - Markdown-formatted text.
 * @param parentId - (optional) The ID of the parent comment for replies.
 */
export async function addComment(
  postId: string,
  content: string,
  parentId?: string | null
): Promise<Comment> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("User must be logged in to comment.");

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      parent_comment_id: parentId ?? null,
      content,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add comment: ${error.message}`);
  return comment as Comment;
}

/**
 * Increments the upvote count for a comment.
 */
export async function upvoteComment(commentId: string, currentCount: number): Promise<void> {
  const { error } = await supabase
    .from("comments")
    .update({ upvotes: currentCount + 1 })
    .eq("id", commentId);

  if (error) throw new Error(`Failed to upvote: ${error.message}`);
}

/**
 * Allows the post owner to accept a single comment as the best answer.
 * This sets is_accepted=TRUE on the target and FALSE on all others in the post.
 */
export async function acceptComment(postId: string, commentId: string): Promise<void> {
  // Unacccept all existing accepted comments for this post first
  await supabase
    .from("comments")
    .update({ is_accepted: false })
    .eq("post_id", postId)
    .eq("is_accepted", true);

  // Accept the selected comment
  const { error } = await supabase
    .from("comments")
    .update({ is_accepted: true })
    .eq("id", commentId);

  if (error) throw new Error(`Failed to accept comment: ${error.message}`);
}


// ============================================================
// THREAD FETCHING (Recursive Hierarchical Tree)
// Calls the PostgreSQL `fetch_thread` RPC function which uses
// a recursive CTE to efficiently build the entire comment tree.
// ============================================================

/**
 * Converts a flat array of ThreadRows (ordered by path) into
 * a nested CommentNode tree suitable for the ProjectThread component.
 */
function buildCommentTree(rows: ThreadRow[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const row of rows) {
    map.set(row.id, { ...row, replies: [] });
  }

  for (const row of rows) {
    const node = map.get(row.id)!;
    if (row.parent_comment_id && map.has(row.parent_comment_id)) {
      map.get(row.parent_comment_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Fetches all comments for a post as a nested tree by calling
 * the `fetch_thread` Postgres RPC function (defined in schema.sql).
 */
export async function fetchThread(postId: string): Promise<CommentNode[]> {
  const { data, error } = await supabase.rpc("fetch_thread", { p_post_id: postId });

  if (error) throw new Error(`Failed to fetch thread: ${error.message}`);
  return buildCommentTree(data as ThreadRow[]);
}
