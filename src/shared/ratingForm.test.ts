import { describe, expect, it } from 'vitest';
import {
  COMMENT_MAX_LENGTH,
  combineRating,
  fractionLabel,
  normalizeComment,
  splitRating,
} from './ratingForm';

describe('splitRating', () => {
  it('sépare la partie entière et le quart', () => {
    expect(splitRating(4.75)).toEqual({ whole: 4, fraction: 0.75 });
    expect(splitRating(3)).toEqual({ whole: 3, fraction: 0 });
    expect(splitRating(0.25)).toEqual({ whole: 0, fraction: 0.25 });
    expect(splitRating(5)).toEqual({ whole: 5, fraction: 0 });
  });

  it('arrondit au quart et borne entre 0 et 5', () => {
    expect(splitRating(2.3)).toEqual({ whole: 2, fraction: 0.25 });
    expect(splitRating(7)).toEqual({ whole: 5, fraction: 0 });
    expect(splitRating(-1)).toEqual({ whole: 0, fraction: 0 });
  });
});

describe('combineRating', () => {
  it('additionne les deux parties', () => {
    expect(combineRating(4, 0.75)).toBe(4.75);
    expect(combineRating(0, 0)).toBe(0);
  });

  it('ignore le quart à 5', () => {
    expect(combineRating(5, 0.75)).toBe(5);
  });
});

describe('fractionLabel', () => {
  it('affiche deux décimales', () => {
    expect(fractionLabel(0)).toBe('.00');
    expect(fractionLabel(0.25)).toBe('.25');
    expect(fractionLabel(0.5)).toBe('.50');
  });
});

describe('normalizeComment', () => {
  it('retire les espaces et renvoie null si vide', () => {
    expect(normalizeComment('  Super jeu ! ')).toBe('Super jeu !');
    expect(normalizeComment('   ')).toBeNull();
  });

  it('coupe à la longueur maximale', () => {
    expect(normalizeComment('a'.repeat(COMMENT_MAX_LENGTH + 5))).toHaveLength(
      COMMENT_MAX_LENGTH,
    );
  });
});
