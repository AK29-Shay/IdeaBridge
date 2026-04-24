"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_PROJECTS, SearchPost } from "@/lib/demoData";
import { ArrowLeft, TrendingUp, Eye, Calendar, BookOpen, BarChart, Share2 } from "lucide-react";

const POST_TYPES = [
  { label: "Full Project", value: "full_project" },
  { label: "Idea", value: "idea" },
  { label: "AI Driven", value: "ai_driven" },
  { label: "Campus Req", value: "campus_req" },
];

const TYPE_STYLES: Record<string, string> = {
  full_project: "bg-[#FFF1E6] text-[#8A4E2A]",
  idea: "bg-emerald-50 text-emerald-700",
  ai_driven: "bg-sky-50 text-sky-700",
  campus_req: "bg-amber-50 text-amber-700",
};

export default function TrendingPage() {
  const [trending, setTrending] = React.useState<SearchPost[]>([]);
  const [selectedPost, setSelectedPost] = React.useState<SearchPost | null>(null);

  const handleShare = async (post: SearchPost) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: `Check out this project: ${post.title}`,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  React.useEffect(() => {
    // In a real app, you'd fetch from an API. Here we use demo data sorted by views.
    const sorted = [...DEMO_PROJECTS]
      .filter((p) => p.trending)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    setTrending(sorted);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF4EA] to-[#FFEBDD] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/search" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A4E2A] hover:text-[#0F0F0F]">
            <ArrowLeft size={16} />
            Back to Explore
          </Link>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[#FFD4B1] bg-[#0F0F0F] px-6 py-8 text-[#FDE0C9] shadow-[0_35px_70px_-45px_rgba(15,15,15,0.9)] sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9F5A] to-[#FF7A1F] text-white">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trending Ideas</h1>
              <p className="mt-1 text-sm text-[#FDE0C9]/75">Top 5 most viewed and active projects right now</p>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-5">
          {trending.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-[24px] border border-[#FFD7BC] bg-white/92 p-5 shadow-[0_24px_45px_-38px_rgba(63,31,7,0.35)] hover:border-[#F5A97F] transition"
            >
              <div className="absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#FFE1CC] bg-[#FFF8F2] text-xl font-black text-[#FF7A1F] shadow-sm">
                #{index + 1}
              </div>
              
              <div className="ml-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${TYPE_STYLES[post.type] || "bg-gray-100 text-gray-700"}`}>
                      {POST_TYPES.find((t) => t.value === post.type)?.label || post.type}
                    </span>
                    <span className="rounded-full border border-[#FFD7BC] px-2.5 py-1 text-[11px] font-bold text-[#8A4E2A]">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#0F0F0F]">{post.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5D4739]">{post.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#FFF3E8] px-2.5 py-1 text-[11px] font-medium text-[#8A4E2A]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[#8A4E2A]/75">
                    <div className="flex items-center gap-1.5"><Calendar size={14}/> {post.year}</div>
                    <div className="flex items-center gap-1.5"><BookOpen size={14}/> {post.semester}</div>
                    <div className="flex items-center gap-1.5"><BarChart size={14}/> {post.difficulty}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="shrink-0 rounded-2xl border border-[#FFE1CC] bg-[#FFF8F2] px-4 py-3 text-right">
                    <div className="text-2xl font-bold text-[#0F0F0F]">{post.views}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A4E2A]/60">Views</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare(post)}
                      className="inline-flex items-center justify-center rounded-xl border border-[#FFD7BC] bg-white p-[7px] text-[#8A4E2A] transition hover:border-[#F5A97F] hover:bg-[#FFF8F2]"
                      title="Share"
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFD7BC] bg-white px-3 py-1.5 text-xs font-semibold text-[#8A4E2A] transition hover:border-[#F5A97F] hover:bg-[#FFF8F2]"
                    >
                      <Eye size={14} />
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
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
              <div className="border-b border-[#FFE1CC] bg-[#FFF8F2] px-6 py-4">
                <h2 className="text-xl font-bold text-[#0F0F0F]">{selectedPost.title}</h2>
                <p className="mt-1 text-sm font-medium text-[#8A4E2A]/70">By {selectedPost.author} • {selectedPost.date}</p>
              </div>
              <div className="p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Category: {selectedPost.category}</span>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">Year: {selectedPost.year}</span>
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">Sem: {selectedPost.semester}</span>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">Difficulty: {selectedPost.difficulty}</span>
                </div>
                <h3 className="mb-2 text-sm font-bold text-[#0F0F0F]">Description</h3>
                <p className="mb-6 text-sm leading-relaxed text-[#5D4739]">{selectedPost.description}</p>
                <h3 className="mb-2 text-sm font-bold text-[#0F0F0F]">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="rounded-md border border-[#FFD7BC] bg-white px-2 py-1 text-xs font-medium text-[#8A4E2A]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t border-[#FFE1CC] bg-gray-50 px-6 py-4 text-right">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-xl bg-[#0F0F0F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
