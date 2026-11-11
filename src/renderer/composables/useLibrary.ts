import { computed, ref } from 'vue';
import type { LibraryGame } from '../../shared/types';

/**
 * Données fictives, en attendant les routes de l'API.
 * Remplacer par `[]` pour voir les états vides.
 */
const MOCK_LIBRARY: LibraryGame[] = [
  {
    id: 121,
    name: 'Minecraft',
    coverImageId: 'co49x5',
    studio: 'Mojang Studios',
    releaseYear: 2011,
    rating: 4.75,
    isFavourite: true,
    isToPlayLater: false,
    updatedAt: '2026-10-02T18:00:00Z',
  },
  {
    id: 1942,
    name: 'The Witcher 3: Wild Hunt',
    coverImageId: 'co1wyy',
    studio: 'CD Projekt RED',
    releaseYear: 2015,
    rating: 4.25,
    isFavourite: true,
    isToPlayLater: false,
    updatedAt: '2026-11-03T20:15:00Z',
  },
  {
    id: 113112,
    name: 'Hades',
    coverImageId: 'co39vc',
    studio: 'Supergiant Games',
    releaseYear: 2020,
    rating: 4.5,
    isFavourite: true,
    isToPlayLater: false,
    updatedAt: '2026-09-14T12:00:00Z',
  },
  {
    id: 26226,
    name: 'Celeste',
    coverImageId: 'co3byy',
    studio: 'Maddy Makes Games',
    releaseYear: 2018,
    rating: 4.5,
    isFavourite: false,
    isToPlayLater: false,
    updatedAt: '2026-08-21T09:30:00Z',
  },
  {
    id: 11133,
    name: 'Outer Wilds',
    coverImageId: 'co65ac',
    studio: 'Mobius Digital',
    releaseYear: 2019,
    rating: 5,
    isFavourite: true,
    isToPlayLater: false,
    updatedAt: '2026-07-01T16:45:00Z',
  },
  {
    id: 1020,
    name: 'Grand Theft Auto V',
    coverImageId: 'co2lbd',
    studio: 'Rockstar North',
    releaseYear: 2013,
    rating: 3.75,
    isFavourite: false,
    isToPlayLater: false,
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 103329,
    name: 'Control',
    coverImageId: 'co2evj',
    studio: 'Remedy Entertainment',
    releaseYear: 2019,
    rating: 4,
    isFavourite: false,
    isToPlayLater: false,
    updatedAt: '2026-11-05T22:10:00Z',
  },
  {
    id: 119133,
    name: 'Elden Ring',
    coverImageId: null,
    studio: 'FromSoftware',
    releaseYear: 2022,
    rating: null,
    isFavourite: true,
    isToPlayLater: true,
    updatedAt: '2026-11-08T19:00:00Z',
  },
  {
    id: 14593,
    name: 'Hollow Knight',
    coverImageId: null,
    studio: 'Team Cherry',
    releaseYear: 2017,
    rating: null,
    isFavourite: false,
    isToPlayLater: true,
    updatedAt: '2026-10-20T14:00:00Z',
  },
  {
    id: 119171,
    name: 'Disco Elysium',
    coverImageId: null,
    studio: 'ZA/UM',
    releaseYear: 2019,
    rating: null,
    isFavourite: false,
    isToPlayLater: true,
    updatedAt: '2026-09-30T08:00:00Z',
  },
  {
    id: 999001,
    name: 'Projet sans studio',
    coverImageId: null,
    studio: null,
    releaseYear: 2026,
    rating: null,
    isFavourite: false,
    isToPlayLater: true,
    updatedAt: '2026-08-02T08:00:00Z',
  },
];

// État partagé : un retrait sur une page se voit sur toutes les autres.
const library = ref<LibraryGame[]>(MOCK_LIBRARY);

export type LibraryList = 'favourites' | 'play-later' | 'ratings';

const belongsTo: Record<LibraryList, (game: LibraryGame) => boolean> = {
  favourites: (game) => game.isFavourite,
  'play-later': (game) => game.isToPlayLater,
  ratings: (game) => game.rating !== null,
};

/** Retire le jeu de la liste ; retirer des évaluations supprime la note. */
function removeFrom(list: LibraryList, id: number) {
  library.value = library.value.flatMap((game) => {
    if (game.id !== id) return [game];
    const updated: LibraryGame = {
      ...game,
      isFavourite: list === 'favourites' ? false : game.isFavourite,
      isToPlayLater: list === 'play-later' ? false : game.isToPlayLater,
      rating: list === 'ratings' ? null : game.rating,
      updatedAt: new Date().toISOString(),
    };
    // Règle métier : une ligne sans favori, sans « à jouer » et sans note est supprimée.
    const empty =
      !updated.isFavourite && !updated.isToPlayLater && updated.rating === null;
    return empty ? [] : [updated];
  });
}

/** Bibliothèque de l'utilisateur connecté. */
export function useLibrary() {
  const loading = ref(false);
  const gamesIn = (list: LibraryList) =>
    computed(() => library.value.filter(belongsTo[list]));
  return { library, loading, gamesIn, removeFrom };
}
