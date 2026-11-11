import { serve } from '@hono/node-server';
import { app } from './app';
import { getEnv } from './env';

/** Serveur local : `npm run dev` (redémarre à chaque modification). */
const { PORT } = getEnv();

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`API Ratey : http://localhost:${info.port}`);
});
