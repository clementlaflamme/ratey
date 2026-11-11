import { MAX_RATING } from './stars';

/** Choix de la 1re liste : partie entière de la note. */
export const WHOLE_OPTIONS = [0, 1, 2, 3, 4, 5] as const;

/** Choix de la 2e liste : quart de point. */
export const FRACTION_OPTIONS = [0, 0.25, 0.5, 0.75] as const;

/** Longueur maximale du commentaire. */
export const COMMENT_MAX_LENGTH = 1000;

/** Libellé d'un quart de point. Ex. : 0.5 → « .50 ». */
export function fractionLabel(fraction: number) {
  return `.${String(Math.round(fraction * 100)).padStart(2, '0')}`;
}

/** Découpe une note. Ex. : 4.75 → { whole: 4, fraction: 0.75 }. */
export function splitRating(rating: number) {
  const quarters = Math.round(Math.min(Math.max(rating, 0), MAX_RATING) * 4);
  return { whole: Math.floor(quarters / 4), fraction: (quarters % 4) / 4 };
}

/** Recompose la note ; à 5, le quart est ignoré (max 5). */
export function combineRating(whole: number, fraction: number) {
  return whole >= MAX_RATING ? MAX_RATING : whole + fraction;
}

/** Commentaire nettoyé : null s'il est vide. */
export function normalizeComment(comment: string) {
  const trimmed = comment.trim();
  return trimmed ? trimmed.slice(0, COMMENT_MAX_LENGTH) : null;
}
