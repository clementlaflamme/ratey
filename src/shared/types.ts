/** Jeu évalué par l'utilisateur, tel que renvoyé par l'API Ratey. */
export interface RatedGame {
  /** ID IGDB */
  id: number;
  name: string;
  /** image_id de la pochette IGDB */
  coverImageId: string | null;
  /** Note sur 5, au quart de point (ex. 4.25) */
  rating: number;
  /** Date de la dernière modification de l'évaluation (ISO 8601) */
  updatedAt: string;
}

/**
 * Jeu de la bibliothèque de l'utilisateur (ligne users_games + jeu),
 * affiché dans « Vos favoris », « À jouer plus tard » et « Vos évaluations ».
 */
export interface LibraryGame {
  /** ID IGDB */
  id: number;
  name: string;
  /** image_id de la pochette IGDB */
  coverImageId: string | null;
  /** Nom du studio de développement principal */
  studio: string | null;
  /** Année de sortie */
  releaseYear: number | null;
  /** Note sur 5, au quart de point ; null si le jeu n'est pas évalué */
  rating: number | null;
  isFavourite: boolean;
  isToPlayLater: boolean;
  /** Date de la dernière modification de la ligne (ISO 8601) */
  updatedAt: string;
}
