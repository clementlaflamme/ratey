<script setup lang="ts">
import homeIcon from '../assets/icons/home.svg';
import playLaterIcon from '../assets/icons/play-later.svg';
import favouritesIcon from '../assets/icons/favourites.svg';
import ratingsIcon from '../assets/icons/ratings.svg';
import settingsIcon from '../assets/icons/settings.svg';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const mainItems: NavItem[] = [
  { to: '/', label: 'Accueil', icon: homeIcon },
  { to: '/a-jouer', label: 'À jouer plus tard', icon: playLaterIcon },
  { to: '/favoris', label: 'Vos favoris', icon: favouritesIcon },
  { to: '/evaluations', label: 'Vos évaluations', icon: ratingsIcon },
];

// Guillemets obligatoires : Vite intègre les petits SVG en URL `data:`
// contenant des espaces, invalides dans un `url()` sans guillemets.
function iconStyle(icon: string) {
  return { '--icon': `url("${icon}")` };
}

const settingsItem: NavItem = {
  to: '/parametres',
  label: 'Paramètres',
  icon: settingsIcon,
};
</script>

<template>
  <nav
    aria-label="Navigation principale"
    class="flex flex-col items-center justify-between border-r-2 border-divider bg-sidebar py-8"
  >
    <ul class="flex flex-col items-center gap-6">
      <li v-for="item in mainItems" :key="item.to">
        <RouterLink
          v-slot="{ href, navigate, isExactActive }"
          :to="item.to"
          custom
        >
          <a
            :href="href"
            :title="item.label"
            :aria-current="isExactActive ? 'page' : undefined"
            class="nav-link"
            @click="navigate"
          >
            <span
              class="nav-icon"
              :style="iconStyle(item.icon)"
              aria-hidden="true"
            />
            <span class="sr-only">{{ item.label }}</span>
          </a>
        </RouterLink>
      </li>
    </ul>

    <RouterLink
      v-slot="{ href, navigate, isExactActive }"
      :to="settingsItem.to"
      custom
    >
      <a
        :href="href"
        :title="settingsItem.label"
        :aria-current="isExactActive ? 'page' : undefined"
        class="nav-link"
        @click="navigate"
      >
        <span
          class="nav-icon"
          :style="iconStyle(settingsItem.icon)"
          aria-hidden="true"
        />
        <span class="sr-only">{{ settingsItem.label }}</span>
      </a>
    </RouterLink>
  </nav>
</template>

<style scoped>
@reference '../index.css';

.nav-link {
  @apply relative grid size-15 place-items-center rounded-2xl text-muted transition-colors hover:bg-white/5 hover:text-neutral-200 focus-visible:outline-2 focus-visible:outline-white;
}

.nav-link[aria-current='page'] {
  @apply bg-white/10 text-white;
}

/* Barre d'accent à gauche de l'élément actif */
.nav-link[aria-current='page']::before {
  content: '';
  @apply absolute top-2 bottom-2 -left-[18px] w-1 rounded-r-full bg-ratey-magenta;
}

/* L'icône Figma sert de masque : sa couleur suit `currentColor`. */
.nav-icon {
  @apply size-10 bg-current;
  mask: var(--icon) center / contain no-repeat;
}
</style>
