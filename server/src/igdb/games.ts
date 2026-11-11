import type { GameSummary } from '../../../src/shared/types';
import { igdbRequest } from './client';
import { toGameSummary } from './mappers';
import { rankSearchResults } from './ranking';
import type { IgdbGame } from './types';

/**
 * Requêtes IGDB sur les jeux.
 * Langage de requête « Apicalypse » : https://api-docs.igdb.com/#apicalypse-1
 */

/** Nombre maximal de résultats de recherche renvoyés à l'app. */
export const SEARCH_LIMIT = 20;

/**
 * Nombre de résultats demandés à IGDB avant le tri par popularité (50 est le
 * maximum par défaut d'IGDB) : plus large que SEARCH_LIMIT, pour qu'un jeu
 * connu mais mal classé par la pertinence (ex. « Control ») soit trouvé.
 */
export const SEARCH_FETCH_LIMIT = 50;

/** Champs nécessaires pour un résultat de recherche (GameSummary). */
const SUMMARY_FIELDS = [
  'name',
  'total_rating_count',
  'cover.image_id',
  'first_release_date',
  'involved_companies.company.name',
  'involved_companies.developer',
].join(', ');

/** Champs nécessaires pour la fiche complète et la sauvegarde en base. */
const DETAILS_FIELDS = [SUMMARY_FIELDS, 'genres.name', 'platforms.name'].join(
  ', ',
);

/**
 * Seulement les jeux « parents » : jeu principal (game_type 0) ou remake (8),
 * et pas une édition d'un autre jeu (version_parent vide). Exclut les éditions
 * (GOTY, Complete…), DLC, extensions, bundles, mods, remasters, ports…
 */
const MAIN_GAMES_ONLY = 'game_type = (0, 8) & version_parent = null';

/**
 * Recherche des jeux par nom, classés par popularité et correspondance du
 * titre (voir ranking.ts). IGDB ne permet pas de trier une recherche
 * (`search` + `sort`) : on prend les SEARCH_FETCH_LIMIT plus pertinents,
 * puis on les classe ici.
 */
export async function searchGames(query: string): Promise<GameSummary[]> {
  // Le texte vient de l'utilisateur : on échappe les guillemets.
  const search = query.trim().replaceAll('"', '\\"');
  const games = await igdbRequest<IgdbGame[]>(
    'games',
    `search "${search}"; fields ${SUMMARY_FIELDS}; where ${MAIN_GAMES_ONLY}; limit ${SEARCH_FETCH_LIMIT};`,
  );
  return rankSearchResults(games, query)
    .slice(0, SEARCH_LIMIT)
    .map(toGameSummary);
}

/** Un jeu par son ID IGDB, avec ses relations ; null s'il n'existe pas. */
export async function fetchIgdbGame(gameId: number): Promise<IgdbGame | null> {
  const games = await igdbRequest<IgdbGame[]>(
    'games',
    `fields ${DETAILS_FIELDS}; where id = ${gameId}; limit 1;`,
  );
  return games[0] ?? null;
}
