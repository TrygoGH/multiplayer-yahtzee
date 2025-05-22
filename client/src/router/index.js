import { createRouter, createWebHistory } from 'vue-router'
import LobbySelect from '@/views/LobbySelect.vue'
import Login from '@/views/Login.vue'
import Lobby from '@/views/Lobby.vue'
import Game from '@/views/Game.vue'

export const routes = [
    {
      path: '/',
      name: 'Login',
      component: Login,
    },
    {
      path: '/lobby',
      name: 'Lobby',
      component: Lobby,
    },
    {
        path: '/lobby-select',
        name: 'LobbySelect',
        component: LobbySelect,
    },
    {
      path: '/game',
      name: 'Game',
      component: Game,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router