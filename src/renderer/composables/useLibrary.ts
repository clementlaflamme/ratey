import { computed, ref, watch } from 'vue';
import type { GameDetails, GameEntry, LibraryGame } from '../../shared/types';
import { api, ApiError, errorMessage, type LibraryList } from './api';

export type { LibraryList } from './api';

/*
 * État partagé de la bibliothèque : un changement sur une page se voit sur
 * toutes les autres. L'API n'a pas de route « toute la bibliothèque » : on
 * lit les 3 listes et on les fusionne (un jeu peut être dans plusieurs).
 */
const library = ref<LibraryGame[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

/** Numéro du dernier chargement : une réponse plus ancienne est ignorée. */
let loadId = 0;

/** (Re)charge la bibliothèque de l'utilisateur connecté. */
export async function loadLibrary() {
  const id = ++loadId;
  loading.value = true;
  error.value = null;
  try {
    const lists = await Promise.all([
      api.library('favourites'),
      api.library('play-later'),
      api.library('ratings'),
    ]);
    if (id !== loadId) return;
    const byId = new Map(lists.flat().map((game) => [game.id, game]));
    library.value = [...byId.values()];
  } catch (caught) {
    if (id === loadId) error.value = errorMessage(caught);
  } finally {
    if (id === loadId) loading.value = false;
  }
}

/** Vide la bibliothèque (déconnexion, changement d'utilisateur). */
export function clearLibrary() {
  loadId++;
  library.value = [];
  loading.value = false;
  error.value = null;
}

const belongsTo: Record<LibraryList, (game: LibraryGame) => boolean> = {
  favourites: (game) => game.isFavourite,
  'play-later': (game) => game.isToPlayLater,
  ratings: (game) => game.rating !== null,
};

/**
 * Retire le jeu de la liste ; retirer des évaluations supprime la note et
 * le commentaire. Lance une erreur si l'API refuse.
 */
async function removeFrom(list: LibraryList, gameId: number) {
  await api.removeFrom(list, gameId);
  await loadLibrary();
}

/** Bibliothèque de l'utilisateur connecté. */
export function useLibrary() {
  const gamesIn = (list: LibraryList) =>
    computed(() => library.value.filter(belongsTo[list]));
  return { library, loading, error, gamesIn, removeFrom, reload: loadLibrary };
}

/** Fiche d'un jeu et relation de l'utilisateur avec ce jeu. */
export function useGame(gameId: () => number) {
  const game = ref<GameDetails | null>(null);
  const userEntry = ref<GameEntry | null>(null);
  const loading = ref(false);
  /** Erreur de chargement (hors « jeu introuvable ») */
  const error = ref<string | null>(null);
  /** Une modification est en cours d'envoi */
  const saving = ref(false);
  /** Erreur de la dernière modification */
  const saveError = ref<string | null>(null);

  async function load(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const data = await api.game(id);
      if (id !== gameId()) return; // on a changé de jeu entre-temps
      game.value = data.game;
      userEntry.value = data.entry;
    } catch (caught) {
      if (id !== gameId()) return;
      game.value = null;
      userEntry.value = null;
      if (!(caught instanceof ApiError && caught.status === 404)) {
        error.value = errorMessage(caught);
      }
    } finally {
      if (id === gameId()) loading.value = false;
    }
  }

  watch(
    gameId,
    (id) => {
      game.value = null;
      userEntry.value = null;
      saveError.value = null;
      void load(id);
    },
    { immediate: true },
  );

  /**
   * Envoie une modification, puis relit le jeu et la bibliothèque.
   * Renvoie true si elle a réussi.
   */
  async function change(send: (id: number) => Promise<void>) {
    const id = gameId();
    saving.value = true;
    saveError.value = null;
    try {
      await send(id);
      await Promise.all([load(id), loadLibrary()]);
      return true;
    } catch (caught) {
      saveError.value = errorMessage(caught);
      return false;
    } finally {
      saving.value = false;
    }
  }

  return {
    game,
    userEntry,
    loading,
    error,
    saving,
    saveError,
    setFavourite: (value: boolean) =>
      change((id) =>
        value ? api.addTo('favourites', id) : api.removeFrom('favourites', id),
      ),
    setToPlayLater: (value: boolean) =>
      change((id) =>
        value ? api.addTo('play-later', id) : api.removeFrom('play-later', id),
      ),
    saveRating: (rating: number, comment: string | null) =>
      change((id) => api.saveRating(id, rating, comment)),
    deleteRating: () => change((id) => api.removeFrom('ratings', id)),
  };
}
