import { Decimal } from '@prisma/client/runtime/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureGameSaved } from '../db/games';
import { findUserGame, listUserGames, updateUserGame } from '../db/userGames';
import { callApi, TEST_USER_ID } from '../test/helpers';

vi.mock('../db/userGames', () => ({
  listUserGames: vi.fn(),
  findUserGame: vi.fn(),
  updateUserGame: vi.fn(),
}));
vi.mock('../db/games', () => ({ ensureGameSaved: vi.fn() }));

type UserGameRow = Awaited<ReturnType<typeof findUserGame>>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /me/ratings', () => {
  it('renvoie les jeux évalués', async () => {
    vi.mocked(listUserGames).mockResolvedValue([]);

    const res = await callApi('GET', '/me/ratings');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(listUserGames).toHaveBeenCalledWith(TEST_USER_ID, {
      rating: { not: null },
    });
  });
});

describe('PUT /me/ratings/:gameId', () => {
  it('enregistre la note et le commentaire (204)', async () => {
    const res = await callApi('PUT', '/me/ratings/121', {
      rating: 4.25,
      comment: 'Super jeu !',
    });

    expect(res.status).toBe(204);
    expect(ensureGameSaved).toHaveBeenCalledWith(121);
    expect(updateUserGame).toHaveBeenCalledWith(TEST_USER_ID, 121, {
      rating: 4.25,
      comment: 'Super jeu !',
    });
  });

  it('accepte les bornes 0 et 5', async () => {
    for (const rating of [0, 5]) {
      const res = await callApi('PUT', '/me/ratings/121', { rating });
      expect(res.status).toBe(204);
    }
  });

  it('retire les espaces du commentaire ; vide ou absent → null', async () => {
    await callApi('PUT', '/me/ratings/121', { rating: 3, comment: '  Bien  ' });
    await callApi('PUT', '/me/ratings/121', { rating: 3, comment: '   ' });
    await callApi('PUT', '/me/ratings/121', { rating: 3 });

    const changes = vi.mocked(updateUserGame).mock.calls.map((call) => call[2]);
    expect(changes).toEqual([
      { rating: 3, comment: 'Bien' },
      { rating: 3, comment: null },
      { rating: 3, comment: null },
    ]);
  });

  it.each([
    ['au-dessus de 5', { rating: 5.25 }],
    ['négative', { rating: -1 }],
    ['pas au quart de point', { rating: 4.3 }],
    ['en texte', { rating: '4' }],
    ['absente', { comment: 'Pas de note' }],
    ['avec un commentaire trop long', { rating: 4, comment: 'a'.repeat(1001) }],
  ])('refuse une note %s (400)', async (_, body) => {
    const res = await callApi('PUT', '/me/ratings/121', body);

    expect(res.status).toBe(400);
    expect(updateUserGame).not.toHaveBeenCalled();
  });

  it('refuse un gameId invalide (400)', async () => {
    const res = await callApi('PUT', '/me/ratings/abc', { rating: 4 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /me/ratings/:gameId', () => {
  it('supprime la note et le commentaire (204)', async () => {
    vi.mocked(findUserGame).mockResolvedValue({
      rating: new Decimal(4.5),
    } as UserGameRow);

    const res = await callApi('DELETE', '/me/ratings/121');

    expect(res.status).toBe(204);
    expect(updateUserGame).toHaveBeenCalledWith(TEST_USER_ID, 121, {
      rating: null,
      comment: null,
    });
  });

  it("renvoie 404 si le jeu n'est pas évalué", async () => {
    vi.mocked(findUserGame).mockResolvedValue({
      rating: null,
      isFavourite: true,
    } as UserGameRow);

    const res = await callApi('DELETE', '/me/ratings/121');

    expect(res.status).toBe(404);
    expect(updateUserGame).not.toHaveBeenCalled();
  });

  it("renvoie 404 si le jeu n'est pas dans la bibliothèque", async () => {
    vi.mocked(findUserGame).mockResolvedValue(null);

    const res = await callApi('DELETE', '/me/ratings/121');

    expect(res.status).toBe(404);
  });
});
