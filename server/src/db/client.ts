import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../generated/prisma/client';
import { getEnv } from '../env';

/**
 * Client Prisma unique, connecté à Neon.
 * Prisma 7 passe par un « adaptateur » : ici celui de Neon (WebSocket),
 * qui permet aussi les transactions.
 */
export const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: getEnv().DATABASE_URL }),
});
