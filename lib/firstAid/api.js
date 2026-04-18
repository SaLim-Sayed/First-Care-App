import { getOrCreateAnonymousId } from '@/lib/firstAid/session';

export async function getFirstAidConversation() {
  const anon = typeof window !== 'undefined' ? getOrCreateAnonymousId() : '';
  const headers = {};
  if (anon) headers['x-first-aid-session'] = anon;
  const res = await fetch('/api/first-aid/conversation', {
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('first_aid_fetch_failed');
  return res.json();
}

export async function putFirstAidConversation(messages) {
  const anon = typeof window !== 'undefined' ? getOrCreateAnonymousId() : '';
  const headers = { 'Content-Type': 'application/json' };
  if (anon) headers['x-first-aid-session'] = anon;
  const res = await fetch('/api/first-aid/conversation', {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
      anonymousId: anon || undefined,
    }),
  });
  if (!res.ok) throw new Error('first_aid_persist_failed');
}
