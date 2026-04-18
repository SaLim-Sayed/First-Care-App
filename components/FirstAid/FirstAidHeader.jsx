'use client';

import { MdHealthAndSafety } from 'react-icons/md';

export function FirstAidHeader({ title, statusLabel }) {
  return (
    <div className="bg-gradient-to-r from-[#0076f7] to-[#00c6ff] px-4 py-4 relative">
      <div className="flex items-center gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg ring-2 ring-white/30 backdrop-blur-sm"
          aria-hidden
        >
          <MdHealthAndSafety className="text-3xl" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-white text-xl font-black tracking-tight leading-none">{title}</h1>
          <div className="flex items-center gap-2 pt-1">
            <span
              className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)] animate-pulse"
              aria-hidden
            />
            <span className="text-white text-sm font-semibold">{statusLabel}</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
        <svg
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          className="relative block w-full h-4 fill-[var(--bg-color)] transition-all"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>
    </div>
  );
}
