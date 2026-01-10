import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HomeV2View from '@/views/HomeV2View.vue';

const router = createRouter({
	//@ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
	{
      path: '/v2',
      name: 'v2',
      component: HomeV2View,
    }
  ],
})

export default router
