import { describe, expect, it } from 'vitest';
import {
  SORT_OPTIONS_WITHOUT_RATING,
  filterGames,
  sortGames,
  studioAndYear,
} from './library';
import type { LibraryGame } from './types';

const game = (
  id: number,
  name: string,
  overrides: Partial<LibraryGame> = {},
): LibraryGame => ({
  id,
  name,
  coverImageId: null,
  studio: null,
  releaseYear: null,
  rating: null,
  isFavourite: false,
  isToPlayLater: false,
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const hades = game(1, 'Hades', {
  studio: 'Supergiant Games',
  releaseYear: 2020,
  rating: 4.5,
  updatedAt: '2026-03-01T00:00:00Z',
});
const celeste = game(2, 'Celeste', {
  studio: 'Maddy Makes Games',
  releaseYear: 2018,
  rating: 4.75,
  updatedAt: '2026-01-01T00:00:00Z',
});
const eldenRing = game(3, 'Élden Ring', {
  studio: 'FromSoftware',
  releaseYear: 2022,
  updatedAt: '2026-02-01T00:00:00Z',
});
const unknown = game(4, 'Bastion');

const games = [hades, celeste, eldenRing, unknown];
const ids = (list: LibraryGame[]) => list.map((g) => g.id);

describe('filterGames', () => {
  it('cherche dans le titre et le studio', () => {
    expect(ids(filterGames(games, 'hades'))).toEqual([1]);
    expect(ids(filterGames(games, 'supergiant'))).toEqual([1]);
  });

  it('ignore la casse, les accents et les espaces autour', () => {
    expect(ids(filterGames(games, '  ELDEN '))).toEqual([3]);
    expect(ids(filterGames(games, 'céleste'))).toEqual([2]);
  });

  it('renvoie tous les jeux sans recherche', () => {
    expect(ids(filterGames(games, '   '))).toEqual([1, 2, 3, 4]);
  });

  it('gère un studio manquant', () => {
    expect(ids(filterGames(games, 'bast'))).toEqual([4]);
  });
});

describe('sortGames', () => {
  it('par défaut, du plus récemment modifié au plus ancien', () => {
    expect(ids(sortGames(games, null))).toEqual([1, 3, 4, 2]);
  });

  it('par titre, sans tenir compte des accents', () => {
    expect(ids(sortGames(games, 'title-asc'))).toEqual([4, 2, 3, 1]);
    expect(ids(sortGames(games, 'title-desc'))).toEqual([1, 3, 2, 4]);
  });

  it('met les valeurs manquantes à la fin, dans les deux sens', () => {
    expect(ids(sortGames(games, 'studio-asc'))).toEqual([3, 2, 1, 4]);
    expect(ids(sortGames(games, 'studio-desc'))).toEqual([1, 2, 3, 4]);
    expect(ids(sortGames(games, 'year-desc'))).toEqual([3, 1, 2, 4]);
    expect(ids(sortGames(games, 'year-asc'))).toEqual([2, 1, 3, 4]);
    expect(ids(sortGames(games, 'rating-desc'))).toEqual([2, 1, 4, 3]);
    expect(ids(sortGames(games, 'rating-asc'))).toEqual([1, 2, 4, 3]);
  });

  it('départage les égalités par titre', () => {
    const a = game(10, 'Zelda', { releaseYear: 2017 });
    const b = game(11, 'Astro', { releaseYear: 2017 });
    expect(ids(sortGames([a, b], 'year-desc'))).toEqual([11, 10]);
  });

  it('ne modifie pas la liste reçue', () => {
    sortGames(games, 'title-asc');
    expect(ids(games)).toEqual([1, 2, 3, 4]);
  });
});

describe('studioAndYear', () => {
  it('affiche le studio et l’année', () => {
    expect(studioAndYear(hades)).toBe('Supergiant Games - 2020');
  });

  it("n'affiche que l'info présente", () => {
    expect(studioAndYear({ studio: 'Ubisoft', releaseYear: null })).toBe(
      'Ubisoft',
    );
    expect(studioAndYear({ studio: null, releaseYear: 2026 })).toBe('2026');
    expect(studioAndYear({ studio: null, releaseYear: null })).toBe('');
  });
});

describe('SORT_OPTIONS_WITHOUT_RATING', () => {
  it('exclut les tris par évaluation', () => {
    expect(
      SORT_OPTIONS_WITHOUT_RATING.some((o) => o.key.startsWith('rating')),
    ).toBe(false);
    expect(SORT_OPTIONS_WITHOUT_RATING).toHaveLength(6);
  });
});
