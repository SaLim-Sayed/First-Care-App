'use client';

import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, footerCloseLabel }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const closeLabel =
    footerCloseLabel ??
    (title === 'نتائج الفحص الذكي' || title === 'Smart Diagnosis Results'
      ? title === 'نتائج الفحص الذكي'
        ? 'إغلاق'
        : 'Close'
      : 'Close');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative bg-[var(--card-bg)] w-full max-w-2xl rounded-3xl shadow-2xl border border-[var(--border-color)] overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--card-bg)] sticky top-0 z-10">
          <h3 className="text-xl font-bold text-[var(--text-main)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar grow">{children}</div>

        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end bg-[var(--card-bg)] sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 bg-[#0076f7] hover:bg-[#0060cc] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
