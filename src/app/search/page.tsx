"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, TrendingUp, FileCode2, Lightbulb, Sparkles, GraduationCap, Tag } from "lucide-react";

const POST_TYPES = [
  { label: "Full Project", value: "full_project", icon: <FileCode2 size={14} /> },
  { label: "Idea", value: "idea", icon: <Lightbulb size={14} /> },
  { label: "AI Driven", value: "ai_driven", icon: <Sparkles size={14} /> },
  { label: "Campus Req", value: "campus_req", icon: <GraduationCap size={14} /> },
];

const TECH_TAGS = ["Next.js", "React", "Supabase", "TypeScript", "Tailwind", "Node.js", "PostgreSQL", "Python"];

const MOCK_POSTS = [
  { id: "1", title: "IdeaBridge: AI-Powered Collaboration Platform", type: "full_project", author: "AK29-Shay", role: "Student", tags: ["Next.js", "Supabase", "TypeScript"], upvotes: 42, views: 310, mode: "post" },
  { id: "2", title: "How do I connect Supabase RLS with Next.js server actions?", type: "campus_req", author: "sneha-dhaya-IT", role: "Student", tags: ["Supabase", "Next.js"], upvotes: 18, views: 145, mode: "request" },
  { id: "3", title: "Fully AI-Generated E-Commerce Store", type: "ai_driven", author: "abinayan03", role: "Mentor", tags: ["React", "Python", "TypeScript"], upvotes: 87, views: 620, mode: "post" },
  { id: "4", title: "Campus Library Management System", type: "campus_req", author: "NethminiChinthana101", role: "Student", tags: ["PostgreSQL", "Node.js"], upvotes: 23, views: 190, mode: "post" },
  { id: "5", title: "Micro-SaaS Idea: AI Code Reviewer", type: "idea", author: "AK29-Shay", role: "Student", tags: ["TypeScript", "React"], upvotes: 55, views: 410, mode: "post" },
];

interface Post {
  id: string;
  title: string;
  type: string;
  author: string;
  role: string;
  tags: string[];
  upvotes: number;
  views: number;
  mode: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Post[]>(MOCK_POSTS);

  const debouncedQuery = useDebounce(query, 300);

  const filter = useCallback(() => {
    let filtered = MOCK_POSTS;
    if (debouncedQuery.trim()) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(debouncedQuery.toLowerCase()))
      );
    }
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => selectedTypes.includes(p.type));
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => selectedTags.some(t => p.tags.includes(t)));
    }
    setResults(filtered);
  }, [debouncedQuery, selectedTypes, selectedTags]);

  useEffect(() => { filter(); }, [filter]);

  const toggleType = (v: string) =>
    setSelectedTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleTag = (t: string) =>
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const clearAll = () => { setSelectedTypes([]); setSelectedTags([]); setQuery(""); };

  const trending = [...MOCK_POSTS].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);

  const typeColor: Record<string, string> = {
    full_project: "text-indigo-400 bg-indigo-900/30",
    idea: "text-green-400 bg-green-900/30",
    ai_driven: "text-purple-400 bg-purple-900/30",
    campus_req: "text-orange-400 bg-orange-900/30",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Ideas</h1>
          <p className="text-slate-400 text-sm">Search projects, ideas, and guidance across the community.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, tech stack, topic..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-12 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Toggle Row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition ${showFilters ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"}`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {(selectedTypes.length + selectedTags.length) > 0 && (
              <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedTypes.length + selectedTags.length}
              </span>
            )}
          </button>
          {(selectedTypes.length + selectedTags.length) > 0 && (
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Post Type</p>
                  <div className="flex flex-wrap gap-2">
                    {POST_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => toggleType(t.value)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${selectedTypes.includes(t.value) ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <Tag size={12} className="inline mr-1" />Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TECH_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs font-medium px-3 py-1 rounded-full border transition ${selectedTags.includes(tag) ? "bg-purple-600 border-purple-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Results */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-slate-500 text-sm mb-3">
              {results.length === 0 ? "No results found." : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
            </p>
            <AnimatePresence mode="popLayout">
              {results.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  layout
                  className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${typeColor[post.type]}`}>
                          {POST_TYPES.find(t => t.value === post.type)?.label}
                        </span>
                        <span className="text-[11px] text-slate-500">{post.mode === "request" ? "🙋 Request" : "💡 Post"}</span>
                      </div>
                      <h3 className="font-semibold text-white text-sm leading-snug mb-2">{post.title}</h3>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">{post.author} · {post.role}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-indigo-400 font-bold text-lg">{post.upvotes}</div>
                      <div className="text-slate-600 text-[10px]">upvotes</div>
                      <div className="text-slate-600 text-[10px] mt-1">{post.views} views</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Trending Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sticky top-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={15} className="text-orange-400" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {trending.map((post, idx) => (
                  <div key={post.id} className="flex items-start gap-3">
                    <span className="text-xl font-black text-slate-700 leading-none">#{idx + 1}</span>
                    <div>
                      <p className="text-xs text-slate-300 font-medium leading-snug line-clamp-2">{post.title}</p>
                      <p className="text-[10px] text-orange-400 mt-0.5">↑ {post.upvotes} upvotes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
