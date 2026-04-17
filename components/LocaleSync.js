'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import i18n from '@/lib/i18n';

const SUPPORTED = new Set(['en', 'ar']);

function langPrefix(code) {
  if (!code || typeof code !== 'string') return '';
  return code.split('-')[0];
}

/** First path segment when it is a locale (works from root layout; `useParams().lng` may be empty there). */
function localeFromPathname(pathname) {
  const first = pathname?.split('/').filter(Boolean)[0];
  return first && SUPPORTED.has(first) ? first : null;
}

export function LocaleSync({ children }) {
  const pathname = usePathname();
  const lng = localeFromPathname(pathname);

  useEffect(() => {
    if (!lng) return;

    if (langPrefix(i18n.language) !== lng) {
      void i18n.changeLanguage(lng);
    }

    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  }, [lng]);

  return children;
}
