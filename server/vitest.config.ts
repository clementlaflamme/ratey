import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    // Fausses valeurs : les tests ne contactent jamais Neon, Clerk ni Twitch.
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      CLERK_SECRET_KEY: 'sk_test_fake',
      TWITCH_CLIENT_ID: 'test-client-id',
      TWITCH_CLIENT_SECRET: 'test-client-secret',
      CORS_ORIGINS: 'http://localhost:5173',
    },
  },
});
