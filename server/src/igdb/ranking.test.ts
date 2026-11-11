import { describe, expect, it } from 'vitest';
import {
  EXACT_TITLE_BONUS,
  normalizeTitle,
  PREFIX_TITLE_BONUS,
  rankSearchResults,
  titleBonus,
} from './ranking';
import type { IgdbGame } from './types';

const game = (name: string, total_rating_count?: number): IgdbGame => ({
  id: Math.floor(Math.random() * 1e9),
  name,
  total_rating_count,
});

const names = (games: IgdbGame[]) => games.map((g) => g.name);

describe('normalizeTitle', () => {
  it('retire casse, accents et ponctuation', () => {
    expect(normalizeTitle('  Pokémon: Épée!  ')).toBe('pokemon epee');
    expect(normalizeTitle('Hades-II')).toBe('hades ii');
  });
});

describe('titleBonus', () => {
  it('titre identique', () => {
    expect(titleBonus('Control', ' control ')).toBe(EXACT_TITLE_BONUS);
  });

  it('titre qui commence par la recherche (mot entier)', () => {
    expect(titleBonus('Control: Resonant', 'control')).toBe(PREFIX_TITLE_BONUS);
    expect(titleBonus('Controller Hero', 'control')).toBe(0);
  });

  it('recherche ailleurs dans le titre', () => {
    expect(titleBonus('SuperHot: Mind Control Delete', 'control')).toBe(0);
  });
});

// Cas réels d'IGDB (nombre d'évaluations relevé en novembre 2026).
describe('rankSearchResults', () => {
  it('« control » : le titre exact, puis ceux qui commencent par le mot', () => {
    const results = [
      game('Control: Override', 0),
      game('Control Resonant', 46),
      game('Star Control', 14),
      game('Control', 989),
      game('SuperHot: Mind Control Delete', 110),
    ];

    expect(names(rankSearchResults(results, 'control')).slice(0, 3)).toEqual([
      'Control',
      'Control Resonant',
      'SuperHot: Mind Control Delete',
    ]);
  });

  it('« zelda » : un titre exact inconnu ne passe pas devant les classiques', () => {
    const results = [
      game('Zelda', 0),
      game('Zelda II: The Adventure of Link', 308),
      game('The Legend of Zelda: Ocarina of Time', 2187),
    ];

    expect(names(rankSearchResults(results, 'zelda'))[0]).toBe(
      'The Legend of Zelda: Ocarina of Time',
    );
  });

  it('« portal » : Portal devant Portal 2, les homonymes inconnus derrière', () => {
    const results = [
      game('Portal', 0),
      game('Portal 2', 4540),
      game('Portal', 4072),
    ];

    expect(
      rankSearchResults(results, 'portal').map((g) => g.total_rating_count),
    ).toEqual([4072, 4540, 0]);
  });

  it('garde l’ordre de pertinence IGDB à score égal', () => {
    const results = [game('Alpha'), game('Beta'), game('Gamma')];

    expect(names(rankSearchResults(results, 'jeu'))).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ]);
  });
});
