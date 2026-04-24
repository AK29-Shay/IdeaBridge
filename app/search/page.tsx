"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Search,
  SlidersHorizontal,
  X,
  TrendingUp,
  FileCode2,
  Lightbulb,
  Sparkles,
  GraduationCap,
  Tag,
  Calendar,
  BookOpen,
  BarChart,
  Eye,
  Layers
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { buildIdeaRecommendations } from "@/lib/ideaRecommendations";
import { useSavedIdeas } from "@/lib/useSavedIdeas";
import { DEMO_PROJECTS, SearchPost } from "@/lib/demoData";

const POST_TYPES = [
  { label: "Full Project", value: "full_project", icon: <FileCode2 size={14} /> },
  { label: "Idea", value: "idea", icon: <Lightbulb size={14} /> },
  { label: "AI Driven", value: "ai_driven", icon: <Sparkles size={14} /> },
  { label: "Campus Req", value: "campus_req", icon: <GraduationCap size={14} /> },
];

const TYPE_STYLES: Record<string, string> = {
  full_project: "bg-[#FFF1E6] text-[#8A4E2A]",
  idea: "bg-emerald-50 text-emerald-700",
  ai_driven: "bg-sky-50 text-sky-700",
  campus_req: "bg-amber-50 text-amber-700",
};

const TECH_STACK_TAGS = ["Java", "Python", "React", "Node.js", "Spring Boot", "MySQL", "MongoDB", "Firebase", "Next.js", "TypeScript", "TensorFlow", "Docker", "REST API"];
const CATEGORIES = ["Web", "Mobile", "Data Science", "Cyber Security", "AI/ML", "SE"];
const YEARS = ["Year 1", "Year 2", "Year 3", "Year 4"];
const SEMESTERS = ["Sem 1", "Sem 2"];

export default function SearchPage() {
  const { user } = useAuth();
  const { savedIdeaIds, isSaved, toggleSaved } = useSavedIdeas(user?.email);
  const [query, setQuery] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [selectedYears, setSelectedYears] = React.useState<string[]>([]);
  const [selectedSemesters, setSelectedSemesters] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  
  const [showFilters, setShowFilters] = React.useState(false);
  const [posts, setPosts] = React.useState<SearchPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  
  const [selectedPost, setSelectedPost] = React.useState<SearchPost | null>(null);

  const deferredQuery = React.useDeferredValue(query);

  const loadPosts = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/posts?limit=48", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload || (Array.isArray(payload) && payload.length === 0)) {
        // Use demo data if API fails or returns empty
        setPosts(DEMO_PROJECTS);
        return;
      }

      // If we had a real mapping from ApiPost to SearchPost we'd do it here, but for demo we just use demo data
      setPosts(DEMO_PROJECTS);
    } catch (error) {
      setPosts(DEMO_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const results = React.useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (normalizedQuery) {
        const haystack = `${post.title} ${post.description} ${post.tags.join(" ")} ${post.author} ${post.category}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(post.type)) return false;
      if (selectedTags.length > 0 && !selectedTags.some((tag) => post.tags.includes(tag))) return false;
      if (selectedYears.length > 0 && !selectedYears.includes(post.year)) return false;
      if (selectedSemesters.length > 0 && !selectedSemesters.includes(post.semester)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(post.category)) return false;

      return true;
    });
  }, [deferredQuery, posts, selectedTags, selectedTypes, selectedYears, selectedSemesters, selectedCategories]);

  const trending = React.useMemo(() => {
    return [...posts].filter(p => p.trending).sort((left, right) => right.views - left.views).slice(0, 3);
  }, [posts]);

  // For recommendations, we just use a placeholder here for the demo
  const recommended = React.useMemo(() => {
    return posts.slice(0, 3);
  }, [posts]);

  function toggleFilter(value: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function clearAll() {
    setSelectedTypes([]);
    setSelectedTags([]);
    setSelectedYears([]);
    setSelectedSemesters([]);
    setSelectedCategories([]);
    setQuery("");
  }

  const activeFiltersCount = selectedTypes.length + selectedTags.length + selectedYears.length + selectedSemesters.length + selectedCategories.length;

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
              Discover what the community is building, filter by project type, categories, and tech stack.
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
              placeholder="Search by title, description, category, or tech stack..."
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
              {activeFiltersCount > 0 ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFCBA4] text-[11px] text-[#0F0F0F]">
                  {activeFiltersCount}
                </span>
              ) : null}
            </button>

            {activeFiltersCount > 0 ? (
              <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs font-semibold text-[#B95D35] transition hover:text-[#0F0F0F]">
                <X size={12} />
                Clear all
              </button>
            ) : null}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-[#FFE1CC] bg-[#FFF8F2] p-5">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4E2A]/70">Post Type</p>
                    <div className="flex flex-wrap gap-2">
                      {POST_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => toggleFilter(type.value, selectedTypes, setSelectedTypes)}
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

                    <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4E2A]/70">
                      <Layers size={12} className="mr-1 inline" /> Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            selectedCategories.includes(cat)
                              ? "border-[#F5A97F] bg-[#FDE8D8] text-[#8A4E2A]"
                              : "border-[#FFD7BC] bg-white text-[#8A4E2A]/85 hover:border-[#F5A97F]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4E2A]/70">Year</p>
                        <div className="flex flex-wrap gap-2">
                          {YEARS.map((y) => (
                            <button
                              key={y}
                              onClick={() => toggleFilter(y, selectedYears, setSelectedYears)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                selectedYears.includes(y) ? "border-[#F5A97F] bg-[#FDE8D8] text-[#8A4E2A]" : "border-[#FFD7BC] bg-white text-[#8A4E2A]/85 hover:border-[#F5A97F]"
                              }`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4E2A]/70">Semester</p>
                        <div className="flex flex-wrap gap-2">
                          {SEMESTERS.map((s) => (
                            <button
                              key={s}
                              onClick={() => toggleFilter(s, selectedSemesters, setSelectedSemesters)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                selectedSemesters.includes(s) ? "border-[#F5A97F] bg-[#FDE8D8] text-[#8A4E2A]" : "border-[#FFD7BC] bg-white text-[#8A4E2A]/85 hover:border-[#F5A97F]"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A4E2A]/70">
                      <Tag size={12} className="mr-1 inline" /> Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TECH_STACK_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleFilter(tag, selectedTags, setSelectedTags)}
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
            )}
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
                        <span className="rounded-full border border-[#FFD7BC] px-2.5 py-1 text-[11px] font-bold text-[#8A4E2A]">
                          {post.category}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-[#0F0F0F]">{post.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5D4739]">
                        {post.description}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[#FFF3E8] px-2.5 py-1 text-[11px] font-medium text-[#8A4E2A]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-[#8A4E2A]/70 uppercase tracking-wide">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {post.year}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><BookOpen size={12}/> {post.semester}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><BarChart size={12}/> {post.difficulty}</span>
                      </div>
                      
                      <p className="mt-3 text-xs font-medium text-[#8A4E2A]/75">
                        {post.author} · {post.role} · {post.date}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="shrink-0 rounded-2xl border border-[#FFE1CC] bg-[#FFF8F2] px-4 py-3 text-right">
                        <div className="text-2xl font-bold text-[#0F0F0F]">{post.views}</div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A4E2A]/60">Views</div>
                      </div>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD7BC] bg-white px-3 py-1.5 text-xs font-semibold text-[#8A4E2A] transition hover:border-[#F5A97F] hover:bg-[#FFF8F2]"
                      >
                        <Eye size={14} />
                        Quick View
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-[24px] border border-[#FFD7BC] bg-white/92 p-5 shadow-[0_24px_45px_-38px_rgba(63,31,7,0.35)]">
              <Link href="/trending" className="group flex items-center justify-between text-[#0F0F0F] hover:text-[#B95D35] transition">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <TrendingUp size={15} className="text-[#B95D35] group-hover:text-current" />
                  Trending Now
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A4E2A] group-hover:text-current">View All</span>
              </Link>
              <div className="mt-4 space-y-4">
                {trending.map((post, index) => (
                  <Link href="/trending" key={post.id} className="flex items-start gap-3 group cursor-pointer">
                    <span className="text-2xl font-black leading-none text-[#FFD4B1] group-hover:text-[#F5A97F] transition">#{index + 1}</span>
                    <div>
                      <p className="line-clamp-2 text-sm font-semibold text-[#0F0F0F] group-hover:text-[#B95D35] transition">{post.title}</p>
                      <p className="mt-1 text-[11px] font-medium text-[#8A4E2A]/75">{post.views} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-[#FFD7BC] bg-white shadow-2xl"
            >
              <div className="border-b border-[#FFE1CC] bg-[#FFF8F2] px-6 py-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#0F0F0F]">{selectedPost.title}</h2>
                  <p className="mt-1 text-sm font-medium text-[#8A4E2A]/70">By {selectedPost.author} • {selectedPost.date}</p>
                </div>
                <button onClick={() => setSelectedPost(null)} className="text-[#8A4E2A] hover:text-[#0F0F0F]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Category: {selectedPost.category}</span>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">Year: {selectedPost.year}</span>
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">Sem: {selectedPost.semester}</span>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">Difficulty: {selectedPost.difficulty}</span>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Status: {selectedPost.status}</span>
                </div>
                <h3 className="mb-2 text-sm font-bold text-[#0F0F0F]">Description</h3>
                <p className="mb-6 text-sm leading-relaxed text-[#5D4739]">{selectedPost.description}</p>
                <h3 className="mb-2 text-sm font-bold text-[#0F0F0F]">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="rounded-md border border-[#FFD7BC] bg-[#FFF8F2] px-2 py-1 text-xs font-medium text-[#8A4E2A]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t border-[#FFE1CC] bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-xl bg-[#0F0F0F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Close Quick View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
