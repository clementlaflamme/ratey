import { getEnv } from '../env';
import type { TwitchTokenResponse } from './types';

/**
 * Jeton d'accès Twitch, nécessaire pour appeler IGDB (flux « client
 * credentials »). Il vit environ 60 jours : on le garde en mémoire avec sa
 * date d'expiration, sans jamais l'écrire ni le renvoyer au client.
 *
 * Doc : https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow
 */

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

/** Marge avant l'expiration : on renouvelle 1 minute avant. */
const EXPIRY_MARGIN_MS = 60_000;

let cached: { token: string; expiresAt: number } | null = null;

/** Renvoie un jeton valide : celui du cache, ou un nouveau. */
export async function getTwitchToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - EXPIRY_MARGIN_MS) {
    return cached.token;
  }

  const env = getEnv();
  const params = new URLSearchParams({
    client_id: env.TWITCH_CLIENT_ID,
    client_secret: env.TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials',
  });

  const response = await fetch(TOKEN_URL, { method: 'POST', body: params });
  if (!response.ok) {
    throw new Error(`Twitch a répondu ${response.status}`);
  }

  const data = (await response.json()) as TwitchTokenResponse;
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cached.token;
}

/** Vide le cache (utilisé par les tests). */
export function clearTwitchTokenCache(): void {
  cached = null;
}
