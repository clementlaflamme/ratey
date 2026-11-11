<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ icon: string }>();

// Guillemets obligatoires : les petits SVG sont intégrés en URL `data:`.
const style = computed(() => ({ '--icon': `url("${props.icon}")` }));
</script>

<!-- L'icône sert de masque : sa couleur suit `currentColor` et elle
     s'ajuste à la boîte sans être déformée. -->
<template>
  <span class="mask-icon block bg-current" :style="style" aria-hidden="true" />
</template>

<style scoped>
.mask-icon {
  mask: var(--icon) center / contain no-repeat;
}
</style>
