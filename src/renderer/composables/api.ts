import { getToken } from '@clerk/vue';
import type {
  GameSummary,
  GameWithEntry,
  LibraryGame,
} from '../../shared/types';

/**
 * Client de l'API Ratey. Chaque requête envoie le jeton de session Clerk :
 * l'API en déduit l'utilisateur, l'app ne transmet jamais de userId.
 */

/** Erreur renvoyée par l'API (statut HTTP + message lisible). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

async function request<T>(
  method: 'GET' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      0,
      'VITE_API_URL manquante : ajoute-la dans le fichier .env (voir .env.example).',
    );
  }

  const token = await getToken();
  if (!token) throw new ApiError(401, 'Vous n’êtes pas connecté.');

  const init: RequestInit = {
    method,
    headers: { Authorization: `Bearer ${token}` },
  };
  if (body !== undefined) {
    init.headers = { ...init.headers, 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur Ratey.');
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new ApiError(
      response.status,
      data?.error ?? `Erreur du serveur (${response.status})`,
    );
  }

  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

/** Message à afficher pour une erreur quelconque. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Erreur inattendue.';
}

export type LibraryList = 'favourites' | 'play-later' | 'ratings';

export const api = {
  library: (list: LibraryList) => request<LibraryGame[]>('GET', `/me/${list}`),
  addTo: (list: Exclude<LibraryList, 'ratings'>, gameId: number) =>
    request<void>('PUT', `/me/${list}/${gameId}`),
  removeFrom: (list: LibraryList, gameId: number) =>
    request<void>('DELETE', `/me/${list}/${gameId}`),
  saveRating: (gameId: number, rating: number, comment: string | null) =>
    request<void>('PUT', `/me/ratings/${gameId}`, { rating, comment }),
  game: (gameId: number) => request<GameWithEntry>('GET', `/games/${gameId}`),
  search: (query: string) =>
    request<GameSummary[]>(
      'GET',
      `/games/search?q=${encodeURIComponent(query)}`,
    ),
};
