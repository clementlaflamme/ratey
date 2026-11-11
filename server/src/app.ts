import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { getEnv } from './env';
import { requireAuth } from './middleware/auth';
import { favouritesRoutes } from './routes/favourites';
import { gamesRoutes } from './routes/games';
import { playLaterRoutes } from './routes/playLater';
import { ratingsRoutes } from './routes/ratings';
import type { AppEnv } from './types';

/**
 * Application Hono : middlewares, routes et gestion des erreurs.
 * Utilisée par le serveur local (index.ts) et par les tests (app.request()).
 */
export const app = new Hono<AppEnv>();

// CORS : autorise l'app (origines de CORS_ORIGINS) à appeler l'API.
app.use(
  '*',
  cors({
    origin: (origin) =>
      getEnv().CORS_ORIGINS.includes(origin) ? origin : null,
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'PUT', 'DELETE'],
  }),
);

// Route publique : vérifier que l'API répond.
app.get('/health', (c) => c.json({ status: 'ok' }));

// Toutes les routes suivantes exigent un utilisateur connecté.
app.use('/me/*', requireAuth);
app.use('/games/*', requireAuth);

app.route('/me/favourites', favouritesRoutes);
app.route('/me/play-later', playLaterRoutes);
app.route('/me/ratings', ratingsRoutes);
app.route('/games', gamesRoutes);

app.notFound((c) => c.json({ error: 'Route introuvable' }, 404));

// Les HTTPException deviennent { error: message } avec leur statut ;
// toute autre erreur est un bogue : 500, détails seulement dans la console.
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }
  console.error(error);
  return c.json({ error: 'Erreur interne du serveur' }, 500);
});
