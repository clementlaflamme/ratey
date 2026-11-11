<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Show, SignIn, useAuth } from '@clerk/vue';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import { clearLibrary, loadLibrary } from './composables/useLibrary';

// Bibliothèque chargée à la connexion, vidée à la déconnexion (ou au
// changement de compte) : jamais les données d'un autre utilisateur.
const { userId } = useAuth();
watch(
  userId,
  (id) => {
    clearLibrary();
    if (id) void loadLibrary();
  },
  { immediate: true },
);

// C'est <main> qui défile (pas la fenêtre) : on remonte en haut à chaque page.
const route = useRoute();
const main = useTemplateRef<HTMLElement>('main');
watch(
  () => route.fullPath,
  () => main.value?.scrollTo({ top: 0 }),
);
</script>

<template>
  <Show when="signed-in">
    <div class="grid h-full grid-cols-[6rem_1fr] grid-rows-[auto_1fr]">
      <AppHeader class="col-span-2" />
      <AppSidebar />
      <main ref="main" class="min-w-0 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </Show>

  <Show when="signed-out">
    <div class="grid h-full place-items-center">
      <SignIn />
    </div>
  </Show>
</template>
