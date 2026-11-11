import type { IgdbGame } from './types';

/**
 * Classement des résultats de recherche : popularité + correspondance du titre.
 *
 *   score = log10(1 + nombre d'évaluations) + bonus du titre
 *
 * - Le logarithme écrase les écarts de popularité (0 à ~5000 évaluations) :
 *   chaque ×10 vaut +1 point. Un jeu très connu reste devant un inconnu,
 *   sans écraser complètement la correspondance du titre.
 * - Bonus : titre identique à la recherche +1,5 (≈ ×30 de popularité),
 *   titre qui commence par la recherche +0,5 (≈ ×3).
 */
export const EXACT_TITLE_BONUS = 1.5;
export const PREFIX_TITLE_BONUS = 0.5;

/** Minuscules, sans accents ni ponctuation : « Hades: II » → « hades ii ». */
export function normalizeTitle(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Bonus selon la correspondance du titre avec la recherche. */
export function titleBonus(name: string, query: string): number {
  const title = normalizeTitle(name);
  const search = normalizeTitle(query);
  if (!search) return 0;
  if (title === search) return EXACT_TITLE_BONUS;
  // Au début d'un mot entier : « Control Resonant » oui, « Controller » non.
  if (title.startsWith(`${search} `)) return PREFIX_TITLE_BONUS;
  return 0;
}

/** Score d'un résultat pour la recherche `query`. */
export function searchScore(game: IgdbGame, query: string): number {
  return (
    Math.log10(1 + (game.total_rating_count ?? 0)) +
    titleBonus(game.name, query)
  );
}

/**
 * Trie les résultats du meilleur score au moins bon. À score égal, l'ordre
 * de pertinence d'IGDB est gardé (tri stable).
 */
export function rankSearchResults(
  games: IgdbGame[],
  query: string,
): IgdbGame[] {
  const scores = new Map(games.map((game) => [game, searchScore(game, query)]));
  return games.toSorted((a, b) => scores.get(b)! - scores.get(a)!);
}
