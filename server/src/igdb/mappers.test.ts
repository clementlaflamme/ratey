import { describe, expect, it } from 'vitest';
import {
  findDeveloper,
  toGameDetails,
  toGameSummary,
  toIsoDate,
} from './mappers';
import type { IgdbGame } from './types';

/** Jeu tel que renvoyé par IGDB (réponse réelle simplifiée). */
const minecraft: IgdbGame = {
  id: 121,
  name: 'Minecraft',
  cover: { image_id: 'co49x5' },
  first_release_date: 1321574400,
  genres: [
    { id: 13, name: 'Simulator' },
    { id: 31, name: 'Adventure' },
  ],
  platforms: [
    { id: 6, name: 'PC (Microsoft Windows)' },
    { id: 48, name: 'PlayStation 4' },
  ],
  involved_companies: [
    { company: { id: 1, name: 'Microsoft' }, developer: false },
    { company: { id: 2, name: 'Mojang Studios' }, developer: true },
    { company: { id: 3, name: '4J Studios' }, developer: true },
  ],
};

/** Jeu presque vide : IGDB omet les champs inconnus. */
const unknownGame: IgdbGame = { id: 999, name: 'Projet mystère' };

describe('findDeveloper', () => {
  it('prend la 1re compagnie qui a développé le jeu', () => {
    expect(findDeveloper(minecraft.involved_companies)).toEqual({
      id: 2,
      name: 'Mojang Studios',
    });
  });

  it('renvoie null sans développeur', () => {
    expect(findDeveloper(undefined)).toBeNull();
    expect(
      findDeveloper([
        { company: { id: 1, name: 'Éditeur' }, developer: false },
      ]),
    ).toBeNull();
  });
});

describe('toIsoDate', () => {
  it('convertit des secondes UTC en AAAA-MM-JJ', () => {
    expect(toIsoDate(1321574400)).toBe('2011-11-18');
    expect(toIsoDate(0)).toBe('1970-01-01');
  });

  it('renvoie null sans date', () => {
    expect(toIsoDate(undefined)).toBeNull();
  });
});

describe('toGameSummary', () => {
  it('convertit un jeu IGDB', () => {
    expect(toGameSummary(minecraft)).toEqual({
      id: 121,
      name: 'Minecraft',
      coverImageId: 'co49x5',
      studio: 'Mojang Studios',
      releaseYear: 2011,
    });
  });

  it('met null pour les champs absents', () => {
    expect(toGameSummary(unknownGame)).toEqual({
      id: 999,
      name: 'Projet mystère',
      coverImageId: null,
      studio: null,
      releaseYear: null,
    });
  });
});

describe('toGameDetails', () => {
  it('convertit un jeu IGDB complet', () => {
    expect(toGameDetails(minecraft)).toEqual({
      id: 121,
      name: 'Minecraft',
      coverImageId: 'co49x5',
      studio: 'Mojang Studios',
      releaseDate: '2011-11-18',
      genres: ['Simulator', 'Adventure'],
      platforms: [
        { id: 6, name: 'PC (Microsoft Windows)' },
        { id: 48, name: 'PlayStation 4' },
      ],
    });
  });

  it('met des listes vides et null pour les champs absents', () => {
    expect(toGameDetails(unknownGame)).toEqual({
      id: 999,
      name: 'Projet mystère',
      coverImageId: null,
      studio: null,
      releaseDate: null,
      genres: [],
      platforms: [],
    });
  });
});
