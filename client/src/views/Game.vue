<template>
  <div class="lobby-container">
    <!-- Leave button top-left -->
    <button class="leave-btn" @click="leaveLobby">Leave Lobby</button>

    <h1 id="lobby-name">{{ lobbyName }}</h1>

    <!-- Dice display -->
    <div class="dice-area">
      <div
        v-for="(die, idx) in gameData.dice"
        :key="idx"
        class="die"
        :class="{ held: die.isHeld }"
        @click="toggleHold(idx)"
      >
        {{ die.value }}
      </div>
    </div>

    <!-- Roll Dice button -->
    <div class="controls">
      <button @click="rollDice" :disabled="gameData.rollsLeft === 0">
        Roll Dice ({{ gameData.rollsLeft }} left)
      </button>
    </div>

    <div class="scoreboard">
  <h2>Scoreboard</h2>
  <div class="score-row" v-for="(value, category) in gameData.scores" :key="category">
    <span class="category-name">{{ category.replaceAll('_', ' ') }}</span>
    <button
      class="score-value"
      :disabled="gameData.scoredScores.scores[category] !== null"
      @click="score(category)"
    >
      {{ possibleScores[category] ?? '-' }}
    </button>
  </div>
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
import { getSocketSafe, EVENTS, channels } from '@/services/socketService'
import { PlayerGameData } from '@/models/playerGameData';
import Player from '../models/Player';

const router = useRouter()
const socket = getSocketSafe().unwrapOrThrow();

const lobbyName = ref('Game Room')
const chatMessages = ref([])
const chatMessage = ref('')
const chatBox = ref(null)

// Dice handler instance
const gameData = ref(new PlayerGameData({}));
const possibleScores = ref({});

function rollDice() {
  //send socket event
  socket.emit(EVENTS.client.request.roll);
}

function toggleHold(index) {
  socket.emit(EVENTS.client.request.toggle_hold, index);
}

function score(category) {
  socket.emit(EVENTS.client.request.score, category);
}

function sendMessage() {
  const text = chatMessage.value.trim()
  if (!text) return
  socket.emit(EVENTS.client.request.message_room, {
    message: text
  })
  console.log("sending message");
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
  router.push({ name: 'LobbySelect' })
}

function updatePlayerGameData(target, source) {
  Object.keys(target).forEach(key => {
    if (key in source) {
      target[key] = source[key];
    }
  });

  possibleScores.value = gameData.value.scores;
}

function initPlayer(){
  toggleHold(0);
}

onMounted(() => {
  console.log(EVENTS.server.action.send_to_home);
  socket.on(EVENTS.server.action.send_to_home, () =>{
  console.log("home");
    router.push({ name: 'LobbySelect' }) 
  })

  socket.on(EVENTS.client.broadcast.message_room, ({ sender, message }) => {
    appendMessage(sender, message)
  })

  socket.on(EVENTS.server.action.send_game_data, (newGameData) => {
    updatePlayerGameData(gameData.value, newGameData);
    console.log(gameData.value);
  })

  initPlayer();
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

.scoreboard {
  margin-top: 30px;
  border-top: 1px solid #ccc;
  padding-top: 15px;
}

.score-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.category-name {
  text-transform: capitalize;
}

.score-value {
  background: #e0f7fa;
  border: 1px solid #26c6da;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.score-value:disabled {
  background: #ccc;
  cursor: not-allowed;
}

</style>
