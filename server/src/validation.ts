import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

/**
 * Valide une partie de la requête avec un schéma zod.
 * En cas d'échec : réponse 400 avec un message lisible.
 *
 *   route.put('/:gameId', validate('param', gameIdParam), (c) => {
 *     const { gameId } = c.req.valid('param'); // typé et déjà converti
 *   })
 *
 * Cibles possibles : 'param' (URL /:x), 'query' (?x=), 'json' (corps).
 */
export function validate<
  Target extends 'param' | 'query' | 'json',
  Schema extends z.ZodType,
>(target: Target, schema: Schema) {
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      const details = result.error.issues
        .map((issue) => `${issue.path.join('.') || target} : ${issue.message}`)
        .join(' ; ');
      throw new HTTPException(400, {
        message: `Requête invalide (${details})`,
      });
    }
  });
}

/** Paramètre d'URL `:gameId` : un ID IGDB (entier positif). */
export const gameIdParam = z.object({
  // coerce : l'URL contient du texte (« 121 ») ; zod le convertit en nombre.
  gameId: z.coerce.number().int().positive(),
});
