<script setup lang="ts">
import { computed } from 'vue';
import type { SortKey, SortOption } from '../../shared/library';
import clearFiltersIcon from '../assets/icons/clear-filters.svg';

defineProps<{ sortOptions: readonly SortOption[] }>();

const query = defineModel<string>('query', { required: true });
const sort = defineModel<SortKey | null>('sort', { required: true });

const hasFilters = computed(() => query.value.trim() !== '' || sort.value);

function onSortChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  sort.value = value ? (value as SortKey) : null;
}

function clearFilters() {
  query.value = '';
  sort.value = null;
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <label class="relative block w-80">
      <span class="sr-only">Rechercher par titre ou studio</span>
      <input
        v-model="query"
        type="search"
        placeholder="Recherchez..."
        class="h-12 w-full rounded-full bg-field pr-12 pl-6 text-on-field placeholder:text-on-field/80 focus:ring-4 focus:ring-white/40 focus:outline-none"
      />
      <svg
        viewBox="0 0 24 24"
        class="pointer-events-none absolute top-1/2 right-4 size-6 -translate-y-1/2 fill-on-field"
        aria-hidden="true"
      >
        <path
          d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"
        />
      </svg>
    </label>

    <label class="relative block w-60">
      <span class="sr-only">Trier par</span>
      <select
        :value="sort ?? ''"
        class="h-12 w-full cursor-pointer appearance-none rounded-full bg-field-alt pr-10 pl-5 text-sm font-medium text-neutral-900 focus:ring-4 focus:ring-white/40 focus:outline-none"
        @change="onSortChange"
      >
        <option value="" disabled>Trier par</option>
        <option
          v-for="option in sortOptions"
          :key="option.key"
          :value="option.key"
        >
          {{ option.label }}
        </option>
      </select>
      <svg
        viewBox="0 0 24 24"
        class="pointer-events-none absolute top-1/2 right-4 size-6 -translate-y-1/2 fill-on-field"
        aria-hidden="true"
      >
        <path d="m10 17 5-5-5-5z" />
      </svg>
    </label>

    <button
      type="button"
      class="grid size-12 place-items-center rounded-full bg-white shadow-md transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Effacer la recherche et le tri"
      title="Effacer la recherche et le tri"
      :disabled="!hasFilters"
      @click="clearFilters"
    >
      <img :src="clearFiltersIcon" alt="" />
    </button>
  </div>
</template>
