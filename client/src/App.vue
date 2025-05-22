<script setup>
import LobbySelect from './views/LobbySelect.vue'
import { getLobbies, joinLobby, handleText, lobbyTracker, lobbiesMapCache, socket } from './services/socketService.js'
import NavBar from './components/NavBar.vue'
</script>

<template>
    <NavBar />
    <router-view />
</template>

<style scoped>
main {
  padding-top: 60px; /* or match the height of your navbar */
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
