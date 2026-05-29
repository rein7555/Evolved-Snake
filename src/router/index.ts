import { createRouter, createWebHistory } from 'vue-router'
import MenuView from '@/views/MenuView.vue'
import GameScene from '@/views/GameScene.vue'
import ResultView from '@/views/ResultView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Menu',
      component: MenuView,
    },
    {
      path: '/game',
      name: 'Game',
      component: GameScene,
    },
    {
      path: '/result',
      name: 'Result',
      component: ResultView,
    },
  ],
})

export default router
