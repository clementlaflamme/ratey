import { z } from 'zod';

/**
 * Variables d'environnement de l'API, vérifiées par zod.
 * En local, `npm run dev` les lit dans server/.env (option --env-file).
 * Sur Vercel, elles se configurent dans le tableau de bord du projet.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  TWITCH_CLIENT_ID: z.string().min(1),
  TWITCH_CLIENT_SECRET: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | undefined;

/** Lit les variables une seule fois ; plante clairement s'il en manque une. */
export function getEnv(): Env {
  if (!env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const missing = result.error.issues.map((issue) => issue.path.join('.'));
      throw new Error(
        `Variables d'environnement manquantes ou invalides : ${missing.join(', ')}. Voir server/.env.example.`,
      );
    }
    env = result.data;
  }
  return env;
}
