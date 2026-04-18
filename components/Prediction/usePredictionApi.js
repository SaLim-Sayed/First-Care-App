'use client';

import axios from 'axios';
import { useCallback, useState } from 'react';

import { PREDICT_API_BASE } from '@/lib/prediction/constants';
import { fetchGeminiDiagnosis } from '@/lib/prediction/geminiDiagnosis';
import { normalizePredictionPayload } from '@/lib/prediction/normalizePayload';

const REQUIRED_VECTOR_LENGTH = 350;

export function usePredictionApi({ posts, isAr, onOpen }) {
  const [prediction, setPrediction] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchGeminiPrediction = useCallback(
    async (selectedSymptoms) => {
      const genericGeminiError = isAr
        ? 'عذراً، تعذر الحصول على تشخيص حالياً. يرجى المحاولة لاحقاً.'
        : 'Sorry, unable to get a diagnosis at this time. Please try again later.';
      try {
        setIsLoading(true);
        const result = await fetchGeminiDiagnosis(selectedSymptoms, isAr);

        if (!result.ok) {
          if (result.fallbackText) {
            setPrediction(result.fallbackText);
          } else if (result.empty) {
            throw new Error('Empty Gemini response');
          } else {
            setPrediction(genericGeminiError);
          }
          return;
        }

        setPrediction(result.text);
      } catch (error) {
        console.error('Gemini fallback failed:', error);
        setPrediction(
          isAr
            ? 'عذراً، تعذر الحصول على تشخيص حالياً. يرجى المحاولة لاحقاً.'
            : 'Sorry, unable to get a diagnosis at this time. Please try again later.',
        );
      } finally {
        setIsLoading(false);
        onOpen();
      }
    },
    [isAr, onOpen],
  );

  const predictionHandle = useCallback(() => {
    setIsLoading(true);
    let symptomsArray = Object.values(posts);

    if (symptomsArray.length < REQUIRED_VECTOR_LENGTH) {
      const padding = new Array(REQUIRED_VECTOR_LENGTH - symptomsArray.length).fill(
        0,
      );
      symptomsArray = [...padding, ...symptomsArray];
    }

    const symptomsParam = `[${symptomsArray.join(',')}]`;
    const url = `${PREDICT_API_BASE}/predict/?symptoms=${encodeURIComponent(symptomsParam)}`;

    axios
      .get(url, { timeout: 90_000 })
      .then((response) => {
        setPrediction(normalizePredictionPayload(response.data));
        setIsLoading(false);
        onOpen();
      })
      .catch((err) => {
        console.warn('Local API failed, falling back to Gemini...', err?.message);
        const selectedSymptoms = Object.entries(posts)
          .filter(([, value]) => value === 1)
          .map(([key]) => key);

        if (selectedSymptoms.length > 0) {
          void fetchGeminiPrediction(selectedSymptoms);
        } else {
          setPrediction(
            isAr ? 'يرجى اختيار عرض واحد على الأقل.' : 'Please select at least one symptom.',
          );
          setIsLoading(false);
          onOpen();
        }
      });
  }, [fetchGeminiPrediction, isAr, onOpen, posts]);

  return { prediction, setPrediction, isLoading, predictionHandle };
}
