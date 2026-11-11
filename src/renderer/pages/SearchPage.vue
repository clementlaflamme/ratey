<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useSearch } from '../composables/useSearch';
import EmptyState from '../components/EmptyState.vue';
import SearchResultCard from '../components/SearchResultCard.vue';

const props = defineProps<{ q: string }>();

const query = toRef(props, 'q');
const { results, loading, error, searched } = useSearch(query);

const text = computed(() => props.q.trim());
const resultsLabel = computed(() => {
  const n = results.value.length;
  return `${n} résultat${n > 1 ? 's' : ''} pour « ${searched.value} »`;
});
</script>

<template>
  <div class="mx-auto flex max-w-[80rem] flex-col gap-6 px-12 pt-4 pb-10">
    <h2 class="text-center text-5xl font-bold text-balance">
      <template v-if="text">Résultats pour « {{ text }} »</template>
      <template v-else>Recherche</template>
    </h2>

    <EmptyState
      v-if="!text"
      title="Que cherchez-vous ?"
      message="Tapez le nom d'un jeu dans la barre du haut."
    />

    <p v-else-if="loading" role="status" class="text-center text-muted">
      Recherche en cours…
    </p>

    <EmptyState
      v-else-if="error"
      title="La recherche a échoué"
      :message="error"
    />

    <template v-else-if="results.length">
      <p class="sr-only" aria-live="polite">{{ resultsLabel }}</p>
      <ul
        class="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-x-10 gap-y-8"
      >
        <li v-for="game in results" :key="game.id">
          <SearchResultCard :game="game" />
        </li>
      </ul>
    </template>

    <EmptyState
      v-else
      title="Aucun résultat"
      :message="`Aucun jeu ne correspond à « ${text} ».`"
    />
  </div>
</template>
