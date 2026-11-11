<script setup lang="ts">
import { computed } from 'vue';
import type { LibraryGame } from '../../shared/types';
import { studioAndYear } from '../../shared/library';
import { formatRating } from '../../shared/stars';
import GameCover from './GameCover.vue';
import MaskIcon from './MaskIcon.vue';
import StarRating from './StarRating.vue';

const props = defineProps<{
  game: LibraryGame;
  /** Icône du bouton de retrait (celle de l'écran courant) */
  removeIcon: string;
  /** Libellé accessible du bouton de retrait */
  removeLabel: string;
}>();

const emit = defineEmits<{ remove: [] }>();

const meta = computed(() => studioAndYear(props.game));
</script>

<template>
  <article
    class="group relative flex h-full flex-col items-center gap-3 rounded-[25px] bg-card px-5 pt-3 pb-6 text-center transition hover:bg-[#383838]"
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
    <template v-if="game.rating !== null">
      <StarRating :rating="game.rating" />
      <p class="text-lg font-bold">{{ formatRating(game.rating) }}</p>
    </template>

    <button
      type="button"
      class="remove-button"
      :aria-label="removeLabel"
      :title="removeLabel"
      @click="emit('remove')"
    >
      <MaskIcon :icon="removeIcon" class="size-6" />
    </button>
  </article>
</template>

<style scoped>
@reference '../index.css';

.card-link {
  @apply focus-visible:outline-none after:absolute after:inset-0 after:rounded-[25px] focus-visible:after:outline-2 focus-visible:after:outline-white;
}

/* Visible au survol de la carte, ou au focus clavier du bouton */
.remove-button {
  @apply absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-full bg-black/60 text-white opacity-0 shadow-md transition hover:bg-black/80 hover:text-ratey-magenta focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white group-hover:opacity-100;
}
</style>
