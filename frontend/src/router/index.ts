import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/hino/:id',
    name: 'hymn-detail',
    component: () => import('../views/HymnDetailView.vue')
  },
  {
    path: '/buscar',
    name: 'search',
    component: () => import('../views/SearchView.vue')
  },
  {
    path: '/favoritos',
    name: 'favorites',
    component: () => import('../views/FavoritesView.vue')
  },
  {
    path: '/ajustes',
    name: 'settings',
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;
