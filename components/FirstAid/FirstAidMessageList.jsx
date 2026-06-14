'use client';

import { MdHealthAndSafety } from 'react-icons/md';

/* ─── Suggestion chips shown when no messages yet ─────────── */
const QUICK_SUGGESTIONS = [
  { en: '🤕 Headache relief', ar: '🤕 علاج الصداع' },
  { en: '🩹 Treat a cut', ar: '🩹 علاج جرح' },
  { en: '🔥 Burn first aid', ar: '🔥 إسعاف الحروق' },
  { en: '😵 Fainting', ar: '😵 الإغماء' },
  { en: '🦴 Sprain / fracture', ar: '🦴 التواء أو كسر' },
  { en: '🫀 Chest pain', ar: '🫀 ألم في الصدر' },
];

/* ─── Bot avatar ──────────────────────────────────────────── */
function BotAvatar() {
  return (
    <div className="bot-avatar-sm shrink-0 mt-1" aria-hidden>
      <MdHealthAndSafety className="text-white text-sm" />
    </div>
  );
}

/* ─── Typing dots indicator ───────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="msg-row msg-row--bot chat-enter">
      <BotAvatar />
      <div className="bubble bubble--bot typing-bubble">
        <span className="typing-dot" style={{ animationDelay: '0s' }} />
        <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
        <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

/* ─── Single message bubble ───────────────────────────────── */
function MessageBubble({ msg, isLast }) {
  const isUser = msg.role === 'user';
  const timeStr = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`msg-row ${isUser ? 'msg-row--user' : 'msg-row--bot'} chat-enter`}>
      {!isUser && <BotAvatar />}
      <div className="msg-col">
        <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--bot'} ${isLast ? 'bubble--last' : ''}`}>
          <p className="bubble-text">{msg.text}</p>
        </div>
        {timeStr && (
          <span className={`msg-time ${isUser ? 'msg-time--user' : 'msg-time--bot'}`}>
            {timeStr}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Empty / welcome state ───────────────────────────────── */
function EmptyState({ onSuggest, isAr }) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap" aria-hidden>
        <MdHealthAndSafety className="empty-icon" />
        <div className="empty-ping" />
      </div>
      <h2 className="empty-title">
        {isAr ? 'كيف يمكنني مساعدتك؟' : 'How can I help you?'}
      </h2>
      <p className="empty-sub">
        {isAr
          ? 'اسألني عن الإسعافات الأولية أو اختر اقتراحًا:'
          : 'Ask me anything about first aid, or pick a suggestion:'}
      </p>
      <div className="suggestions-grid">
        {QUICK_SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip"
            onClick={() => onSuggest(isAr ? s.ar : s.en)}
            type="button"
          >
            {isAr ? s.ar : s.en}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Skeleton loading ────────────────────────────────────── */
function HistorySkeleton() {
  return (
    <div className="skeleton-wrap">
      {[
        { w: 65, side: 'bot' },
        { w: 45, side: 'user' },
        { w: 80, side: 'bot' },
        { w: 55, side: 'user' },
        { w: 70, side: 'bot' },
      ].map((item, i) => (
        <div key={i} className={`skeleton-row skeleton-row--${item.side}`}>
          {item.side === 'bot' && <div className="skeleton-avatar" />}
          <div
            className="skeleton-bar"
            style={{ width: `${item.w}%`, animationDelay: `${i * 0.12}s` }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Message list (exported) ─────────────────────────────── */
export function FirstAidMessageList({
  messages,
  isLoading,
  historyLoading,
  loadingLabel,
  chatEndRef,
  onSuggest,
  isAr,
}) {
  const isEmpty = !historyLoading && messages.length === 0;

  return (
    <div className="msg-list chat-scroll">
      {historyLoading ? (
        <HistorySkeleton />
      ) : isEmpty ? (
        <EmptyState onSuggest={onSuggest} isAr={isAr} />
      ) : (
        <>
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              msg={msg}
              isLast={index === messages.length - 1 && !isLoading}
            />
          ))}
          {isLoading && <TypingIndicator />}
        </>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
