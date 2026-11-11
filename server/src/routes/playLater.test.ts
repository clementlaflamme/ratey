import { HTTPException } from 'hono/http-exception';
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

describe('/me/play-later', () => {
  it('GET renvoie les jeux à jouer plus tard', async () => {
    vi.mocked(listUserGames).mockResolvedValue([]);

    const res = await callApi('GET', '/me/play-later');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(listUserGames).toHaveBeenCalledWith(TEST_USER_ID, {
      isToPlayLater: true,
    });
  });

  it('PUT ajoute le jeu (204)', async () => {
    const res = await callApi('PUT', '/me/play-later/121');

    expect(res.status).toBe(204);
    expect(ensureGameSaved).toHaveBeenCalledWith(121);
    expect(updateUserGame).toHaveBeenCalledWith(TEST_USER_ID, 121, {
      isToPlayLater: true,
    });
  });

  it('PUT refuse un gameId invalide (400)', async () => {
    for (const id of ['abc', '-3', '1.5']) {
      const res = await callApi('PUT', `/me/play-later/${id}`);
      expect(res.status).toBe(400);
    }
    expect(updateUserGame).not.toHaveBeenCalled();
  });

  it("PUT renvoie 404 si le jeu n'existe pas sur IGDB", async () => {
    vi.mocked(ensureGameSaved).mockRejectedValue(
      new HTTPException(404, { message: 'Jeu introuvable' }),
    );

    const res = await callApi('PUT', '/me/play-later/999999999');

    expect(res.status).toBe(404);
    expect(updateUserGame).not.toHaveBeenCalled();
  });

  it('DELETE retire le jeu (204)', async () => {
    vi.mocked(findUserGame).mockResolvedValue({
      isToPlayLater: true,
    } as UserGameRow);

    const res = await callApi('DELETE', '/me/play-later/121');

    expect(res.status).toBe(204);
    expect(updateUserGame).toHaveBeenCalledWith(TEST_USER_ID, 121, {
      isToPlayLater: false,
    });
  });

  it("DELETE renvoie 404 si le jeu n'est pas dans la liste", async () => {
    vi.mocked(findUserGame).mockResolvedValue({
      isToPlayLater: false,
      isFavourite: true,
    } as UserGameRow);

    const res = await callApi('DELETE', '/me/play-later/121');

    expect(res.status).toBe(404);
    expect(updateUserGame).not.toHaveBeenCalled();
  });
});
