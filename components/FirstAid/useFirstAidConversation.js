'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import { getOrCreateAnonymousId } from '@/lib/firstAid/session';
import { getFirstAidConversation, putFirstAidConversation } from '@/lib/firstAid/api';

/**
 * @param {{ t: (key: string) => string }} opts
 */
export function useFirstAidConversation({ t }) {
  const { status, data: session } = useSession();
  const [anonKey, setAnonKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const appliedSuccessKeyRef = useRef(null);

  useEffect(() => {
    setAnonKey(getOrCreateAnonymousId());
  }, []);

  const conversationKey =
    status === 'loading'
      ? null
      : status === 'authenticated' && session?.user?.id
        ? `user:${session.user.id}`
        : anonKey
          ? `anon:${anonKey}`
          : null;

  const {
    data: conversationPayload,
    isLoading: historyLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ['first-aid-conversation', conversationKey],
    queryFn: getFirstAidConversation,
    enabled: Boolean(conversationKey),
    retry: 1,
  });

  useEffect(() => {
    if (!conversationKey || !isSuccess || conversationPayload === undefined) return;
    if (appliedSuccessKeyRef.current === conversationKey) return;
    appliedSuccessKeyRef.current = conversationKey;

    if (Array.isArray(conversationPayload.messages) && conversationPayload.messages.length > 0) {
      setMessages(
        conversationPayload.messages.map((m) => ({
          role: m.role,
          text: m.text,
        })),
      );
    } else {
      setMessages([{ role: 'assistant', text: t('firstaid.welcome_message') }]);
    }
    setHydrated(true);
  }, [isSuccess, conversationPayload, conversationKey, t]);

  useEffect(() => {
    if (!conversationKey || !isError) return;
    if (appliedSuccessKeyRef.current === conversationKey) return;
    setMessages([{ role: 'assistant', text: t('firstaid.welcome_message') }]);
    setHydrated(true);
  }, [isError, conversationKey, t]);

  const { mutate } = useMutation({
    mutationFn: putFirstAidConversation,
  });

  useEffect(() => {
    if (!hydrated || historyLoading) return;
    const timer = setTimeout(() => {
      mutate(messages);
    }, 500);
    return () => clearTimeout(timer);
  }, [messages, hydrated, historyLoading, mutate]);

  return {
    messages,
    setMessages,
    historyLoading,
    hydrated,
  };
}
