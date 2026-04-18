'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function SignUpPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const lng = params.lng || 'en';
  const isAr = lng === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'email_taken') {
          setError(t('auth.error_email_taken'));
        } else if (data.error === 'weak_password') {
          setError(t('auth.error_weak_password'));
        } else {
          setError(t('auth.error_generic'));
        }
        return;
      }

      const sign = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (sign?.error) {
        setError(t('auth.error_generic'));
      } else {
        router.push(`/${lng}`);
        router.refresh();
      }
    } catch {
      setError(t('auth.error_generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="container mx-auto px-4 pt-28 pb-20 max-w-md"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <p className="text-sm text-[var(--text-muted)] mb-6">{t('auth.guest_ok')}</p>
      <h1 className="text-3xl font-black mb-8 text-[var(--text-main)]">
        {t('auth.sign_up_title')}
      </h1>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">
            {t('auth.name')}
          </label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[#0076f7]"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">
            {t('auth.email')}
          </label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[#0076f7]"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">
            {t('auth.password')}
          </label>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[#0076f7]"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('auth.password_hint')}</p>
        </div>
        {error ? (
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0076f7] to-[#00c6ff] text-white font-bold shadow-lg shadow-blue-500/25 disabled:opacity-60"
        >
          {loading ? '…' : t('auth.submit_sign_up')}
        </button>
      </form>
      <p className="mt-8 text-[var(--text-muted)]">
        {t('auth.already_have_account')}{' '}
        <Link
          href={`/${lng}/sign-in`}
          className="text-[#0076f7] font-bold no-underline hover:underline"
        >
          {t('navbar.sign_in')}
        </Link>
      </p>
    </div>
  );
}
