import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronUpDown, Eye, Heart, MessageSquare } from 'lucide-react';

function normalizeDate(value) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString();
}

function getProjectThreads(project) {
  if (!project) {
    return [];
  }

  return [
    {
      id: `${project.id}-mentor`,
      role: 'Mentor',
      author: 'Mentor Panel',
      time: '2 hours ago',
      message: `Good momentum on ${project.title}. Share your next milestone plan with measurable outcomes so we can review progress faster.`
    },
    {
      id: `${project.id}-student`,
      role: 'Student',
      author: 'Project Owner',
      time: '1 hour ago',
      message: 'I will upload an updated demo and architecture note before the next review. Please focus on scalability and API boundaries.'
    },
    {
      id: `${project.id}-followup`,
      role: 'Mentor',
      author: 'Mentor Panel',
      time: '35 minutes ago',
      message: 'Perfect. Add test coverage notes as well so we can track quality, not only feature progress.'
    }
  ];
}

function ProjectsList({ projects, dateFrom, dateTo }) {
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const sortedProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'createdDate' || sortConfig.key === 'requestedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortConfig.key === 'contributions') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [projects, sortConfig]);

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId(null);
      return;
    }

    if (!selectedProjectId || !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return sortedProjects.find((project) => project.id === selectedProjectId) ?? null;
  }, [sortedProjects, selectedProjectId]);

  const selectedProjectThreads = useMemo(() => getProjectThreads(selectedProject), [selectedProject]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUpDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-4 sm:px-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Projects in Period</h2>
            {dateFrom && dateTo && (
              <p className="mt-1 text-xs text-slate-500">
                {new Date(dateFrom).toLocaleDateString()} to {new Date(dateTo).toLocaleDateString()}
              </p>
            )}
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="px-4 py-8 sm:px-6 text-center text-slate-500">
          No projects found in this period
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th 
                  onClick={() => handleSort('title')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-6 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    Title
                    <SortIcon column="title" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('category')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-6 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    Category
                    <SortIcon column="category" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('createdDate')}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-6 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    Created Date
                    <SortIcon column="createdDate" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('contributions')}
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-6 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-2">
                    Contributions
                    <SortIcon column="contributions" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedProjects.map((project) => (
                <tr
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProjectId(project.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedProjectId(project.id);
                    }
                  }}
                  className={`transition-colors cursor-pointer ${
                    selectedProjectId === project.id
                      ? 'bg-amber-50/70'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3 sm:px-6 text-sm font-medium text-slate-900">{project.title}</td>
                  <td className="px-4 py-3 sm:px-6 text-sm">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-6 text-sm text-slate-600">
                    {new Date(project.createdDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 sm:px-6 text-right text-sm font-semibold text-slate-900">
                    {project.contributions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProject ? (
        <div className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-[#efdfd2] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Project details</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{selectedProject.title}</h3>
                </div>
                <span className="rounded-full border border-[#f2dfd1] bg-[#fff6ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c96c2c]">
                  {selectedProject.category || 'General'}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Project ID</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedProject.id}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Created Date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{normalizeDate(selectedProject.createdDate)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Contributions</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedProject.contributions ?? 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Responses</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedProject.responses ?? 0}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Heart className="h-4 w-4 text-[#e26d5c]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Likes</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{selectedProject.likes ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Eye className="h-4 w-4 text-[#4f8df6]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Views</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{selectedProject.views ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MessageSquare className="h-4 w-4 text-[#10b981]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Threads</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{selectedProjectThreads.length}</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Summary</p>
                <p className="mt-2 text-sm text-slate-700">
                  {selectedProject.description || 'Detailed summary is not available for this project yet.'}
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-[#efdfd2] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Project Threads</h3>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {selectedProjectThreads.length} updates
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {selectedProjectThreads.map((thread) => (
                  <div key={thread.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            thread.role === 'Mentor' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {thread.role}
                        </span>
                        <p className="text-sm font-semibold text-slate-900">{thread.author}</p>
                      </div>
                      <p className="text-xs text-slate-500">{thread.time}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{thread.message}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProjectsList;
