import { getEnv } from '../env';
import { getTwitchToken } from './twitchToken';

export const IGDB_URL = 'https://api.igdb.com/v4';

/**
 * Envoie une requête Apicalypse à IGDB et renvoie le JSON reçu.
 * IGDB n'accepte que des POST, avec la requête en texte brut dans le corps.
 *
 *   igdbRequest<IgdbGame[]>('games', 'fields name; where id = 121;')
 *
 * Doc : https://api-docs.igdb.com/#requests
 */
export async function igdbRequest<T>(
  endpoint: string,
  query: string,
): Promise<T> {
  const token = await getTwitchToken();

  const response = await fetch(`${IGDB_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': getEnv().TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
    body: query,
  });

  // Erreur côté IGDB : le gestionnaire d'erreurs répondra 500.
  if (!response.ok) {
    throw new Error(`IGDB a répondu ${response.status} sur /${endpoint}`);
  }

  return (await response.json()) as T;
}
