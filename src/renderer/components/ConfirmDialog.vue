<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
}>();

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const dialog = useTemplateRef<HTMLDialogElement>('dialog');

watch(
  () => props.open,
  (open) => {
    if (open) dialog.value?.showModal();
    else dialog.value?.close();
  },
  { immediate: true, flush: 'post' },
);

// Un clic sur le fond (hors de la boîte) annule.
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('cancel');
}
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="confirm-title"
    aria-describedby="confirm-message"
    class="m-auto max-w-md rounded-3xl bg-card p-0 text-white shadow-2xl backdrop:bg-black/60"
    @cancel.prevent="emit('cancel')"
    @click="onClick"
  >
    <div class="flex flex-col gap-4 p-8">
      <h2 id="confirm-title" class="text-2xl font-bold">{{ title }}</h2>
      <p id="confirm-message" class="text-neutral-300">{{ message }}</p>
      <div class="mt-4 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-full px-5 py-2.5 font-bold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
          autofocus
          @click="emit('cancel')"
        >
          Annuler
        </button>
        <button
          type="button"
          class="rounded-full bg-ratey-magenta px-5 py-2.5 font-bold hover:bg-ratey-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>
