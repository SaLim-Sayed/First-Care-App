'use client';

import { useCallback, useState } from 'react';

import {
  INITIAL_SYMPTOM_POSTS,
  SYMPTOM_ORDER_AR,
} from '@/components/Prediction/symptomData';

export function useSymptomSelection(isAr) {
  const [posts, setPosts] = useState(() => ({ ...INITIAL_SYMPTOM_POSTS }));

  const getIsChecked = useCallback(
    (symptomName) => {
      if (isAr) {
        const index = SYMPTOM_ORDER_AR.indexOf(symptomName);
        if (index !== -1) {
          const englishKey = Object.keys(posts)[index];
          return posts[englishKey] === 1;
        }
      }
      return posts[symptomName] === 1;
    },
    [isAr, posts],
  );

  const handleCheckboxUnified = useCallback(
    (status) => {
      const clonePost = { ...posts };
      if (isAr) {
        const index = SYMPTOM_ORDER_AR.indexOf(status.value);
        if (index !== -1) {
          const englishKey = Object.keys(clonePost)[index];
          clonePost[englishKey] = status.checked ? 1 : 0;
        }
      } else {
        clonePost[status.value] = status.checked ? 1 : 0;
      }
      setPosts(clonePost);
    },
    [isAr, posts],
  );

  return { posts, setPosts, getIsChecked, handleCheckboxUnified };
}
