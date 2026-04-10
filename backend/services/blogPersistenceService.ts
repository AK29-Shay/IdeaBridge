import supabaseServer from "../config/supabaseServer";

const BLOG_MODULE = "mentor_blog";

export type BlogWriteInput = {
  authorEmail: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

export type StoredBlogRow = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  author_email: string;
  created_at: string;
  updated_at: string;
};

export class BlogStorageError extends Error {
  status: number;
  hint?: string;

  constructor(message: string, status = 500, hint?: string) {
    super(message);
    this.status = status;
    this.hint = hint;
  }
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeOptionalUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function dynamicObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function isMentorBlogsTableMissing(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";

  return code === "42P01" || code === "PGRST205" || message.toLowerCase().includes("mentor_blogs");
}

function tableHint() {
  return "Run supabase/unified_migration.sql to create the mentor_blogs table.";
}

function mapPostRowToBlogRow(row: {
  id: string;
  title: string;
  description: string | null;
  dynamic_content: unknown;
  created_at: string;
  updated_at: string;
}): StoredBlogRow {
  const dynamic = dynamicObject(row.dynamic_content);

  return {
    id: row.id,
    title: row.title,
    content: row.description ?? "",
    image_url: normalizeOptionalUrl(dynamic.imageUrl),
    video_url: normalizeOptionalUrl(dynamic.videoUrl),
    author_email: normalizeEmail(dynamic.authorEmail),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function ensureAuthUserIdByEmail(authorEmail: string) {
  const normalizedEmail = normalizeEmail(authorEmail);
  if (!normalizedEmail) {
    throw new BlogStorageError("authorEmail is required.", 400);
  }

  const { data: listed, error: listError } = await supabaseServer.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw new BlogStorageError(listError.message, 500);
  }

  const existing = listed.users.find(
    (entry) => normalizeEmail(entry.email) === normalizedEmail
  );

  if (existing?.id) {
    return existing.id;
  }

  const generatedPassword = `IdeaBridge_${Date.now()}_Aa1!`;
  const { data: created, error: createError } = await supabaseServer.auth.admin.createUser({
    email: normalizedEmail,
    password: generatedPassword,
    email_confirm: true,
  });

  if (createError || !created.user?.id) {
    throw new BlogStorageError(createError?.message || "Failed to create blog author account.", 500);
  }

  return created.user.id;
}

async function listFromMentorBlogs(authorEmail: string) {
  let query = supabaseServer
    .from("mentor_blogs")
    .select("id,title,content,image_url,video_url,author_email,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (authorEmail) {
    query = query.eq("author_email", authorEmail);
  }

  return query;
}

async function listFromPosts(authorEmail: string) {
  const filter = authorEmail
    ? { module: BLOG_MODULE, authorEmail }
    : { module: BLOG_MODULE };

  const { data, error } = await supabaseServer
    .from("posts")
    .select("id,title,description,dynamic_content,created_at,updated_at")
    .contains("dynamic_content", filter)
    .order("created_at", { ascending: false });

  if (error) {
    throw new BlogStorageError(error.message, 500);
  }

  return (data ?? []).map(mapPostRowToBlogRow);
}

async function createInMentorBlogs(input: BlogWriteInput) {
  const payload = {
    author_email: normalizeEmail(input.authorEmail),
    title: input.title,
    content: input.content,
    image_url: normalizeOptionalUrl(input.imageUrl),
    video_url: normalizeOptionalUrl(input.videoUrl),
  };

  const { data, error } = await supabaseServer
    .from("mentor_blogs")
    .insert(payload)
    .select("id,title,content,image_url,video_url,author_email,created_at,updated_at")
    .single();

  return { data, error };
}

async function createInPosts(input: BlogWriteInput) {
  const userId = await ensureAuthUserIdByEmail(input.authorEmail);

  const { data, error } = await supabaseServer
    .from("posts")
    .insert({
      user_id: userId,
      post_mode: "post",
      post_type: "idea",
      title: input.title,
      description: input.content,
      tech_stack: [],
      dynamic_content: {
        module: BLOG_MODULE,
        authorEmail: normalizeEmail(input.authorEmail),
        imageUrl: normalizeOptionalUrl(input.imageUrl),
        videoUrl: normalizeOptionalUrl(input.videoUrl),
      },
    })
    .select("id,title,description,dynamic_content,created_at,updated_at")
    .single();

  if (error) {
    throw new BlogStorageError(error.message, 500);
  }

  return mapPostRowToBlogRow(data);
}

async function loadPostBlogById(id: string) {
  const { data, error } = await supabaseServer
    .from("posts")
    .select("id,title,description,dynamic_content,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new BlogStorageError(error.message, 500);
  }

  if (!data) {
    throw new BlogStorageError("Blog post not found.", 404);
  }

  const dynamic = dynamicObject(data.dynamic_content);
  const moduleValue = typeof dynamic.module === "string" ? dynamic.module : "";
  if (moduleValue !== BLOG_MODULE) {
    throw new BlogStorageError("Blog post not found.", 404);
  }

  return {
    row: data,
    dynamic,
  };
}

async function updateInMentorBlogs(id: string, input: BlogWriteInput) {
  const updates = {
    title: input.title,
    content: input.content,
    image_url: normalizeOptionalUrl(input.imageUrl),
    video_url: normalizeOptionalUrl(input.videoUrl),
  };

  const { data, error } = await supabaseServer
    .from("mentor_blogs")
    .update(updates)
    .eq("id", id)
    .eq("author_email", normalizeEmail(input.authorEmail))
    .select("id,title,content,image_url,video_url,author_email,created_at,updated_at")
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    throw new BlogStorageError("Blog post not found.", 404);
  }

  return { data, error: null };
}

async function updateInPosts(id: string, input: BlogWriteInput) {
  const normalizedEmail = normalizeEmail(input.authorEmail);
  const loaded = await loadPostBlogById(id);
  const rowAuthor = normalizeEmail(loaded.dynamic.authorEmail);

  if (rowAuthor !== normalizedEmail) {
    throw new BlogStorageError("Forbidden", 403);
  }

  const { data, error } = await supabaseServer
    .from("posts")
    .update({
      title: input.title,
      description: input.content,
      dynamic_content: {
        ...loaded.dynamic,
        module: BLOG_MODULE,
        authorEmail: normalizedEmail,
        imageUrl: normalizeOptionalUrl(input.imageUrl),
        videoUrl: normalizeOptionalUrl(input.videoUrl),
      },
    })
    .eq("id", id)
    .select("id,title,description,dynamic_content,created_at,updated_at")
    .single();

  if (error) {
    throw new BlogStorageError(error.message, 500);
  }

  return mapPostRowToBlogRow(data);
}

async function deleteInMentorBlogs(id: string, authorEmail: string) {
  const { error } = await supabaseServer
    .from("mentor_blogs")
    .delete()
    .eq("id", id)
    .eq("author_email", normalizeEmail(authorEmail));

  return { error };
}

async function deleteInPosts(id: string, authorEmail: string) {
  const normalizedEmail = normalizeEmail(authorEmail);
  const loaded = await loadPostBlogById(id);
  const rowAuthor = normalizeEmail(loaded.dynamic.authorEmail);

  if (rowAuthor !== normalizedEmail) {
    throw new BlogStorageError("Forbidden", 403);
  }

  const { error } = await supabaseServer.from("posts").delete().eq("id", id);

  if (error) {
    throw new BlogStorageError(error.message, 500);
  }
}

export async function listStoredBlogs(authorEmail: string) {
  const normalizedEmail = normalizeEmail(authorEmail);

  const primary = await listFromMentorBlogs(normalizedEmail);
  if (primary.error) {
    if (!isMentorBlogsTableMissing(primary.error)) {
      throw new BlogStorageError(primary.error.message, 500);
    }

    return listFromPosts(normalizedEmail);
  }

  return (primary.data ?? []) as StoredBlogRow[];
}

export async function createStoredBlog(input: BlogWriteInput) {
  const normalizedInput = {
    ...input,
    authorEmail: normalizeEmail(input.authorEmail),
  };

  const primary = await createInMentorBlogs(normalizedInput);
  if (primary.error) {
    if (!isMentorBlogsTableMissing(primary.error)) {
      throw new BlogStorageError(primary.error.message, 500);
    }

    return createInPosts(normalizedInput);
  }

  return primary.data as StoredBlogRow;
}

export async function updateStoredBlog(id: string, input: BlogWriteInput) {
  const normalizedInput = {
    ...input,
    authorEmail: normalizeEmail(input.authorEmail),
  };

  const primary = await updateInMentorBlogs(id, normalizedInput);
  if (primary.error) {
    if (!isMentorBlogsTableMissing(primary.error)) {
      throw new BlogStorageError(primary.error.message, 500);
    }

    return updateInPosts(id, normalizedInput);
  }

  return primary.data as StoredBlogRow;
}

export async function deleteStoredBlog(id: string, authorEmail: string) {
  const normalizedEmail = normalizeEmail(authorEmail);
  const primary = await deleteInMentorBlogs(id, normalizedEmail);

  if (primary.error) {
    if (!isMentorBlogsTableMissing(primary.error)) {
      throw new BlogStorageError(primary.error.message, 500);
    }

    await deleteInPosts(id, normalizedEmail);
  }
}

export function mentorBlogsTableHint(error: unknown) {
  return isMentorBlogsTableMissing(error) ? tableHint() : undefined;
}
