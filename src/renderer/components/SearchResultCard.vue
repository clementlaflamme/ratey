<script setup lang="ts">
import { computed } from 'vue';
import type { GameSummary } from '../../shared/types';
import { studioAndYear } from '../../shared/library';
import GameCover from './GameCover.vue';

const props = defineProps<{ game: GameSummary }>();

const meta = computed(() => studioAndYear(props.game));
</script>

<template>
  <article
    class="relative flex h-full flex-col items-center gap-3 rounded-[25px] bg-card px-5 pt-3 pb-6 text-center transition hover:bg-[#383838]"
    :aria-label="game.name"
  >
    <GameCover
      :cover-image-id="game.coverImageId"
      :name="game.name"
      class="w-[8.3rem] shrink-0"
    />
    <h3 class="mt-2 line-clamp-2 leading-snug font-bold text-balance">
      <!-- Lien étiré : toute la carte ouvre la page du jeu. -->
      <RouterLink
        :to="{ name: 'game', params: { id: game.id } }"
        class="card-link"
      >
        {{ game.name }}
      </RouterLink>
    </h3>
    <p v-if="meta" class="font-bold">{{ meta }}</p>
  </article>
</template>

<style scoped>
@reference '../index.css';

.card-link {
  @apply focus-visible:outline-none after:absolute after:inset-0 after:rounded-[25px] focus-visible:after:outline-2 focus-visible:after:outline-white;
}
</style>
