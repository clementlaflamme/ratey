<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { coverUrl } from '../../shared/ratings';

const props = withDefaults(
  defineProps<{
    coverImageId: string | null;
    name: string;
    /** Taille IGDB : 720p pour un affichage en grand */
    size?: 'cover_big' | '720p';
  }>(),
  { size: 'cover_big' },
);

const failed = ref(false);
watch(
  () => props.coverImageId,
  () => (failed.value = false),
);

const src = computed(() =>
  failed.value ? null : coverUrl(props.coverImageId, props.size),
);
</script>

<template>
  <div
    class="aspect-3/4 overflow-hidden rounded-3xl bg-linear-to-br from-ratey-violet to-ratey-magenta shadow-lg shadow-black/40"
  >
    <img
      v-if="src"
      :src="src"
      :alt="`Pochette de ${name}`"
      class="size-full object-cover"
      loading="lazy"
      @error="failed = true"
    />
    <div
      v-else
      class="grid size-full place-items-center p-3 text-center font-bold text-white/90"
    >
      {{ name }}
    </div>
  </div>
</template>
