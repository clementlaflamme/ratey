<script setup lang="ts">
import { computed } from 'vue';
import type { RatedGame } from '../../shared/types';
import { formatRating } from '../../shared/stars';
import GameCover from './GameCover.vue';
import StarRating from './StarRating.vue';

const props = withDefaults(
  defineProps<{ game: RatedGame; variant?: 'large' | 'compact' }>(),
  { variant: 'compact' },
);

const gameLink = computed(() => ({
  name: 'game',
  params: { id: props.game.id },
}));
</script>

<template>
  <article
    v-if="variant === 'large'"
    class="relative flex items-center gap-12"
    :aria-label="game.name"
  >
    <GameCover
      :cover-image-id="game.coverImageId"
      :name="game.name"
      class="w-64 shrink-0"
    />
    <div class="flex w-64 flex-col items-center gap-5 text-center">
      <h3 class="text-3xl font-bold text-balance">
        <RouterLink :to="gameLink" class="card-link">{{
          game.name
        }}</RouterLink>
      </h3>
      <StarRating :rating="game.rating" size="lg" />
      <p class="text-3xl font-bold">{{ formatRating(game.rating) }}</p>
    </div>
  </article>

  <article
    v-else
    class="relative flex items-center gap-5"
    :aria-label="game.name"
  >
    <GameCover
      :cover-image-id="game.coverImageId"
      :name="game.name"
      class="w-28 shrink-0 rounded-2xl"
    />
    <div class="flex min-w-0 flex-col items-center gap-3 text-center">
      <h3 class="line-clamp-2 text-lg leading-snug font-bold">
        <RouterLink :to="gameLink" class="card-link">{{
          game.name
        }}</RouterLink>
      </h3>
      <StarRating :rating="game.rating" />
      <p class="text-xl font-bold">{{ formatRating(game.rating) }}</p>
    </div>
  </article>
</template>

<style scoped>
@reference '../index.css';

/* Lien étiré : toute la carte ouvre la page du jeu. */
.card-link {
  @apply hover:text-ratey-magenta focus-visible:outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline-2 focus-visible:after:outline-white;
}
</style>
