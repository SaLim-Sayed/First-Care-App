'use client';

export function FirstAidMessageList({
  messages,
  isLoading,
  historyLoading,
  loadingLabel,
  chatEndRef,
}) {
  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--bg-color)] transition-all">
      {historyLoading ? (
        <p className="text-center text-sm text-[var(--text-muted)] py-8">{loadingLabel}</p>
      ) : (
        <>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-[17px] font-medium leading-relaxed shadow-sm
                                ${
                                  msg.role === 'user'
                                    ? 'bg-[#0091ff] text-white rounded-tr-none'
                                    : 'bg-[var(--card-bg)] text-[var(--text-main)] rounded-tl-none border border-[var(--border-color)]'
                                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[var(--card-bg)] p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center border border-[var(--border-color)] shadow-sm">
                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <div
                  className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          )}
        </>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
