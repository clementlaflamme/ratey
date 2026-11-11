import { HTTPException } from 'hono/http-exception';
import type { GameDetails } from '../../../src/shared/types';
import { fetchIgdbGame } from '../igdb/games';
import { findDeveloper } from '../igdb/mappers';
import { prisma } from './client';

/** Accès aux tables games, genres, platforms et companies (copie d'IGDB). */

/**
 * S'assure que le jeu existe dans la table games, à appeler avant d'y faire
 * référence depuis users_games (clé étrangère).
 * - déjà en base : ne fait rien ;
 * - sinon : le copie depuis IGDB avec son studio, ses genres et ses
 *   plateformes, dans une transaction ;
 * - inconnu d'IGDB : HTTPException 404.
 */
export async function ensureGameSaved(gameId: number): Promise<void> {
  const saved = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true },
  });
  if (saved) return;

  const game = await fetchIgdbGame(gameId);
  if (!game) {
    throw new HTTPException(404, { message: 'Ce jeu n’existe pas' });
  }

  const developer = findDeveloper(game.involved_companies);
  const genres = game.genres ?? [];
  const platforms = game.platforms ?? [];

  await prisma.$transaction(async (tx) => {
    // upsert : ne plante pas si le studio, le genre ou la plateforme
    // existe déjà (partagé avec un autre jeu).
    if (developer) {
      await tx.company.upsert({
        where: { id: developer.id },
        create: { id: developer.id, name: developer.name },
        update: { name: developer.name },
      });
    }
    for (const { id, name } of genres) {
      await tx.genre.upsert({
        where: { id },
        create: { id, name },
        update: { name },
      });
    }
    for (const { id, name } of platforms) {
      await tx.platform.upsert({
        where: { id },
        create: { id, name },
        update: { name },
      });
    }

    // upsert aussi pour le jeu : deux requêtes simultanées ne plantent pas.
    await tx.game.upsert({
      where: { id: game.id },
      update: {},
      create: {
        id: game.id,
        name: game.name,
        coverImageId: game.cover?.image_id ?? null,
        releaseDate:
          game.first_release_date === undefined
            ? null
            : new Date(game.first_release_date * 1000),
        developerId: developer?.id ?? null,
        genres: { create: genres.map(({ id }) => ({ genreId: id })) },
        platforms: { create: platforms.map(({ id }) => ({ platformId: id })) },
      },
    });
  });
}

/** Fiche d'un jeu lue dans la base, ou null s'il n'y est pas. */
export async function findSavedGame(
  gameId: number,
): Promise<GameDetails | null> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      developer: true,
      genres: { include: { genre: true } },
      platforms: { include: { platform: true } },
    },
  });
  if (!game) return null;

  return {
    id: game.id,
    name: game.name,
    coverImageId: game.coverImageId,
    studio: game.developer?.name ?? null,
    releaseDate: game.releaseDate?.toISOString().slice(0, 10) ?? null,
    genres: game.genres.map(({ genre }) => genre.name),
    platforms: game.platforms.map(({ platform }) => ({
      id: platform.id,
      name: platform.name,
    })),
  };
}
