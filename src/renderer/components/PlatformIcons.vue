<script setup lang="ts">
import { computed } from 'vue';
import type { Platform } from '../../shared/types';
import { groupPlatforms, type PlatformFamily } from '../../shared/platforms';
import MaskIcon from './MaskIcon.vue';
import playstationIcon from '../assets/icons/platforms/playstation.svg';
import xboxIcon from '../assets/icons/platforms/xbox.svg';
import nintendoIcon from '../assets/icons/platforms/nintendo.svg';
import pcIcon from '../assets/icons/platforms/pc.svg';
import mobileIcon from '../assets/icons/platforms/mobile.svg';

const props = defineProps<{ platforms: Platform[] }>();

const ICONS: Record<Exclude<PlatformFamily, 'other'>, string> = {
  playstation: playstationIcon,
  xbox: xboxIcon,
  nintendo: nintendoIcon,
  pc: pcIcon,
  mobile: mobileIcon,
};

const groups = computed(() => groupPlatforms(props.platforms));

function description(label: string, names: string[]) {
  return `${label} : ${names.join(', ')}`;
}
</script>

<template>
  <ul class="flex flex-wrap items-center gap-5">
    <!-- Même boîte pour chaque logo : les icônes s'y ajustent, d'où une taille harmonisée. -->
    <li
      v-for="group in groups"
      :key="group.family"
      class="grid size-12 place-items-center"
      :title="description(group.label, group.names)"
    >
      <MaskIcon
        v-if="group.family !== 'other'"
        :icon="ICONS[group.family]"
        class="size-11"
      />
      <svg
        v-else
        viewBox="0 0 24 24"
        class="size-12 fill-current"
        aria-hidden="true"
      >
        <path
          d="m21.58 16.09-1.09-7.66A3.996 3.996 0 0 0 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91M11 11H9v2H8v-2H6v-1h2V8h1v2h2zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1"
        />
      </svg>
      <span class="sr-only">{{ description(group.label, group.names) }}</span>
    </li>
  </ul>
</template>
