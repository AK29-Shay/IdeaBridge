import React, { useState, useMemo } from 'react';
import { ChevronUpDown, ChevronUp, ChevronDown } from 'lucide-react';

function ProjectsList({ projects, dateFrom, dateTo }) {
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });

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
                <tr key={project.id} className="hover:bg-slate-50 transition-colors">
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
    </section>
  );
}

export default ProjectsList;
