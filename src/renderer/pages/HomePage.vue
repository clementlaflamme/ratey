<script setup lang="ts">
import { computed } from 'vue';
import { latestRated, topRated } from '../../shared/ratings';
import { useLibrary } from '../composables/useLibrary';
import { useRatings } from '../composables/useRatings';
import EmptyState from '../components/EmptyState.vue';
import GameCard from '../components/GameCard.vue';
import GameCarousel from '../components/GameCarousel.vue';
import trophy from '../assets/trophy.svg';

const TOP_COUNT = 10;
const LATEST_COUNT = 3;

const { ratings, loading, error } = useRatings();
const { reload } = useLibrary();
const top = computed(() => topRated(ratings.value, TOP_COUNT));
const latest = computed(() => latestRated(ratings.value, LATEST_COUNT));
</script>

<template>
  <div
    v-if="loading && !ratings.length"
    role="status"
    class="py-10 text-center text-muted"
  >
    Chargement…
  </div>

  <div
    v-else-if="error && !ratings.length"
    role="alert"
    class="mx-auto flex max-w-6xl flex-col items-center gap-4 px-12 py-10"
  >
    <EmptyState
      title="Impossible de charger vos évaluations"
      :message="error"
    />
    <button
      type="button"
      class="rounded-full bg-ratey-magenta px-6 py-2 font-bold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-white"
      @click="reload"
    >
      Réessayer
    </button>
  </div>

  <div v-else class="mx-auto flex max-w-6xl flex-col gap-10 px-12 py-10">
    <section aria-labelledby="top-title" class="flex flex-col gap-6">
      <h2
        id="top-title"
        class="flex items-center justify-center gap-3 text-4xl font-bold"
      >
        Vos jeux les mieux évalués
        <img :src="trophy" alt="" class="size-14" />
      </h2>

      <GameCarousel
        v-if="top.length"
        :games="top"
        label="Vos jeux les mieux évalués"
      />
      <EmptyState
        v-else
        title="Aucun jeu évalué pour l'instant"
        message="Recherchez un jeu dans la barre du haut et donnez-lui une note : vos coups de cœur apparaîtront ici."
      />
    </section>

    <hr class="border-t-2 border-divider" />

    <section aria-labelledby="latest-title" class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h2 id="latest-title" class="text-3xl font-bold">
          Évaluations précédentes
        </h2>
        <RouterLink
          v-if="latest.length"
          to="/evaluations"
          class="group flex items-center gap-2 rounded-lg px-2 py-1 text-xl font-bold hover:text-ratey-magenta focus-visible:outline-2 focus-visible:outline-white"
        >
          Voir tout
          <svg
            viewBox="0 0 24 24"
            class="size-6 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          >
            <path
              d="M4 11h12.17l-5.59-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4z"
              fill="currentColor"
            />
          </svg>
        </RouterLink>
      </div>

      <ul v-if="latest.length" class="grid grid-cols-3 gap-8">
        <li v-for="game in latest" :key="game.id">
          <GameCard :game="game" />
        </li>
      </ul>
      <EmptyState
        v-else
        title="Aucune évaluation récente"
        message="Évaluez votre premier jeu pour retrouver ici vos dernières notes."
      />
    </section>
  </div>
</template>
