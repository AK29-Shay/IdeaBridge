import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, FolderOpen, Sparkles, Zap } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import FilterBar from '../components/FilterBar';
import AnalyticsSection from '../components/AnalyticsSection';
import { dummyData } from '../data/dummyData';
import { filterByCategoryAndRange, safeArray, sumField } from '../utils/dataHelpers';

const fallbackData = { projects: [], requests: [] };

function isResolvedRequest(status) {
  return status === 'answered' || status === 'completed';
}

function StudentAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ category: 'All', dateFrom: '', dateTo: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!dummyData) {
          throw new Error('Failed to load dummy data');
        }

        setData(dummyData);
        setLoading(false);
      } catch (loadError) {
        setError('Failed to load data');
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const projects = useMemo(() => safeArray(data?.projects ?? fallbackData.projects), [data]);
  const requests = useMemo(() => safeArray(data?.requests ?? fallbackData.requests), [data]);

  const filteredProjects = useMemo(() => {
    return filterByCategoryAndRange(projects, filters.category, filters.dateFrom, filters.dateTo);
  }, [projects, filters]);

  const filteredRequests = useMemo(() => {
    return filterByCategoryAndRange(requests, filters.category, filters.dateFrom, filters.dateTo, 'requestedAt');
  }, [requests, filters]);

  const categories = useMemo(() => {
    return Array.from(new Set(projects.map((project) => project?.category).filter(Boolean)));
  }, [projects]);

  const totalProjects = filteredProjects.length;
  const openRequests = filteredRequests.filter((item) => !isResolvedRequest(item.status)).length;
  const resolvedRequests = filteredRequests.filter((item) => isResolvedRequest(item.status)).length;
  const totalContributions = sumField(filteredProjects, 'contributions');

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="rounded-[28px] border border-[#f3e0d2] bg-white/92 p-8 text-center text-slate-600 shadow-[0_24px_70px_-48px_rgba(45,28,11,0.4)]">
          Loading analytics...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="rounded-[28px] border border-red-200 bg-red-50/95 p-8 text-center text-red-600 shadow-[0_24px_70px_-48px_rgba(45,28,11,0.4)]">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const noData = totalProjects === 0 && filteredRequests.length === 0;

  return (
    <DashboardLayout title="Dashboard">
      <section className="relative overflow-hidden rounded-[34px] bg-[#110f0c] px-7 py-8 text-[#fecdac] shadow-[0_30px_90px_-42px_rgba(17,15,12,0.92)] sm:px-9">
        <div className="absolute inset-y-0 right-0 w-[34%] bg-[radial-gradient(circle_at_center,rgba(245,169,127,0.24),transparent_46%)]" />
        <div className="absolute -bottom-12 right-[22%] h-40 w-40 rounded-full bg-[rgba(214,84,122,0.28)] blur-3xl" />
        <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/5 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 text-base font-semibold text-[#fecdac]">
            <Sparkles className="h-5 w-5" />
            <span>Welcome back</span>
          </div>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#fecdac] sm:text-5xl">
            Ready to build something great?
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#fecdac]/72">
            Share your student projects, track collaboration requests, and spot what is getting attention without turning the dashboard into an admin screen.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-2xl border border-[#fecdac]/15 bg-[#fecdac]/10 px-6 py-4 text-lg font-semibold text-[#fecdac] shadow-[0_18px_40px_-26px_rgba(0,0,0,0.75)] transition hover:bg-[#fecdac]/14"
            >
              <ArrowUpRight className="h-5 w-5" />
              View My Projects
            </button>
            <div className="rounded-2xl border border-[#fecdac]/12 bg-[#fecdac]/6 px-5 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#fecdac]/55">Total contributions</p>
              <p className="mt-1 text-2xl font-bold text-[#fecdac]">{totalContributions}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          icon={<FolderOpen className="h-6 w-6" />}
          description="Projects in the current view"
          cardClassName="bg-white/94"
          iconClassName="bg-darkSecondary"
          valueClassName="text-slate-950"
        />
        <StatCard
          label="Open Requests"
          value={openRequests}
          icon={<Zap className="h-6 w-6" />}
          description="Requests still waiting for a response"
          cardClassName="bg-[#fff9ec]"
          iconClassName="bg-amber-gradient"
          valueClassName="text-[#c45c00]"
        />
        <StatCard
          label="Resolved Requests"
          value={resolvedRequests}
          icon={<CheckCircle2 className="h-6 w-6" />}
          description="Requests that already have an answer"
          cardClassName="bg-[#ebfbf6]"
          iconClassName="bg-emerald-gradient"
          valueClassName="text-[#05856b]"
        />
      </div>

      <FilterBar
        category={filters.category}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        categories={categories}
        onApply={(nextFilters) => setFilters(nextFilters)}
      />

      {noData ? (
        <div className="rounded-[28px] border border-dashed border-[#dfc7b8] bg-white/88 p-10 text-center text-slate-500 shadow-[0_24px_70px_-48px_rgba(45,28,11,0.4)]">
          No data available
        </div>
      ) : (
        <AnalyticsSection
          projects={filteredProjects}
          requests={filteredRequests}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
        />
      )}
    </DashboardLayout>
  );
}

export default StudentAnalyticsDashboard;
