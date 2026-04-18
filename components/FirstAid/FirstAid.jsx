'use client';

import { useEffect, useRef } from 'react';
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

  return (
    <div
      className="flex flex-col min-h-screen bg-[var(--bg-color)]   pt-20 transition-colors duration-300"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex-grow flex flex-col max-w-2xl mx-auto w-full bg-[var(--card-bg)] shadow-2xl relative overflow-hidden sm:rounded-b-[2.5rem] border-x border-b border-[var(--border-color)]">
        <FirstAidHeader title={t('firstaid.bot_role')} statusLabel={t('firstaid.status_online')} />

        <FirstAidMessageList
          messages={messages}
          isLoading={isLoading}
          historyLoading={historyLoading}
          loadingLabel={t('firstaid.loading_history')}
          chatEndRef={chatEndRef}
        />

        <FirstAidChatInput
          value={value}
          onChange={setValue}
          onSend={sendMessage}
          isLoading={isLoading}
          historyLoading={historyLoading}
          placeholder={isAr ? 'اكتب رسالتك...' : 'Enter your message...'}
          isAr={isAr}
        />
      </div>
    </div>
  );
}
