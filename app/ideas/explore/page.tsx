"use client";

import DynamicPostForm from "@/src/components/DynamicPostForm";
import ProjectThread from "@/src/components/ProjectThread";
import { mockThreadData } from "@/src/data/mockThread";

export default function IdeasExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-3xl font-bold text-white mb-2">Idea &amp; Guidance Module</h1>
          <p className="text-slate-400 text-sm">
            Share your concepts, find teammates, or request guidance from experienced mentors.
          </p>
        </div>

        {/* Dynamic Post Form */}
        <DynamicPostForm />

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* Recursive Discussion Thread */}
        <ProjectThread comments={mockThreadData} />
      </div>
    </div>
  );
}
