/**
 * Types Hono de l'application.
 * `Variables` = ce que les middlewares rangent dans le contexte (c.set / c.get).
 */
export interface AppEnv {
  Variables: {
    /** ID Clerk de l'utilisateur connecté, posé par le middleware requireAuth */
    userId: string;
  };
}
