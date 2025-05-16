<template>
  <div class="lobby-container">
    <!-- Leave button top-left -->
    <button class="leave-btn" @click="leaveLobby">Leave Lobby</button>

    <h1 id="lobby-name">{{ lobbyName }}</h1>

    <!-- Dice display -->
    <div class="dice-area">
      <div
        v-for="(die, idx) in dice"
        :key="idx"
        class="die"
        :class="{ held: die.isHeld }"
        @click="toggleHold(die)"
      >
        {{ die.value }}
      </div>
    </div>

    <!-- Roll Dice button -->
    <div class="controls">
      <button @click="rollDice" :disabled="rollsLeft === 0">
        Roll Dice ({{ rollsLeft }} left)
      </button>
    </div>

    <!-- Chat section -->
    <div class="chat-section">
      <h2>Chat</h2>
      <div class="chat-box" ref="chatBox">
        <div v-for="(msg, i) in chatMessages" :key="i">
          {{ msg.sender }}: {{ msg.message }}
        </div>
      </div>
      <div class="chat-input">
        <input
          v-model="chatMessage"
          placeholder="Type a message..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getSocketSafe, EVENTS, lobbyTracker } from '@/services/socketService'
import { PlayerGameData } from '@/models/playerGameData';
import Player from '../models/Player';

const router = useRouter()
const socket = getSocketSafe()

const lobbyName = ref(lobbyTracker.current?.name || 'Game Room')
const chatMessages = ref([])
const chatMessage = ref('')
const chatBox = ref(null)

// Dice handler instance
const playerGameData = new PlayerGameData({
  dice: [
    {value: Math.floor(Math.random() * 6) + 1, isHeld: false},
    {value: Math.floor(Math.random() * 6) + 1, isHeld: false},
    {value: Math.floor(Math.random() * 6) + 1, isHeld: false},
    {value: Math.floor(Math.random() * 6) + 1, isHeld: false},
    {value: Math.floor(Math.random() * 6) + 1, isHeld: false},
  ],
  rollsLeft: 3
});
console.log("dice", playerGameData);
const dice = ref(playerGameData.dice)
const rollsLeft = ref(playerGameData.rollsLeft)


function rollDice() {
  //send socket event
  socket.emit(EVENTS.client.request.roll);
}

function toggleHold(die) {
  die.isHeld = !die.isHeld;
  console.log(playerGameData.dice);
}

function sendMessage() {
  const text = chatMessage.value.trim()
  if (!text) return
  socket.emit(EVENTS.client.request.message_room, {
    room: lobbyTracker.current.id,
    message: text
  })
  appendMessage('You', text)
  chatMessage.value = ''
}

function appendMessage(sender, message) {
  chatMessages.value.push({ sender, message })
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}

function leaveLobby() {
  socket.emit(EVENTS.client.request.leave_lobby)
  lobbyTracker.current = null
  router.push({ name: 'LobbySelect' })
}

onMounted(() => {
  socket.on(EVENTS.client.broadcast.message_room, ({ sender, message }) => {
    appendMessage(sender, message)
  })

  socket.on(EVENTS.server.action.send_game_data, (gameData) => {
    console.log("sGameData", gameData);
  })
})
</script>

<style scoped>
.lobby-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.leave-btn {
  position: absolute;
  top: 20px;
  left: 20px;
}

#lobby-name {
  text-align: center;
  margin-bottom: 20px;
}

.dice-area {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.die {
  width: 60px;
  height: 60px;
  background: #f2f2f2;
  border: 2px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  user-select: none;
}

.die.held {
  background: #ddd;
  border-color: #999;
}

.controls {
  display: flex;
  justify-content: center;
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
