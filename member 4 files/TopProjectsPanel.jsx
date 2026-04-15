import React from 'react';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import ChartCard from './ChartCard';
import InsightNote from './InsightNote';

function StatPill({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function TopProjectsPanel({ projects, insight }) {
  return (
    <ChartCard title="Top Performing Projects" subtitle="What is resonating?" bodyClassName="space-y-4">
      {projects.length === 0 ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-[20px] border border-dashed border-[#e5d3c6] bg-white/80 text-sm text-slate-500">
          No projects match the current filters.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className="rounded-[24px] border border-[#efdfd2] bg-white/95 p-5 shadow-[0_20px_45px_-34px_rgba(45,28,11,0.28)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">#{index + 1} performer</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{project.title}</h3>
                </div>
                <span className="rounded-full border border-[#f2dfd1] bg-[#fff6ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c96c2c]">
                  {project.category}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <StatPill
                  icon={<Heart className="h-4 w-4 text-[#e26d5c]" />}
                  value={project.likes}
                  label="Likes"
                />
                <StatPill
                  icon={<Eye className="h-4 w-4 text-[#4f8df6]" />}
                  value={project.views}
                  label="Views"
                />
                <StatPill
                  icon={<MessageSquare className="h-4 w-4 text-[#10b981]" />}
                  value={project.responses}
                  label="Responses"
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <InsightNote>{insight}</InsightNote>
    </ChartCard>
  );
}

export default TopProjectsPanel;
