'use client';

import { useRef, useEffect, useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { MdOutlineMedicalServices } from 'react-icons/md';

const MAX_CHARS = 500;

export function FirstAidChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  historyLoading,
  placeholder,
  isAr,
}) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const disabled = isLoading || historyLoading;
  const canSend = Boolean(value.trim()) && !disabled;
  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.8;
  const overLimit = charCount > MAX_CHARS;

  /* Auto-grow textarea */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }, [value]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend && !overLimit) onSend();
    }
  }

  return (
    <div className="chat-input-wrap" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Input pill */}
      <div className={`chat-input-pill ${focused ? 'chat-input-pill--focused' : ''}`}>
        {/* Medical icon */}
        <MdOutlineMedicalServices
          className="chat-input-icon shrink-0"
          aria-hidden
        />

        {/* Textarea */}
        <textarea
          ref={inputRef}
          rows={1}
          placeholder={placeholder}
          className="chat-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          aria-label={placeholder}
          maxLength={MAX_CHARS + 20}
        />

        {/* Char counter — only shown when near limit */}
        {nearLimit && (
          <span
            className="chat-char-counter"
            style={{ color: overLimit ? '#ef4444' : 'var(--text-muted)' }}
          >
            {MAX_CHARS - charCount}
          </span>
        )}

        {/* Send button */}
        <button
          type="button"
          id="first-aid-send-btn"
          aria-label="Send message"
          className={`send-btn ${canSend && !overLimit ? 'send-btn--active' : 'send-btn--idle'}`}
          onClick={() => canSend && !overLimit && onSend()}
          disabled={!canSend || overLimit}
        >
          {isLoading ? (
            <span className="send-spinner" aria-hidden />
          ) : (
            <IoSend
              size={17}
              style={{ transform: isAr ? 'rotate(180deg) translateX(-1px)' : 'translateX(1px)' }}
            />
          )}
        </button>
      </div>

      {/* Hint bar */}
      <div className="chat-hint">
        <span>{isAr ? 'Enter للإرسال · Shift+Enter لسطر جديد' : 'Enter to send · Shift+Enter for newline'}</span>
        <span className="chat-powered">
          Powered by <strong style={{ color: '#0076f7' }}>First Care</strong>
        </span>
      </div>
    </div>
  );
}
