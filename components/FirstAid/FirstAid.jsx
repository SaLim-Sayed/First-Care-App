'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { FirstAidChatInput } from '@/components/FirstAid/FirstAidChatInput';
import { FirstAidHeader } from '@/components/FirstAid/FirstAidHeader';
import { FirstAidMessageList } from '@/components/FirstAid/FirstAidMessageList';
import { useFirstAidAssistant } from '@/components/FirstAid/useFirstAidAssistant';
import { useFirstAidConversation } from '@/components/FirstAid/useFirstAidConversation';

export default function FirstAid() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const chatEndRef = useRef(null);

  const { messages, setMessages, historyLoading } = useFirstAidConversation({ t });
  const { value, setValue, isLoading, sendMessage } = useFirstAidAssistant({
    isAr,
    t,
    setMessages,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* When user taps a suggestion chip, pre-fill and auto-send */
  const handleSuggest = useCallback(
    (text) => {
      setValue(text);
      // Tiny delay so setValue settles before send reads it
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'user', text }]);
      }, 0);
    },
    [setValue, setMessages],
  );

  return (
    <div
      className="first-aid-page"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="first-aid-card">
        <FirstAidHeader
          title={t('firstaid.bot_role')}
          statusLabel={t('firstaid.status_online')}
        />

        <FirstAidMessageList
          messages={messages}
          isLoading={isLoading}
          historyLoading={historyLoading}
          loadingLabel={t('firstaid.loading_history')}
          chatEndRef={chatEndRef}
          onSuggest={handleSuggest}
          isAr={isAr}
        />

        <FirstAidChatInput
          value={value}
          onChange={setValue}
          onSend={sendMessage}
          isLoading={isLoading}
          historyLoading={historyLoading}
          placeholder={isAr ? 'اكتب رسالتك...' : 'Type your message…'}
          isAr={isAr}
        />
      </div>
    </div>
  );
}
