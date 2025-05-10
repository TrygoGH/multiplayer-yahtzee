<template>
    <div>
      <h1>Socket.IO Client</h1>
  
      <button @click="sendMessage">Send Message to Server</button>
  
      <div>
        <input v-model="message" placeholder="Type a message" />
        <button @click="sendBoxMessage">Send message</button>
      </div>
  
      <div>
        <p id="response">{{ response }}</p>
      </div>
  
      <div>
        <p id="messages">{{ messages.join(', ') }}</p>
      </div>
  
      <div>
        <button @click="refreshLobbies">Refresh</button>
        <p id="lobbies">{{ lobbiesList }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { socket, getLobbies, handleText, lobbyTracker, lobbiesMapCache } from '@/services/socketService'
  import { EVENTS } from '@/constants/socketEvents'
  
  // Reactive state
  const message = ref('')
  const response = ref('')
  const messages = ref([])
  const lobbiesList = ref('')
  
  // Handle sending a simple message to the server
  function sendMessage() {
    socket.emit('custom_event', { hello: 'world' })
  }
  
  // Send typed message via handleText
  function sendBoxMessage() {
    if (!message.value.trim()) return
    handleText(message.value)
    message.value = ''
  }
  
  // Refresh lobbies list
  function refreshLobbies() {
    getLobbies()
  }
  
  // Setup listeners once on mount
  onMounted(() => {
    socket.on(EVENTS.server.response.get_lobbies, ({ lobbyKeys, lobbyValues }) => {
      lobbiesMapCache.clear()
      lobbyKeys.forEach((key, i) => {
        lobbiesMapCache.set(key, lobbyValues[i])
      })
      lobbiesList.value = Array.from(lobbiesMapCache.entries())
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n')
    })
  
    socket.on(EVENTS.server.response.join_lobby, (result) => {
      if (result.success) {
        lobbyTracker.current = result.data
        response.value = `Joined lobby: ${result.data.name || result.data.id}`
      } else {
        response.value = `Failed to join lobby`
      }
    })
  
    socket.on(EVENTS.server.response.room_message, (payload) => {
      messages.value.push(`[${payload.room}] ${payload.message}`)
    })
  })
  </script>
  
  <style scoped>
  input {
    padding: 5px;
    margin-right: 10px;
  }
  button {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  p {
    white-space: pre-wrap;
  }
  </style>
  