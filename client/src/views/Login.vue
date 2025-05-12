<template>
    <div class="login-container">
      <h2>Welcome</h2>
  
      <div v-if="mode === 'login'">
        <input v-model="username" placeholder="Username" />
        <input v-model="password" type="password" placeholder="Password" />
        <button @click="login">Log In</button>
      </div>
  
      <div v-else>
        <input v-model="nickname" placeholder="Nickname" />
        <button @click="continueAsGuest">Continue as Guest</button>
      </div>
  
      <button @click="toggleMode">
        {{ mode === 'login' ? 'Continue as Guest' : 'Back to Login' }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { connectSocket } from '@/services/socketService'
  
  const router = useRouter()
  const mode = ref('guest') // or 'login'
  
  const username = ref('')
  const password = ref('')
  const nickname = ref('')
  
  const toggleMode = () => {
    mode.value = mode.value === 'login' ? 'guest' : 'login'
  }
  
  const login = async () => {
    // Simulate login + receiving token from backend
    if (!username.value.trim()) return
    const mockUser = {username: username.value, nickname: username.value}
    connectSocket({ token: mockUser })
    router.push('/lobby-select')
  }
  
  const continueAsGuest = () => {
    if (!nickname.value.trim()) return
    const mockUser = {username: "guest", nickname: nickname.value}
    connectSocket({token: mockUser})
    router.push('/lobby-select')
  }
  </script>
  
  <style scoped>
  .login-container {
    max-width: 300px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  </style>
  