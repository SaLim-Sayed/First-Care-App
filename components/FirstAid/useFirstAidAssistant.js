'use client';

import { useCallback, useState } from 'react';

import { fetchGeminiFirstAid, fetchRailwayFirstAid } from '@/lib/firstAid/assistant';
import { matchSmallTalk } from '@/lib/firstAid/greetings';

export function useFirstAidAssistant({ isAr, t, setMessages }) {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!value.trim()) return;

    const userText = value.trim();
    const lowerText = userText.toLowerCase();
    setValue('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const smallTalk = matchSmallTalk(lowerText, isAr);
    if (smallTalk) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', text: smallTalk.reply }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const instruction = await fetchRailwayFirstAid(userText, isAr);
      setMessages((prev) => [...prev, { role: 'assistant', text: instruction }]);
    } catch (err) {
      console.log('Local model failed, falling back to Gemini...', err?.message || err);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: isAr
                ? 'عذراً، الخادم المحلي لا يستجيب ولم يتم تعيين مفتاح Gemini.'
                : 'Sorry, the assistant is unavailable and no Gemini API key is configured.',
            },
          ]);
          return;
        }
        const text = await fetchGeminiFirstAid(userText, isAr);
        setMessages((prev) => [...prev, { role: 'assistant', text }]);
      } catch (inner) {
        console.error('Gemini fallback failed:', inner);
        setMessages((prev) => [...prev, { role: 'assistant', text: t('firstaid.error') }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAr, setMessages, t, value]);

  return { value, setValue, isLoading, sendMessage };
}
