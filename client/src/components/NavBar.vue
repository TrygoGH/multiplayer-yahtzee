<template>
  <nav class="navbar">
    <router-link to="/">Home</router-link>
    <router-link to="/lobby-select">Lobby Select</router-link>

    <button @click="checkAuth" class="auth-btn">
      {{ isSignedIn ? 'Sign Out' : 'Sign In' }}
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { hasLoggedIn, } from '../services/loginService'

const isSignedIn = ref(false)
const router = useRouter()

function checkAuth() {
  isSignedIn.value = hasLoggedIn().isSuccess();

  if (isSignedIn.value) {
    router.push('/lobby-select') 
  } else {

    router.push('/login') // Navigate to login after sign-out
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.auth-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
}
</style>
