import { ref, watch, type Ref } from 'vue';
import type { GameSummary } from '../../shared/types';
import { api, errorMessage } from './api';

/** Longueur maximale acceptée par l'API. */
export const SEARCH_MAX_LENGTH = 100;

/**
 * Recherche IGDB réactive : relancée quand `query` change, après `delay` ms
 * sans frappe. Une réponse arrivée après une recherche plus récente est
 * ignorée. Les textes plus courts que `minLength` ne lancent rien.
 */
export function useSearch(
  query: Ref<string>,
  { delay = 0, minLength = 1 }: { delay?: number; minLength?: number } = {},
) {
  const results = ref<GameSummary[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  /** Texte de la dernière recherche terminée */
  const searched = ref('');

  let timer: ReturnType<typeof setTimeout> | undefined;
  let searchId = 0;

  async function run(text: string) {
    const id = ++searchId;
    try {
      const games = await api.search(text);
      if (id !== searchId) return;
      results.value = games;
      searched.value = text;
    } catch (caught) {
      if (id !== searchId) return;
      results.value = [];
      error.value = errorMessage(caught);
    } finally {
      if (id === searchId) loading.value = false;
    }
  }

  watch(
    query,
    (value) => {
      clearTimeout(timer);
      const text = value.trim().slice(0, SEARCH_MAX_LENGTH);
      error.value = null;
      if (text.length < minLength) {
        searchId++;
        results.value = [];
        searched.value = '';
        loading.value = false;
        return;
      }
      loading.value = true;
      timer = setTimeout(() => void run(text), delay);
    },
    { immediate: true },
  );

  return { results, loading, error, searched };
}
