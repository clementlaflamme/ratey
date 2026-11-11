import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { jsonResponse } from '../test/helpers';
import { clearTwitchTokenCache, getTwitchToken } from './twitchToken';

/**
 * `fetch` est remplacé par une fausse fonction : aucun appel réel à Twitch.
 */
const fetchMock = vi.fn();

/** Paramètres envoyés à Twitch, dans l'URL ou dans le corps (au choix). */
function sentParams(call: unknown[]) {
  const [input, init] = call as [string | URL, RequestInit | undefined];
  const url = new URL(input);
  const params = new URLSearchParams(url.search);
  if (init?.body) {
    new URLSearchParams(String(init.body)).forEach((value, key) =>
      params.set(key, value),
    );
  }
  return { url, init, params };
}

beforeEach(() => {
  clearTwitchTokenCache();
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () =>
    jsonResponse({
      access_token: 'jeton-1',
      expires_in: 3600,
      token_type: 'bearer',
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-11T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('getTwitchToken', () => {
  it('demande un jeton à Twitch (client credentials)', async () => {
    const token = await getTwitchToken();

    expect(token).toBe('jeton-1');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const { url, init, params } = sentParams(fetchMock.mock.calls[0]);
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://id.twitch.tv/oauth2/token',
    );
    expect(init?.method).toBe('POST');
    expect(params.get('client_id')).toBe('test-client-id');
    expect(params.get('client_secret')).toBe('test-client-secret');
    expect(params.get('grant_type')).toBe('client_credentials');
  });

  it('réutilise le jeton en mémoire tant qu’il est valide', async () => {
    await getTwitchToken();
    vi.advanceTimersByTime(30 * 60 * 1000); // 30 minutes plus tard
    const token = await getTwitchToken();

    expect(token).toBe('jeton-1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('redemande un jeton quand il a expiré', async () => {
    await getTwitchToken();
    fetchMock.mockImplementation(async () =>
      jsonResponse({
        access_token: 'jeton-2',
        expires_in: 3600,
        token_type: 'bearer',
      }),
    );
    vi.advanceTimersByTime(3600 * 1000); // 1 heure plus tard

    expect(await getTwitchToken()).toBe('jeton-2');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('lance une erreur si Twitch refuse la demande', async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ message: 'invalid client secret' }, 403),
    );

    await expect(getTwitchToken()).rejects.toThrow();
  });
});
