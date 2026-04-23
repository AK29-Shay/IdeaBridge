"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  TrendingUp,
  FileCode2,
  Lightbulb,
  Sparkles,
  GraduationCap,
  Tag,
} from "lucide-react";

type PostType = "full_project" | "idea" | "ai_driven" | "campus_req";
type PostMode = "post" | "request";

type SearchPost = {
  id: string;
  title: string;
  type: PostType;
  mode: PostMode;
  author: string;
  role: string;
  tags: string[];
  views: number;
  description: string;
};

type ApiPost = {
  id: string;
  title: string;
  description: string;
  post_type: PostType;
  post_mode: PostMode;
  tech_stack: string[];
  view_count: number;
  author?: {
    name?: string;
    role?: string;
  };
};

const POST_TYPES = [
  { label: "Full Project", value: "full_project", icon: <FileCode2 size={14} /> },
  { label: "Idea", value: "idea", icon: <Lightbulb size={14} /> },
  { label: "AI Driven", value: "ai_driven", icon: <Sparkles size={14} /> },
  { label: "Campus Req", value: "campus_req", icon: <GraduationCap size={14} /> },
] as const;

const TYPE_STYLES: Record<PostType, string> = {
  full_project: "bg-[#FFF1E6] text-[#8A4E2A]",
  idea: "bg-emerald-50 text-emerald-700",
  ai_driven: "bg-sky-50 text-sky-700",
  campus_req: "bg-amber-50 text-amber-700",
};

function mapPost(post: ApiPost): SearchPost {
  return {
    id: post.id,
    title: post.title,
    type: post.post_type,
    mode: post.post_mode,
    author: post.author?.name ?? "IdeaBridge Member",
    role: post.author?.role ?? "Student",
    tags: Array.isArray(post.tech_stack) ? post.tech_stack : [],
    views: Number(post.view_count) || 0,
    description: post.description ?? "",
  };
}

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [posts, setPosts] = React.useState<SearchPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const recoveryQueryRef = React.useRef<string | null>(null);

  const deferredQuery = React.useDeferredValue(query);

  const loadPosts = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/posts?limit=48", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as ApiPost[] | { error?: string } | null;

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          !Array.isArray(payload) &&
          "error" in payload
            ? payload.error
            : undefined;
        throw new Error(message || "Failed to load ideas.");
      }

      setPosts(Array.isArray(payload) ? payload.map(mapPost) : []);
    } catch (error) {
      setPosts([]);
      setLoadError(error instanceof Error ? error.message : "Failed to load ideas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const techTags = React.useMemo(() => {
    return Array.from(new Set(posts.flatMap((post) => post.tags))).sort((left, right) => left.localeCompare(right));
  }, [posts]);

  const results = React.useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (normalizedQuery) {
        const haystack = `${post.title} ${post.description} ${post.tags.join(" ")} ${post.author}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(post.type)) {
        return false;
      }

      if (selectedTags.length > 0 && !selectedTags.every((tag) => post.tags.includes(tag))) {
        return false;
      }

      return true;
    });
  }, [deferredQuery, posts, selectedTags, selectedTypes]);

  const trending = React.useMemo(() => {
    return [...posts].sort((left, right) => right.views - left.views).slice(0, 3);
  }, [posts]);

  React.useEffect(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      recoveryQueryRef.current = null;
      return;
    }

    if (isLoading || results.length > 0 || recoveryQueryRef.current === normalizedQuery) {
      return;
    }

    recoveryQueryRef.current = normalizedQuery;
    const timer = window.setTimeout(() => {
      void loadPosts();
    }, 600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [deferredQuery, isLoading, loadPosts, results.length]);

  function toggleType(value: string) {
    setSelectedTypes((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function toggleTag(value: string) {
    setSelectedTags((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function clearAll() {
    setSelectedTypes([]);
    setSelectedTags([]);
    setQuery("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF4EA] to-[#FFEBDD] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[32px] border border-[#FFD4B1] bg-[#0F0F0F] px-6 py-8 text-[#FDE0C9] shadow-[0_35px_70px_-45px_rgba(15,15,15,0.9)] sm:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCBA4]">
              <Sparkles className="h-3.5 w-3.5" />
              Search & Discovery
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Explore ideas, projects, and requests</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#FDE0C9]/75 sm:text-base">
              Discover what the community is building, filter by project type and tech stack, and spot the most active ideas across IdeaBridge.
            </p>
          </div>
        </section>

        <div className="mt-6 rounded-[28px] border border-[#FFD4B1] bg-white/90 p-5 shadow-[0_28px_60px_-44px_rgba(63,31,7,0.35)] backdrop-blur">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A4E2A]" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, description, author, or tech stack..."
              className="h-13 w-full rounded-2xl border border-[#FFD7BC] bg-[#FFF8F2] pl-12 pr-12 text-sm text-[#0F0F0F] placeholder:text-[#8A4E2A]/55 focus:border-[#F5A97F] focus:outline-none focus:ring-2 focus:ring-[#F5A97F]/25"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A4E2A]/70 transition-colors hover:text-[#0F0F0F]"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                showFilters
                  ? "border-[#F5A97F] bg-[#0F0F0F] text-[#FFCBA4]"
                  : "border-[#FFD7BC] bg-[#FFF8F2] text-[#8A4E2A] hover:border-[#F5A97F]"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {selectedTypes.length + selectedTags.length > 0 ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFCBA4] text-[11px] text-[#0F0F0F]">
                  {selectedTypes.length + selectedTags.length}
                </span>
              ) : null}
            </button>

            {selectedTypes.length + selectedTags.length > 0 ? (
              <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs font-semibold text-[#B95D35] transition hover:text-[#0F0F0F]">
                <X size={12} />
                Clear all
              </button>
            ) : null}
          </div>

          <AnimatePresence>
            {showFilters ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl border border-[#FFE1CC] bg-[#FFF8F2] p-5">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4E2A]/70">Post Type</p>
                    <div className="flex flex-wrap gap-2">
                      {POST_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => toggleType(type.value)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            selectedTypes.includes(type.value)
                              ? "border-[#F5A97F] bg-[#0F0F0F] text-[#FFCBA4]"
                              : "border-[#FFD7BC] bg-white text-[#8A4E2A] hover:border-[#F5A97F]"
                          }`}
                        >
                          {type.icon}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4E2A]/70">
                      <Tag size={12} className="mr-1 inline" />
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {techTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            selectedTags.includes(tag)
                              ? "border-[#F5A97F] bg-[#FDE8D8] text-[#8A4E2A]"
                              : "border-[#FFD7BC] bg-white text-[#8A4E2A]/85 hover:border-[#F5A97F]"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-3">
            <p className="text-sm text-[#8A4E2A]">
              {isLoading
                ? "Loading ideas..."
                : results.length === 0
                  ? "No results found for the current filters."
                  : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
            </p>

            {loadError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
            ) : null}

            <AnimatePresence mode="popLayout">
              {results.map((post) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-[24px] border border-[#FFD7BC] bg-white/92 p-5 shadow-[0_24px_45px_-38px_rgba(63,31,7,0.35)] transition hover:-translate-y-0.5 hover:border-[#F5A97F]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${TYPE_STYLES[post.type]}`}>
                          {POST_TYPES.find((type) => type.value === post.type)?.label}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A4E2A]/60">
                          {post.mode === "request" ? "Request" : "Post"}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-[#0F0F0F]">{post.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5D4739]">
                        {post.description || "This post is ready for discussion in the IdeaBridge community feed."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[#FFF3E8] px-2.5 py-1 text-[11px] font-medium text-[#8A4E2A]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs font-medium text-[#8A4E2A]/75">
                        {post.author} · {post.role}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-[#FFE1CC] bg-[#FFF8F2] px-4 py-3 text-right">
                      <div className="text-2xl font-bold text-[#0F0F0F]">{post.views}</div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A4E2A]/60">Views</div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-[24px] border border-[#FFD7BC] bg-white/92 p-5 shadow-[0_24px_45px_-38px_rgba(63,31,7,0.35)]">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#0F0F0F]">
                <TrendingUp size={15} className="text-[#B95D35]" />
                Trending Now
              </h3>
              <div className="mt-4 space-y-4">
                {trending.map((post, index) => (
                  <div key={post.id} className="flex items-start gap-3">
                    <span className="text-2xl font-black leading-none text-[#FFD4B1]">#{index + 1}</span>
                    <div>
                      <p className="line-clamp-2 text-sm font-semibold text-[#0F0F0F]">{post.title}</p>
                      <p className="mt-1 text-[11px] font-medium text-[#8A4E2A]/75">{post.views} views</p>
                    </div>
                  </div>
                ))}
                {!isLoading && trending.length === 0 ? (
                  <p className="text-sm text-[#8A4E2A]/70">Trending items will appear here once posts are available.</p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
