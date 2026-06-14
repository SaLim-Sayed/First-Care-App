'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

import { getOrCreateAnonymousId } from '@/lib/firstAid/session';

export default function HistoryPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const lng = params.lng || 'en';
  const isAr = lng === 'ar';

  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState('predictions');
  const [predictions, setPredictions] = useState([]);
  const [firstAidMessages, setFirstAidMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If we're fully loaded and unauthenticated, normally profile protects this.
    // But since history can be for anon users too, we allow it.
  }, [status, router, lng]);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const anonId = getOrCreateAnonymousId();
        const headers = { 'x-first-aid-session': anonId };

        const [predRes, faRes] = await Promise.all([
          axios.get('/api/prediction/history', { headers }),
          axios.get('/api/first-aid/conversation', { headers }),
        ]);

        if (predRes.data?.ok) {
          setPredictions(predRes.data.predictions || []);
        }
        if (faRes.data?.ok) {
          // Reverse messages to show newest first, or keep chronological
          setFirstAidMessages(faRes.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setIsLoading(false);
      }
    }

    // Wait until session is either loaded or unauthenticated
    if (status !== 'loading') {
      fetchHistory();
    }
  }, [status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20 text-center text-[var(--text-muted)]">
        …
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="container mx-auto px-4 pt-28 pb-20 max-w-2xl"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${lng}/profile`} className="text-[#0076f7] font-bold no-underline hover:underline">
          &larr; {isAr ? 'رجوع للملف الشخصي' : 'Back to Profile'}
        </Link>
      </div>

      <h1 className="text-3xl font-black mb-2 text-[var(--text-main)]">
        {isAr ? 'سجل النشاطات' : 'Activity History'}
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        {isAr ? 'استعرض سجل الفحص الذكي والمحادثات الطبية السابقة.' : 'Review your past Smart Diagnoses and Medical Chats.'}
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border-color)] pb-2">
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeTab === 'predictions'
              ? 'bg-[#0076f7] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:bg-[var(--card-bg)]'
          }`}
        >
          {isAr ? 'الفحص الذكي' : 'Predictions'}
        </button>
        <button
          onClick={() => setActiveTab('firstaid')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeTab === 'firstaid'
              ? 'bg-[#0076f7] text-white shadow-md'
              : 'text-[var(--text-muted)] hover:bg-[var(--card-bg)]'
          }`}
        >
          {isAr ? 'الإسعافات الأولية' : 'First Aid Chat'}
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'predictions' && (
          <>
            {predictions.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-10">
                {isAr ? 'لا يوجد سجل فحص ذكي حتى الآن.' : 'No prediction history yet.'}
              </p>
            ) : (
              predictions.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
                  <div className="text-xs text-[var(--text-muted)] mb-3 font-semibold">
                    {formatDate(p.createdAt)}
                  </div>
                  <div className="mb-3">
                    <span className="font-bold text-[var(--text-main)]">{isAr ? 'الأعراض:' : 'Symptoms:'}</span>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {p.symptoms?.join('، ') || (isAr ? 'غير محدد' : 'None')}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-[#0076f7]">{isAr ? 'التشخيص:' : 'Diagnosis:'}</span>
                    <p className="text-sm text-[var(--text-main)] mt-1 whitespace-pre-wrap leading-relaxed">
                      {p.diagnosis}
                    </p>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'firstaid' && (
          <>
            {firstAidMessages.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-10">
                {isAr ? 'لا توجد محادثات إسعافات أولية حتى الآن.' : 'No first aid chat history yet.'}
              </p>
            ) : (
              <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm flex flex-col gap-4 max-h-[600px] overflow-y-auto">
                {firstAidMessages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-gradient-to-br from-[#0076f7] to-[#00b4d8] text-white rounded-br-sm'
                            : 'bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
