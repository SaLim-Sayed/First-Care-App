'use client';
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import Footer from '@/components/Footer';

import { IoSend } from "react-icons/io5";
import { MdHealthAndSafety } from "react-icons/md";

const ANON_STORAGE_KEY = 'fc_firstaid_session';

function getOrCreateAnonymousId() {
    if (typeof window === 'undefined') return '';
    try {
        let id = localStorage.getItem(ANON_STORAGE_KEY);
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(ANON_STORAGE_KEY, id);
        }
        return id;
    } catch {
        return '';
    }
}

export default function FirstAid() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const { status } = useSession();
    const chatEndRef = useRef(null);
    const persistTimerRef = useRef(null);
    const anonymousIdRef = useRef('');
    const isAr = i18n.language?.startsWith('ar');

    const persistConversation = useCallback(async (msgs) => {
        if (!hydrated || !msgs.length) return;
        try {
            const anon = anonymousIdRef.current;
            const headers = { 'Content-Type': 'application/json' };
            if (anon) headers['x-first-aid-session'] = anon;
            await fetch('/api/first-aid/conversation', {
                method: 'PUT',
                credentials: 'include',
                headers,
                body: JSON.stringify({
                    messages: msgs.map((m) => ({ role: m.role, text: m.text })),
                    anonymousId: anon || undefined,
                }),
            });
        } catch (e) {
            console.warn('[FirstAid] persist failed', e);
        }
    }, [hydrated]);

    // Initial load: MongoDB conversation or default welcome
    useEffect(() => {
        let cancelled = false;
        (async () => {
            anonymousIdRef.current = getOrCreateAnonymousId();
            try {
                const anon = anonymousIdRef.current;
                const headers = {};
                if (anon) headers['x-first-aid-session'] = anon;
                const res = await fetch('/api/first-aid/conversation', {
                    credentials: 'include',
                    headers,
                });
                const data = await res.json();
                if (cancelled) return;
                if (Array.isArray(data.messages) && data.messages.length > 0) {
                    setMessages(
                        data.messages.map((m) => ({
                            role: m.role,
                            text: m.text,
                        })),
                    );
                } else {
                    setMessages([
                        {
                            role: 'assistant',
                            text: t('firstaid.welcome_message'),
                        },
                    ]);
                }
            } catch (e) {
                console.warn('[FirstAid] load failed', e);
                if (!cancelled)
                    setMessages([
                        {
                            role: 'assistant',
                            text: t('firstaid.welcome_message'),
                        },
                    ]);
            } finally {
                if (!cancelled) {
                    setHistoryLoading(false);
                    setHydrated(true);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // When user signs in, prefer server-side user conversation
    useEffect(() => {
        if (status !== 'authenticated') return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/first-aid/conversation', {
                    credentials: 'include',
                });
                const data = await res.json();
                if (cancelled || !Array.isArray(data.messages)) return;
                if (data.messages.length > 0) {
                    setMessages(
                        data.messages.map((m) => ({
                            role: m.role,
                            text: m.text,
                        })),
                    );
                }
            } catch (e) {
                console.warn('[FirstAid] reload after login failed', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [status]);

    // Debounced persist after messages change
    useEffect(() => {
        if (!hydrated || historyLoading) return;
        if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
        persistTimerRef.current = setTimeout(() => {
            persistConversation(messages);
        }, 500);
        return () => {
            if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
        };
    }, [messages, hydrated, historyLoading, persistConversation]);

    // Auto scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const fetchGeminiFallback = async (text, isArabic) => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: isArabic
                        ? 'عذراً، الخادم المحلي لا يستجيب ولم يتم تعيين مفتاح Gemini.'
                        : 'Sorry, the assistant is unavailable and no Gemini API key is configured.'
                }]);
                return;
            }

            const prompt = isArabic
                ? `أنت مساعد طبي خبير في الإسعافات الأولية. قدم تعليمات إسعافات أولية دقيقة وموجزة بناءً على هذه الحالة: "${text}"`
                : `You are an expert medical assistant for first aid. Provide accurate and concise first aid instructions based on this situation: "${text}"`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const response = await axios.post(
                url,
                {
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!aiResponse) throw new Error('empty');
            setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
        } catch (error) {
            console.error("Gemini fallback failed:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: t('firstaid.error'),
            }]);
        }
    };

    const predictionHandle = async () => {
        if (!value.trim()) return;

        const userText = value.trim();
        const lowerText = userText.toLowerCase();
        setValue("");
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        const greetings = ['hi', 'hello', 'hey', 'مرحبا', 'اهلا', 'سلام', 'صباح الخير', 'مساء الخير'];
        const thanks = ['thanks', 'thank you', 'thx', 'شكرا', 'تسلم', 'جزاك الله خيرا', 'مشكور'];

        if (greetings.some(word => lowerText.includes(word))) {
            const reply = isAr ? 'أهلاً بك! كيف يمكنني مساعدتك في الإسعافات الأولية اليوم؟' : 'Hello! How can I help you with first aid today?';
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
                setIsLoading(false);
            }, 500);
            return;
        }

        if (thanks.some(word => lowerText.includes(word))) {
            const reply = isAr ? 'العفو! أنا هنا دائماً للمساعدة. أتمنى لك السلامة.' : "You're welcome! I'm always here to help. Stay safe.";
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
                setIsLoading(false);
            }, 500);
            return;
        }

        const baseURL = 'https://web-production-654d2.up.railway.app/predict/?text= ' + userText;
        try {
            const response = await axios.get(baseURL);
            const data = response.data;
            const instruction = isAr ? data.firstaid_instructions_in_arabic : data.firstaid_instructions;

            const isFailureMsg =
                instruction === "I don't understand!" ||
                instruction === "لا أفهم!" ||
                data.firstaid_instructions === "I don't understand!";

            if (instruction && !isFailureMsg) {
                setMessages(prev => [...prev, { role: 'assistant', text: instruction }]);
            } else {
                throw new Error("Local model returned inability to understand.");
            }
        } catch (err) {
            console.log("Local model failed, falling back to Gemini...", err.message || err);
            await fetchGeminiFallback(userText, isAr);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-color)]   pt-20 transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="flex-grow flex flex-col max-w-2xl mx-auto w-full bg-[var(--card-bg)] shadow-2xl relative overflow-hidden sm:rounded-b-[2.5rem] border-x border-b border-[var(--border-color)]">

                {/* Chat Header — First Care First Aid Bot */}
                <div className="bg-gradient-to-r from-[#0076f7] to-[#00c6ff] px-4 py-4 relative">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg ring-2 ring-white/30 backdrop-blur-sm"
                            aria-hidden
                        >
                            <MdHealthAndSafety className="text-3xl" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                 
                            <h1 className="text-white text-xl font-black tracking-tight leading-none">
                            {t('firstaid.bot_role')}
                            </h1>
                            <div className="flex items-center gap-2 pt-1">
                                <span
                                    className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)] animate-pulse"
                                    aria-hidden
                                />
                                <span className="text-white text-sm font-semibold">
                                    {t('firstaid.status_online')}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Wavy bottom effect */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
                        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="relative block w-full h-4 fill-[var(--bg-color)] transition-all">
                            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--bg-color)] transition-all">
                    {historyLoading ? (
                        <p className="text-center text-sm text-[var(--text-muted)] py-8">{t('firstaid.loading_history')}</p>
                    ) : (
                        <>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-[17px] font-medium leading-relaxed shadow-sm
                                ${msg.role === 'user'
                                    ? 'bg-[#0091ff] text-white rounded-tr-none'
                                    : 'bg-[var(--card-bg)] text-[var(--text-main)] rounded-tl-none border border-[var(--border-color)]'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--card-bg)] p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center border border-[var(--border-color)] shadow-sm">
                                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                        </div>
                    )}
                        </>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-4 bg-[var(--card-bg)] border-t border-[var(--border-color)] transition-all">
                    <div className="flex items-center gap-3 w-full" dir={isAr ? 'rtl' : 'ltr'}>
                        <input
                            type="text"
                            placeholder={isAr ? "اكتب رسالتك..." : "Enter your message..."}
                            className="flex-grow p-4 bg-transparent text-lg text-[var(--text-main)] outline-none focus:ring-0 placeholder-[var(--text-muted)] font-medium"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && predictionHandle()}
                            disabled={historyLoading}
                        />
                        <button
                            className={`w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-[#0091ff] to-[#00c6ff] text-white shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center justify-center p-0 ${isLoading || !value.trim() || historyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={predictionHandle}
                            disabled={isLoading || !value.trim() || historyLoading}
                        >
                            <IoSend size={20} className={isAr ? 'rotate-180 mr-1' : 'ml-1'} />
                        </button>
                    </div>
                    {/* Powered By Footer */}
                    <div className="flex items-center justify-center gap-1 mt-4 opacity-50 text-[9px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                        <span>Powered By</span>
                        <span className="text-[#0091ff]">First Care</span>
                    </div>
                </div>
            </div>
         </div>
    );
}
