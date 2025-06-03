<template>
  <div>
    <h1>Lobby Select</h1>
    <div>
      <button id="sendMessage" @click="sendMessage">Create Lobby</button>
    </div>
    <div>
      <p id="response">{{ responseMessage }}</p>
    </div>
    <div id="messages">
      <p v-for="(message, index) in messageList" :key="index">{{ message }}</p>
    </div>
    <div id="lobbies" class="lobbies-container">
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
import { onMounted, ref } from 'vue';
import { getSocket } from '../services/socketService';

const messageList = ref([]);
const responseMessage = ref('');
const messageInput = ref('');
const lobbies = ref([]);

// Initialize Vue Router
const router = useRouter();

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
setupSocketEvents();


// Methods
const sendMessage = () => {
  console.log(EVENTS.client.request.make_lobby);
  socket.emit(EVENTS.client.request.make_lobby, {name: `Lobby ${Math.floor(Math.random() * 10000)}`});
};

const sendText = () => {
  if (messageInput.value.length > 0) {
    handleText(messageInput.value);
    messageInput.value = '';  // Reset the input after sending
  }
};

const tryJoinLobby = (lobby) => {
  console.log("joining", lobby);
  joinLobby(lobby);
};

function setupSocketEvents(){
  console.log(socket);
  // Listen for socket events
socket.on(EVENTS.server.action.message, (data) => {
  responseMessage.value = data;
});

socket.on(EVENTS.client.broadcast.message_room, ({ sender, message }) => {
  messageList.value.push(message);
});

socket.on(EVENTS.server.response.get_lobbies, ({ lobbyKeys, lobbyValues }) => {
  lobbies.value = lobbyValues.map(lobby => Lobby.fromObject(lobby));
  console.log(lobbies.value);
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

  socket.on(EVENTS.server.action.send_to_home, () =>{
  console.log("home");
    router.push({ name: 'LobbySelect' }) 
  })

}

// Call getLobbies to populate the list on load
getLobbies();

onMounted(() =>{
      console.log(localStorage);
})
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

.lobbies-container{
    background: white;
    color: black;
}

</style>
