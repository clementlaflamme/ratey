<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UserButton } from '@clerk/vue';
import { studioAndYear } from '../../shared/library';
import { SEARCH_MAX_LENGTH, useSearch } from '../composables/useSearch';
import GameCover from './GameCover.vue';
import logo from '../assets/logo.png';

/** Nombre de suggestions sous la barre (les plus pertinentes d'IGDB). */
const SUGGESTION_COUNT = 6;

const route = useRoute();
const router = useRouter();

const query = ref('');
/** La liste de suggestions est ouverte */
const open = ref(false);
/** Suggestion choisie au clavier (-1 : aucune) */
const active = ref(-1);

// Pas de recherche tant que la liste est fermée.
const suggestQuery = computed(() => (open.value ? query.value : ''));
const { results, loading, error } = useSearch(suggestQuery, {
  delay: 300,
  minLength: 2,
});
const suggestions = computed(() => results.value.slice(0, SUGGESTION_COUNT));
const showList = computed(() => open.value && query.value.trim().length >= 2);

watch(suggestions, () => (active.value = -1));

// Sur l'écran de résultats, la barre affiche la recherche courante.
watch(
  () => route.query.q,
  (q) => {
    if (route.name === 'search' && typeof q === 'string') query.value = q;
  },
  { immediate: true },
);

function close() {
  open.value = false;
  active.value = -1;
}

function onInput() {
  open.value = true;
}

function move(step: number) {
  if (!showList.value || !suggestions.value.length) return;
  const count = suggestions.value.length;
  active.value = ((active.value + step + count + 1) % (count + 1)) - 1;
}

function openGame(id: number) {
  close();
  query.value = '';
  void router.push({ name: 'game', params: { id } });
}

/** Entrée : ouvre la suggestion choisie au clavier, sinon les résultats. */
function onSubmit() {
  const choice = suggestions.value[active.value];
  if (showList.value && choice) return openGame(choice.id);
  showResults();
}

/** Ouvre l'écran de résultats pour le texte tapé. */
function showResults() {
  const q = query.value.trim();
  query.value = q;
  close();
  if (q) void router.push({ name: 'search', query: { q } });
}

/** Ferme la liste quand le focus quitte la zone de recherche. */
function onFocusOut(event: FocusEvent) {
  const form = event.currentTarget as HTMLElement;
  if (!form.contains(event.relatedTarget as Node | null)) close();
}

const optionId = (index: number) => `search-option-${index}`;
</script>

<template>
  <header
    class="grid h-24 grid-cols-[6rem_1fr_6rem] items-center border-b-2 border-divider bg-linear-to-r from-ratey-violet to-ratey-magenta"
  >
    <RouterLink
      to="/"
      class="flex justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-white"
      aria-label="Ratey, accueil"
    >
      <img :src="logo" alt="Ratey" class="size-18 object-contain" />
    </RouterLink>

    <form
      role="search"
      class="relative mx-auto w-full max-w-xl px-6"
      @submit.prevent="onSubmit"
      @focusout="onFocusOut"
    >
      <label class="relative block">
        <span class="sr-only">Rechercher un jeu</span>
        <input
          v-model="query"
          type="search"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          :aria-expanded="showList"
          :aria-activedescendant="active >= 0 ? optionId(active) : undefined"
          :maxlength="SEARCH_MAX_LENGTH"
          placeholder="Recherchez un jeu..."
          class="h-11 w-full rounded-full bg-white pr-12 pl-5 text-sm text-neutral-900 shadow-md placeholder:text-neutral-400 focus:ring-4 focus:ring-white/40 focus:outline-none"
          @input="onInput"
          @focus="query.trim() && (open = true)"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.esc="close"
        />
        <button
          type="submit"
          aria-label="Lancer la recherche"
          class="absolute inset-y-0 right-1 grid w-10 place-items-center rounded-full text-neutral-700 hover:text-ratey-violet"
        >
          <svg
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </label>

      <div
        v-if="showList"
        class="absolute inset-x-6 top-full z-30 mt-2 overflow-hidden rounded-3xl bg-card shadow-xl shadow-black/50"
      >
        <ul
          v-if="suggestions.length"
          id="search-suggestions"
          role="listbox"
          aria-label="Suggestions"
        >
          <li
            v-for="(game, index) in suggestions"
            :id="optionId(index)"
            :key="game.id"
            role="option"
            :aria-selected="index === active"
            class="flex cursor-pointer items-center gap-4 px-4 py-2"
            :class="index === active ? 'bg-white/10' : 'hover:bg-white/5'"
            @mousedown.prevent
            @click="openGame(game.id)"
            @mouseenter="active = index"
          >
            <GameCover
              :cover-image-id="game.coverImageId"
              :name="game.name"
              class="w-10 shrink-0 rounded-lg! text-[0.5rem]"
            />
            <div class="min-w-0">
              <p class="truncate font-bold">{{ game.name }}</p>
              <p v-if="studioAndYear(game)" class="truncate text-sm text-muted">
                {{ studioAndYear(game) }}
              </p>
            </div>
          </li>
          <li
            role="option"
            :aria-selected="false"
            class="cursor-pointer border-t border-white/10 px-4 py-3 text-center text-sm font-bold hover:bg-white/5"
            @mousedown.prevent
            @mouseenter="active = -1"
            @click="showResults"
          >
            Voir tous les résultats
          </li>
        </ul>
        <p
          v-else
          id="search-suggestions"
          role="status"
          class="px-4 py-3 text-center text-sm text-muted"
        >
          <template v-if="loading">Recherche…</template>
          <template v-else-if="error">{{ error }}</template>
          <template v-else>Aucun jeu trouvé.</template>
        </p>
      </div>
    </form>

    <div class="flex justify-center">
      <UserButton
        :appearance="{
          elements: {
            avatarBox: {
              width: '3.5rem',
              height: '3.5rem',
              boxShadow: '0 0 0 3px rgb(255 255 255 / 0.7)',
            },
          },
        }"
      />
    </div>
  </header>
</template>
