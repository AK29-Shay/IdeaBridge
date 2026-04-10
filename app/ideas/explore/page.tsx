"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, LayoutDashboard, Search } from "lucide-react";
import DynamicPostForm from "@/components/ideas/DynamicPostForm";
import ProjectThread from "@/components/ideas/ProjectThread";
import type { CommentNode } from "@/lib/ideas/mockThread";
import { useAuth } from "@/context/AuthContext";

type IdeaPostRow = {
  id: string;
  title: string;
  description: string;
  post_mode: "request" | "post";
  created_at: string;
  post_type: "full_project" | "idea" | "ai_driven" | "campus_req";
  author?: {
    name?: string;
    role?: string;
  };
};

function parseApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = "error" in payload ? String((payload as { error?: unknown }).error ?? "") : "";
  return error || fallback;
}

function formatPostType(value: IdeaPostRow["post_type"]) {
  switch (value) {
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

export default function IdeasExplorePage() {
  const { user } = useAuth();

  const [posts, setPosts] = React.useState<IdeaPostRow[]>([]);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);
  const [threadComments, setThreadComments] = React.useState<CommentNode[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [isLoadingPosts, setIsLoadingPosts] = React.useState(true);
  const [isLoadingThread, setIsLoadingThread] = React.useState(false);
  const [postsError, setPostsError] = React.useState<string | null>(null);
  const [threadError, setThreadError] = React.useState<string | null>(null);

  const filteredPosts = React.useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) {
      return posts;
    }

    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.description,
        post.author?.name,
        post.author?.role,
        formatPostType(post.post_type),
        post.post_mode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [posts, searchQuery]);

  const selectedPost = React.useMemo(
    () => filteredPosts.find((post) => post.id === selectedPostId) ?? null,
    [filteredPosts, selectedPostId]
  );

  const loadThread = React.useCallback(async (postId: string | null) => {
    if (!postId) {
      setThreadComments([]);
      setThreadError(null);
      return;
    }

    setIsLoadingThread(true);
    setThreadError(null);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to load project thread."));
      }

      setThreadComments(Array.isArray(payload) ? (payload as CommentNode[]) : []);
    } catch (error) {
      setThreadComments([]);
      setThreadError(error instanceof Error ? error.message : "Failed to load project thread.");
    } finally {
      setIsLoadingThread(false);
    }
  }, []);

  const loadPosts = React.useCallback(
    async (preferredPostId?: string) => {
      setIsLoadingPosts(true);
      setPostsError(null);
      try {
        const response = await fetch("/api/posts?limit=40", { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(parseApiError(payload, "Failed to load idea posts."));
        }

        const rows = Array.isArray(payload) ? (payload as IdeaPostRow[]) : [];
        setPosts(rows);

        const preferred = preferredPostId && rows.some((row) => row.id === preferredPostId) ? preferredPostId : null;
        const fallback = rows[0]?.id ?? null;
        const active = preferred ?? fallback;
        setSelectedPostId(active);
        await loadThread(active);
      } catch (error) {
        setPosts([]);
        setSelectedPostId(null);
        setThreadComments([]);
        setPostsError(error instanceof Error ? error.message : "Failed to load posts.");
      } finally {
        setIsLoadingPosts(false);
      }
    },
    [loadThread]
  );

  React.useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  React.useEffect(() => {
    if (filteredPosts.length === 0) {
      setSelectedPostId(null);
      setThreadComments([]);
      return;
    }

    if (!selectedPostId || !filteredPosts.some((post) => post.id === selectedPostId)) {
      const nextPostId = filteredPosts[0].id;
      setSelectedPostId(nextPostId);
      void loadThread(nextPostId);
    }
  }, [filteredPosts, selectedPostId, loadThread]);

  const handleCreatedPost = React.useCallback(
    (post: unknown) => {
      const postId =
        post && typeof post === "object" && "id" in post && typeof (post as { id?: unknown }).id === "string"
          ? (post as { id: string }).id
          : undefined;

      void loadPosts(postId);
    },
    [loadPosts]
  );

  const refreshCurrentThread = React.useCallback(async () => {
    await loadThread(selectedPostId);
  }, [loadThread, selectedPostId]);

  const postTypeLabel = selectedPost ? formatPostType(selectedPost.post_type) : "";

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FFF8F3] to-[#FFEFE6]">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-10 space-y-8">
        <section className="rounded-3xl border border-[#FFD4B1] bg-white px-6 py-8 shadow-sm md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#FFD4B1] bg-[#FFF4EA] px-3 py-1 text-xs font-semibold text-[#c97a30]">
                Idea &amp; Guidance Hub
              </p>
              <h1 className="mt-4 text-3xl font-extrabold text-black md:text-4xl">Explore ideas, open projects, and guidance threads</h1>
              <p className="mt-3 max-w-2xl text-sm text-black/60 md:text-base">
                Use the post form to create new ideas or requests, click any project to reveal project details with the merged thread panel, and search instantly across backend-loaded posts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-[#FFD4B1] bg-[#FFF4EA] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#FFE9D8]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-[#FFD4B1] bg-[#FFF4EA] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#FFE9D8]"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#FFD4B1] bg-[#FFF8F3] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Total posts</p>
              <p className="mt-1 text-2xl font-bold text-black">{posts.length}</p>
            </div>
            <div className="rounded-2xl border border-[#FFD4B1] bg-[#FFF8F3] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Search matches</p>
              <p className="mt-1 text-2xl font-bold text-black">{filteredPosts.length}</p>
            </div>
            <div className="rounded-2xl border border-[#FFD4B1] bg-[#FFF8F3] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Active thread</p>
              <p className="mt-1 truncate text-sm font-semibold text-black">{selectedPost?.title || "No project selected"}</p>
            </div>
          </div>
        </section>

        <DynamicPostForm onPostCreated={handleCreatedPost} />

        <section className="rounded-3xl border border-[#FFD4B1] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-black">Explore Projects</h2>
              <p className="text-sm text-black/60">Click a card to open project details and thread in one merged panel.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, description, author, type..."
                className="w-full rounded-xl border border-[#FFD4B1] bg-[#FFF8F3] py-2 pl-9 pr-3 text-sm text-black outline-none transition focus:border-[#e2a36e]"
              />
            </div>
          </div>

          {postsError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{postsError}</div>
          ) : null}

          {isLoadingPosts ? (
            <div className="mt-4 rounded-xl border border-[#FFD4B1] bg-[#FFF8F3] px-4 py-4 text-sm text-black/60">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#FFD4B1] bg-[#FFF8F3] px-4 py-4 text-sm text-black/60">
              No matching posts. Try a different search term or create a new project post.
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {filteredPosts.map((post) => {
                const selected = selectedPostId === post.id;
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      setSelectedPostId(post.id);
                      void loadThread(post.id);
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-[#d88b4c] bg-[#FFF4EA] shadow-sm"
                        : "border-[#FFD4B1] bg-[#FFF8F3] hover:border-[#e2a36e]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full border border-[#FFD4B1] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/50">
                        {post.post_mode === "request" ? "Request" : "Post"}
                      </span>
                      <span className="text-[11px] font-semibold text-[#c97a30]">{formatPostType(post.post_type)}</span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold text-black">{post.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-black/60">{post.description || "No description"}</p>
                    <p className="mt-2 text-[11px] text-black/45">
                      {post.author?.name || "Member"} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[#FFD4B1] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-black">Project Details + Thread</h2>
              <p className="text-sm text-black/60">This merged card updates when you click a project in Explore Ideas.</p>
            </div>
            {selectedPost ? (
              <span className="rounded-full border border-[#FFD4B1] bg-[#FFF4EA] px-3 py-1 text-xs font-semibold text-[#c97a30]">
                {postTypeLabel}
              </span>
            ) : null}
          </div>

          {selectedPost ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <article className="md:col-span-1 rounded-2xl border border-[#FFD4B1] bg-[#FFF8F3] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">Project Info</p>
                <h3 className="mt-2 text-base font-bold text-black">{selectedPost.title}</h3>
                <p className="mt-2 text-sm text-black/65">{selectedPost.description || "No description provided."}</p>

                <div className="mt-4 space-y-2 text-xs text-black/55">
                  <p>
                    <span className="font-semibold text-black/70">Author:</span> {selectedPost.author?.name || "Member"}
                  </p>
                  <p>
                    <span className="font-semibold text-black/70">Role:</span> {selectedPost.author?.role || "Student"}
                  </p>
                  <p>
                    <span className="font-semibold text-black/70">Created:</span> {new Date(selectedPost.created_at).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold text-black/70">Mode:</span> {selectedPost.post_mode === "request" ? "Request" : "Post"}
                  </p>
                </div>
              </article>

              <div className="md:col-span-2 rounded-2xl border border-[#FFD4B1] bg-[#FFFDF9] p-4">
                {threadError ? (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{threadError}</div>
                ) : null}

                <ProjectThread
                  comments={threadComments}
                  postId={selectedPost.id}
                  actorEmail={user?.email ?? ""}
                  isLoading={isLoadingThread}
                  onRefresh={refreshCurrentThread}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#FFD4B1] bg-[#FFF8F3] px-4 py-4 text-sm text-black/60">
              Select a project to view its details and thread discussion.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
