<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { formatReleaseDate } from '../../shared/dates';
import { formatRating } from '../../shared/stars';
import { useGame } from '../composables/useLibrary';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import EmptyState from '../components/EmptyState.vue';
import GameCover from '../components/GameCover.vue';
import MaskIcon from '../components/MaskIcon.vue';
import PlatformIcons from '../components/PlatformIcons.vue';
import RatingForm from '../components/RatingForm.vue';
import StarRating from '../components/StarRating.vue';
import favouritesIcon from '../assets/icons/favourites.svg';
import playLaterIcon from '../assets/icons/play-later.svg';
import editIcon from '../assets/icons/edit.svg';
import deleteIcon from '../assets/icons/delete.svg';

const props = defineProps<{ id: number }>();

const {
  game,
  userEntry,
  loading,
  error,
  saving,
  saveError,
  setFavourite,
  setToPlayLater,
  saveRating,
  deleteRating,
} = useGame(() => props.id);

const isFavourite = computed(() => userEntry.value?.isFavourite ?? false);
const isToPlayLater = computed(() => userEntry.value?.isToPlayLater ?? false);
const rating = computed(() => userEntry.value?.rating ?? null);
const comment = computed(() => userEntry.value?.comment ?? null);

const editing = ref(false);
const confirmingDelete = ref(false);

// La page est réutilisée d'un jeu à l'autre : on referme tout.
watch(
  () => props.id,
  () => {
    editing.value = false;
    confirmingDelete.value = false;
  },
);

const showForm = computed(() => rating.value === null || editing.value);

async function onSave(newRating: number, newComment: string | null) {
  // En cas d'erreur, le formulaire reste ouvert avec la saisie.
  if (await saveRating(newRating, newComment)) editing.value = false;
}

async function onConfirmDelete() {
  confirmingDelete.value = false;
  if (await deleteRating()) editing.value = false;
}
</script>

<template>
  <div class="mx-auto max-w-[80rem] px-12 pt-4 pb-10">
    <p
      v-if="loading && !game"
      role="status"
      class="py-10 text-center text-muted"
    >
      Chargement…
    </p>

    <EmptyState
      v-else-if="error && !game"
      title="Impossible de charger ce jeu"
      :message="error"
    />

    <EmptyState
      v-else-if="!game"
      title="Jeu introuvable"
      message="Ce jeu n'existe pas ou n'est plus disponible."
    />

    <article v-else class="relative rounded-[25px] bg-card">
      <div class="absolute top-6 right-6 flex gap-2">
        <button
          type="button"
          class="toggle"
          :aria-pressed="isToPlayLater"
          :disabled="saving"
          :title="
            isToPlayLater
              ? 'Retirer de « À jouer plus tard »'
              : 'Ajouter à « À jouer plus tard »'
          "
          @click="setToPlayLater(!isToPlayLater)"
        >
          <MaskIcon :icon="playLaterIcon" class="size-9" />
          <span class="sr-only">À jouer plus tard</span>
        </button>
        <button
          type="button"
          class="toggle"
          :aria-pressed="isFavourite"
          :disabled="saving"
          :title="isFavourite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          @click="setFavourite(!isFavourite)"
        >
          <MaskIcon :icon="favouritesIcon" class="size-9" />
          <span class="sr-only">Favori</span>
        </button>
      </div>

      <div class="grid grid-cols-[minmax(0,24rem)_1fr] gap-12 p-8">
        <GameCover
          :cover-image-id="game.coverImageId"
          :name="game.name"
          size="720p"
          class="w-full"
        />

        <div class="flex min-w-0 flex-col gap-6 pt-4 pr-28">
          <h1 class="text-6xl font-bold text-balance">{{ game.name }}</h1>
          <dl class="flex flex-col gap-4 text-3xl font-bold">
            <div>
              <dt class="inline">Studio :</dt>
              <dd class="inline">
                {{ ' ' }}<span v-if="game.studio">{{ game.studio }}</span>
                <span v-else class="text-muted">Inconnu</span>
              </dd>
            </div>
            <div>
              <dt class="inline">Date de sortie :</dt>
              <dd class="inline">
                {{ ' '
                }}<span v-if="game.releaseDate">{{
                  formatReleaseDate(game.releaseDate)
                }}</span>
                <span v-else class="text-muted">Inconnue</span>
              </dd>
            </div>
            <div>
              <dt class="inline">
                {{ game.genres.length > 1 ? 'Genres' : 'Genre' }} :
              </dt>
              <dd class="inline">
                {{ ' '
                }}<span v-if="game.genres.length">{{
                  game.genres.join(', ')
                }}</span>
                <span v-else class="text-muted">Inconnu</span>
              </dd>
            </div>
            <div class="flex flex-col gap-4">
              <dt>Plateformes :</dt>
              <dd>
                <PlatformIcons
                  v-if="game.platforms.length"
                  :platforms="game.platforms"
                />
                <span v-else class="text-muted">Inconnues</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <hr class="border-t-2 border-white/20" />

      <section aria-labelledby="rating-title" class="flex flex-col gap-6 p-8">
        <p
          v-if="saveError"
          role="alert"
          class="rounded-2xl bg-red-500/15 px-5 py-3 font-bold text-red-200"
        >
          {{ saveError }}
        </p>

        <div class="flex items-center justify-between gap-4">
          <h2 id="rating-title" class="text-4xl font-bold">
            {{ rating === null ? 'Évaluez ce jeu' : 'Votre évaluation' }}
          </h2>
          <div v-if="rating !== null && !editing" class="flex gap-2">
            <button
              type="button"
              class="action"
              title="Modifier l'évaluation"
              :disabled="saving"
              @click="editing = true"
            >
              <MaskIcon :icon="editIcon" class="size-10" />
              <span class="sr-only">Modifier l'évaluation</span>
            </button>
            <button
              type="button"
              class="action"
              title="Supprimer l'évaluation"
              :disabled="saving"
              @click="confirmingDelete = true"
            >
              <MaskIcon :icon="deleteIcon" class="size-10" />
              <span class="sr-only">Supprimer l'évaluation</span>
            </button>
          </div>
        </div>

        <RatingForm
          v-if="showForm"
          :key="`${id}-${editing}`"
          :rating="rating"
          :comment="comment"
          :cancellable="editing"
          @save="onSave"
          @cancel="editing = false"
        />

        <div v-else class="grid grid-cols-[auto_1fr] gap-x-12">
          <div class="flex flex-col items-center gap-4 px-6">
            <StarRating :rating="rating ?? 0" size="lg" />
            <p class="text-3xl font-bold">{{ formatRating(rating ?? 0) }}</p>
          </div>
          <div class="flex flex-col gap-3">
            <h3 class="text-2xl font-bold">Commentaire :</h3>
            <p
              class="min-h-32 rounded-[25px] bg-sidebar px-6 py-4 text-xl font-bold whitespace-pre-wrap"
            >
              <template v-if="comment">{{ comment }}</template>
              <span v-else class="font-normal text-muted">
                Aucun commentaire.
              </span>
            </p>
          </div>
        </div>
      </section>
    </article>

    <ConfirmDialog
      :open="confirmingDelete"
      title="Supprimer l’évaluation ?"
      :message="`Votre note et votre commentaire pour ${game?.name ?? 'ce jeu'} seront définitivement supprimés.`"
      confirm-label="Supprimer"
      @confirm="onConfirmDelete"
      @cancel="confirmingDelete = false"
    />
  </div>
</template>

<style scoped>
@reference '../index.css';

.toggle,
.action {
  @apply grid size-14 place-items-center rounded-full text-neutral-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white;
}

.toggle:disabled,
.action:disabled {
  @apply cursor-wait opacity-60;
}

.toggle[aria-pressed='true'] {
  @apply bg-white/10 text-ratey-magenta;
}
</style>
