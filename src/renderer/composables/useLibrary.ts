import { computed, ref } from 'vue';
import { releaseYear } from '../../shared/dates';
import type {
  GameDetails,
  LibraryGame,
  UserGameEntry,
} from '../../shared/types';

/**
 * Données fictives, en attendant les routes de l'API.
 * MOCK_GAMES imite la table games, MOCK_ENTRIES la table users_games.
 */
const MOCK_GAMES: GameDetails[] = [
  {
    id: 121,
    name: 'Minecraft',
    coverImageId: 'co49x5',
    studio: 'Mojang Studios',
    releaseDate: '2011-11-18',
    genres: ['Simulation', 'Aventure'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 14, name: 'Mac' },
      { id: 48, name: 'PlayStation 4' },
      { id: 49, name: 'Xbox One' },
      { id: 130, name: 'Nintendo Switch' },
      { id: 34, name: 'Android' },
      { id: 39, name: 'iOS' },
    ],
  },
  {
    id: 1942,
    name: 'The Witcher 3: Wild Hunt',
    coverImageId: 'co1wyy',
    studio: 'CD Projekt RED',
    releaseDate: '2015-05-19',
    genres: ['Jeu de rôle', 'Aventure'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 48, name: 'PlayStation 4' },
      { id: 167, name: 'PlayStation 5' },
      { id: 49, name: 'Xbox One' },
      { id: 169, name: 'Xbox Series X|S' },
      { id: 130, name: 'Nintendo Switch' },
    ],
  },
  {
    id: 113112,
    name: 'Hades',
    coverImageId: 'co39vc',
    studio: 'Supergiant Games',
    releaseDate: '2020-09-17',
    genres: ['Action', 'Indépendant', 'Jeu de rôle'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 130, name: 'Nintendo Switch' },
      { id: 48, name: 'PlayStation 4' },
      { id: 49, name: 'Xbox One' },
      { id: 39, name: 'iOS' },
    ],
  },
  {
    id: 26226,
    name: 'Celeste',
    coverImageId: 'co3byy',
    studio: 'Maddy Makes Games',
    releaseDate: '2018-01-25',
    genres: ['Plateforme', 'Indépendant'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 130, name: 'Nintendo Switch' },
      { id: 48, name: 'PlayStation 4' },
      { id: 49, name: 'Xbox One' },
    ],
  },
  {
    id: 11133,
    name: 'Outer Wilds',
    coverImageId: 'co65ac',
    studio: 'Mobius Digital',
    releaseDate: '2019-05-28',
    genres: ['Aventure', 'Casse-tête', 'Indépendant'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 48, name: 'PlayStation 4' },
      { id: 49, name: 'Xbox One' },
      { id: 130, name: 'Nintendo Switch' },
    ],
  },
  {
    id: 1020,
    name: 'Grand Theft Auto V',
    coverImageId: 'co2lbd',
    studio: 'Rockstar North',
    releaseDate: '2013-09-17',
    genres: ['Action', 'Course'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 9, name: 'PlayStation 3' },
      { id: 48, name: 'PlayStation 4' },
      { id: 167, name: 'PlayStation 5' },
      { id: 12, name: 'Xbox 360' },
      { id: 49, name: 'Xbox One' },
      { id: 169, name: 'Xbox Series X|S' },
    ],
  },
  {
    id: 103329,
    name: 'Control',
    coverImageId: 'co2evj',
    studio: 'Remedy Entertainment',
    releaseDate: '2019-08-27',
    genres: ['Tir', 'Aventure'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 48, name: 'PlayStation 4' },
      { id: 49, name: 'Xbox One' },
    ],
  },
  {
    id: 119133,
    name: 'Elden Ring',
    coverImageId: null,
    studio: 'FromSoftware',
    releaseDate: '2022-02-25',
    genres: ['Jeu de rôle', 'Aventure'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 167, name: 'PlayStation 5' },
      { id: 169, name: 'Xbox Series X|S' },
    ],
  },
  {
    id: 14593,
    name: 'Hollow Knight',
    coverImageId: null,
    studio: 'Team Cherry',
    releaseDate: '2017-02-24',
    genres: ['Plateforme', 'Indépendant'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 14, name: 'Mac' },
      { id: 3, name: 'Linux' },
      { id: 130, name: 'Nintendo Switch' },
    ],
  },
  {
    id: 119171,
    name: 'Disco Elysium',
    coverImageId: null,
    studio: 'ZA/UM',
    releaseDate: '2019-10-15',
    genres: ['Jeu de rôle'],
    platforms: [
      { id: 6, name: 'PC (Windows)' },
      { id: 170, name: 'Google Stadia' },
    ],
  },
  {
    id: 999001,
    name: 'Projet sans studio',
    coverImageId: null,
    studio: null,
    releaseDate: '2026-06-01',
    genres: [],
    platforms: [],
  },
];

const entry = (
  gameId: number,
  fields: Partial<UserGameEntry> & Pick<UserGameEntry, 'updatedAt'>,
): UserGameEntry => ({
  gameId,
  rating: null,
  comment: null,
  isFavourite: false,
  isToPlayLater: false,
  ...fields,
});

const MOCK_ENTRIES: UserGameEntry[] = [
  entry(121, {
    rating: 4.75,
    comment:
      'Facilement mon jeu préféré ! Les possibilités sont infinies et ma créativité est constamment suscitée !',
    isFavourite: true,
    updatedAt: '2026-10-02T18:00:00Z',
  }),
  entry(1942, {
    rating: 4.25,
    isFavourite: true,
    updatedAt: '2026-11-03T20:15:00Z',
  }),
  entry(113112, {
    rating: 4.5,
    isFavourite: true,
    updatedAt: '2026-09-14T12:00:00Z',
  }),
  entry(26226, { rating: 4.5, updatedAt: '2026-08-21T09:30:00Z' }),
  entry(11133, {
    rating: 5,
    isFavourite: true,
    updatedAt: '2026-07-01T16:45:00Z',
  }),
  entry(1020, { rating: 3.75, updatedAt: '2026-11-01T10:00:00Z' }),
  entry(103329, { rating: 4, updatedAt: '2026-11-05T22:10:00Z' }),
  entry(119133, {
    isFavourite: true,
    isToPlayLater: true,
    updatedAt: '2026-11-08T19:00:00Z',
  }),
  entry(14593, { isToPlayLater: true, updatedAt: '2026-10-20T14:00:00Z' }),
  entry(119171, { isToPlayLater: true, updatedAt: '2026-09-30T08:00:00Z' }),
  entry(999001, { isToPlayLater: true, updatedAt: '2026-08-02T08:00:00Z' }),
];

// État partagé : un changement sur une page se voit sur toutes les autres.
const games = new Map(MOCK_GAMES.map((game) => [game.id, game]));
const entries = ref<UserGameEntry[]>(MOCK_ENTRIES);

/** Jeux de la bibliothèque (jointure jeux + lignes de l'utilisateur). */
const library = computed(() =>
  entries.value.flatMap((row): LibraryGame[] => {
    const game = games.get(row.gameId);
    if (!game) return [];
    return [
      {
        id: game.id,
        name: game.name,
        coverImageId: game.coverImageId,
        studio: game.studio,
        releaseYear: releaseYear(game.releaseDate),
        rating: row.rating,
        isFavourite: row.isFavourite,
        isToPlayLater: row.isToPlayLater,
        updatedAt: row.updatedAt,
      },
    ];
  }),
);

/**
 * Modifie la ligne du jeu (créée au besoin). Règle métier : une ligne
 * sans favori, sans « à jouer » et sans note est supprimée.
 */
function updateEntry(
  gameId: number,
  changes: Partial<Omit<UserGameEntry, 'gameId' | 'updatedAt'>>,
) {
  const current =
    entries.value.find((row) => row.gameId === gameId) ??
    entry(gameId, { updatedAt: '' });
  const updated: UserGameEntry = {
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  };
  const empty =
    !updated.isFavourite && !updated.isToPlayLater && updated.rating === null;
  const others = entries.value.filter((row) => row.gameId !== gameId);
  entries.value = empty ? others : [...others, updated];
}

export type LibraryList = 'favourites' | 'play-later' | 'ratings';

const belongsTo: Record<LibraryList, (game: LibraryGame) => boolean> = {
  favourites: (game) => game.isFavourite,
  'play-later': (game) => game.isToPlayLater,
  ratings: (game) => game.rating !== null,
};

/** Retire le jeu de la liste ; retirer des évaluations supprime la note. */
function removeFrom(list: LibraryList, gameId: number) {
  if (list === 'favourites') updateEntry(gameId, { isFavourite: false });
  else if (list === 'play-later') updateEntry(gameId, { isToPlayLater: false });
  else deleteRating(gameId);
}

function setFavourite(gameId: number, isFavourite: boolean) {
  updateEntry(gameId, { isFavourite });
}

function setToPlayLater(gameId: number, isToPlayLater: boolean) {
  updateEntry(gameId, { isToPlayLater });
}

function saveRating(gameId: number, rating: number, comment: string | null) {
  updateEntry(gameId, { rating, comment });
}

/** Supprime l'évaluation : la note et le commentaire. */
function deleteRating(gameId: number) {
  updateEntry(gameId, { rating: null, comment: null });
}

/** Bibliothèque de l'utilisateur connecté. */
export function useLibrary() {
  const loading = ref(false);
  const gamesIn = (list: LibraryList) =>
    computed(() => library.value.filter(belongsTo[list]));
  return { library, loading, gamesIn, removeFrom };
}

/** Fiche d'un jeu et relation de l'utilisateur avec ce jeu. */
export function useGame(gameId: () => number) {
  const game = computed(() => games.get(gameId()) ?? null);
  const userEntry = computed(
    () => entries.value.find((row) => row.gameId === gameId()) ?? null,
  );
  return {
    game,
    userEntry,
    setFavourite: (value: boolean) => setFavourite(gameId(), value),
    setToPlayLater: (value: boolean) => setToPlayLater(gameId(), value),
    saveRating: (rating: number, comment: string | null) =>
      saveRating(gameId(), rating, comment),
    deleteRating: () => deleteRating(gameId()),
  };
}
