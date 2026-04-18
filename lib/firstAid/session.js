export const FIRST_AID_ANON_STORAGE_KEY = 'fc_firstaid_session';

export function getOrCreateAnonymousId() {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(FIRST_AID_ANON_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(FIRST_AID_ANON_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}
