/**
 * Forme des données renvoyées par IGDB (seulement les champs utilisés).
 * Doc : https://api-docs.igdb.com/#game
 *
 * Avec Apicalypse, les champs « développés » (ex. `cover.image_id`)
 * arrivent sous forme d'objets imbriqués. Un champ absent sur IGDB
 * est tout simplement absent de la réponse (d'où les `?`).
 */
export interface IgdbGame {
  id: number;
  name: string;
  /** `fields cover.image_id` */
  cover?: { image_id: string };
  /** Date en secondes depuis le 1er janvier 1970 (UTC) */
  first_release_date?: number;
  /** Nombre total d'évaluations (joueurs + critiques) : sert de popularité */
  total_rating_count?: number;
  /** `fields genres.name` */
  genres?: { id: number; name: string }[];
  /** `fields platforms.name` */
  platforms?: { id: number; name: string }[];
  /** `fields involved_companies.company.name, involved_companies.developer` */
  involved_companies?: IgdbInvolvedCompany[];
}

export interface IgdbInvolvedCompany {
  company: { id: number; name: string };
  /** true si cette compagnie a développé le jeu */
  developer: boolean;
}

/** Réponse de https://id.twitch.tv/oauth2/token */
export interface TwitchTokenResponse {
  access_token: string;
  /** Durée de validité, en secondes */
  expires_in: number;
  token_type: string;
}
