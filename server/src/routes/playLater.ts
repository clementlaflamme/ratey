import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ensureGameSaved } from '../db/games';
import { findUserGame, listUserGames, updateUserGame } from '../db/userGames';
import type { AppEnv } from '../types';
import { gameIdParam, validate } from '../validation';

/** Routes « À jouer plus tard », montées sur /me/play-later. */
export const playLaterRoutes = new Hono<AppEnv>()
  /** GET /me/play-later → 200 + LibraryGame[] */
  .get('/', async (c) => {
    const userId = c.get('userId');
    const games = await listUserGames(userId, { isToPlayLater: true });
    return c.json(games);
  })

  /**
   * PUT /me/play-later/:gameId
   * → 204 ; 400 si gameId invalide ; 404 si jeu inconnu d'IGDB
   */
  .put('/:gameId', validate('param', gameIdParam), async (c) => {
    const userId = c.get('userId');
    const { gameId } = c.req.valid('param');

    await ensureGameSaved(gameId);
    await updateUserGame(userId, gameId, { isToPlayLater: true });
    return c.body(null, 204);
  })

  /**
   * DELETE /me/play-later/:gameId
   * → 204 ; 400 si gameId invalide ; 404 si le jeu n'est pas dans la liste
   */
  .delete('/:gameId', validate('param', gameIdParam), async (c) => {
    const userId = c.get('userId');
    const { gameId } = c.req.valid('param');

    const row = await findUserGame(userId, gameId);
    if (!row?.isToPlayLater) {
      throw new HTTPException(404, {
        message: 'Ce jeu n’est pas dans « À jouer plus tard »',
      });
    }

    await updateUserGame(userId, gameId, { isToPlayLater: false });
    return c.body(null, 204);
  });
