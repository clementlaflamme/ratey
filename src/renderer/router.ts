import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import LibraryPage from './pages/LibraryPage.vue';
import PlaceholderPage from './pages/PlaceholderPage.vue';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
  }
}

// Mode hash : compatible avec le chargement de fichiers locaux d'Electron.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { title: 'Accueil' },
    },
    {
      path: '/a-jouer',
      name: 'play-later',
      component: LibraryPage,
      props: { list: 'play-later' },
      meta: { title: 'À jouer plus tard' },
    },
    {
      path: '/favoris',
      name: 'favourites',
      component: LibraryPage,
      props: { list: 'favourites' },
      meta: { title: 'Vos favoris' },
    },
    {
      path: '/evaluations',
      name: 'ratings',
      component: LibraryPage,
      props: { list: 'ratings' },
      meta: { title: 'Vos évaluations' },
    },
    {
      path: '/parametres',
      name: 'settings',
      component: PlaceholderPage,
      meta: { title: 'Paramètres' },
    },
  ],
});
