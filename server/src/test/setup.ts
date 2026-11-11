import { vi } from 'vitest';
import { TEST_TOKEN, TEST_USER_ID } from './constants';

// Clerk simulé : seul TEST_TOKEN est accepté, il correspond à TEST_USER_ID.
vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn(async (token: string) => {
    if (token !== TEST_TOKEN) throw new Error('Jeton invalide');
    return { sub: TEST_USER_ID };
  }),
}));
