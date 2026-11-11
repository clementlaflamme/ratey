import { Decimal } from '@prisma/client/runtime/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findSavedGame } from '../db/games';
import { findUserGame } from '../db/userGames';
import { fetchIgdbGame, searchGames } from '../igdb/games';
import { callApi } from '../test/helpers';

vi.mock('../db/games', () => ({
  ensureGameSaved: vi.fn(),
  findSavedGame: vi.fn(),
}));
vi.mock('../db/userGames', () => ({
  listUserGames: vi.fn(),
  findUserGame: vi.fn(),
  updateUserGame: vi.fn(),
}));
vi.mock('../igdb/games', () => ({
  searchGames: vi.fn(),
  fetchIgdbGame: vi.fn(),
}));

type UserGameRow = Awaited<ReturnType<typeof findUserGame>>;

const summary = {
  id: 113112,
  name: 'Hades',
  coverImageId: 'co39vc',
  studio: 'Supergiant Games',
  releaseYear: 2020,
};

const details = {
  id: 113112,
  name: 'Hades',
  coverImageId: 'co39vc',
  studio: 'Supergiant Games',
  releaseDate: '2020-09-17',
  genres: ['Role-playing (RPG)'],
  platforms: [{ id: 6, name: 'PC (Microsoft Windows)' }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /games/search', () => {
  it('renvoie les résultats de la recherche', async () => {
    vi.mocked(searchGames).mockResolvedValue([summary]);

    const res = await callApi('GET', '/games/search?q=%20hades%20');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([summary]);
    expect(searchGames).toHaveBeenCalledWith('hades');
  });

  it.each([
    ['absente', '/games/search'],
    ['vide', '/games/search?q=%20%20'],
    ['trop longue', `/games/search?q=${'a'.repeat(101)}`],
  ])('refuse une recherche %s (400)', async (_, path) => {
    const res = await callApi('GET', path);

    expect(res.status).toBe(400);
    expect(searchGames).not.toHaveBeenCalled();
  });
});

describe('GET /games/:gameId', () => {
  it('lit le jeu dans la base et la relation de l’utilisateur', async () => {
    vi.mocked(findSavedGame).mockResolvedValue(details);
    vi.mocked(findUserGame).mockResolvedValue({
      rating: new Decimal(4.5),
      comment: 'Excellent',
      isFavourite: true,
      isToPlayLater: false,
    } as UserGameRow);

    const res = await callApi('GET', '/games/113112');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      game: details,
      entry: {
        rating: 4.5,
        comment: 'Excellent',
        isFavourite: true,
        isToPlayLater: false,
      },
    });
    expect(fetchIgdbGame).not.toHaveBeenCalled();
  });

  it("va chercher sur IGDB si le jeu n'est pas dans la base", async () => {
    vi.mocked(findSavedGame).mockResolvedValue(null);
    vi.mocked(fetchIgdbGame).mockResolvedValue({
      id: 113112,
      name: 'Hades',
      cover: { image_id: 'co39vc' },
      first_release_date: 1600300800,
      genres: [{ id: 12, name: 'Role-playing (RPG)' }],
      platforms: [{ id: 6, name: 'PC (Microsoft Windows)' }],
      involved_companies: [
        { company: { id: 1, name: 'Supergiant Games' }, developer: true },
      ],
    });
    vi.mocked(findUserGame).mockResolvedValue(null);

    const res = await callApi('GET', '/games/113112');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ game: details, entry: null });
  });

  it("renvoie 404 si le jeu n'existe nulle part", async () => {
    vi.mocked(findSavedGame).mockResolvedValue(null);
    vi.mocked(fetchIgdbGame).mockResolvedValue(null);

    const res = await callApi('GET', '/games/999999999');

    expect(res.status).toBe(404);
  });

  it('refuse un gameId invalide (400)', async () => {
    const res = await callApi('GET', '/games/abc');

    expect(res.status).toBe(400);
  });
});
