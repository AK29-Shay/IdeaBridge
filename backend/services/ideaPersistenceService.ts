import supabaseServer from "../config/supabaseServer";

const IDEAS_MODULE = "idea_guidance";
const AUTH_USERS_PAGE_SIZE = 200;

export type IdeaPostMode = "request" | "post";
export type IdeaPostType = "full_project" | "idea" | "ai_driven" | "campus_req";
export type IdeaUserRole = "Student" | "Mentor" | "Admin";
export type IdeaThreadRole = "Mentor" | "Student" | "Post Owner";

export type IdeaCommentAttachment = {
  id?: string;
  name?: string;
  url?: string;
  kind?: "image" | "gif" | "video";
};

export type IdeaPostAuthor = {
  id: string;
  name: string;
  avatarUrl: string;
  role: IdeaUserRole;
};

export type IdeaPostRecord = {
  id: string;
  user_id: string;
  post_mode: IdeaPostMode;
  post_type: IdeaPostType;
  title: string;
  description: string;
  tech_stack: string[];
  dynamic_content: Record<string, unknown>;
  view_count: number;
  created_at: string;
  updated_at: string;
  author: IdeaPostAuthor;
};

export type IdeaThreadNode = {
  id: string;
  author: string;
  avatarUrl: string;
  role: IdeaThreadRole;
  content: string;
  upvotes: number;
  timestamp: string;
  isAcceptedAnswer?: boolean;
  replies: IdeaThreadNode[];
};

export type IdeaAnalyticsProject = {
  id: string;
  title: string;
  category: string;
  createdDate: string;
  contributions: number;
  likes: number;
  views: number;
  responses: number;
  description: string;
};

export type IdeaAnalyticsRequest = {
  id: string;
  category: string;
  status: "pending" | "answered" | "completed";
  requestedAt: string;
};

export type IdeaAnalyticsThreadNote = {
  id: string;
  role: IdeaThreadRole;
  author: string;
  time: string;
  message: string;
};

export type IdeaAnalyticsSnapshot = {
  projects: IdeaAnalyticsProject[];
  requests: IdeaAnalyticsRequest[];
  threadsByProject: Record<string, IdeaAnalyticsThreadNote[]>;
};

export class IdeaPersistenceError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

type ActorInput = {
  email: string;
  name?: string;
  role?: string;
};

type ActorRecord = {
  id: string;
  email: string;
  name: string;
  role: IdeaUserRole;
};

type AuthAdminUser = {
  id?: string;
  email?: string | null;
};

type ProfileRecord = {
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type IdeaPostRow = {
  id: string;
  user_id: string;
  post_mode: string;
  post_type: string;
  title: string;
  description: string | null;
  tech_stack?: unknown;
  dynamic_content: unknown;
  view_count: number | null;
  created_at: string;
  updated_at?: string;
};

type IdeaCommentSummaryRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  upvotes: number | null;
  created_at: string;
};

type MentorshipRequestRow = {
  id: string;
  domain: string | null;
  status: string | null;
  created_at: string;
};

type PostListFilters = {
  mode?: IdeaPostMode;
  limit?: number;
};

type CreateIdeaPostInput = {
  actorEmail: string;
  actorName?: string;
  actorRole?: string;
  post_mode: IdeaPostMode;
  post_type: IdeaPostType;
  title: string;
  description?: string;
  tech_stack?: string[];
  dynamic_content?: Record<string, unknown>;
};

type CreateIdeaCommentInput = {
  actorEmail: string;
  actorName?: string;
  actorRole?: string;
  content: string;
  parent_comment_id?: string | null;
  attachments?: IdeaCommentAttachment[];
};

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeRole(value: unknown): IdeaUserRole {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "mentor") return "Mentor";
  if (raw === "admin") return "Admin";
  return "Student";
}

function normalizePostMode(value: unknown): IdeaPostMode {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "post";
  return raw === "request" ? "request" : "post";
}

function normalizePostType(value: unknown): IdeaPostType {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "idea";
  if (raw === "full_project" || raw === "ai_driven" || raw === "campus_req") {
    return raw;
  }
  return "idea";
}

function defaultDisplayName(email: string): string {
  const username = email.split("@")[0] || "Member";
  const parts = username.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  if (parts.length === 0) return "Member";
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .slice(0, 64);
}

function normalizeAnalyticsStatus(value: unknown): "pending" | "answered" | "completed" {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "pending";
  if (raw === "completed") return "completed";
  if (raw === "cancelled" || raw === "approved" || raw === "answered" || raw === "resolved") return "answered";
  return "pending";
}

function isFetchThreadUnavailable(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";

  return code === "PGRST202" || message.toLowerCase().includes("fetch_thread");
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / (1000 * 60)), 0);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function summarizeMessage(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= 220) return compact;
  return `${compact.slice(0, 217)}...`;
}

function mapPostTypeToCategory(postType: IdeaPostType, dynamicContent: Record<string, unknown>): string {
  const explicitCategory = normalizeString(dynamicContent.category);
  if (explicitCategory) {
    return explicitCategory;
  }

  switch (postType) {
    case "full_project":
      return "Full Project";
    case "ai_driven":
      return "AI Driven";
    case "campus_req":
      return "Campus Requirement";
    default:
      return "Project Idea";
  }
}

function mapAttachmentsToMarkdown(attachments: IdeaCommentAttachment[] | undefined): string {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return "";
  }

  const lines: string[] = [];
  for (const attachment of attachments) {
    const url = normalizeString(attachment.url);
    if (!url) continue;

    const name = normalizeString(attachment.name) || "Attachment";
    const kind = attachment.kind;

    if (kind === "image" || kind === "gif") {
      lines.push(`![${name}](${url})`);
    } else {
      lines.push(`[${name}](${url})`);
    }
  }

  if (lines.length === 0) {
    return "";
  }

  return `\n\nAttachments:\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

async function findOrCreateAuthUserByEmail(actor: ActorInput): Promise<ActorRecord> {
  const email = normalizeEmail(actor.email);
  if (!email) {
    throw new IdeaPersistenceError("actorEmail is required.", 400);
  }

  let page = 1;
  let foundUserId: string | null = null;

  while (page <= 10 && !foundUserId) {
    const { data, error } = await supabaseServer.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (error) {
      throw new IdeaPersistenceError(error.message, 500);
    }

    const user = data.users.find((entry: AuthAdminUser) => normalizeEmail(entry.email) === email);
    if (user?.id) {
      foundUserId = user.id;
      break;
    }

    if (data.users.length < AUTH_USERS_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  if (!foundUserId) {
    const generatedPassword = `IdeaBridge_${Date.now()}_Aa1!`;
    const { data, error } = await supabaseServer.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: normalizeString(actor.name) || defaultDisplayName(email),
      },
    });

    if (error || !data.user?.id) {
      throw new IdeaPersistenceError(error?.message || "Failed to create actor account.", 500);
    }

    foundUserId = data.user.id;
  }

  if (!foundUserId) {
    throw new IdeaPersistenceError("Failed to resolve actor account.", 500);
  }

  const actorRecord: ActorRecord = {
    id: foundUserId,
    email,
    name: normalizeString(actor.name) || defaultDisplayName(email),
    role: normalizeRole(actor.role),
  };

  await ensureProfile(actorRecord);

  return actorRecord;
}

async function ensureProfile(actor: ActorRecord) {
  const { error } = await supabaseServer.from("profiles").upsert(
    {
      id: actor.id,
      full_name: actor.name,
      role: actor.role,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }
}

async function loadProfiles(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, ProfileRecord>();
  }

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("id,full_name,avatar_url,role")
    .in("id", userIds);

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }

  const map = new Map<string, ProfileRecord>();
  for (const profile of data ?? []) {
    map.set(profile.id, {
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
    });
  }

  return map;
}

function toAuthor(
  userId: string,
  profile: ProfileRecord | undefined
): IdeaPostAuthor {
  return {
    id: userId,
    name: normalizeString(profile?.full_name) || "Member",
    avatarUrl: normalizeString(profile?.avatar_url),
    role: normalizeRole(profile?.role),
  };
}

function mapPostRow(row: IdeaPostRow, profileMap: Map<string, ProfileRecord>): IdeaPostRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    post_mode: normalizePostMode(row.post_mode),
    post_type: normalizePostType(row.post_type),
    title: row.title,
    description: row.description ?? "",
    tech_stack: toStringArray(row.tech_stack),
    dynamic_content: toObject(row.dynamic_content),
    view_count: Number(row.view_count) || 0,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    author: toAuthor(row.user_id, profileMap.get(row.user_id)),
  };
}

async function loadIdeaPost(postId: string): Promise<IdeaPostRecord> {
  const { data, error } = await supabaseServer
    .from("posts")
    .select("id,user_id,post_mode,post_type,title,description,tech_stack,dynamic_content,view_count,created_at,updated_at")
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }

  if (!data) {
    throw new IdeaPersistenceError("Post not found.", 404);
  }

  const dynamic = toObject(data.dynamic_content);
  const moduleName = normalizeString(dynamic.module);
  if (moduleName !== IDEAS_MODULE) {
    throw new IdeaPersistenceError("Post not found.", 404);
  }

  const profiles = await loadProfiles([data.user_id]);
  return mapPostRow(data, profiles);
}

export async function listIdeaPosts(filters: PostListFilters = {}): Promise<IdeaPostRecord[]> {
  const mode = filters.mode ? normalizePostMode(filters.mode) : undefined;
  const limit = typeof filters.limit === "number" && filters.limit > 0 ? Math.min(filters.limit, 100) : 30;

  let query = supabaseServer
    .from("posts")
    .select("id,user_id,post_mode,post_type,title,description,tech_stack,dynamic_content,view_count,created_at,updated_at")
    .contains("dynamic_content", { module: IDEAS_MODULE })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (mode) {
    query = query.eq("post_mode", mode);
  }

  const { data, error } = await query;

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }

  const rows = (data ?? []) as IdeaPostRow[];
  const userIds = Array.from(new Set(rows.map((row) => row.user_id)));
  const profileMap = await loadProfiles(userIds);

  return rows.map((row) => mapPostRow(row, profileMap));
}

export async function createIdeaPost(input: CreateIdeaPostInput): Promise<IdeaPostRecord> {
  const actor = await findOrCreateAuthUserByEmail({
    email: input.actorEmail,
    name: input.actorName,
    role: input.actorRole,
  });

  const title = normalizeString(input.title);
  if (!title) {
    throw new IdeaPersistenceError("title is required.", 400);
  }

  const description = normalizeString(input.description);
  const mode = normalizePostMode(input.post_mode);
  const postType = normalizePostType(input.post_type);
  const techStack = toStringArray(input.tech_stack);

  const dynamicContent = {
    ...toObject(input.dynamic_content),
    module: IDEAS_MODULE,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
  };

  const { data, error } = await supabaseServer
    .from("posts")
    .insert({
      user_id: actor.id,
      post_mode: mode,
      post_type: postType,
      title,
      description: description || null,
      tech_stack: techStack,
      dynamic_content: dynamicContent,
    })
    .select("id,user_id,post_mode,post_type,title,description,tech_stack,dynamic_content,view_count,created_at,updated_at")
    .single();

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }

  const profileMap = await loadProfiles([actor.id]);
  return mapPostRow(data, profileMap);
}

type ThreadRow = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  is_accepted: boolean;
  upvotes: number;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  author_role: string | null;
};

type RawCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  is_accepted: boolean;
  upvotes: number;
  created_at: string;
};

async function loadThreadRowsWithFallback(postId: string): Promise<ThreadRow[]> {
  const rpc = await supabaseServer.rpc("fetch_thread", {
    p_post_id: postId,
  });

  if (!rpc.error) {
    return (rpc.data ?? []) as ThreadRow[];
  }

  if (!isFetchThreadUnavailable(rpc.error)) {
    throw new IdeaPersistenceError(rpc.error.message, 500);
  }

  const { data: commentsRaw, error: commentsError } = await supabaseServer
    .from("comments")
    .select("id,post_id,user_id,parent_comment_id,content,is_accepted,upvotes,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    throw new IdeaPersistenceError(commentsError.message, 500);
  }

  const comments = (commentsRaw ?? []) as RawCommentRow[];
  const userIds = Array.from(new Set(comments.map((comment) => comment.user_id).filter(Boolean)));
  const profiles = await loadProfiles(userIds);

  return comments.map((row) => {
    const profile = profiles.get(row.user_id);
    return {
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      parent_comment_id: row.parent_comment_id,
      content: row.content,
      is_accepted: row.is_accepted,
      upvotes: row.upvotes,
      created_at: row.created_at,
      author_name: profile?.full_name ?? "Anonymous",
      author_avatar: profile?.avatar_url ?? null,
      author_role: profile?.role ?? "Student",
    };
  });
}

export async function fetchIdeaThread(postId: string): Promise<IdeaThreadNode[]> {
  const post = await loadIdeaPost(postId);

  const rows = await loadThreadRowsWithFallback(postId);

  const map = new Map<string, IdeaThreadNode>();
  const roots: IdeaThreadNode[] = [];

  for (const row of rows) {
    const role: IdeaThreadRole =
      row.user_id === post.user_id
        ? "Post Owner"
        : normalizeRole(row.author_role) === "Mentor"
          ? "Mentor"
          : "Student";

    map.set(row.id, {
      id: row.id,
      author: normalizeString(row.author_name) || "Anonymous",
      avatarUrl: normalizeString(row.author_avatar) || "https://i.pravatar.cc/150?u=ideabridge-thread",
      role,
      content: row.content,
      upvotes: Number(row.upvotes) || 0,
      timestamp: formatRelativeTime(row.created_at),
      isAcceptedAnswer: Boolean(row.is_accepted),
      replies: [],
    });
  }

  for (const row of rows) {
    const node = map.get(row.id);
    if (!node) continue;

    if (row.parent_comment_id && map.has(row.parent_comment_id)) {
      map.get(row.parent_comment_id)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function createIdeaComment(postId: string, input: CreateIdeaCommentInput) {
  const post = await loadIdeaPost(postId);

  const actor = await findOrCreateAuthUserByEmail({
    email: input.actorEmail,
    name: input.actorName,
    role: input.actorRole,
  });

  let content = normalizeString(input.content);
  content += mapAttachmentsToMarkdown(input.attachments);
  content = content.trim();

  if (!content) {
    throw new IdeaPersistenceError("content is required.", 400);
  }

  const { data, error } = await supabaseServer
    .from("comments")
    .insert({
      post_id: post.id,
      user_id: actor.id,
      parent_comment_id: normalizeString(input.parent_comment_id) || null,
      content,
    })
    .select("id,post_id,parent_comment_id,content,created_at")
    .single();

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }

  return data;
}

export async function updateIdeaComment(postId: string, commentId: string, actorEmail: string, content: string) {
  await loadIdeaPost(postId);

  const actor = await findOrCreateAuthUserByEmail({ email: actorEmail });
  const trimmedContent = normalizeString(content);

  if (!trimmedContent) {
    throw new IdeaPersistenceError("content is required.", 400);
  }

  const { data: existing, error: findError } = await supabaseServer
    .from("comments")
    .select("id,user_id")
    .eq("id", commentId)
    .eq("post_id", postId)
    .maybeSingle();

  if (findError) {
    throw new IdeaPersistenceError(findError.message, 500);
  }

  if (!existing) {
    throw new IdeaPersistenceError("Comment not found.", 404);
  }

  if (existing.user_id !== actor.id) {
    throw new IdeaPersistenceError("Forbidden", 403);
  }

  const { data, error } = await supabaseServer
    .from("comments")
    .update({ content: trimmedContent })
    .eq("id", commentId)
    .eq("post_id", postId)
    .select("id,content,updated_at")
    .single();

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }

  return data;
}

export async function deleteIdeaComment(postId: string, commentId: string, actorEmail: string) {
  await loadIdeaPost(postId);

  const actor = await findOrCreateAuthUserByEmail({ email: actorEmail });

  const { data: existing, error: findError } = await supabaseServer
    .from("comments")
    .select("id,user_id")
    .eq("id", commentId)
    .eq("post_id", postId)
    .maybeSingle();

  if (findError) {
    throw new IdeaPersistenceError(findError.message, 500);
  }

  if (!existing) {
    throw new IdeaPersistenceError("Comment not found.", 404);
  }

  if (existing.user_id !== actor.id) {
    throw new IdeaPersistenceError("Forbidden", 403);
  }

  const { error } = await supabaseServer
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("post_id", postId);

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }

  return { ok: true };
}

export async function buildIdeaAnalyticsSnapshot(): Promise<IdeaAnalyticsSnapshot> {
  const { data: postsRaw, error: postsError } = await supabaseServer
    .from("posts")
    .select("id,user_id,post_mode,post_type,title,description,dynamic_content,view_count,created_at")
    .contains("dynamic_content", { module: IDEAS_MODULE })
    .order("created_at", { ascending: false });

  if (postsError) {
    throw new IdeaPersistenceError(postsError.message, 500);
  }

  const posts = (postsRaw ?? []) as IdeaPostRow[];
  const postIds = posts.map((post) => post.id);

  const commentsByPost = new Map<string, Array<{ id: string; post_id: string; user_id: string; content: string; upvotes: number; created_at: string }>>();

  if (postIds.length > 0) {
    const { data: commentsRaw, error: commentsError } = await supabaseServer
      .from("comments")
      .select("id,post_id,user_id,content,upvotes,created_at")
      .in("post_id", postIds)
      .order("created_at", { ascending: false });

    if (commentsError) {
      throw new IdeaPersistenceError(commentsError.message, 500);
    }

    for (const comment of (commentsRaw ?? []) as IdeaCommentSummaryRow[]) {
      const existing = commentsByPost.get(comment.post_id) ?? [];
      existing.push({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        upvotes: Number(comment.upvotes) || 0,
        created_at: comment.created_at,
      });
      commentsByPost.set(comment.post_id, existing);
    }
  }

  const allUserIds = Array.from(
    new Set([
      ...posts.map((post) => post.user_id),
      ...Array.from(commentsByPost.values()).flatMap((items) => items.map((item) => item.user_id)),
    ])
  );

  const profileMap = await loadProfiles(allUserIds);

  const projectPosts = posts.filter((post) => normalizePostMode(post.post_mode) === "post");
  const ideaRequestPosts = posts.filter((post) => normalizePostMode(post.post_mode) === "request");

  const projects: IdeaAnalyticsProject[] = projectPosts.map((post) => {
    const dynamic = toObject(post.dynamic_content);
    const comments = commentsByPost.get(post.id) ?? [];
    const responseCount = comments.length;
    const likes = comments.reduce((sum, item) => sum + item.upvotes, 0);

    return {
      id: post.id,
      title: post.title,
      category: mapPostTypeToCategory(normalizePostType(post.post_type), dynamic),
      createdDate: post.created_at,
      contributions: Math.max(responseCount + 1, 1),
      likes,
      views: Number(post.view_count) || 0,
      responses: responseCount,
      description: normalizeString(post.description),
    };
  });

  const threadsByProject: Record<string, IdeaAnalyticsThreadNote[]> = {};
  for (const post of projectPosts) {
    const postComments = commentsByPost.get(post.id) ?? [];
    threadsByProject[post.id] = postComments.slice(0, 6).map((comment) => {
      const profile = profileMap.get(comment.user_id);
      const role: IdeaThreadRole =
        comment.user_id === post.user_id
          ? "Post Owner"
          : normalizeRole(profile?.role) === "Mentor"
            ? "Mentor"
            : "Student";

      return {
        id: comment.id,
        role,
        author: normalizeString(profile?.full_name) || "Member",
        time: formatRelativeTime(comment.created_at),
        message: summarizeMessage(comment.content),
      };
    });
  }

  const { data: mentorshipRequestsRaw, error: mentorshipRequestsError } = await supabaseServer
    .from("requests")
    .select("id,domain,status,created_at")
    .order("created_at", { ascending: false });

  if (mentorshipRequestsError) {
    throw new IdeaPersistenceError(mentorshipRequestsError.message, 500);
  }

  const mentorshipRequests: IdeaAnalyticsRequest[] = ((mentorshipRequestsRaw ?? []) as MentorshipRequestRow[]).map((request) => ({
    id: request.id,
    category: normalizeString(request.domain) || "Mentorship",
    status: normalizeAnalyticsStatus(request.status),
    requestedAt: request.created_at,
  }));

  const ideaRequests: IdeaAnalyticsRequest[] = ideaRequestPosts.map((post) => {
    const dynamic = toObject(post.dynamic_content);
    const hasResponse = (commentsByPost.get(post.id) ?? []).length > 0;

    return {
      id: post.id,
      category: mapPostTypeToCategory(normalizePostType(post.post_type), dynamic),
      status: hasResponse ? "answered" : "pending",
      requestedAt: post.created_at,
    };
  });

  return {
    projects,
    requests: [...ideaRequests, ...mentorshipRequests],
    threadsByProject,
  };
}
