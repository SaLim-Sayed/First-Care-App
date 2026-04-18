import axios from 'axios';

export async function fetchGeminiDiagnosis(selectedSymptoms, isAr) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      fallbackText: isAr
        ? 'عذراً، نظام التوقع المحلي متوقف حالياً ولم يتم العثور على مفتاح API لـ Gemini.'
        : 'Sorry, the local prediction service is unavailable and no Gemini API key was configured.',
    };
  }

  const symptomsList = selectedSymptoms.join(', ');
  const prompt = isAr
    ? `أنت مساعد طبي خبير. بناءً على هذه الأعراض المختارة: (${symptomsList})، قدم تشخيصاً محتملاً موجزاً ودقيقاً بلغة بسيطة، مع توضيح أهمية استشارة الطبيب. اجعل الرد باللغة العربية.`
    : `You are an expert medical assistant. Based on these selected symptoms: (${symptomsList}), provide a concise and accurate potential diagnosis in simple language, highlighting the importance of consulting a doctor.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4 },
  });

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return { ok: false, empty: true };

  return { ok: true, text };
}
