import { createRouter, createWebHistory } from 'vue-router'
import LobbySelect from '@/views/LobbySelect.vue'
import Lobby from '@/views/Lobby.vue'

const routes = [
    {
      path: '/',
      name: 'LobbySelect',
      component: LobbySelect,
    },
    {
      path: '/lobby',
      name: 'Lobby',
      component: Lobby,
    }
  ]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router