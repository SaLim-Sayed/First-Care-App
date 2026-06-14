'use client';

import { MdHealthAndSafety, MdOutlineShield } from 'react-icons/md';

export function FirstAidHeader({ title, statusLabel }) {
  return (
    <div className="first-aid-header relative overflow-hidden px-5 pt-6 pb-10">
      {/* Animated background gradient */}
      <div className="first-aid-header-bg" aria-hidden />

      {/* Decorative orbs */}
      <div className="orb orb-1" aria-hidden />
      <div className="orb orb-2" aria-hidden />
      <div className="orb orb-3" aria-hidden />

      {/* Grid pattern overlay */}
      <div className="first-aid-grid" aria-hidden />

      {/* Content */}
      <div className="relative flex items-center gap-4 z-10">
        {/* Glassmorphism avatar */}
        <div className="first-aid-avatar" aria-hidden>
          <div className="avatar-ring" />
          <MdHealthAndSafety className="text-3xl sm:text-4xl text-white relative z-10 drop-shadow-lg" />
        </div>

        {/* Title + status */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-white text-lg sm:text-xl font-black tracking-tight leading-tight truncate drop-shadow">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="status-dot-wrapper" aria-hidden>
              <span className="status-dot-inner" />
            </span>
            <span className="text-white/90 text-xs sm:text-sm font-semibold tracking-wide">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* AI badge */}
        <div className="ai-badge hidden sm:flex" aria-hidden>
          <MdOutlineShield className="text-sm" />
          <span>AI Powered</span>
        </div>
      </div>

      {/* Smooth wave bottom */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="block w-full" style={{ height: '28px', fill: 'var(--bg-color)', transition: 'fill 0.3s ease' }}>
          <path d="M0,40 C240,56 480,24 720,36 C960,48 1200,20 1440,40 L1440,56 L0,56 Z" />
        </svg>
      </div>
    </div>
  );
}
