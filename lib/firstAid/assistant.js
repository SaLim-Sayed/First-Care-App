import axios from 'axios';

const RAILWAY_FIRSTAID_URL =
  'https://web-production-654d2.up.railway.app/predict/?text= ';

/**
 * @returns {Promise<string>} Localized first-aid instruction text
 */
export async function fetchRailwayFirstAid(userText, isAr) {
  const response = await axios.get(RAILWAY_FIRSTAID_URL + userText);
  const data = response.data;
  const instruction = isAr ? data.firstaid_instructions_in_arabic : data.firstaid_instructions;

  const isFailureMsg =
    instruction === "I don't understand!" ||
    instruction === "لا أفهم!" ||
    data.firstaid_instructions === "I don't understand!";

  if (instruction && !isFailureMsg) return instruction;

  throw new Error('Local model returned inability to understand.');
}

/** Call only when `NEXT_PUBLIC_GEMINI_API_KEY` is set. */
export async function fetchGeminiFirstAid(userText, isAr) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const prompt = isAr
    ? `أنت مساعد طبي خبير في الإسعافات الأولية. قدم تعليمات إسعافات أولية دقيقة وموجزة بناءً على هذه الحالة: "${userText}". تأكد من صياغة الإجابة على شكل قائمة خطوات إرشادية، وأن تكون قصيرة وأقل من 400 حرف.`
    : `You are an expert medical assistant for first aid. Provide accurate and concise first aid instructions based on this situation: "${userText}". Make sure the answer is formatted as a step-by-step list of instructions, short, and strictly under 400 characters.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await axios.post(
    url,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('empty');
  return text;
}
