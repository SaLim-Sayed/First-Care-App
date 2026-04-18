'use client';

import { IoSend } from 'react-icons/io5';

export function FirstAidChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  historyLoading,
  placeholder,
  isAr,
}) {
  return (
    <div className="px-4 bg-[var(--card-bg)] border-t border-[var(--border-color)] transition-all">
      <div className="flex items-center gap-3 w-full" dir={isAr ? 'rtl' : 'ltr'}>
        <input
          type="text"
          placeholder={placeholder}
          className="flex-grow p-4 bg-transparent text-lg text-[var(--text-main)] outline-none focus:ring-0 placeholder-[var(--text-muted)] font-medium"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          disabled={historyLoading}
        />
        <button
          type="button"
          className={`w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-[#0091ff] to-[#00c6ff] text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center justify-center p-0 ${
            isLoading || !value.trim() || historyLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={onSend}
          disabled={isLoading || !value.trim() || historyLoading}
        >
          <IoSend size={20} className={isAr ? 'rotate-180 mr-1' : 'ml-1'} />
        </button>
      </div>
      <div className="flex items-center justify-center gap-1 mt-4 opacity-50 text-[9px] font-black tracking-widest text-[var(--text-muted)] uppercase">
        <span>Powered By</span>
        <span className="text-[#0091ff]">First Care</span>
      </div>
    </div>
  );
}
