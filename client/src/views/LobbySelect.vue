<template>
  <div>
    <h1>Lobby Select</h1>
    <div>
      <button id="sendMessage" @click="sendMessage">Send Message to Server</button>
    </div>
    <div>
      <p id="response">{{ responseMessage }}</p>
    </div>
    <div id="messages">
      <p v-for="(message, index) in messageList" :key="index">{{ message }}</p>
    </div>
    <div id="lobbies">
      <div v-for="lobby in lobbies" :key="lobby.id" class="lobby-card">
        <h3>{{ lobby.name }}</h3>
        <p>Owner: {{ lobby.owner.nickname }}</p>
        <p class="players">{{ lobby.players.length }}/{{ lobby.maxPlayers }}</p>
        <button @click="tryJoinLobby(lobby)">Join</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import relevant services, constants, and Vue Router
import { getLobbies, getSocketSafe, handleText, lobbyTracker, lobbiesMapCache, joinLobby, EVENTS} from '@/services/socketService';
import Lobby from '@/models/Lobby';
import { useRouter } from 'vue-router';  // Import useRouter to use routing

// Reactive data
import { ref } from 'vue';
import { getSocket } from '../services/socketService';

const messageList = ref([]);
const responseMessage = ref('');
const messageInput = ref('');
const lobbies = ref([]);
const socket = getSocketSafe();
setupSocketEvents();

// Initialize Vue Router
const router = useRouter();

// Methods
const sendMessage = () => {
  socket.emit(EVENTS.client.action.message, "Hello from client!");
};

const sendText = () => {
  if (messageInput.value.length > 0) {
    handleText(messageInput.value);
    messageInput.value = '';  // Reset the input after sending
  }
};

const tryJoinLobby = (lobby) => {
  console.log("joining");
  joinLobby(lobby);
};

function setupSocketEvents(){
  // Listen for socket events
socket.on(EVENTS.server.action.message, (data) => {
  responseMessage.value = data;
});

socket.on(EVENTS.client.broadcast.message_room, ({ sender, message }) => {
  messageList.value.push(message);
});

socket.on(EVENTS.server.response.get_lobbies, ({ lobbyKeys, lobbyValues }) => {
  lobbies.value = lobbyValues.map(lobby => Lobby.fromObject(lobby));
});

socket.on(EVENTS.server.response.join_lobby, (lobbyJoinResult) => {
  if (lobbyJoinResult.success) {
    lobbyTracker.current = lobbyJoinResult.data;
    responseMessage.value = `Joined lobby with id: ${lobbyTracker.current.id}`;
    // After successfully joining, route to the Lobby page
    router.push({ name: 'Lobby', params: { lobbyId: lobbyTracker.current.id } });
  } else {
    responseMessage.value = lobbyJoinResult.error;
  }
});

}

// Call getLobbies to populate the list on load
getLobbies();
</script>

<style scoped>
/* Add some basic styling for your lobbies */
.lobby-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
}

.players {
  font-weight: bold;
}
</style>
