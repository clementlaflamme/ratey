import { createRouter, createWebHashHistory } from 'vue-router';
import GamePage from './pages/GamePage.vue';
import HomePage from './pages/HomePage.vue';
import LibraryPage from './pages/LibraryPage.vue';
import PlaceholderPage from './pages/PlaceholderPage.vue';
import SearchPage from './pages/SearchPage.vue';

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
      path: '/jeu/:id(\\d+)',
      name: 'game',
      component: GamePage,
      props: (route) => ({ id: Number(route.params.id) }),
      meta: { title: 'Jeu' },
    },
    {
      path: '/recherche',
      name: 'search',
      component: SearchPage,
      props: (route) => ({
        q: typeof route.query.q === 'string' ? route.query.q : '',
      }),
      meta: { title: 'Recherche' },
    },
    {
      path: '/parametres',
      name: 'settings',
      component: PlaceholderPage,
      meta: { title: 'Paramètres' },
    },
  ],
});
