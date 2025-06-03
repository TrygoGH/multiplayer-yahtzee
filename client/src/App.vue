<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
    <NavBar v-if="!$route.meta.hideNavbar" />
    <main>
      <router-view />
    </main>
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
