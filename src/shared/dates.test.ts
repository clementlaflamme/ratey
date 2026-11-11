import { describe, expect, it } from 'vitest';
import { formatReleaseDate, releaseYear } from './dates';

describe('formatReleaseDate', () => {
  it('affiche la date complète en français', () => {
    expect(formatReleaseDate('2011-11-18')).toBe('18 novembre 2011');
    expect(formatReleaseDate('2020-01-01')).toBe('1 janvier 2020');
  });
});

describe('releaseYear', () => {
  it("extrait l'année", () => {
    expect(releaseYear('2011-11-18')).toBe(2011);
    expect(releaseYear(null)).toBeNull();
  });
});
