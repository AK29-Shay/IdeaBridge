import React from 'react';

function InsightNote({ children }) {
  return (
    <div className="rounded-2xl border border-[#efe1d4] bg-white/95 px-4 py-3 text-sm text-slate-600 shadow-[0_18px_35px_-30px_rgba(45,28,11,0.28)]">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f5a97f]" />
        <p className="leading-6">{children}</p>
      </div>
    </div>
  );
}

export default InsightNote;
