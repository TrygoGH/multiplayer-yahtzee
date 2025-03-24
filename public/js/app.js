// import { io } from "socket.io-client";
import { EVENTS } from "../js/constants/socketEvents.js";
import Lobby from "./models/Lobby.js"
// import { io } from "https://cdn.socket.io/4.8.1/socket.io.min.js";

console.log("HIIIII");
const socket = io("http://localhost:3000");  // Connect to the server
console.log(socket); 
let lobbiesContainer = document.getElementById("lobbies")

loadHTMLStuff();

// Listen for messages from the server
socket.on(EVENTS.SERVER.MESSAGE, (data) => {
  document.getElementById("response").innerText = data;
});

socket.on(EVENTS.SERVER.SEND_LOBBIES, (data) => {
  document.getElementById("lobbies").replaceChildren();
  data.forEach((lobby) => {
    console.log(lobby);
    createLobbyCard(lobby);
  });
});

/**
 * @param { Lobby } lobby - A game lobby
 */
function createLobbyCard(lobby) {
  const card = document.createElement('div');
  card.classList.add('lobby-card');

  // Name of the lobby
  const nameElement = document.createElement('h3');
  nameElement.textContent = lobby.name;
  card.appendChild(nameElement);

  // Owner of the lobby
  const ownerElement = document.createElement('p');
  ownerElement.textContent = `Owner: ${lobby.owner}`;
  card.appendChild(ownerElement);

  // Players count
  const playersElement = document.createElement('p');
  playersElement.classList.add('players');
  playersElement.textContent = `${lobby.players.length}/${lobby.maxPlayers} players`;
  card.appendChild(playersElement);

  // Join button
  const joinButton = document.createElement('button');
  joinButton.classList.add('join-btn');
  joinButton.textContent = 'Join';
  joinButton.addEventListener('click', () => joinLobby(lobby.id));
  card.appendChild(joinButton);

  document.getElementById("lobbies").appendChild(card);
}

function loadHTMLStuff(){
  document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("sendMessage").onclick = function () {
      socket.emit(EVENTS.CLIENT.MESSAGE, "Hello from client!");
    };
    
    document.getElementById("refreshLobbies").onclick = function () {
      socket.emit(EVENTS.CLIENT.GET_LOBBIES);
    };
  })
}

function joinLobby(id) {
  socket.emit(EVENTS.CLIENT.JOIN_LOBBY, id);
}


