<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { LibraryGame } from '../../shared/types';
import {
  SORT_OPTIONS,
  SORT_OPTIONS_WITHOUT_RATING,
  filterGames,
  sortGames,
  type SortKey,
  type SortOption,
} from '../../shared/library';
import { errorMessage } from '../composables/api';
import { useLibrary, type LibraryList } from '../composables/useLibrary';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import EmptyState from '../components/EmptyState.vue';
import LibraryGameCard from '../components/LibraryGameCard.vue';
import LibraryToolbar from '../components/LibraryToolbar.vue';
import favouritesIcon from '../assets/icons/favourites.svg';
import playLaterIcon from '../assets/icons/play-later.svg';
import ratingsIcon from '../assets/icons/ratings.svg';

interface ListConfig {
  title: string;
  icon: string;
  /** Complément de « Retirer X … » */
  removeFrom: string;
  sortOptions: readonly SortOption[];
  /** Popup de confirmation avant de retirer un jeu */
  confirm: {
    title: string;
    message: (name: string) => string;
    label: string;
  };
  empty: { title: string; message: string };
}

const CONFIG: Record<LibraryList, ListConfig> = {
  favourites: {
    title: 'Vos favoris',
    icon: favouritesIcon,
    removeFrom: 'de vos favoris',
    sortOptions: SORT_OPTIONS,
    confirm: {
      title: 'Retirer des favoris ?',
      message: (name) => `${name} sera retiré de vos favoris.`,
      label: 'Retirer',
    },
    empty: {
      title: 'Aucun favori pour l’instant',
      message:
        'Recherchez un jeu dans la barre du haut et ajoutez-le à vos favoris.',
    },
  },
  'play-later': {
    title: 'À jouer plus tard',
    icon: playLaterIcon,
    removeFrom: 'de vos jeux à jouer plus tard',
    sortOptions: SORT_OPTIONS_WITHOUT_RATING,
    confirm: {
      title: 'Retirer de « À jouer plus tard » ?',
      message: (name) => `${name} sera retiré de vos jeux à jouer plus tard.`,
      label: 'Retirer',
    },
    empty: {
      title: 'Aucun jeu à jouer plus tard',
      message:
        'Recherchez un jeu dans la barre du haut et gardez-le pour plus tard.',
    },
  },
  ratings: {
    title: 'Vos évaluations',
    icon: ratingsIcon,
    removeFrom: 'de vos évaluations',
    sortOptions: SORT_OPTIONS,
    confirm: {
      title: 'Supprimer l’évaluation ?',
      message: (name) =>
        `${name} sera retiré de vos évaluations : votre note et votre commentaire seront définitivement supprimés.`,
      label: 'Supprimer',
    },
    empty: {
      title: 'Aucun jeu évalué pour l’instant',
      message:
        'Recherchez un jeu dans la barre du haut et donnez-lui une note.',
    },
  },
};

const props = defineProps<{ list: LibraryList }>();

const config = computed(() => CONFIG[props.list]);

const { gamesIn, removeFrom, loading, error, reload } = useLibrary();
const games = computed(() => gamesIn(props.list).value);

const query = ref('');
const sort = ref<SortKey | null>(null);

// La même instance sert aux 3 écrans : on repart de zéro en changeant d'écran.
watch(
  () => props.list,
  () => {
    query.value = '';
    sort.value = null;
    pending.value = null;
    removeError.value = null;
  },
);

const visibleGames = computed(() =>
  sortGames(filterGames(games.value, query.value), sort.value),
);

const resultsLabel = computed(() => {
  const n = visibleGames.value.length;
  return `${n} jeu${n > 1 ? 'x' : ''} affiché${n > 1 ? 's' : ''}`;
});

function removeLabel(game: LibraryGame) {
  return `Retirer ${game.name} ${config.value.removeFrom}`;
}

/** Jeu en attente de confirmation de retrait */
const pending = ref<LibraryGame | null>(null);

function requestRemove(game: LibraryGame) {
  pending.value = game;
}

/** Erreur du dernier retrait */
const removeError = ref<string | null>(null);

async function confirmRemove() {
  const game = pending.value;
  pending.value = null;
  if (!game) return;
  removeError.value = null;
  try {
    await removeFrom(props.list, game.id);
  } catch (caught) {
    removeError.value = `Impossible de retirer ${game.name} : ${errorMessage(caught)}`;
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-[80rem] flex-col gap-6 px-12 pt-4 pb-10">
    <h2 class="text-center text-5xl font-bold">{{ config.title }}</h2>

    <p v-if="removeError" role="alert" class="alert">{{ removeError }}</p>

    <p
      v-if="loading && !games.length"
      role="status"
      class="text-center text-muted"
    >
      Chargement…
    </p>

    <div
      v-else-if="error && !games.length"
      role="alert"
      class="flex flex-col items-center gap-4"
    >
      <EmptyState title="Impossible de charger vos jeux" :message="error" />
      <button type="button" class="retry" @click="reload">Réessayer</button>
    </div>

    <template v-else-if="games.length">
      <LibraryToolbar
        v-model:query="query"
        v-model:sort="sort"
        :sort-options="config.sortOptions"
      />

      <p class="sr-only" aria-live="polite">{{ resultsLabel }}</p>

      <ul
        v-if="visibleGames.length"
        class="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-x-10 gap-y-8"
      >
        <li v-for="game in visibleGames" :key="game.id">
          <LibraryGameCard
            :game="game"
            :remove-icon="config.icon"
            :remove-label="removeLabel(game)"
            @remove="requestRemove(game)"
          />
        </li>
      </ul>
      <EmptyState
        v-else
        title="Aucun résultat"
        :message="`Aucun jeu ne correspond à « ${query.trim()} ».`"
      />
    </template>

    <EmptyState
      v-else
      :title="config.empty.title"
      :message="config.empty.message"
    />

    <ConfirmDialog
      :open="pending !== null"
      :title="config.confirm.title"
      :message="config.confirm.message(pending?.name ?? '')"
      :confirm-label="config.confirm.label"
      @confirm="confirmRemove"
      @cancel="pending = null"
    />
  </div>
</template>

<style scoped>
@reference '../index.css';

.alert {
  @apply rounded-2xl bg-red-500/15 px-5 py-3 text-center font-bold text-red-200;
}

.retry {
  @apply rounded-full bg-ratey-magenta px-6 py-2 font-bold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-white;
}
</style>
