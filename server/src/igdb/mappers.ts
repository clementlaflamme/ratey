import type { GameDetails, GameSummary } from '../../../src/shared/types';
import type { IgdbGame, IgdbInvolvedCompany } from './types';

/**
 * Conversion des données IGDB vers les types partagés avec l'app.
 * Fonctions pures (pas de réseau, pas de base).
 */

/**
 * Le studio de développement principal : la 1re compagnie avec
 * `developer: true`, ou null s'il n'y en a pas.
 */
export function findDeveloper(
  companies: IgdbInvolvedCompany[] | undefined,
): IgdbInvolvedCompany['company'] | null {
  return companies?.find((company) => company.developer)?.company ?? null;
}

/**
 * Date IGDB (secondes depuis 1970, UTC) → « AAAA-MM-JJ ».
 * Ex. : 1321574400 → '2011-11-18'
 */
export function toIsoDate(seconds: number | undefined): string | null {
  if (seconds === undefined) return null;
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

/** Jeu IGDB → résultat de recherche. */
export function toGameSummary(game: IgdbGame): GameSummary {
  const releaseDate = toIsoDate(game.first_release_date);
  return {
    id: game.id,
    name: game.name,
    coverImageId: game.cover?.image_id ?? null,
    studio: findDeveloper(game.involved_companies)?.name ?? null,
    releaseYear: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
  };
}

/** Jeu IGDB → fiche complète (genres et plateformes : [] si absents). */
export function toGameDetails(game: IgdbGame): GameDetails {
  return {
    id: game.id,
    name: game.name,
    coverImageId: game.cover?.image_id ?? null,
    studio: findDeveloper(game.involved_companies)?.name ?? null,
    releaseDate: toIsoDate(game.first_release_date),
    genres: game.genres?.map((genre) => genre.name) ?? [],
    platforms: game.platforms?.map(({ id, name }) => ({ id, name })) ?? [],
  };
}
