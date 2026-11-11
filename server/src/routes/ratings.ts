import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { COMMENT_MAX_LENGTH } from '../../../src/shared/ratingForm';
import { MAX_RATING } from '../../../src/shared/stars';
import { ensureGameSaved } from '../db/games';
import { findUserGame, listUserGames, updateUserGame } from '../db/userGames';
import type { AppEnv } from '../types';
import { gameIdParam, validate } from '../validation';

/**
 * Corps de PUT /me/ratings/:gameId, par exemple :
 *   { "rating": 4.25, "comment": "Super jeu !" }
 * - note de 0 à 5 inclus, au quart de point
 * - commentaire facultatif ; vide → null
 */
export const ratingBody = z.object({
  rating: z.number().min(0).max(MAX_RATING).multipleOf(0.25),
  comment: z
    .string()
    .trim()
    .max(COMMENT_MAX_LENGTH)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .optional(),
});

/** Routes des évaluations, montées sur /me/ratings. */
export const ratingsRoutes = new Hono<AppEnv>()
  /** GET /me/ratings → 200 + jeux évalués (LibraryGame[]) */
  .get('/', async (c) => {
    const userId = c.get('userId');
    const games = await listUserGames(userId, { rating: { not: null } });
    return c.json(games);
  })

  /**
   * PUT /me/ratings/:gameId : crée ou modifie l'évaluation.
   * → 204 ; 400 si gameId ou corps invalide ; 404 si jeu inconnu d'IGDB
   */
  .put(
    '/:gameId',
    validate('param', gameIdParam),
    validate('json', ratingBody),
    async (c) => {
      const userId = c.get('userId');
      const { gameId } = c.req.valid('param');
      const { rating, comment } = c.req.valid('json');

      await ensureGameSaved(gameId);
      await updateUserGame(userId, gameId, {
        rating,
        comment: comment ?? null,
      });
      return c.body(null, 204);
    },
  )

  /**
   * DELETE /me/ratings/:gameId : supprime la note ET le commentaire.
   * → 204 ; 400 si gameId invalide ; 404 si le jeu n'est pas évalué
   */
  .delete('/:gameId', validate('param', gameIdParam), async (c) => {
    const userId = c.get('userId');
    const { gameId } = c.req.valid('param');

    const row = await findUserGame(userId, gameId);
    if (row?.rating == null) {
      throw new HTTPException(404, {
        message: 'Vous n’avez pas évalué ce jeu',
      });
    }

    await updateUserGame(userId, gameId, { rating: null, comment: null });
    return c.body(null, 204);
  });
