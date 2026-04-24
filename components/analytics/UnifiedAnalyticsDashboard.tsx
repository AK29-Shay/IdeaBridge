"use client";

import * as React from "react";
import {
  ArrowUpDown,
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FolderOpen,
  Heart,
  MessageSquare,
  Search,
  Shapes,
  Sparkles,
  Zap,
  Filter,
} from "lucide-react";
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
  YAxis,
} from "recharts";

type AnalyticsProject = {
  id: string;
  title: string;
  category: string;
  createdDate: string;
  contributions: number;
  likes: number;
  views: number;
  responses: number;
  description?: string;
};

type AnalyticsRequest = {
  id: string;
  category: string;
  status: "pending" | "answered" | "completed";
  requestedAt: string;
};

type Filters = {
  category: string;
  dateFrom: string;
  dateTo: string;
};

type FilterFieldErrors = Partial<Record<keyof Filters, string>>;

type SortConfig = {
  key: keyof AnalyticsProject;
  direction: "asc" | "desc";
};

type ThreadNote = {
  id: string;
  role: "Mentor" | "Student" | "Post Owner";
  author: string;
  time: string;
  message: string;
};

type AnalyticsApiPayload = {
  projects?: AnalyticsProject[];
  requests?: AnalyticsRequest[];
  threadsByProject?: Record<string, ThreadNote[]>;
  topicSignals?: TopicSignal[];
  dataSource?: AnalyticsDataSource;
  dataSourceMessage?: string;
};

type AnalyticsDataSource = "live" | "hybrid";

type TopicSignal = {
  topic: string;
  score: number;
  mentions: number;
  categories: string[];
  projects: string[];
};

type TooltipEntry = {
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  payload?: {
    name?: string;
    value?: number;
  };
};

type BaseTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  valueSuffix?: string;
};

const DEFAULT_FILTERS: Filters = { category: "All", dateFrom: "", dateTo: "" };

const CONTRIBUTION_DOT_CLASSES = ["bg-[#f5a97f]", "bg-[#1d4ed8]", "bg-[#10b981]"];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function sumField<T extends Record<string, unknown>>(items: T[], key: keyof T): number {
  return items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
}

function filterByCategoryAndRange<T extends Record<string, unknown>>(
  items: T[],
  category: string,
  dateFrom: string,
  dateTo: string,
  dateKey: keyof T = "createdDate" as keyof T
): T[] {
  return items.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    if (!matchesCategory) {
      return false;
    }

    const value = item[dateKey];
    const rawDate = typeof value === "string" ? value : "";
    if (!rawDate) {
      return !dateFrom && !dateTo;
    }

    if (!dateFrom && !dateTo) {
      return true;
    }

    const candidate = new Date(rawDate).getTime();
    const from = dateFrom ? new Date(dateFrom).getTime() : Number.MIN_SAFE_INTEGER;
    const to = dateTo ? new Date(dateTo).getTime() : Number.MAX_SAFE_INTEGER;
    return candidate >= from && candidate <= to;
  });
}

function isResolvedRequest(status: string): boolean {
  return status === "answered" || status === "completed";
}

function isAnsweredRequest(status: string): boolean {
  return status === "answered" || status === "completed";
}

function formatMonth(monthKey: string): string {
  const parsed = new Date(`${monthKey}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return monthKey;
  }
  return parsed.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function buildMonthlyTrend(projects: AnalyticsProject[], requests: AnalyticsRequest[]) {
  const monthMap = new Map<string, { month: string; uploads: number; requests: number; total: number }>();

  projects.forEach((project) => {
    const month = project.createdDate.slice(0, 7);
    const existing = monthMap.get(month) ?? { month, uploads: 0, requests: 0, total: 0 };
    existing.uploads += 1;
    existing.total += 1;
    monthMap.set(month, existing);
  });

  requests.forEach((request) => {
    const month = request.requestedAt.slice(0, 7);
    const existing = monthMap.get(month) ?? { month, uploads: 0, requests: 0, total: 0 };
    existing.requests += 1;
    existing.total += 1;
    monthMap.set(month, existing);
  });

  return [...monthMap.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({ ...item, label: formatMonth(item.month) }));
}

function getProjectThreads(projectId: string | null, threadsByProject: Record<string, ThreadNote[]>): ThreadNote[] {
  if (!projectId) return [];
  return safeArray(threadsByProject[projectId]);
}

function parseApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = "error" in payload ? String((payload as { error?: unknown }).error ?? "") : "";
  return error || fallback;
}

function normalizeDate(value?: string): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function scoreProject(project: AnalyticsProject) {
  return project.likes * 3 + project.responses * 10 + Math.round(project.views / 20);
}

function parseDateInput(value: string): number | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function getTodayDateInputValue(): string {
  return new Date().toISOString().split("T")[0];
}

function getMinDateValue(left?: string, right?: string): string | undefined {
  if (left && right) {
    return left < right ? left : right;
  }
  return left || right || undefined;
}

function validateFilterDraft(filters: Filters, categories: string[]): {
  fieldErrors: FilterFieldErrors;
  formError: string;
} {
  const fieldErrors: FilterFieldErrors = {};
  const hasCategoryFilter = filters.category !== "All";
  const hasFromDate = Boolean(filters.dateFrom);
  const hasToDate = Boolean(filters.dateTo);
  const hasDateFilter = hasFromDate || hasToDate;
  const fromDate = parseDateInput(filters.dateFrom);
  const toDate = parseDateInput(filters.dateTo);
  const today = parseDateInput(getTodayDateInputValue());

  if (!hasCategoryFilter && !hasDateFilter) {
    return {
      fieldErrors: {},
      formError: "Please select at least one filter before applying.",
    };
  }

  if (filters.category !== "All" && !categories.includes(filters.category)) {
    fieldErrors.category = "Please choose a valid category.";
  }

  if (hasFromDate && fromDate === null) {
    fieldErrors.dateFrom = "Please enter a valid from date.";
  }

  if (hasToDate && toDate === null) {
    fieldErrors.dateTo = "Please enter a valid to date.";
  }

  if (hasFromDate && !hasToDate) {
    fieldErrors.dateTo = "Please select a to date.";
  }

  if (!hasFromDate && hasToDate) {
    fieldErrors.dateFrom = "Please select a from date.";
  }

  if (fromDate !== null && today !== null && fromDate > today) {
    fieldErrors.dateFrom = "From date cannot be in the future.";
  }

  if (toDate !== null && today !== null && toDate > today) {
    fieldErrors.dateTo = "To date cannot be in the future.";
  }

  if (fromDate !== null && toDate !== null && fromDate > toDate) {
    fieldErrors.dateFrom = "From date must be on or before the to date.";
    fieldErrors.dateTo = "To date must be on or after the from date.";
  }

  return {
    fieldErrors,
    formError:
      Object.keys(fieldErrors).length > 0 ? "Fix the highlighted filters before applying them." : "",
  };
}

function renderSortIcon(sortConfig: SortConfig, column: keyof AnalyticsProject) {
  if (sortConfig.key !== column) return <ArrowUpDown className="h-4 w-4 opacity-30" />;
  return sortConfig.direction === "asc" ? (
    <ChevronUp className="h-4 w-4 text-blue-600" />
  ) : (
    <ChevronDown className="h-4 w-4 text-blue-600" />
  );
}

function BaseTooltip({ active, payload, label, valueSuffix = "" }: BaseTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#f1dfd1] bg-white/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={String(entry.dataKey ?? entry.name ?? "tooltip-entry")} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f5a97f]" />
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

function PieTooltip({ active, payload }: Omit<BaseTooltipProps, "label" | "valueSuffix">) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  if (!point) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#f1dfd1] bg-white/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{point.name}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{point.value} actions</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, bodyClassName = "" }: { title: string; subtitle?: string; children: React.ReactNode; bodyClassName?: string }) {
  return (
    <section className="rounded-[30px] border border-[#f0dfd1] bg-white/90 p-5 shadow-[0_30px_65px_-46px_rgba(45,28,11,0.48)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {subtitle ? (
          <span className="rounded-full border border-[#f2dfd1] bg-[#fff8f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c96c2c]">
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className={`rounded-3xl border border-[#f4e8dc] bg-linear-to-b from-[#fffdfa] to-[#fff7f1] p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

function InsightNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#efe1d4] bg-white/95 px-4 py-3 text-sm text-slate-600 shadow-[0_18px_35px_-30px_rgba(45,28,11,0.28)]">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f5a97f]" />
        <p className="leading-6">{children}</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  description,
  cardClassName = "",
  iconClassName = "",
  valueClassName = "",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  cardClassName?: string;
  iconClassName?: string;
  valueClassName?: string;
}) {
  return (
    <article className={`rounded-[28px] border border-[#f3dfcf] p-6 shadow-[0_24px_55px_-42px_rgba(45,28,11,0.42)] transition duration-300 hover:-translate-y-0.5 ${cardClassName}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-[3rem] font-bold leading-none tracking-tight ${valueClassName}`}>{value}</p>
          <p className="mt-4 text-lg font-semibold text-slate-600">{label}</p>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_20px_35px_-20px_rgba(15,15,15,0.55)] ${iconClassName}`}>{icon}</div>
      </div>
    </article>
  );
}

function FilterBar({
  category,
  dateFrom,
  dateTo,
  categories,
  onApply,
}: {
  category: string;
  dateFrom: string;
  dateTo: string;
  categories: string[];
  onApply: (filters: Filters) => void;
}) {
  const [draftFilters, setDraftFilters] = React.useState<Filters>({ category, dateFrom, dateTo });
  const [fieldErrors, setFieldErrors] = React.useState<FilterFieldErrors>({});
  const [formError, setFormError] = React.useState("");
  const todayDate = React.useMemo(() => getTodayDateInputValue(), []);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (draftFilters.category !== "All") count += 1;
    if (draftFilters.dateFrom || draftFilters.dateTo) count += 1;
    return count;
  }, [draftFilters.category, draftFilters.dateFrom, draftFilters.dateTo]);

  function updateDraftFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
    setFormError("");
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === "dateFrom" || key === "dateTo") {
        delete next.dateFrom;
        delete next.dateTo;
      }
      return next;
    });
  }

  function handleApply() {
    const validation = validateFilterDraft(draftFilters, categories);
    setFieldErrors(validation.fieldErrors);
    setFormError(validation.formError);
    if (validation.formError) {
      return;
    }

    onApply(draftFilters);
  }

  function handleClear() {
    setFormError("");
    setFieldErrors({});
    setDraftFilters(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
  }

  return (
    <section className="rounded-[30px] border border-[#f0dfd1] bg-white/92 p-6 shadow-[0_30px_65px_-46px_rgba(45,28,11,0.42)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4eb] text-[#c96c2c]">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Find insights faster</h2>
              <p className="mt-1 text-sm text-slate-500">Filter projects by category and date range.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#f2e4d8] bg-[#fff8f2] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Shapes className="h-4 w-4 text-[#c96c2c]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Category</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">{draftFilters.category === "All" ? "All categories" : draftFilters.category}</p>
          </div>
          <div className="rounded-2xl border border-[#dbf2ea] bg-[#edfcf8] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Filter className="h-4 w-4 text-emerald-600" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Active Filters</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">{activeFilterCount} applied</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr_1fr_auto_auto]">
        <div>
          <label htmlFor="analytics-category" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Category
          </label>
          <select
            id="analytics-category"
            title="Category"
            value={draftFilters.category}
            onChange={(e) => updateDraftFilter("category", e.target.value)}
            aria-invalid={Boolean(fieldErrors.category)}
            aria-describedby={fieldErrors.category ? "analytics-category-error" : undefined}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 transition-colors focus:bg-white focus:outline-none ${
              fieldErrors.category
                ? "border border-red-300 bg-red-50 focus:border-red-400"
                : "border border-[#eedfd2] bg-[#fff8f2] focus:border-[#f5a97f]"
            }`}
          >
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {fieldErrors.category ? (
            <p id="analytics-category-error" className="mt-2 text-sm font-medium text-red-600">
              {fieldErrors.category}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="analytics-date-from" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            From Date
          </label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c96c2c]" />
            <input
              id="analytics-date-from"
              title="From Date"
              placeholder="From date"
              type="date"
              value={draftFilters.dateFrom}
              onChange={(e) => updateDraftFilter("dateFrom", e.target.value)}
              max={getMinDateValue(draftFilters.dateTo, todayDate)}
              aria-invalid={Boolean(fieldErrors.dateFrom)}
              aria-describedby={fieldErrors.dateFrom ? "analytics-date-from-error" : undefined}
              className={`w-full rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-colors focus:bg-white focus:outline-none ${
                fieldErrors.dateFrom
                  ? "border border-red-300 bg-red-50 focus:border-red-400"
                  : "border border-[#eedfd2] bg-[#fff8f2] focus:border-[#f5a97f]"
              }`}
            />
          </div>
          {fieldErrors.dateFrom ? (
            <p id="analytics-date-from-error" className="mt-2 text-sm font-medium text-red-600">
              {fieldErrors.dateFrom}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="analytics-date-to" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            To Date
          </label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c96c2c]" />
            <input
              id="analytics-date-to"
              title="To Date"
              placeholder="To date"
              type="date"
              value={draftFilters.dateTo}
              onChange={(e) => updateDraftFilter("dateTo", e.target.value)}
              min={draftFilters.dateFrom || undefined}
              max={todayDate}
              aria-invalid={Boolean(fieldErrors.dateTo)}
              aria-describedby={fieldErrors.dateTo ? "analytics-date-to-error" : undefined}
              className={`w-full rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-colors focus:bg-white focus:outline-none ${
                fieldErrors.dateTo
                  ? "border border-red-300 bg-red-50 focus:border-red-400"
                  : "border border-[#eedfd2] bg-[#fff8f2] focus:border-[#f5a97f]"
              }`}
            />
          </div>
          {fieldErrors.dateTo ? (
            <p id="analytics-date-to-error" className="mt-2 text-sm font-medium text-red-600">
              {fieldErrors.dateTo}
            </p>
          ) : null}
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleApply}
            className="w-full rounded-2xl bg-linear-to-r from-[#ffcba4] to-[#f5a97f] px-6 py-3 text-sm font-semibold text-[#0f0f0f] shadow-[0_24px_40px_-24px_rgba(245,169,127,0.95)] transition duration-200 hover:-translate-y-0.5"
          >
            Apply Filters
          </button>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleClear}
            className="w-full rounded-2xl border border-[#eed7c7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-[#fff8f2]"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {formError ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}
    </section>
  );
}

function InsightPulseCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[28px] border border-[#f0dfd1] bg-white/92 p-5 shadow-[0_24px_55px_-42px_rgba(45,28,11,0.38)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c96c2c]">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

function TopProjectsPanel({ projects, insight }: { projects: AnalyticsProject[]; insight: string }) {
  return (
    <ChartCard title="Top Performing Projects" subtitle="What is resonating?" bodyClassName="space-y-4">
      {projects.length === 0 ? (
        <div className="flex min-h-45 items-center justify-center rounded-[20px] border border-dashed border-[#e5d3c6] bg-white/80 text-sm text-slate-500">
          No projects match the current filters.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {projects.map((project, index) => (
            <article key={project.id} className="rounded-3xl border border-[#efdfd2] bg-white/95 p-5 shadow-[0_20px_45px_-34px_rgba(45,28,11,0.28)]">
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
                <div className="rounded-2xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Heart className="h-4 w-4 text-[#e26d5c]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Likes</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{project.likes}</p>
                </div>
                <div className="rounded-2xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Eye className="h-4 w-4 text-[#4f8df6]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Views</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{project.views}</p>
                </div>
                <div className="rounded-2xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MessageSquare className="h-4 w-4 text-[#10b981]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Responses</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{project.responses}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <InsightNote>{insight}</InsightNote>
    </ChartCard>
  );
}

function ProjectsList({
  projects,
  dateFrom,
  dateTo,
  threadsByProject,
}: {
  projects: AnalyticsProject[];
  dateFrom: string;
  dateTo: string;
  threadsByProject: Record<string, ThreadNote[]>;
}) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: "createdDate",
    direction: "desc",
  });
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  const sortedProjects = React.useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      let aVal: string | number = a[sortConfig.key] as string | number;
      let bVal: string | number = b[sortConfig.key] as string | number;

      if (sortConfig.key === "createdDate") {
        aVal = new Date(String(aVal)).getTime();
        bVal = new Date(String(bVal)).getTime();
      } else if (sortConfig.key === "contributions") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [projects, sortConfig]);

  const activeProjectId = React.useMemo(() => {
    if (sortedProjects.length === 0) {
      return null;
    }

    if (selectedProjectId && sortedProjects.some((project) => project.id === selectedProjectId)) {
      return selectedProjectId;
    }

    return sortedProjects[0]?.id ?? null;
  }, [selectedProjectId, sortedProjects]);

  const selectedProject = React.useMemo(() => {
    return sortedProjects.find((project) => project.id === activeProjectId) ?? null;
  }, [activeProjectId, sortedProjects]);

  const selectedProjectThreads = React.useMemo(
    () => getProjectThreads(selectedProject?.id ?? null, threadsByProject),
    [selectedProject?.id, threadsByProject]
  );

  function handleSort(key: keyof AnalyticsProject) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  return (
    <section id="analytics-projects-list" className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Projects in Period</h2>
            {dateFrom && dateTo ? (
              <p className="mt-1 text-xs text-slate-500">
                {new Date(dateFrom).toLocaleDateString()} to {new Date(dateTo).toLocaleDateString()}
              </p>
            ) : null}
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="px-4 py-8 text-center text-slate-500 sm:px-6">No projects found in this period</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th
                  onClick={() => handleSort("title")}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100 sm:px-6"
                >
                  <div className="flex items-center gap-2">
                    Title
                    {renderSortIcon(sortConfig, "title")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("category")}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100 sm:px-6"
                >
                  <div className="flex items-center gap-2">
                    Category
                    {renderSortIcon(sortConfig, "category")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdDate")}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100 sm:px-6"
                >
                  <div className="flex items-center gap-2">
                    Created Date
                    {renderSortIcon(sortConfig, "createdDate")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("contributions")}
                  className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100 sm:px-6"
                >
                  <div className="flex items-center justify-end gap-2">
                    Contributions
                    {renderSortIcon(sortConfig, "contributions")}
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
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedProjectId(project.id);
                    }
                  }}
                  className={`cursor-pointer transition-colors ${activeProjectId === project.id ? "bg-amber-50/70" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 sm:px-6">{project.title}</td>
                  <td className="px-4 py-3 text-sm sm:px-6">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 sm:px-6">{normalizeDate(project.createdDate)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 sm:px-6">{project.contributions}</td>
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
                  {selectedProject.category || "General"}
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
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedProject.contributions}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Responses</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedProject.responses}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Heart className="h-4 w-4 text-[#e26d5c]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Likes</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{selectedProject.likes}</p>
                </div>
                <div className="rounded-xl border border-[#f0e2d5] bg-[#fffdfa] px-3 py-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Eye className="h-4 w-4 text-[#4f8df6]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Views</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{selectedProject.views}</p>
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
                  {selectedProject.description || "Detailed summary is not available for this project yet."}
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
                {selectedProjectThreads.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    No thread updates yet for this project.
                  </div>
                ) : (
                  selectedProjectThreads.map((thread) => (
                    <div key={thread.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              thread.role === "Mentor"
                                ? "bg-emerald-100 text-emerald-700"
                                : thread.role === "Post Owner"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-indigo-100 text-indigo-700"
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
                  ))
                )}
              </div>
            </article>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AnalyticsSection({
  projects,
  requests,
  dateFrom,
  dateTo,
  threadsByProject,
  topicSignals,
}: {
  projects: AnalyticsProject[];
  requests: AnalyticsRequest[];
  dateFrom: string;
  dateTo: string;
  threadsByProject: Record<string, ThreadNote[]>;
  topicSignals: TopicSignal[];
}) {
  const popularityColor = "#F5A97F";
  const answeredColor = "#10B981";
  const unansweredColor = "#FECACA";
  const uploadColor = "#1D4ED8";
  const requestColor = "#F59E0B";
  const contributionPalette = ["#F5A97F", "#1D4ED8", "#10B981"];

  const categories = React.useMemo(() => {
    return Array.from(new Set([...projects, ...requests].map((item) => item?.category).filter(Boolean)));
  }, [projects, requests]);

  const categoryPopularity = React.useMemo(() => {
    return categories
      .map((category) => ({
        category,
        projects: projects.filter((project) => project.category === category).length,
      }))
      .filter((item) => item.projects > 0)
      .sort((left, right) => right.projects - left.projects);
  }, [categories, projects]);

  const requestResponseData = React.useMemo(() => {
    return categories
      .map((category) => {
        const categoryRequests = requests.filter((request) => request.category === category);
        const answered = categoryRequests.filter((request) => isAnsweredRequest(request.status)).length;

        return {
          category,
          answered,
          unanswered: Math.max(categoryRequests.length - answered, 0),
          totalRequests: categoryRequests.length,
        };
      })
      .filter((item) => item.totalRequests > 0);
  }, [categories, requests]);

  const monthlyTrend = React.useMemo(() => buildMonthlyTrend(projects, requests), [projects, requests]);

  const answeredRequests = React.useMemo(
    () => requests.filter((request) => isAnsweredRequest(request.status)).length,
    [requests]
  );

  const userContribution = React.useMemo(() => {
    return [
      { name: "Uploads", value: projects.length },
      { name: "Requests", value: requests.length },
      { name: "Responses", value: answeredRequests },
    ].filter((item) => item.value > 0);
  }, [projects.length, requests.length, answeredRequests]);

  const topProjects = React.useMemo(() => {
    return [...projects].sort((left, right) => scoreProject(right) - scoreProject(left)).slice(0, 3);
  }, [projects]);

  const totalRequests = requests.length;
  const responseRate = totalRequests === 0 ? 0 : Math.round((answeredRequests / totalRequests) * 100);
  const mostPopularCategory = categoryPopularity[0];
  const peakMonth = monthlyTrend.reduce<{ label: string; total: number } | null>((highest, item) => {
    if (!highest || item.total > highest.total) {
      return item;
    }
    return highest;
  }, null);
  const topContribution = userContribution.reduce<{ name: string; value: number } | null>((highest, item) => {
    if (!highest || item.value > highest.value) {
      return item;
    }
    return highest;
  }, null);
  const leadingTopic = topicSignals[0] ?? null;
  const risingTopic = topicSignals[1] ?? topicSignals[0] ?? null;
  const supportGap = React.useMemo(() => {
    return requestResponseData
      .map((item) => ({
        category: item.category,
        unanswered: item.unanswered,
        responseRate: item.totalRequests === 0 ? 0 : Math.round((item.answered / item.totalRequests) * 100),
      }))
      .sort((left, right) => right.unanswered - left.unanswered || left.responseRate - right.responseRate)[0] ?? null;
  }, [requestResponseData]);
  const totalContributions = userContribution.reduce((sum, item) => sum + item.value, 0);
  const topProject = topProjects[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <InsightPulseCard
          eyebrow="Hybrid Trend Signal"
          title={leadingTopic?.topic ?? "Awaiting topic data"}
          description={
            leadingTopic
              ? `${leadingTopic.mentions} weighted signals across ${leadingTopic.categories.join(", ")}. Strongest pull is coming from ${leadingTopic.projects.slice(0, 2).join(" and ")}.`
              : "Trending topics will appear once the dashboard sees project and request activity."
          }
        />
        <InsightPulseCard
          eyebrow="Rising Theme"
          title={risingTopic?.topic ?? "No rising theme yet"}
          description={
            risingTopic
              ? `${risingTopic.projects.slice(0, 2).join(" and ")} are helping this theme gain momentum in the current view.`
              : "Add more recent uploads or request activity to surface a rising theme."
          }
        />
        <InsightPulseCard
          eyebrow="Support Gap"
          title={supportGap ? supportGap.category : "No request gap detected"}
          description={
            supportGap
              ? `${supportGap.unanswered} requests are still waiting here, with a ${supportGap.responseRate}% response rate. This is the clearest area to prioritize next.`
              : "Once request data exists, the dashboard will highlight the category that needs the fastest response."
          }
        />
      </div>

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
                    <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip content={<BaseTooltip valueSuffix=" projects" />} cursor={{ fill: "rgba(245, 169, 127, 0.12)" }} />
                    <Bar dataKey="projects" name="Projects" radius={[12, 12, 0, 0]} fill={popularityColor} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <InsightNote>
                {mostPopularCategory
                  ? `Most active category is ${mostPopularCategory.category} with ${mostPopularCategory.projects} projects. Leading topic signal: ${leadingTopic?.topic ?? mostPopularCategory.category}.`
                  : "Projects will start surfacing here once you upload work."}
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
                    <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
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
                  : "Request health will appear here once collaboration requests are made."}
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
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip content={<BaseTooltip valueSuffix=" actions" />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="uploads" name="Uploads" stroke={uploadColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="requests" name="Requests" stroke={requestColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <InsightNote>
                {peakMonth
                  ? `Peak activity was in ${peakMonth.label}, with ${peakMonth.total} uploads and requests combined. Rising theme: ${risingTopic?.topic ?? "current project discussions"}.`
                  : "Your trend line will appear here as you start sharing work."}
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
                      <span className={`h-3 w-3 rounded-full ${CONTRIBUTION_DOT_CLASSES[index % CONTRIBUTION_DOT_CLASSES.length]}`} />
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
                  : "Your contribution mix will appear here as you interact with the platform."}
              </InsightNote>
            </>
          )}
        </ChartCard>

        <div className="xl:col-span-2">
          <TopProjectsPanel
            projects={topProjects}
            insight={
              topProject
                ? `${topProject.title} is leading right now with ${topProject.views} views and ${topProject.likes} likes. It is reinforcing the ${leadingTopic?.topic ?? topProject.category} trend.`
                : "High-performing projects will surface here once engagement data is available."
            }
          />
        </div>
      </div>

      <ProjectsList projects={projects} dateFrom={dateFrom} dateTo={dateTo} threadsByProject={threadsByProject} />
    </div>
  );
}

export function UnifiedAnalyticsDashboard() {
  const [filters, setFilters] = React.useState<Filters>({ category: "All", dateFrom: "", dateTo: "" });
  const [analyticsData, setAnalyticsData] = React.useState<Required<AnalyticsApiPayload>>({
    projects: [],
    requests: [],
    threadsByProject: {},
    topicSignals: [],
    dataSource: "live",
    dataSourceMessage: "",
  });
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadAnalytics = React.useCallback(async () => {
    setIsLoadingData(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/analytics/overview", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as AnalyticsApiPayload | null;

      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to load analytics data."));
      }

      setAnalyticsData({
        projects: safeArray(payload?.projects),
        requests: safeArray(payload?.requests),
        threadsByProject:
          payload?.threadsByProject && typeof payload.threadsByProject === "object"
            ? payload.threadsByProject
            : {},
        topicSignals: safeArray(payload?.topicSignals),
        dataSource: payload?.dataSource === "hybrid" ? "hybrid" : "live",
        dataSourceMessage: typeof payload?.dataSourceMessage === "string" ? payload.dataSourceMessage : "",
      });
    } catch {
      setLoadError("Failed to load analytics data.");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const projects = React.useMemo(() => safeArray(analyticsData.projects), [analyticsData.projects]);
  const requests = React.useMemo(() => safeArray(analyticsData.requests), [analyticsData.requests]);
  const threadsByProject = React.useMemo(
    () => analyticsData.threadsByProject ?? {},
    [analyticsData.threadsByProject]
  );
  const topicSignals = React.useMemo(() => safeArray(analyticsData.topicSignals), [analyticsData.topicSignals]);
  const dataSource = analyticsData.dataSource === "hybrid" ? "hybrid" : "live";
  const dataSourceMessage = analyticsData.dataSourceMessage;

  const filteredProjects = React.useMemo(() => {
    return filterByCategoryAndRange(projects, filters.category, filters.dateFrom, filters.dateTo, "createdDate");
  }, [projects, filters]);

  const filteredRequests = React.useMemo(() => {
    return filterByCategoryAndRange(requests, filters.category, filters.dateFrom, filters.dateTo, "requestedAt");
  }, [requests, filters]);

  const categories = React.useMemo(() => {
    return Array.from(new Set(projects.map((project) => project.category).filter(Boolean)));
  }, [projects]);

  const totalProjects = filteredProjects.length;
  const openRequests = filteredRequests.filter((item) => !isResolvedRequest(item.status)).length;
  const resolvedRequests = filteredRequests.filter((item) => isResolvedRequest(item.status)).length;
  const totalContributions = sumField(filteredProjects, "contributions");
  const noData = !isLoadingData && totalProjects === 0 && filteredRequests.length === 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="relative overflow-hidden rounded-[34px] bg-[#110f0c] px-7 py-8 text-[#fecdac] shadow-[0_30px_90px_-42px_rgba(17,15,12,0.92)] sm:px-9">
        <div className="absolute inset-y-0 right-0 w-[34%] bg-[radial-gradient(circle_at_center,rgba(245,169,127,0.24),transparent_46%)]" />
        <div className="absolute -bottom-12 right-[22%] h-40 w-40 rounded-full bg-[rgba(214,84,122,0.28)] blur-3xl" />
        <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/5 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 text-base font-semibold text-[#fecdac]">
            <Sparkles className="h-5 w-5" />
            <span>Analytics Component</span>
          </div>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#fecdac] sm:text-5xl">Member 4 + New Update Dashboard</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#fecdac]/72">
            This view merges the updated analytics design with the member 4 detailed project card and project thread panel.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => document.getElementById("analytics-projects-list")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-3 rounded-2xl border border-[#fecdac]/15 bg-[#fecdac]/10 px-6 py-4 text-lg font-semibold text-[#fecdac] shadow-[0_18px_40px_-26px_rgba(0,0,0,0.75)] transition hover:bg-[#fecdac]/14"
            >
              <ArrowUpRight className="h-5 w-5" />
              View Project Details
            </button>
            <div className="rounded-2xl border border-[#fecdac]/12 bg-[#fecdac]/6 px-5 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#fecdac]/55">Total contributions</p>
              <p className="mt-1 text-2xl font-bold text-[#fecdac]">{totalContributions}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          icon={<FolderOpen className="h-6 w-6" />}
          description="Projects in the current view"
          cardClassName="bg-white/94"
          iconClassName="bg-[#0f0f0f]"
          valueClassName="text-slate-950"
        />
        <StatCard
          label="Open Requests"
          value={openRequests}
          icon={<Zap className="h-6 w-6" />}
          description="Requests still waiting for a response"
          cardClassName="bg-[#fff9ec]"
          iconClassName="bg-linear-to-r from-[#f7b955] to-[#f59e0b]"
          valueClassName="text-[#c45c00]"
        />
        <StatCard
          label="Resolved Requests"
          value={resolvedRequests}
          icon={<CheckCircle2 className="h-6 w-6" />}
          description="Requests that already have an answer"
          cardClassName="bg-[#ebfbf6]"
          iconClassName="bg-linear-to-r from-[#34d399] to-[#10b981]"
          valueClassName="text-[#05856b]"
        />
      </div>

      <div className="mt-6">
        <FilterBar
          key={`${filters.category}-${filters.dateFrom}-${filters.dateTo}`}
          category={filters.category}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          categories={categories}
          onApply={(nextFilters) => setFilters(nextFilters)}
        />
      </div>

      <div className="mt-6">
        {dataSourceMessage ? (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              dataSource === "live"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {dataSourceMessage}
          </div>
        ) : null}

        {loadError ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => void loadAnalytics()}
                className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {isLoadingData ? (
          <div className="mb-4 rounded-[28px] border border-[#dfc7b8] bg-white/88 p-8 text-center text-slate-500 shadow-[0_24px_70px_-48px_rgba(45,28,11,0.4)]">
            Loading analytics data...
          </div>
        ) : null}

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
            threadsByProject={threadsByProject}
            topicSignals={topicSignals}
          />
        )}
      </div>
    </section>
  );
}
