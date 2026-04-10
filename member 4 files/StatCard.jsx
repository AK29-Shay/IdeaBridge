import React from 'react';

function StatCard({
  label,
  value,
  icon,
  description,
  cardClassName = '',
  iconClassName = '',
  valueClassName = ''
}) {
  return (
    <article
      className={`rounded-[28px] border border-[#f3dfcf] p-6 shadow-[0_24px_55px_-42px_rgba(45,28,11,0.42)] transition duration-300 hover:-translate-y-0.5 ${cardClassName}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-[3rem] font-bold leading-none tracking-tight ${valueClassName}`}>{value ?? 0}</p>
          <p className="mt-4 text-lg font-semibold text-slate-600">{label}</p>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_20px_35px_-20px_rgba(15,15,15,0.55)] ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

export default StatCard;
