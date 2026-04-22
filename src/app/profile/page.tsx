"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Edit3, Save, X, Camera, Star, BookOpen } from "lucide-react";

type DemoRole = "Student" | "Mentor";

const mockUser = {
  id: "u-001",
  fullName: "Sneha Dhaya",
  email: "sneha@ideabridge.dev",
  role: "Mentor" as DemoRole,
  avatarUrl: "https://i.pravatar.cc/150?u=sneha",
  joinedAt: "March 2025",
  postsCount: 12,
  commentsCount: 47,
  bio: "Full-stack developer mentoring students on Next.js and Supabase. Passionate about building scalable cloud applications.",
};

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(mockUser);
  const [draft, setDraft] = useState(mockUser);

  const handleSave = () => {
    setUser(draft);
    setEditing(false);
  };

  const roleStyle =
    user.role === "Mentor"
      ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700"
      : "bg-blue-900/40 text-blue-400 border border-blue-700";

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-900 via-violet-900 to-slate-900 relative">
            <div className="absolute bottom-0 left-6 translate-y-1/2 flex items-end gap-4">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-2xl border-4 border-slate-900 object-cover shadow-xl"
                />
                {editing && (
                  <button className="absolute -bottom-1 -right-1 bg-indigo-600 p-1.5 rounded-lg shadow">
                    <Camera size={12} className="text-white" />
                  </button>
                )}
              </div>
            </div>
            <div className="absolute top-4 right-4">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Save size={13} /> Save
                  </button>
                  <button
                    onClick={() => { setDraft(user); setEditing(false); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs px-2 py-1.5 rounded-lg transition"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Body */}
          <div className="pt-14 px-6 pb-6">
            {/* Name & Role */}
            <div className="flex items-start justify-between mb-4">
              <div>
                {editing ? (
                  <input
                    value={draft.fullName}
                    onChange={e => setDraft({ ...draft, fullName: e.target.value })}
                    className="text-xl font-bold text-white bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
                )}
                <p className="text-slate-500 text-sm mt-0.5">{user.email}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full mt-1 ${roleStyle}`}>
                {user.role === "Mentor" ? <Star size={12} className="inline mr-1" /> : <BookOpen size={12} className="inline mr-1" />}
                {user.role}
              </span>
            </div>

            {/* Bio */}
            <div className="mb-5">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Bio</label>
              {editing ? (
                <textarea
                  value={draft.bio}
                  onChange={e => setDraft({ ...draft, bio: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                />
              ) : (
                <p className="text-slate-400 text-sm leading-relaxed">{user.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: <User size={16} />, label: "Member since", value: user.joinedAt },
                { icon: <Edit3 size={16} />, label: "Posts", value: user.postsCount },
                { icon: <Mail size={16} />, label: "Comments", value: user.commentsCount },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <div className="text-slate-500 flex justify-center mb-1">{stat.icon}</div>
                  <div className="font-bold text-white text-sm">{stat.value}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Role Selector (edit only) */}
            {editing && (
              <div className="mt-4">
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 block">
                  <Shield size={12} className="inline mr-1" />Role
                </label>
                <select
                  value={draft.role}
                  onChange={e => setDraft({ ...draft, role: e.target.value as "Student" | "Mentor" })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                >
                  <option value="Student">Student</option>
                  <option value="Mentor">Mentor</option>
                </select>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
