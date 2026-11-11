import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { jsonResponse } from '../test/helpers';
import { igdbRequest } from './client';
import { fetchIgdbGame, searchGames } from './games';
import type { IgdbGame } from './types';

/**
 * Le jeton Twitch et `fetch` sont simulés : aucun appel réseau réel.
 */
vi.mock('./twitchToken', () => ({
  getTwitchToken: vi.fn(async () => 'jeton-test'),
}));

const fetchMock = vi.fn();

/** Détails de l'appel n° `index` à fetch. */
function sentRequest(index = 0) {
  const [input, init] = fetchMock.mock.calls[index] as [
    string | URL,
    RequestInit,
  ];
  return {
    url: String(input),
    method: init.method,
    headers: new Headers(init.headers),
    body: String(init.body),
  };
}

const hades: IgdbGame = {
  id: 113112,
  name: 'Hades',
  cover: { image_id: 'co39vc' },
  first_release_date: 1600300800,
  involved_companies: [
    { company: { id: 1, name: 'Supergiant Games' }, developer: true },
  ],
};

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => jsonResponse([hades]));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('igdbRequest', () => {
  it('envoie un POST à IGDB avec les bons en-têtes', async () => {
    const data = await igdbRequest('games', 'fields name;');

    expect(data).toEqual([hades]);
    const request = sentRequest();
    expect(request.url).toBe('https://api.igdb.com/v4/games');
    expect(request.method).toBe('POST');
    expect(request.headers.get('Client-ID')).toBe('test-client-id');
    expect(request.headers.get('Authorization')).toBe('Bearer jeton-test');
    expect(request.body).toBe('fields name;');
  });

  it('lance une erreur si IGDB répond par une erreur', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}, 500));

    await expect(igdbRequest('games', 'fields name;')).rejects.toThrow();
  });
});

describe('searchGames', () => {
  it('cherche par nom et convertit les résultats', async () => {
    const results = await searchGames('hades');

    expect(results).toEqual([
      {
        id: 113112,
        name: 'Hades',
        coverImageId: 'co39vc',
        studio: 'Supergiant Games',
        releaseYear: 2020,
      },
    ]);
    const { url, body } = sentRequest();
    expect(url).toBe('https://api.igdb.com/v4/games');
    expect(body).toContain('search "hades";');
    expect(body).toContain('cover.image_id');
    expect(body).toContain('involved_companies.developer');
    expect(body).toMatch(/limit 50;/);
    expect(body).toContain('total_rating_count');
    expect(body).toContain('where game_type = (0, 8) & version_parent = null;');
  });

  it('classe par popularité, puis par pertinence à égalité', async () => {
    const result = (id: number, total_rating_count?: number): IgdbGame => ({
      id,
      name: `Jeu ${id}`,
      total_rating_count,
    });
    fetchMock.mockImplementation(async () =>
      jsonResponse([result(1), result(2, 46), result(3), result(4, 989)]),
    );

    const results = await searchGames('control');

    expect(results.map((game) => game.id)).toEqual([4, 2, 1, 3]);
  });

  it('renvoie au plus 20 résultats', async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse(
        Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Jeu ${i}` })),
      ),
    );

    expect(await searchGames('jeu')).toHaveLength(20);
  });

  it("échappe les guillemets du texte de l'utilisateur", async () => {
    await searchGames('the "best" game');

    expect(sentRequest().body).toContain('search "the \\"best\\" game";');
  });
});

describe('fetchIgdbGame', () => {
  it('demande le jeu par son ID avec ses relations', async () => {
    const game = await fetchIgdbGame(113112);

    expect(game).toEqual(hades);
    const { body } = sentRequest();
    expect(body).toContain('where id = 113112;');
    expect(body).toContain('genres.name');
    expect(body).toContain('platforms.name');
  });

  it("renvoie null si le jeu n'existe pas", async () => {
    fetchMock.mockImplementation(async () => jsonResponse([]));

    expect(await fetchIgdbGame(999999999)).toBeNull();
  });
});
