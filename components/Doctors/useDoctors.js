import { useQuery } from '@tanstack/react-query';

import { fetchHealthcarePlaces } from '@/lib/places/fetchHealthcarePlaces';

/**
 * Healthcare facilities via React Query (cached, deduped).
 */
export function useDoctors(isAr) {
  const query = useQuery({
    queryKey: ['places', 'healthcare'],
    queryFn: fetchHealthcarePlaces,
    staleTime: 5 * 60 * 1000,
  });

  return {
    places: query.data ?? [],
    loading: query.isPending,
    error: query.isError
      ? isAr
        ? 'تعذر تحميل البيانات. يرجى المحاولة لاحقاً.'
        : 'Failed to load data. Please try again later.'
      : null,
  };
}
