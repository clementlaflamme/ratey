import { app } from '../app';
import { TEST_TOKEN } from './constants';

export { TEST_TOKEN, TEST_USER_ID } from './constants';

/**
 * Appelle l'API en mémoire (sans serveur), en tant qu'utilisateur connecté.
 *
 *   const res = await callApi('PUT', '/me/favourites/121');
 *   expect(res.status).toBe(204);
 */
export function callApi(method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: {
      Authorization: `Bearer ${TEST_TOKEN}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Réponse JSON simulée, pour remplacer `fetch` dans les tests. */
export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
