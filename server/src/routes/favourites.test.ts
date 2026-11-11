import { HTTPException } from 'hono/http-exception';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureGameSaved } from '../db/games';
import { findUserGame, listUserGames, updateUserGame } from '../db/userGames';
import { callApi, TEST_USER_ID } from '../test/helpers';

/**
 * La base de données est remplacée par des
 * fonctions simulées (vi.fn) : on vérifie seulement que la route les
 * appelle correctement et répond avec le bon statut.
 */
vi.mock('../db/userGames', () => ({
  listUserGames: vi.fn(),
  findUserGame: vi.fn(),
  updateUserGame: vi.fn(),
}));
vi.mock('../db/games', () => ({ ensureGameSaved: vi.fn() }));

const minecraft = {
  id: 121,
  name: 'Minecraft',
  coverImageId: 'co49x5',
  studio: 'Mojang Studios',
  releaseYear: 2011,
  rating: 4.75,
  isFavourite: true,
  isToPlayLater: false,
  updatedAt: '2026-10-02T18:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /me/favourites', () => {
  it("renvoie les favoris de l'utilisateur du jeton", async () => {
    vi.mocked(listUserGames).mockResolvedValue([minecraft]);

    const res = await callApi('GET', '/me/favourites');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([minecraft]);
    expect(listUserGames).toHaveBeenCalledWith(TEST_USER_ID, {
      isFavourite: true,
    });
  });
});

describe('PUT /me/favourites/:gameId', () => {
  it('enregistre le jeu puis l’ajoute aux favoris (204)', async () => {
    const res = await callApi('PUT', '/me/favourites/121');

    expect(res.status).toBe(204);
    expect(ensureGameSaved).toHaveBeenCalledWith(121);
    expect(updateUserGame).toHaveBeenCalledWith(TEST_USER_ID, 121, {
      isFavourite: true,
    });
  });

  it('refuse un gameId invalide (400)', async () => {
    const res = await callApi('PUT', '/me/favourites/abc');

    expect(res.status).toBe(400);
    expect(updateUserGame).not.toHaveBeenCalled();
  });

  it("renvoie 404 si le jeu n'existe pas sur IGDB", async () => {
    vi.mocked(ensureGameSaved).mockRejectedValue(
      new HTTPException(404, { message: 'Jeu introuvable' }),
    );

    const res = await callApi('PUT', '/me/favourites/999999999');

    expect(res.status).toBe(404);
    expect(updateUserGame).not.toHaveBeenCalled();
  });
});

describe('DELETE /me/favourites/:gameId', () => {
  it('retire le jeu des favoris (204)', async () => {
    vi.mocked(findUserGame).mockResolvedValue({
      isFavourite: true,
    } as Awaited<ReturnType<typeof findUserGame>>);

    const res = await callApi('DELETE', '/me/favourites/121');

    expect(res.status).toBe(204);
    expect(updateUserGame).toHaveBeenCalledWith(TEST_USER_ID, 121, {
      isFavourite: false,
    });
  });

  it("renvoie 404 si le jeu n'est pas dans les favoris", async () => {
    vi.mocked(findUserGame).mockResolvedValue(null);

    const res = await callApi('DELETE', '/me/favourites/121');

    expect(res.status).toBe(404);
    expect(updateUserGame).not.toHaveBeenCalled();
  });
});
