<template>
    <div class="lobby-container">
      <h1 id="lobby-name">{{ lobbyName }}</h1>
  
      <div class="players">
        <div v-for="i in 4" :key="i" class="player-slot">
          Player {{ i }}
        </div>
      </div>
  
      <div class="controls">
        <button :disabled="!isHost" @click="startGame">Start Game</button>
        <button @click="leaveLobby">Leave Lobby</button>
      </div>
  
      <div class="chat-section">
        <div class="chat-box" ref="chatBox">
          <div v-for="(msg, index) in chatMessages" :key="index">
            {{ msg.sender }}: {{ msg.message }}
          </div>
        </div>
        <div class="chat-input">
          <input type="text" v-model="chatMessage" placeholder="Type a message..." @keyup.enter="sendMessage" />
          <button @click="sendMessage">Send</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router' // Import the router to use its functionality
  import { getSocketSafe, handleText, lobbyTracker, EVENTS} from '@/services/socketService';
  
  const router = useRouter() // Initialize Vue Router

const socket = (() => {
  try {
    return getSocketSafe().unwrapOrThrow();
  } catch (error) {
    console.error("Failed to get socket:", error);
    router.push({
      name: "Login"
    })
    return;
  }
})();


  const lobbyName = ref("Example Lobby") // Replace this with actual data from your backend
  const isHost = ref(true) // You'd typically get this info from server
  const chatMessages = ref([])
  const chatMessage = ref("")
  const chatBox = ref(null)
  
  function sendMessage() {
    const trimmed = chatMessage.value.trim()
    if (trimmed) {
      console.log(`Sending message to room ${lobbyTracker.current.id}`);
      socket.emit(EVENTS.client.request.message_room, {room: lobbyTracker.current.id, message: trimmed})
      appendMessage("You", trimmed)
      chatMessage.value = ""
    }
  }
  
  function appendMessage(sender, message) {
    chatMessages.value.push({ sender, message })
    nextTick(() => {
      if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight
      }
    })
  }
  
  function leaveLobby() {
    socket.emit(EVENTS.client.request.leave_lobby)
    lobbyTracker.current = null;
    router.push({ name: 'LobbySelect' }) 
  }
  
  function startGame() {
    console.log(EVENTS.client.request.start_game);
    socket.emit(EVENTS.client.request.start_game, lobbyTracker.current.id);
    console.log("Start game requested")
  }
  
  onMounted(() => {
    console.log("Chicken jockey!", lobbyTracker.current);
    socket.on(EVENTS.client.broadcast.message_room, ({ sender, message }) => {
      console.log(`got message! ${message}`);
      appendMessage(sender, message)
    })

    socket.on(EVENTS.server.response.start_game, () => {
      router.push({ name: 'Game' }) 
    })
  })
  </script>
  
  <style scoped>
  body {
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
    margin: 0;
    padding: 20px;
  }
  
  .lobby-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  #lobby-name {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .players {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .player-slot {
    width: 100px;
    height: 100px;
    background-color: #ddd;
    border-radius: 4px;
    text-align: center;
    line-height: 100px;
    font-weight: bold;
  }
  
  .controls {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .chat-section {
    border-top: 1px solid #ccc;
    padding-top: 10px;
  }
  
  .chat-box {
    height: 200px;
    overflow-y: auto;
    background: #f9f9f9;
    padding: 10px;
    border: 1px solid #ccc;
    margin-bottom: 10px;
    color: black;
  }
  
  .chat-input {
    display: flex;
    gap: 10px;
  }
  
  .chat-input input {
    flex: 1;
    padding: 8px;
  }
  
  .chat-input button {
    padding: 8px 16px;
  }
  </style>
  