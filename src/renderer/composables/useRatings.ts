import { computed } from 'vue';
import type { RatedGame } from '../../shared/types';
import { useLibrary } from './useLibrary';

/** Évaluations de l'utilisateur connecté, tirées de sa bibliothèque. */
export function useRatings() {
  const { library, loading } = useLibrary();
  const ratings = computed<RatedGame[]>(() =>
    library.value.flatMap(({ id, name, coverImageId, rating, updatedAt }) =>
      rating === null ? [] : [{ id, name, coverImageId, rating, updatedAt }],
    ),
  );
  return { ratings, loading };
}
