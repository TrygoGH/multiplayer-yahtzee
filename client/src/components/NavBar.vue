<template>
  <nav class="navbar">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>

    <button @click="toggleAuth" class="auth-btn">
      {{ isSignedIn ? 'Sign Out' : 'Sign In' }}
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isSignedIn = ref(false)
const router = useRouter()

function toggleAuth() {
  isSignedIn.value = !isSignedIn.value

  if (isSignedIn.value) {
    router.push('/lobby-select') // Navigate to lobby after sign-in
  } else {
    router.push('/login') // Navigate to login after sign-out
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  align-items: center;
}

.auth-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
}
</style>
