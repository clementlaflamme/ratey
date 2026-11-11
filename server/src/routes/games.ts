import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { findSavedGame } from '../db/games';
import { findUserGame } from '../db/userGames';
import { fetchIgdbGame, searchGames } from '../igdb/games';
import { toGameDetails } from '../igdb/mappers';
import type { AppEnv } from '../types';
import { gameIdParam, validate } from '../validation';

/** Paramètres de GET /games/search?q=... : 1 à 100 caractères. */
export const searchQuery = z.object({
  q: z.string().trim().min(1).max(100),
});

/** Routes des jeux, montées sur /games. */
export const gamesRoutes = new Hono<AppEnv>()
  /**
   * GET /games/search?q=zelda
   * → 200 + GameSummary[] ; 400 si q manque ou est vide
   */
  .get('/search', validate('query', searchQuery), async (c) => {
    const { q } = c.req.valid('query');
    return c.json(await searchGames(q));
  })

  /**
   * GET /games/:gameId
   * → 200 + { game: GameDetails, entry: GameEntry | null }
   *   404 si le jeu n'existe ni dans la base, ni sur IGDB
   * Le jeu est lu dans la base, sinon sur IGDB (sans le sauvegarder).
   */
  .get('/:gameId', validate('param', gameIdParam), async (c) => {
    const userId = c.get('userId');
    const { gameId } = c.req.valid('param');

    let game = await findSavedGame(gameId);
    if (!game) {
      const igdbGame = await fetchIgdbGame(gameId);
      if (!igdbGame) {
        throw new HTTPException(404, { message: 'Ce jeu n’existe pas' });
      }
      game = toGameDetails(igdbGame);
    }

    const row = await findUserGame(userId, gameId);
    const entry = row && {
      // Decimal Prisma → nombre (JSON ne connaît pas Decimal)
      rating: row.rating === null ? null : Number(row.rating),
      comment: row.comment,
      isFavourite: row.isFavourite,
      isToPlayLater: row.isToPlayLater,
    };

    return c.json({ game, entry });
  });
