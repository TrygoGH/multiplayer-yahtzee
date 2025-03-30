// import { io } from "socket.io-client";
import { EVENTS } from "./constants/socketEvents.js";
import Lobby from "./models/Lobby.js"
// import { io } from "https://cdn.socket.io/4.8.1/socket.io.min.js";

console.log("HIIIII");
const socket = io("http://localhost:3000");  // Connect to the server
console.log(socket); 
let lobbiesContainer = document.getElementById("lobbies")

loadHTMLStuff();
let lobbiesMapCache = new Map();

// Listen for messages from the server
socket.on(EVENTS.SERVER.MESSAGE, (data) => {
  document.getElementById("response").innerText = data;
});

socket.on(EVENTS.SERVER.SEND_LOBBIES, ({lobbyKeys, lobbyValues}) => {
  document.getElementById("lobbies").replaceChildren();
  lobbiesMapCache = new Map(lobbyKeys.map((key, index) => [key, lobbyValues[index]]));
  console.log("lobbies", lobbyValues);
  displayLobbies(lobbyValues);
  console.log(lobbiesMapCache);
});

socket.on(EVENTS.SERVER.JOIN_LOBBY)

/**
 * @param { MapIterator<Lobby> } lobbies - A game lobby
 */
function displayLobbies(lobbies){
  console.log(lobbies);
  lobbies.sort((a, b) => b.timestamp - a.timestamp)
  for(const lobby of lobbies){
    createLobbyCard(Lobby.fromObject(lobby));
  }
}

function getLobbies(){
  socket.emit(EVENTS.CLIENT.GET_LOBBIES);
}

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
  playersElement.textContent = `${lobby.players.length}/${lobby.maxPlayers}`;
  card.appendChild(playersElement);

  // Join button
  const joinButton = document.createElement('button');
  joinButton.classList.add('join-btn');
  joinButton.textContent = 'Join';
  joinButton.addEventListener('click', () => joinLobby(lobby));
  card.appendChild(joinButton);

  document.getElementById("lobbies").appendChild(card);
}

function loadHTMLStuff(){
  document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("sendMessage").onclick = function () {
      socket.emit(EVENTS.CLIENT.MESSAGE, "Hello from client!");
    };
    
    document.getElementById("refreshLobbies").onclick = getLobbies();
  })
}

/**
 * @param { Lobby } lobby - A game lobby
 */
function joinLobby(lobby) {
  socket.emit(EVENTS.CLIENT.JOIN_LOBBY, lobby.id);
}


