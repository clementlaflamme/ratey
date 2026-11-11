import { describe, expect, it } from 'vitest';
import { app } from './app';
import { TEST_TOKEN } from './test/helpers';

describe('app', () => {
  it('GET /health répond sans authentification', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('refuse une route protégée sans jeton (401)', async () => {
    const res = await app.request('/me/favourites');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: 'Jeton d’authentification manquant',
    });
  });

  it('refuse un jeton invalide (401)', async () => {
    const res = await app.request('/me/favourites', {
      headers: { Authorization: 'Bearer faux-jeton' },
    });
    expect(res.status).toBe(401);
  });

  it('renvoie 404 en JSON pour une route inconnue', async () => {
    const res = await app.request('/inconnue', {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Route introuvable' });
  });

  it("autorise l'origine de l'app (CORS)", async () => {
    const res = await app.request('/health', {
      headers: { Origin: 'http://localhost:5173' },
    });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:5173',
    );
  });

  it('bloque une origine inconnue (CORS)', async () => {
    const res = await app.request('/health', {
      headers: { Origin: 'https://site-pirate.example' },
    });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
