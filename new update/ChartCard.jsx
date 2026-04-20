import React from 'react';

function ChartCard({ title, subtitle, children, bodyClassName = '' }) {
  return (
    <section className="rounded-[30px] border border-[#f0dfd1] bg-white/90 p-5 shadow-[0_30px_65px_-46px_rgba(45,28,11,0.48)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {subtitle ? (
          <span className="rounded-full border border-[#f2dfd1] bg-[#fff8f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-goldSecondary">
            {subtitle}
          </span>
        ) : null}
      </div>
      <div
        className={`rounded-[24px] border border-[#f4e8dc] bg-[linear-gradient(180deg,#fffdfa_0%,#fff7f1_100%)] p-4 ${bodyClassName}`}
      >
        {children}
      </div>
    </section>
  );
}

export default ChartCard;
