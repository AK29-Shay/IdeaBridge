import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Filter, Search, Shapes } from 'lucide-react';

function FilterBar({ category, dateFrom, dateTo, categories, onApply }) {
  const defaultFilters = {
    category: 'All',
    dateFrom: '',
    dateTo: ''
  };
  const defaultErrors = {
    dateFrom: '',
    dateTo: '',
    form: ''
  };
  const [draftFilters, setDraftFilters] = useState({
    category,
    dateFrom,
    dateTo
  });
  const [validationErrors, setValidationErrors] = useState(defaultErrors);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    setDraftFilters({ category, dateFrom, dateTo });
    setValidationErrors(defaultErrors);
    setHasAttemptedSubmit(false);
  }, [category, dateFrom, dateTo]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (draftFilters.category && draftFilters.category !== 'All') {
      count += 1;
    }

    if (draftFilters.dateFrom || draftFilters.dateTo) {
      count += 1;
    }

    return count;
  }, [draftFilters.category, draftFilters.dateFrom, draftFilters.dateTo]);

  const validateFilters = (values) => {
    const nextErrors = { ...defaultErrors };
    const hasFromDate = Boolean(values.dateFrom);
    const hasToDate = Boolean(values.dateTo);

    if (!hasFromDate && !hasToDate) {
      nextErrors.dateFrom = 'Select From Date';
      nextErrors.dateTo = 'Select To Date';
    } else if (hasFromDate && !hasToDate) {
      nextErrors.dateTo = 'Select To Date';
      nextErrors.form = 'Both From Date and To Date are required';
    } else if (!hasFromDate && hasToDate) {
      nextErrors.dateFrom = 'Select From Date';
      nextErrors.form = 'Both From Date and To Date are required';
    } else if (hasFromDate && hasToDate && new Date(values.dateFrom) > new Date(values.dateTo)) {
      nextErrors.dateFrom = 'From Date must be earlier than To Date';
      nextErrors.dateTo = 'To Date must be later than From Date';
      nextErrors.form = 'Wrong date range';
    }

    return nextErrors;
  };

  const hasValidationErrors = (errors) => Object.values(errors).some(Boolean);

  const handleFieldChange = (name, value) => {
    const nextFilters = {
      ...draftFilters,
      [name]: value
    };

    setDraftFilters(nextFilters);

    if (hasAttemptedSubmit) {
      setValidationErrors(validateFilters(nextFilters));
    } else {
      setValidationErrors(defaultErrors);
    }
  };

  const handleApply = () => {
    const nextErrors = validateFilters(draftFilters);
    setHasAttemptedSubmit(true);
    setValidationErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setValidationErrors(defaultErrors);
    onApply(draftFilters);
  };

  const handleClear = () => {
    setDraftFilters(defaultFilters);
    setValidationErrors(defaultErrors);
    setHasAttemptedSubmit(false);
    onApply(defaultFilters);
  };

  return (
    <section className="rounded-[30px] border border-[#f0dfd1] bg-white/92 p-6 shadow-[0_30px_65px_-46px_rgba(45,28,11,0.42)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4eb] text-goldSecondary">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Find insights faster</h2>
              <p className="mt-1 text-sm text-slate-500">Filter projects by category and date range without breaking the new dashboard look.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#f2e4d8] bg-[#fff8f2] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Shapes className="h-4 w-4 text-goldSecondary" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Category</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {draftFilters.category === 'All' ? 'All categories' : draftFilters.category}
            </p>
          </div>
          <div className="rounded-2xl border border-[#dbf2ea] bg-[#edfcf8] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Filter className="h-4 w-4 text-emeraldStart" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Active Filters</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">{activeFilterCount} applied</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr_1fr_auto_auto]">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Category</label>
          <select
            value={draftFilters.category}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            className="w-full rounded-2xl border border-[#eedfd2] bg-[#fff8f2] px-4 py-3 text-sm font-medium text-slate-900 transition-colors focus:border-goldSecondary focus:bg-white focus:outline-none"
          >
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">From Date</label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-goldSecondary" />
            <input
              type="date"
              value={draftFilters.dateFrom}
              onChange={(e) => handleFieldChange('dateFrom', e.target.value)}
              max={draftFilters.dateTo || undefined}
              className={`w-full rounded-2xl border bg-[#fff8f2] py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-colors focus:bg-white focus:outline-none ${
                validationErrors.dateFrom ? 'border-red-300 focus:border-red-500' : 'border-[#eedfd2] focus:border-goldSecondary'
              }`}
            />
          </div>
          {validationErrors.dateFrom ? <p className="mt-2 text-xs font-medium text-red-600">{validationErrors.dateFrom}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">To Date</label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-goldSecondary" />
            <input
              type="date"
              value={draftFilters.dateTo}
              onChange={(e) => handleFieldChange('dateTo', e.target.value)}
              min={draftFilters.dateFrom || undefined}
              className={`w-full rounded-2xl border bg-[#fff8f2] py-3 pl-11 pr-4 text-sm font-medium text-slate-900 transition-colors focus:bg-white focus:outline-none ${
                validationErrors.dateTo ? 'border-red-300 focus:border-red-500' : 'border-[#eedfd2] focus:border-goldSecondary'
              }`}
            />
          </div>
          {validationErrors.dateTo ? <p className="mt-2 text-xs font-medium text-red-600">{validationErrors.dateTo}</p> : null}
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleApply}
            className="w-full rounded-2xl bg-gold-gradient px-6 py-3 text-sm font-semibold text-darkPrimary shadow-[0_24px_40px_-24px_rgba(245,169,127,0.95)] transition duration-200 hover:-translate-y-0.5"
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

      {validationErrors.form ? <p className="mt-4 text-sm font-medium text-red-600">{validationErrors.form}</p> : null}
    </section>
  );
}

export default FilterBar;
