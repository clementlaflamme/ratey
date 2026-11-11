import type { LibraryGame } from '../../../src/shared/types';
import type { Prisma } from '../generated/prisma/client';
import { prisma } from './client';

/**
 * Accès à la table users_games (relation utilisateur–jeu).
 */

/** Champs à lire pour afficher un jeu dans une liste (favoris, etc.). */
const librarySelect = {
  rating: true,
  isFavourite: true,
  isToPlayLater: true,
  updatedAt: true,
  game: {
    select: {
      id: true,
      name: true,
      coverImageId: true,
      releaseDate: true,
      developer: { select: { name: true } },
    },
  },
} satisfies Prisma.UserGameSelect;

/** Type exact d'une ligne lue avec `librarySelect` (déduit par Prisma). */
type LibraryRow = Prisma.UserGameGetPayload<{ select: typeof librarySelect }>;

/**
 * Convertit une ligne Prisma vers le type partagé avec l'app.
 * - `rating` est un Decimal Prisma : JSON ne le connaît pas → `Number(...)`.
 * - Les dates deviennent du texte ISO 8601.
 */
export function toLibraryGame(row: LibraryRow): LibraryGame {
  return {
    id: row.game.id,
    name: row.game.name,
    coverImageId: row.game.coverImageId,
    studio: row.game.developer?.name ?? null,
    releaseYear: row.game.releaseDate?.getUTCFullYear() ?? null,
    rating: row.rating === null ? null : Number(row.rating),
    isFavourite: row.isFavourite,
    isToPlayLater: row.isToPlayLater,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Jeux de l'utilisateur qui respectent le filtre `where`,
 * du plus récemment modifié au plus ancien.
 *
 *   listUserGames(userId, { isFavourite: true })
 */
export async function listUserGames(
  userId: string,
  where: Prisma.UserGameWhereInput,
): Promise<LibraryGame[]> {
  const rows = await prisma.userGame.findMany({
    where: { ...where, userId },
    select: librarySelect,
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(toLibraryGame);
}

/** La ligne users_games de ce jeu, ou null si elle n'existe pas. */
export function findUserGame(userId: string, gameId: number) {
  return prisma.userGame.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
}

/** Champs modifiables d'une ligne users_games. */
export interface UserGameChanges {
  isFavourite?: boolean;
  isToPlayLater?: boolean;
  /** Note sur 5 ; null pour la supprimer */
  rating?: number | null;
  comment?: string | null;
}

/**
 * Crée ou modifie la ligne (userId, gameId), puis applique la règle métier :
 * une ligne sans favori, sans « à jouer » et sans note est supprimée.
 *
 * ⚠️ Le jeu doit déjà exister dans la table games (clé étrangère).
 *
 * Le tout se fait dans une transaction : si une étape échoue,
 * rien n'est enregistré.
 */
export async function updateUserGame(
  userId: string,
  gameId: number,
  changes: UserGameChanges,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const row = await tx.userGame.upsert({
      where: { userId_gameId: { userId, gameId } },
      // Création : on relie l'utilisateur (créé au besoin) et le jeu.
      create: {
        ...changes,
        user: {
          connectOrCreate: { where: { id: userId }, create: { id: userId } },
        },
        game: { connect: { id: gameId } },
      },
      update: changes,
    });

    const empty = !row.isFavourite && !row.isToPlayLater && row.rating === null;
    if (empty) {
      await tx.userGame.delete({
        where: { userId_gameId: { userId, gameId } },
      });
    }
  });
}
