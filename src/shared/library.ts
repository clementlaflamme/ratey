import type { LibraryGame } from './types';

export type SortKey =
  | 'title-asc'
  | 'title-desc'
  | 'studio-asc'
  | 'studio-desc'
  | 'year-desc'
  | 'year-asc'
  | 'rating-desc'
  | 'rating-asc';

export interface SortOption {
  key: SortKey;
  label: string;
}

/** Options du menu « Trier par », dans l'ordre d'affichage. */
export const SORT_OPTIONS: readonly SortOption[] = [
  { key: 'title-asc', label: 'Titre (A → Z)' },
  { key: 'title-desc', label: 'Titre (Z → A)' },
  { key: 'studio-asc', label: 'Studio (A → Z)' },
  { key: 'studio-desc', label: 'Studio (Z → A)' },
  { key: 'year-desc', label: 'Année (récent → ancien)' },
  { key: 'year-asc', label: 'Année (ancien → récent)' },
  { key: 'rating-desc', label: 'Évaluation (haute → basse)' },
  { key: 'rating-asc', label: 'Évaluation (basse → haute)' },
];

/** Options de tri sans celles basées sur l'évaluation. */
export const SORT_OPTIONS_WITHOUT_RATING = SORT_OPTIONS.filter(
  (option) => !option.key.startsWith('rating-'),
);

/** Minuscules et sans accents, pour une recherche tolérante. */
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Jeux dont le titre ou le studio contient la recherche. */
export function filterGames(games: readonly LibraryGame[], query: string) {
  const needle = normalize(query);
  if (!needle) return [...games];
  return games.filter(
    (game) =>
      normalize(game.name).includes(needle) ||
      (game.studio !== null && normalize(game.studio).includes(needle)),
  );
}

const collator = new Intl.Collator('fr', { sensitivity: 'base' });

/** Compare deux valeurs ; les valeurs manquantes vont toujours à la fin. */
function compareNullable<T>(
  a: T | null,
  b: T | null,
  compare: (a: T, b: T) => number,
  direction: 1 | -1,
) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return compare(a, b) * direction;
}

const byNumber = (a: number, b: number) => a - b;
const byText = (a: string, b: string) => collator.compare(a, b);

/**
 * Trie les jeux selon `key`. Sans tri choisi : les derniers ajoutés
 * ou modifiés en premier. À égalité, le titre départage (A → Z).
 */
export function sortGames(games: readonly LibraryGame[], key: SortKey | null) {
  const primary = (a: LibraryGame, b: LibraryGame) => {
    switch (key) {
      case 'title-asc':
        return byText(a.name, b.name);
      case 'title-desc':
        return byText(b.name, a.name);
      case 'studio-asc':
        return compareNullable(a.studio, b.studio, byText, 1);
      case 'studio-desc':
        return compareNullable(a.studio, b.studio, byText, -1);
      case 'year-asc':
        return compareNullable(a.releaseYear, b.releaseYear, byNumber, 1);
      case 'year-desc':
        return compareNullable(a.releaseYear, b.releaseYear, byNumber, -1);
      case 'rating-asc':
        return compareNullable(a.rating, b.rating, byNumber, 1);
      case 'rating-desc':
        return compareNullable(a.rating, b.rating, byNumber, -1);
      case null:
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    }
  };
  return [...games].sort((a, b) => primary(a, b) || byText(a.name, b.name));
}

/**
 * Ligne « Studio - Année » de la carte ; seulement l'info présente
 * si l'autre manque, chaîne vide si aucune.
 */
export function studioAndYear(
  game: Pick<LibraryGame, 'studio' | 'releaseYear'>,
) {
  return [game.studio, game.releaseYear]
    .filter((part) => part !== null)
    .join(' - ');
}
