import supabaseServer from "../config/supabaseServer";
import { DUMMY_STUDENT_PROJECTS } from "@/lib/dummyData";
import { mockThreadData, type CommentNode } from "@/lib/ideas/mockThread";
import { getSupabaseServerConfigError, isSupabaseServerConfigured } from "@/lib/supabase/admin";

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

export type IdeaAnalyticsTopicSignal = {
  topic: string;
  score: number;
  mentions: number;
  categories: string[];
  projects: string[];
};

export type IdeaAnalyticsDataSource = "live" | "hybrid";

export type IdeaAnalyticsSnapshot = {
  projects: IdeaAnalyticsProject[];
  requests: IdeaAnalyticsRequest[];
  threadsByProject: Record<string, IdeaAnalyticsThreadNote[]>;
  topicSignals: IdeaAnalyticsTopicSignal[];
  dataSource: IdeaAnalyticsDataSource;
  dataSourceMessage: string;
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

const TOPIC_LIBRARY = [
  { topic: "AI / ML", keywords: ["ai", "ml", "machine learning", "model", "learning plan", "generator", "personalized"] },
  { topic: "EdTech", keywords: ["study", "notes", "learning", "coach", "student", "education", "companion"] },
  { topic: "Accessibility", keywords: ["accessibility", "accessible", "navigation", "campusmap", "routing", "map"] },
  { topic: "Authentication", keywords: ["auth", "authentication", "session", "supabase", "login"] },
  { topic: "React / Next.js", keywords: ["react", "next.js", "app router", "react query", "swr", "frontend"] },
  { topic: "Research", keywords: ["research", "validation", "startup", "scope", "discovery"] },
] as const;

const OFFLINE_IDEA_POSTS: IdeaPostRecord[] = [
  {
    id: "offline-quantum-notes",
    user_id: "student-quantum",
    post_mode: "post",
    post_type: "full_project",
    title: "Quantum Notes: Smart Study Companion",
    description: "Building a study assistant with guided note generation, revision prompts, and mentor feedback loops.",
    tech_stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    dynamic_content: { module: IDEAS_MODULE, demoMode: true },
    view_count: 184,
    created_at: "2026-04-20T09:00:00.000Z",
    updated_at: "2026-04-22T12:30:00.000Z",
    author: {
      id: "student-quantum",
      name: "Nethmi Perera",
      avatarUrl: "https://i.pravatar.cc/150?u=offline-quantum",
      role: "Student",
    },
  },
  {
    id: "offline-campus-map",
    user_id: "student-campus",
    post_mode: "post",
    post_type: "campus_req",
    title: "CampusMap: Accessibility-first Navigation",
    description: "An accessibility-focused campus routing tool with path clarity, obstacle awareness, and mobile-first flows.",
    tech_stack: ["React", "TypeScript", "Node.js", "UI/UX"],
    dynamic_content: { module: IDEAS_MODULE, demoMode: true },
    view_count: 136,
    created_at: "2026-04-18T07:15:00.000Z",
    updated_at: "2026-04-21T16:45:00.000Z",
    author: {
      id: "student-campus",
      name: "Akash Silva",
      avatarUrl: "https://i.pravatar.cc/150?u=offline-campus",
      role: "Student",
    },
  },
  {
    id: "offline-ml-coach",
    user_id: "student-ml",
    post_mode: "post",
    post_type: "ai_driven",
    title: "ML Coach: Personalized Learning Plan Generator",
    description: "Generating tailored learning plans for students based on skill gaps, progress checkpoints, and mentor review.",
    tech_stack: ["Python", "Machine Learning", "Databases", "React"],
    dynamic_content: { module: IDEAS_MODULE, demoMode: true },
    view_count: 221,
    created_at: "2026-04-17T11:00:00.000Z",
    updated_at: "2026-04-23T05:45:00.000Z",
    author: {
      id: "student-ml",
      name: "Raveen De Silva",
      avatarUrl: "https://i.pravatar.cc/150?u=offline-ml",
      role: "Student",
    },
  },
  {
    id: "offline-startup-research",
    user_id: "student-research",
    post_mode: "request",
    post_type: "idea",
    title: "Need feedback on startup idea validation workflow",
    description: "Looking for mentor guidance on narrowing scope, validating assumptions, and defining a practical MVP.",
    tech_stack: ["Research", "Validation", "Next.js"],
    dynamic_content: { module: IDEAS_MODULE, demoMode: true },
    view_count: 74,
    created_at: "2026-04-23T02:00:00.000Z",
    updated_at: "2026-04-23T02:00:00.000Z",
    author: {
      id: "student-research",
      name: "Sanjana Fernando",
      avatarUrl: "https://i.pravatar.cc/150?u=offline-research",
      role: "Student",
    },
  },
];

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

function mapMockCommentNode(node: CommentNode): IdeaThreadNode {
  return {
    id: node.id,
    author: node.author,
    avatarUrl: node.avatarUrl,
    role: node.role,
    content: node.content,
    upvotes: node.upvotes,
    timestamp: node.timestamp,
    isAcceptedAnswer: node.isAcceptedAnswer,
    replies: Array.isArray(node.replies) ? node.replies.map(mapMockCommentNode) : [],
  };
}

function listOfflineIdeaPosts(filters: PostListFilters = {}): IdeaPostRecord[] {
  const mode = filters.mode ? normalizePostMode(filters.mode) : undefined;
  const limit = typeof filters.limit === "number" && filters.limit > 0 ? Math.min(filters.limit, 100) : 30;
  const rows = mode ? OFFLINE_IDEA_POSTS.filter((post) => post.post_mode === mode) : OFFLINE_IDEA_POSTS;
  return rows.slice(0, limit);
}

function getOfflineIdeaPost(postId: string): IdeaPostRecord | null {
  return OFFLINE_IDEA_POSTS.find((post) => post.id === postId) ?? null;
}

function getOfflineIdeaThread(postId: string): IdeaThreadNode[] {
  if (!getOfflineIdeaPost(postId)) {
    throw new IdeaPersistenceError("Post not found.", 404);
  }

  return mockThreadData.map(mapMockCommentNode);
}

function compactText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`*_#[\]()!>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function inferProjectCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("ml") || text.includes("machine learning") || text.includes("ai")) return "AI / ML";
  if (text.includes("accessibility") || text.includes("navigation") || text.includes("campus")) return "Accessibility";
  if (text.includes("study") || text.includes("notes") || text.includes("learning")) return "EdTech";
  if (text.includes("startup") || text.includes("research") || text.includes("validation")) return "Research";
  return "Productivity";
}

function flattenThreadNodes(nodes: CommentNode[]): IdeaAnalyticsThreadNote[] {
  const items: IdeaAnalyticsThreadNote[] = [];

  function visit(list: CommentNode[]) {
    list.forEach((node) => {
      items.push({
        id: node.id,
        role: node.role,
        author: node.author,
        time: node.timestamp,
        message: compactText(node.content),
      });

      if (Array.isArray(node.replies) && node.replies.length > 0) {
        visit(node.replies);
      }
    });
  }

  visit(nodes);
  return items;
}

function isAnsweredAnalyticsRequest(status: string) {
  return status === "answered" || status === "completed";
}

function addTopicSignal(
  signalMap: Map<string, IdeaAnalyticsTopicSignal>,
  topic: string,
  weight: number,
  category?: string,
  projectTitle?: string
) {
  const existing = signalMap.get(topic) ?? {
    topic,
    score: 0,
    mentions: 0,
    categories: [],
    projects: [],
  };

  existing.score += weight;
  existing.mentions += 1;

  if (category && !existing.categories.includes(category)) {
    existing.categories.push(category);
  }

  if (projectTitle && !existing.projects.includes(projectTitle)) {
    existing.projects.push(projectTitle);
  }

  signalMap.set(topic, existing);
}

function buildTopicSignals(
  projects: IdeaAnalyticsProject[],
  requests: IdeaAnalyticsRequest[],
  threadsByProject: Record<string, IdeaAnalyticsThreadNote[]>
): IdeaAnalyticsTopicSignal[] {
  const signalMap = new Map<string, IdeaAnalyticsTopicSignal>();

  projects.forEach((project) => {
    const text = `${project.title} ${project.description} ${project.category}`.toLowerCase();
    const createdAt = new Date(project.createdDate).getTime();
    const recencyBoost = Number.isNaN(createdAt)
      ? 1
      : Math.max(1, 1.45 - Math.min((Date.now() - createdAt) / (1000 * 60 * 60 * 24 * 45), 0.45));
    const engagementWeight = 2 + project.responses * 0.8 + project.likes * 0.2 + project.views / 120;
    let matched = false;

    TOPIC_LIBRARY.forEach((entry) => {
      if (entry.keywords.some((keyword) => text.includes(keyword))) {
        matched = true;
        addTopicSignal(signalMap, entry.topic, engagementWeight * recencyBoost, project.category, project.title);
      }
    });

    if (!matched) {
      addTopicSignal(signalMap, project.category, engagementWeight, project.category, project.title);
    }

    (threadsByProject[project.id] ?? []).forEach((thread) => {
      const threadText = `${thread.message} ${thread.author} ${thread.role}`.toLowerCase();
      TOPIC_LIBRARY.forEach((entry) => {
        if (entry.keywords.some((keyword) => threadText.includes(keyword))) {
          addTopicSignal(signalMap, entry.topic, 1.4, project.category, project.title);
        }
      });
    });
  });

  requests.forEach((request) => {
    addTopicSignal(signalMap, request.category, isAnsweredAnalyticsRequest(request.status) ? 1.5 : 2.3, request.category);
  });

  return [...signalMap.values()].sort((left, right) => right.score - left.score);
}

function createAnalyticsSnapshot(
  base: Pick<IdeaAnalyticsSnapshot, "projects" | "requests" | "threadsByProject">,
  dataSource: IdeaAnalyticsDataSource,
  dataSourceMessage: string
): IdeaAnalyticsSnapshot {
  return {
    ...base,
    topicSignals: buildTopicSignals(base.projects, base.requests, base.threadsByProject),
    dataSource,
    dataSourceMessage,
  };
}

function buildHybridIdeaAnalyticsSnapshot(): IdeaAnalyticsSnapshot {
  const flattenedThreads = flattenThreadNodes(mockThreadData);

  const projects: IdeaAnalyticsProject[] = DUMMY_STUDENT_PROJECTS.map((project, index) => {
    const category = inferProjectCategory(project.title, project.milestoneNotes);
    const updatedAt = new Date(project.updatedAt);
    const createdDate = new Date(updatedAt.getTime() - (index + 2) * 1000 * 60 * 60 * 24 * 6).toISOString();
    const responses = Math.max((project.mentorId ? 2 : 1) + (index % 3), 1);
    const likes = Math.max(Math.round(project.progressPercent / 12) + index * 2, 1);
    const views = 140 + project.progressPercent * 5 + index * 36;
    const contributions = Math.max(responses + (project.progressPercent >= 60 ? 2 : 1), 1);

    return {
      id: project.id,
      title: project.title,
      category,
      createdDate,
      contributions,
      likes,
      views,
      responses,
      description: project.milestoneNotes,
    };
  });

  const requests: IdeaAnalyticsRequest[] = DUMMY_STUDENT_PROJECTS.map((project, index) => ({
    id: `hybrid-request-${project.id}`,
    category: inferProjectCategory(project.title, project.milestoneNotes),
    status:
      project.status === "Completed"
        ? "completed"
        : project.mentorId && project.progressPercent >= 40
          ? "answered"
          : "pending",
    requestedAt: new Date(new Date(project.updatedAt).getTime() - (index + 1) * 1000 * 60 * 60 * 24 * 3).toISOString(),
  }));

  const threadsByProject: Record<string, IdeaAnalyticsThreadNote[]> = {};
  projects.forEach((project, index) => {
    const count = Math.max(2, Math.min(4, project.responses + 1));
    const rotated = Array.from({ length: count - 1 }, (_, offset) => {
      const base = flattenedThreads[(index + offset) % flattenedThreads.length];
      return {
        ...base,
        id: `${project.id}-${base.id}-${offset}`,
      };
    });

    threadsByProject[project.id] = [
      {
        id: `${project.id}-owner-update`,
        role: "Post Owner",
        author: "Project Update",
        time: "Recently",
        message: compactText(project.description || "Progress update captured from the demo project tracker."),
      },
      ...rotated,
    ];
  });

  return createAnalyticsSnapshot(
    {
      projects,
      requests,
      threadsByProject,
    },
    "hybrid",
    "Analytics is running in backend hybrid mode using demo project data and server-side topic scoring."
  );
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

    const user = data.users.find((entry) => normalizeEmail(entry.email) === email);
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
    return new Map<string, { full_name: string | null; avatar_url: string | null; role: string | null }>();
  }

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("id,full_name,avatar_url,role")
    .in("id", userIds);

  if (error) {
    throw new IdeaPersistenceError(error.message, 500);
  }

  const map = new Map<string, { full_name: string | null; avatar_url: string | null; role: string | null }>();
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
  profile: { full_name: string | null; avatar_url: string | null; role: string | null } | undefined
): IdeaPostAuthor {
  return {
    id: userId,
    name: normalizeString(profile?.full_name) || "Member",
    avatarUrl: normalizeString(profile?.avatar_url),
    role: normalizeRole(profile?.role),
  };
}

function mapPostRow(
  row: {
    id: string;
    user_id: string;
    post_mode: string;
    post_type: string;
    title: string;
    description: string | null;
    tech_stack: unknown;
    dynamic_content: unknown;
    view_count: number | null;
    created_at: string;
    updated_at: string;
  },
  profileMap: Map<string, { full_name: string | null; avatar_url: string | null; role: string | null }>
): IdeaPostRecord {
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
    updated_at: row.updated_at,
    author: toAuthor(row.user_id, profileMap.get(row.user_id)),
  };
}

async function loadIdeaPost(postId: string): Promise<IdeaPostRecord> {
  if (!isSupabaseServerConfigured()) {
    const offlinePost = getOfflineIdeaPost(postId);
    if (!offlinePost) {
      throw new IdeaPersistenceError("Post not found.", 404);
    }
    return offlinePost;
  }

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
  if (!isSupabaseServerConfigured()) {
    return listOfflineIdeaPosts(filters);
  }

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

  const rows = data ?? [];
  const userIds = Array.from(new Set(rows.map((row) => row.user_id).filter(Boolean)));
  const profileMap = await loadProfiles(userIds);

  return rows.map((row) => mapPostRow(row, profileMap));
}

export async function createIdeaPost(input: CreateIdeaPostInput): Promise<IdeaPostRecord> {
  if (!isSupabaseServerConfigured()) {
    throw new IdeaPersistenceError(
      getSupabaseServerConfigError()?.message ?? "Supabase is not configured.",
      503
    );
  }

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
  if (!isSupabaseServerConfigured()) {
    return getOfflineIdeaThread(postId);
  }

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
  if (!isSupabaseServerConfigured()) {
    throw new IdeaPersistenceError(
      getSupabaseServerConfigError()?.message ?? "Supabase is not configured.",
      503
    );
  }

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
  if (!isSupabaseServerConfigured()) {
    throw new IdeaPersistenceError(
      getSupabaseServerConfigError()?.message ?? "Supabase is not configured.",
      503
    );
  }

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
  if (!isSupabaseServerConfigured()) {
    throw new IdeaPersistenceError(
      getSupabaseServerConfigError()?.message ?? "Supabase is not configured.",
      503
    );
  }

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

async function buildLiveIdeaAnalyticsSnapshot(): Promise<IdeaAnalyticsSnapshot> {
  const { data: postsRaw, error: postsError } = await supabaseServer
    .from("posts")
    .select("id,user_id,post_mode,post_type,title,description,dynamic_content,view_count,created_at")
    .contains("dynamic_content", { module: IDEAS_MODULE })
    .order("created_at", { ascending: false });

  if (postsError) {
    throw new IdeaPersistenceError(postsError.message, 500);
  }

  const posts = postsRaw ?? [];
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

    for (const comment of commentsRaw ?? []) {
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

  const profileMap = await loadProfiles(allUserIds.filter(Boolean));

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

  const mentorshipRequests: IdeaAnalyticsRequest[] = (mentorshipRequestsRaw ?? []).map((request) => ({
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

  return createAnalyticsSnapshot(
    {
      projects,
      requests: [...ideaRequests, ...mentorshipRequests],
      threadsByProject,
    },
    "live",
    "Showing live analytics data with backend-owned trend scoring."
  );
}

export async function buildIdeaAnalyticsSnapshot(): Promise<IdeaAnalyticsSnapshot> {
  if (!isSupabaseServerConfigured()) {
    return buildHybridIdeaAnalyticsSnapshot();
  }

  try {
    const liveSnapshot = await buildLiveIdeaAnalyticsSnapshot();
    if (liveSnapshot.projects.length === 0 && liveSnapshot.requests.length === 0) {
      return buildHybridIdeaAnalyticsSnapshot();
    }
    return liveSnapshot;
  } catch {
    return buildHybridIdeaAnalyticsSnapshot();
  }
}
