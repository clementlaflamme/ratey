import { verifyToken } from '@clerk/backend';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { getEnv } from '../env';
import type { AppEnv } from '../types';

/**
 * Vérifie le jeton de session Clerk envoyé par l'app :
 *   Authorization: Bearer <jeton>
 *
 * Si le jeton est valide, l'ID de l'utilisateur est rangé dans le contexte :
 * les routes le lisent avec `c.get('userId')`.
 *
 * ⚠️ Règle de sécurité : le userId vient TOUJOURS du jeton, jamais du client
 * (ni de l'URL, ni du corps de la requête).
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    throw new HTTPException(401, {
      message: 'Jeton d’authentification manquant',
    });
  }

  let userId: string;
  try {
    const payload = await verifyToken(token, {
      secretKey: getEnv().CLERK_SECRET_KEY,
    });
    userId = payload.sub;
  } catch {
    throw new HTTPException(401, { message: 'Jeton invalide ou expiré' });
  }

  c.set('userId', userId);
  await next();
});
