<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  COMMENT_MAX_LENGTH,
  FRACTION_OPTIONS,
  WHOLE_OPTIONS,
  combineRating,
  fractionLabel,
  normalizeComment,
  splitRating,
} from '../../shared/ratingForm';
import { MAX_RATING, formatRating } from '../../shared/stars';
import StarRating from './StarRating.vue';

const props = defineProps<{
  rating: number | null;
  comment: string | null;
  /** Affiche « Annuler » (modification d'une évaluation existante) */
  cancellable: boolean;
}>();

const emit = defineEmits<{
  save: [rating: number, comment: string | null];
  cancel: [];
}>();

const initial = props.rating === null ? null : splitRating(props.rating);
// Pas de note par défaut : on évite d'enregistrer un 0 par mégarde.
const whole = ref<number | null>(initial?.whole ?? null);
const fraction = ref(initial?.fraction ?? 0);
const comment = ref(props.comment ?? '');

// La note maximale est 5 : pas de quart de point au-delà.
const fractionLocked = computed(() => whole.value === MAX_RATING);
watch(fractionLocked, (locked) => {
  if (locked) fraction.value = 0;
});

const rating = computed(() =>
  whole.value === null ? null : combineRating(whole.value, fraction.value),
);

function onSubmit() {
  if (rating.value === null) return;
  emit('save', rating.value, normalizeComment(comment.value));
}
</script>

<template>
  <form
    class="grid grid-cols-[auto_1fr] gap-x-12 gap-y-6"
    @submit.prevent="onSubmit"
  >
    <fieldset class="flex flex-col items-center gap-4">
      <legend class="mb-3 text-2xl font-bold">Note</legend>
      <div class="flex items-center gap-2 text-2xl font-bold">
        <label>
          <span class="sr-only">Partie entière de la note</span>
          <select v-model="whole" class="field w-20" required>
            <option :value="null" disabled>–</option>
            <option v-for="value in WHOLE_OPTIONS" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
        </label>
        <label>
          <span class="sr-only">Quart de point</span>
          <select
            v-model="fraction"
            class="field w-24"
            :disabled="fractionLocked"
          >
            <option
              v-for="value in FRACTION_OPTIONS"
              :key="value"
              :value="value"
            >
              {{ fractionLabel(value) }}
            </option>
          </select>
        </label>
        <span aria-hidden="true">/ {{ MAX_RATING }}</span>
      </div>
      <StarRating :rating="rating ?? 0" size="lg" />
      <p class="text-xl font-bold" aria-live="polite">
        {{ rating === null ? 'Choisissez une note' : formatRating(rating) }}
      </p>
    </fieldset>

    <label class="flex flex-col gap-3">
      <span class="text-2xl font-bold">Commentaire (facultatif) :</span>
      <textarea
        v-model="comment"
        :maxlength="COMMENT_MAX_LENGTH"
        rows="4"
        placeholder="Qu'avez-vous pensé de ce jeu ?"
        class="min-h-32 resize-y rounded-[25px] bg-sidebar px-6 py-4 font-bold placeholder:font-normal placeholder:text-muted focus:ring-4 focus:ring-white/30 focus:outline-none"
      />
      <span class="self-end text-sm text-muted">
        {{ comment.length }} / {{ COMMENT_MAX_LENGTH }}
      </span>
    </label>

    <div class="col-span-2 flex justify-end gap-3">
      <button
        v-if="cancellable"
        type="button"
        class="rounded-full px-5 py-2.5 font-bold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
        @click="emit('cancel')"
      >
        Annuler
      </button>
      <button
        type="submit"
        class="rounded-full bg-ratey-magenta px-6 py-2.5 font-bold hover:bg-ratey-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="rating === null"
      >
        Enregistrer
      </button>
    </div>
  </form>
</template>

<style scoped>
@reference '../index.css';

.field {
  @apply h-12 cursor-pointer rounded-xl bg-field-alt px-3 text-center text-neutral-900 focus:ring-4 focus:ring-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60;
}
</style>
