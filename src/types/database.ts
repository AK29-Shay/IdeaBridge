// ============================================================
// IdeaBridge: TypeScript Types for the Database Schema
// ============================================================

export type PostMode = "request" | "post";
export type PostType = "full_project" | "idea" | "ai_driven" | "campus_req";

// ----- Dynamic Content Payloads (JSONB) -----

export interface FullProjectContent {
  github_url?: string;
  live_url?: string;
  folder_structure?: string;
  color_schema?: string;
}

export interface AIProjectContent {
  master_prompt?: string;
  ide_used?: string;
  ai_agent?: string;
  ai_credits_burned?: number;
}

export interface CampusReqContent {
  component_name?: string;
  crud_features?: string;
  pdf_url?: string;
}

export type DynamicContent = FullProjectContent | AIProjectContent | CampusReqContent | Record<string, unknown>;

// ----- Database Row Types -----

export interface Post {
  id: string;
  user_id: string;
  post_mode: PostMode;
  post_type: PostType;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  dynamic_content: DynamicContent;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  is_accepted: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "Student" | "Mentor" | "Admin";
  created_at: string;
}

// ----- Enriched / Joined Types -----

// Flat row returned by the fetch_thread() Supabase RPC
export interface ThreadRow {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  is_accepted: boolean;
  upvotes: number;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_role: "Student" | "Mentor" | "Admin";
  depth: number;
  path: string[];
}

// Nested tree node used by the frontend ProjectThread component
export interface CommentNode extends ThreadRow {
  replies: CommentNode[];
}
