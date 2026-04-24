"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Compass, Sparkles, TrendingUp } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { buildIdeaRecommendations, type RecommendationPost } from "@/lib/ideaRecommendations";
import { useSavedIdeas } from "@/lib/useSavedIdeas";

type ApiPost = {
  id: string;
  title: string;
  description: string;
  post_type: "full_project" | "idea" | "ai_driven" | "campus_req";
  post_mode: "post" | "request";
  tech_stack: string[];
  view_count: number;
  author?: {
    name?: string;
    role?: string;
  };
};

function parseApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

function mapPost(post: ApiPost): RecommendationPost {
  return {
    id: post.id,
    title: post.title,
    description: post.description ?? "",
    type: post.post_type,
    mode: post.post_mode,
    author: post.author?.name ?? "IdeaBridge Member",
    role: post.author?.role ?? "Student",
    tags: Array.isArray(post.tech_stack) ? post.tech_stack : [],
    views: Number(post.view_count) || 0,
  };
}

export function RecommendationHub() {
  const { user } = useAuth();
  const { savedIdeaIds, isSaved, toggleSaved } = useSavedIdeas(user?.email);
  const [posts, setPosts] = React.useState<RecommendationPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/posts?limit=48", { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(parseApiError(payload, "Failed to load recommendations."));
        }

        if (!cancelled) {
          setPosts(Array.isArray(payload) ? (payload as ApiPost[]).map(mapPost) : []);
        }
      } catch (error) {
        if (!cancelled) {
          setPosts([]);
          setLoadError(error instanceof Error ? error.message : "Failed to load recommendations.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  const savedPosts = React.useMemo(
    () => posts.filter((post) => savedIdeaIds.includes(post.id)),
    [posts, savedIdeaIds]
  );

  const recommendedPosts = React.useMemo(
    () => buildIdeaRecommendations(posts, savedIdeaIds, 6),
    [posts, savedIdeaIds]
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-2xl bg-gradient-to-br from-[#0F0F0F] via-[#1c0f00] to-[#2a1200] p-6 text-[#FFCBA4] shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCBA4]">
          <Sparkles className="h-3.5 w-3.5" />
          Recommendation Hub
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">Save strong ideas and surface the next best ones</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#FFCBA4]/70">
          Bookmark ideas you want to revisit, then use the recommendation feed to find similar projects, mentor-driven threads, and high-signal requests.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-[#FFD4B1] bg-white shadow-sm">
          <div className="border-b border-[#FFD4B1] bg-[#FFF8F3] px-5 py-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Bookmark className="h-4 w-4 text-[#c97a30]" />
              Saved Ideas
            </h3>
          </div>
          <div className="space-y-3 p-5">
            {isLoading ? (
              <div className="text-sm text-slate-500">Loading saved ideas...</div>
            ) : savedPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#FFD4B1] bg-[#FFF8F3] px-4 py-5 text-sm text-slate-500">
                Nothing saved yet. Browse the search page and bookmark the ideas you want to bring back later.
              </div>
            ) : (
              savedPosts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-[#FFD4B1] bg-[#FFF8F2] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{post.title}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{post.description || "Idea ready for further refinement."}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSaved(post.id)}
                      className="rounded-full border border-[#FFD4B1] bg-white px-3 py-1 text-xs font-semibold text-[#8A4E2A] transition hover:bg-[#FFF1E6]"
                    >
                      Unsave
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#FFD4B1] bg-white shadow-sm">
          <div className="border-b border-[#FFD4B1] bg-[#FFF8F3] px-5 py-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Compass className="h-4 w-4 text-[#c97a30]" />
              Recommended Next
            </h3>
          </div>
          <div className="space-y-3 p-5">
            {isLoading ? (
              <div className="text-sm text-slate-500">Loading recommendations...</div>
            ) : recommendedPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#FFD4B1] bg-[#FFF8F3] px-4 py-5 text-sm text-slate-500">
                Save a few ideas first and this feed will become more personalized.
              </div>
            ) : (
              recommendedPosts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{post.title}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{post.description || "Explore the full idea thread for more context."}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-full bg-[#FFF4EB] px-3 py-1 font-semibold text-[#8A4E2A]">
                            {tag}
                          </span>
                        ))}
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {post.views} views
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSaved(post.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        isSaved(post.id)
                          ? "border-[#FFD4B1] bg-[#FFF1E6] text-[#8A4E2A]"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {isSaved(post.id) ? "Saved" : "Save"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/search"
          className="rounded-xl bg-[#0F0F0F] px-4 py-2.5 text-sm font-semibold text-[#FFCBA4] transition hover:brightness-110"
        >
          Browse Search & Discovery
        </Link>
        <Link
          href="/ideas/explore"
          className="rounded-xl border border-[#FFD4B1] bg-[#FFF8F2] px-4 py-2.5 text-sm font-semibold text-[#8A4E2A] transition hover:bg-[#FFF1E6]"
        >
          Open Idea Feed
        </Link>
      </div>
    </div>
  );
}
