"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, MessageSquare, Eye, ThumbsUp, ArrowUpRight, ArrowDownRight, FileCode2, Lightbulb, Sparkles, GraduationCap } from "lucide-react";

// --- Mock Data ---
const STATS = [
  { label: "Total Posts", value: 128, change: +14, icon: <BarChart3 size={20} />, color: "indigo" },
  { label: "Active Users", value: 47, change: +6, icon: <Users size={20} />, color: "emerald" },
  { label: "Comments Today", value: 312, change: -8, icon: <MessageSquare size={20} />, color: "violet" },
  { label: "Total Views", value: "12.4K", change: +22, icon: <Eye size={20} />, color: "orange" },
];

const TOP_POSTS = [
  { id: 1, title: "Fully AI-Generated E-Commerce Store", upvotes: 87, views: 620, type: "ai_driven", author: "abinayan03" },
  { id: 2, title: "Micro-SaaS Idea: AI Code Reviewer", upvotes: 55, views: 410, type: "idea", author: "AK29-Shay" },
  { id: 3, title: "IdeaBridge Collaboration Platform", upvotes: 42, views: 310, type: "full_project", author: "AK29-Shay" },
  { id: 4, title: "Campus Library Management System", upvotes: 23, views: 190, type: "campus_req", author: "NethminiChinthana101" },
  { id: 5, title: "Supabase RLS with Next.js Server Actions", upvotes: 18, views: 145, type: "campus_req", author: "sneha-dhaya-IT" },
];

const WEEKLY_ACTIVITY = [
  { day: "Mon", posts: 12, comments: 45 },
  { day: "Tue", posts: 19, comments: 62 },
  { day: "Wed", posts: 8, comments: 30 },
  { day: "Thu", posts: 24, comments: 89 },
  { day: "Fri", posts: 31, comments: 112 },
  { day: "Sat", posts: 16, comments: 55 },
  { day: "Sun", posts: 9, comments: 28 },
];

const TYPE_BREAKDOWN = [
  { type: "Full Project", value: 38, icon: <FileCode2 size={14} />, color: "bg-indigo-500" },
  { type: "Idea", value: 45, icon: <Lightbulb size={14} />, color: "bg-green-500" },
  { type: "AI Driven", value: 25, icon: <Sparkles size={14} />, color: "bg-purple-500" },
  { type: "Campus Req", value: 20, icon: <GraduationCap size={14} />, color: "bg-orange-500" },
];

const total = TYPE_BREAKDOWN.reduce((sum, t) => sum + t.value, 0);

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "users">("overview");

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: "bg-indigo-900/30", text: "text-indigo-400", border: "border-indigo-800" },
    emerald: { bg: "bg-emerald-900/30", text: "text-emerald-400", border: "border-emerald-800" },
    violet: { bg: "bg-violet-900/30", text: "text-violet-400", border: "border-violet-800" },
    orange: { bg: "bg-orange-900/30", text: "text-orange-400", border: "border-orange-800" },
  };

  const maxActivity = Math.max(...WEEKLY_ACTIVITY.map(d => d.posts + d.comments));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Platform insights & engagement metrics</p>
          </div>
          <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
            {(["overview", "posts", "users"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md capitalize transition ${activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, i) => {
            const c = colorClasses[stat.color];
            const isPositive = stat.change > 0;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-slate-900 border ${c.border} rounded-2xl p-5`}
              >
                <div className={`inline-flex p-2.5 rounded-xl ${c.bg} ${c.text} mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-black text-white mb-0.5">{stat.value}</div>
                <div className="text-slate-500 text-xs mb-2">{stat.label}</div>
                <div className={`flex items-center gap-1 text-[11px] font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(stat.change)}% this week
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" /> Weekly Activity
            </h3>
            <p className="text-slate-500 text-xs mb-6">Posts + Comments by day</p>
            <div className="flex items-end gap-3 h-36">
              {WEEKLY_ACTIVITY.map((d) => {
                const h = ((d.posts + d.comments) / maxActivity) * 100;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${h}%` }}>
                      <div className="absolute inset-0 bg-indigo-600/30 rounded-t-lg" />
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-lg transition-all"
                        style={{ height: `${(d.posts / (d.posts + d.comments)) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{d.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Posts</span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400"><span className="w-3 h-3 rounded-sm bg-indigo-900 inline-block" /> Comments</span>
            </div>
          </div>

          {/* Post Type Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-1">Post Breakdown</h3>
            <p className="text-slate-500 text-xs mb-5">By category</p>
            <div className="space-y-3">
              {TYPE_BREAKDOWN.map(t => (
                <div key={t.type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">{t.icon} {t.type}</span>
                    <span className="text-xs font-bold text-white">{Math.round((t.value / total) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(t.value / total) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${t.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Posts Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ThumbsUp size={16} className="text-indigo-400" /> Top Posts by Engagement
            </h3>
          </div>
          <div className="divide-y divide-slate-800">
            {TOP_POSTS.map((post, idx) => (
              <div key={post.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-800/40 transition-colors">
                <span className="text-slate-600 font-black text-lg w-6 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{post.title}</p>
                  <p className="text-xs text-slate-500">{post.author}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
                  <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post.upvotes}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
