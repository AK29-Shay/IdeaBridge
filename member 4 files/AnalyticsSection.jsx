import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import ChartCard from './ChartCard';
import InsightNote from './InsightNote';
import TopProjectsPanel from './TopProjectsPanel';
import ProjectsList from './ProjectsList';

const popularityColor = '#F5A97F';
const answeredColor = '#10B981';
const unansweredColor = '#FECACA';
const uploadColor = '#1D4ED8';
const requestColor = '#F59E0B';
const contributionPalette = ['#F5A97F', '#1D4ED8', '#10B981'];

function BaseTooltip({ active, payload, label, labelSuffix = '', valueSuffix = '' }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#f1dfd1] bg-white/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
        {labelSuffix}
      </p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-slate-900">
              {entry.value}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-[#f1dfd1] bg-white/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{point.name}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{point.value} actions</p>
    </div>
  );
}

function formatMonth(monthKey) {
  const parsed = new Date(`${monthKey}-01T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return monthKey;
  }

  return parsed.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function isAnsweredRequest(status) {
  return status === 'answered' || status === 'completed';
}

function buildMonthlyTrend(projects, requests) {
  const monthMap = new Map();

  projects.forEach((project) => {
    const month = project.createdDate?.slice(0, 7);

    if (!month) {
      return;
    }

    const existing = monthMap.get(month) ?? { month, uploads: 0, requests: 0, total: 0 };
    existing.uploads += 1;
    existing.total += 1;
    monthMap.set(month, existing);
  });

  requests.forEach((request) => {
    const month = request.requestedAt?.slice(0, 7);

    if (!month) {
      return;
    }

    const existing = monthMap.get(month) ?? { month, uploads: 0, requests: 0, total: 0 };
    existing.requests += 1;
    existing.total += 1;
    monthMap.set(month, existing);
  });

  return [...monthMap.values()]
    .sort((left, right) => left.month.localeCompare(right.month))
    .map((item) => ({
      ...item,
      label: formatMonth(item.month)
    }));
}

function scoreProject(project) {
  return project.likes * 3 + project.responses * 10 + Math.round(project.views / 20);
}

function AnalyticsSection({ projects, requests, dateFrom = '', dateTo = '' }) {
  const categories = useMemo(() => {
    return Array.from(new Set([...projects, ...requests].map((item) => item?.category).filter(Boolean)));
  }, [projects, requests]);

  const categoryPopularity = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        projects: projects.filter((project) => project.category === category).length
      }))
      .filter((item) => item.projects > 0)
      .sort((left, right) => right.projects - left.projects);
  }, [categories, projects]);

  const requestResponseData = useMemo(() => {
    return categories
      .map((category) => {
        const categoryRequests = requests.filter((request) => request.category === category);
        const answered = categoryRequests.filter((request) => isAnsweredRequest(request.status)).length;

        return {
          category,
          answered,
          unanswered: Math.max(categoryRequests.length - answered, 0),
          totalRequests: categoryRequests.length
        };
      })
      .filter((item) => item.totalRequests > 0);
  }, [categories, requests]);

  const monthlyTrend = useMemo(() => buildMonthlyTrend(projects, requests), [projects, requests]);

  const answeredRequests = useMemo(() => requests.filter((request) => isAnsweredRequest(request.status)).length, [requests]);

  const userContribution = useMemo(() => {
    return [
      { name: 'Uploads', value: projects.length },
      { name: 'Requests', value: requests.length },
      { name: 'Responses', value: answeredRequests }
    ].filter((item) => item.value > 0);
  }, [projects.length, requests.length, answeredRequests]);

  const topProjects = useMemo(() => {
    return [...projects]
      .sort((left, right) => scoreProject(right) - scoreProject(left))
      .slice(0, 3);
  }, [projects]);

  const totalRequests = requests.length;
  const responseRate = totalRequests === 0 ? 0 : Math.round((answeredRequests / totalRequests) * 100);
  const mostPopularCategory = categoryPopularity[0];
  const peakMonth = monthlyTrend.reduce((highest, item) => {
    if (!highest || item.total > highest.total) {
      return item;
    }

    return highest;
  }, null);
  const topContribution = userContribution.reduce((highest, item) => {
    if (!highest || item.value > highest.value) {
      return item;
    }

    return highest;
  }, null);
  const totalContributions = userContribution.reduce((sum, item) => sum + item.value, 0);
  const topProject = topProjects[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Category Popularity" subtitle="What is popular?" bodyClassName="space-y-4">
        {categoryPopularity.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-[20px] border border-dashed border-[#e5d3c6] bg-white/80 text-sm text-slate-500">
            No category data in the current view.
          </div>
        ) : (
          <>
            <div className="h-72 w-full min-h-65">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPopularity} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f3e1d1" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<BaseTooltip valueSuffix=" projects" />} cursor={{ fill: 'rgba(245, 169, 127, 0.12)' }} />
                  <Bar dataKey="projects" name="Projects" radius={[12, 12, 0, 0]} fill={popularityColor} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <InsightNote>
              {mostPopularCategory
                ? `Most active category is ${mostPopularCategory.category} with ${mostPopularCategory.projects} projects.`
                : 'Projects will start surfacing here once you upload work.'}
            </InsightNote>
          </>
        )}
        </ChartCard>

        <ChartCard title="Request vs Response Analysis" subtitle="What is lacking?" bodyClassName="space-y-4">
        {requestResponseData.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-[20px] border border-dashed border-[#e5d3c6] bg-white/80 text-sm text-slate-500">
            No request data in the current view.
          </div>
        ) : (
          <>
            <div className="h-72 w-full min-h-65">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestResponseData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f3e1d1" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<BaseTooltip valueSuffix=" requests" />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="answered" name="Answered" stackId="requests" fill={answeredColor} radius={[12, 12, 0, 0]} maxBarSize={42} />
                  <Bar dataKey="unanswered" name="Awaiting response" stackId="requests" fill={unansweredColor} radius={[12, 12, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <InsightNote>
              {totalRequests > 0
                ? `Response rate is ${responseRate}%, so ${Math.max(totalRequests - answeredRequests, 0)} requests still need attention.`
                : 'Request health will appear here once collaboration requests are made.'}
            </InsightNote>
          </>
        )}
        </ChartCard>

        <ChartCard title="Monthly Activity Trend" subtitle="What is trending?" bodyClassName="space-y-4">
        {monthlyTrend.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-[20px] border border-dashed border-[#e5d3c6] bg-white/80 text-sm text-slate-500">
            No activity data in the current view.
          </div>
        ) : (
          <>
            <div className="h-72 w-full min-h-65">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f3e1d1" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<BaseTooltip valueSuffix=" actions" />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="uploads" name="Uploads" stroke={uploadColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="requests" name="Requests" stroke={requestColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <InsightNote>
              {peakMonth
                ? `Peak activity was in ${peakMonth.label}, with ${peakMonth.total} uploads and requests combined.`
                : 'Your trend line will appear here as you start sharing work.'}
            </InsightNote>
          </>
        )}
        </ChartCard>

        <ChartCard title="User Contribution Breakdown" subtitle="How active are you?" bodyClassName="space-y-4">
        {userContribution.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-[20px] border border-dashed border-[#e5d3c6] bg-white/80 text-sm text-slate-500">
            No contribution data in the current view.
          </div>
        ) : (
          <>
            <div className="relative h-72 w-full min-h-65">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<PieTooltip />} />
                  <Pie
                    data={userContribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={4}
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth={4}
                  >
                    {userContribution.map((entry, index) => (
                      <Cell key={entry.name} fill={contributionPalette[index % contributionPalette.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Your Activity</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">{totalContributions}</p>
                <p className="text-xs text-slate-500">actions</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {userContribution.map((item, index) => (
                <div key={item.name} className="rounded-2xl border border-[#f0e2d5] bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: contributionPalette[index % contributionPalette.length] }} />
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{Math.round((item.value / totalContributions) * 100)}%</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <InsightNote>
              {topContribution
                ? `${topContribution.name} make up ${Math.round((topContribution.value / totalContributions) * 100)}% of your activity in this view.`
                : 'Your contribution mix will appear here as you interact with the platform.'}
            </InsightNote>
          </>
        )}
        </ChartCard>

        <div className="xl:col-span-2">
          <TopProjectsPanel
            projects={topProjects}
            insight={
              topProject
                ? `${topProject.title} is leading right now with ${topProject.views} views and ${topProject.likes} likes.`
                : 'High-performing projects will surface here once engagement data is available.'
            }
          />
        </div>
      </div>

      <ProjectsList projects={projects} dateFrom={dateFrom} dateTo={dateTo} />
    </div>
  );
}

export default AnalyticsSection;
