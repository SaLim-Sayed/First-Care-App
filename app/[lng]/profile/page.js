'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const lng = params.lng || 'en';
  const isAr = lng === 'ar';

  const { data: session, status, update } = useSession();

  const [name, setName] = useState('');
  const [emailReadonly, setEmailReadonly] = useState('');
  const [memberSince, setMemberSince] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${lng}/sign-in`);
      return;
    }
    if (status !== 'authenticated') return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data?.error || 'fail');
        setName(data.profile?.name ?? '');
        setEmailReadonly(data.profile?.email ?? session?.user?.email ?? '');
        setMemberSince(data.profile?.createdAt ?? null);
      } catch {
        if (!cancelled) {
          setName(session?.user?.name ?? '');
          setEmailReadonly(session?.user?.email ?? '');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, lng, router, session?.user?.email, session?.user?.name]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'fail');

      await update({
        user: {
          name: data.name ?? name,
          email: session?.user?.email,
        },
      });
      setMessage(t('profile.saved'));
    } catch {
      setError(t('auth.error_generic'));
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20 text-center text-[var(--text-muted)]">
        …
      </div>
    );
  }

  if (!session) return null;

  const formattedDate =
    memberSince &&
    new Date(memberSince).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div
      className="container mx-auto px-4 pt-28 pb-20 max-w-lg"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <h1 className="text-3xl font-black mb-2 text-[var(--text-main)]">
        {t('profile.title')}
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">{t('profile.subtitle')}</p>

      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">
              {t('auth.email')}
            </label>
            <input
              type="email"
              readOnly
              value={emailReadonly}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-muted)] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">
              {t('auth.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[#0076f7]"
            />
          </div>

          {formattedDate ? (
            <p className="text-sm text-[var(--text-muted)]">
              <span className="font-bold text-[var(--text-main)]">
                {t('profile.member_since')}
              </span>{' '}
              {formattedDate}
            </p>
          ) : null}

          {error ? (
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          {message ? (
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{message}</p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0076f7] to-[#00c6ff] text-white font-bold shadow-lg shadow-blue-500/25 disabled:opacity-60"
          >
            {saving ? '…' : t('profile.save')}
          </button>
        </form>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `/${lng}` })}
          className="mt-6 w-full py-3.5 rounded-2xl font-bold border border-[var(--border-color)] bg-transparent text-[var(--text-main)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {t('auth.sign_out')}
        </button>

        <p className="mt-8 text-center">
          <Link href={`/${lng}`} className="text-[#0076f7] font-bold text-sm no-underline hover:underline">
            {t('profile.back_home')}
          </Link>
        </p>
      </div>
    </div>
  );
}
