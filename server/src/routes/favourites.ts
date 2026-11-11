import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ensureGameSaved } from '../db/games';
import { findUserGame, listUserGames, updateUserGame } from '../db/userGames';
import type { AppEnv } from '../types';
import { gameIdParam, validate } from '../validation';

/**
 * Routes des favoris, montées sur /me/favourites (voir app.ts).
 *
 * Toutes ces routes passent d'abord par le middleware requireAuth :
 * `c.get('userId')` contient donc toujours l'utilisateur connecté.
 */
export const favouritesRoutes = new Hono<AppEnv>()
  /**
   * GET /me/favourites
   * → 200 + liste des jeux favoris (LibraryGame[])
   */
  .get('/', async (c) => {
    const userId = c.get('userId');
    const games = await listUserGames(userId, { isFavourite: true });
    return c.json(games);
  })

  /**
   * PUT /me/favourites/:gameId
   * Ajoute le jeu aux favoris. PUT est « idempotent » : l'appeler deux fois
   * donne le même résultat qu'une seule fois.
   * → 204 (succès, pas de contenu) ; 400 si gameId invalide ; 404 si jeu inconnu d'IGDB
   */
  .put('/:gameId', validate('param', gameIdParam), async (c) => {
    const userId = c.get('userId');
    // Validé et converti en nombre par zod (voir validation.ts).
    const { gameId } = c.req.valid('param');

    // Le jeu doit exister dans la table games avant d'y faire référence.
    await ensureGameSaved(gameId);
    await updateUserGame(userId, gameId, { isFavourite: true });

    return c.body(null, 204);
  })

  /**
   * DELETE /me/favourites/:gameId
   * Retire le jeu des favoris (la ligne disparaît si elle devient vide).
   * → 204 ; 400 si gameId invalide ; 404 si le jeu n'est pas dans les favoris
   */
  .delete('/:gameId', validate('param', gameIdParam), async (c) => {
    const userId = c.get('userId');
    const { gameId } = c.req.valid('param');

    const row = await findUserGame(userId, gameId);
    if (!row?.isFavourite) {
      // Lancer une HTTPException : le gestionnaire d'erreurs (app.ts)
      // la transforme en réponse JSON { error: message }.
      throw new HTTPException(404, {
        message: 'Ce jeu n’est pas dans vos favoris',
      });
    }

    await updateUserGame(userId, gameId, { isFavourite: false });
    return c.body(null, 204);
  });
