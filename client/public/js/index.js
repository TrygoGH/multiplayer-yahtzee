import { EVENTS } from "../../src/constants/socketEvents.js";
import Lobby from "../../src/models/Lobby.js";
import {
  joinLobby,
  socket,
  lobbiesMapCache,
  lobbyTracker,
  getLobbies,
  handleText,
} from "./app.js";

let lobbiesContainer;
const messageList = [];
loadHTMLStuff();


// Listen for messages from the server
socket.on(EVENTS.server.action.message, (data) => {
  setResponse(data);
});

socket.on(EVENTS.client.broadcast.message_room, ({sender, message}) => {
  console.log("received message", message);
  messageList.push(message)
  displayMessages();
});

socket.on(EVENTS.server.action.message, (data) => {
  setResponse(data);
});

socket.on(EVENTS.server.response.join_lobby, (lobbyJoinResult) =>{
  if(lobbyJoinResult.success){
    window.location.assign('/lobby');
  }
})

// Listen for messages from the server
socket.on(EVENTS.server.action.result_messages, (data) => {
  const message = data.map(obj => obj.success ? obj.data : obj.error).join('\n');
  setResponse(message);
});

socket.on(EVENTS.server.response.get_lobbies, ({lobbyKeys, lobbyValues}) => {
  document.getElementById("lobbies").replaceChildren();
  displayLobbies(lobbyValues);
});

socket.on(EVENTS.server.response.join_lobby, (lobbyJoinResult) =>{
  console.log(lobbyJoinResult.data);
  console.log(lobbyTracker.current);
  if(lobbyJoinResult.success){
    lobbyTracker.current = lobbyJoinResult.data;
  }
  else{
    setResponse(lobbyJoinResult.error);
  }
})

function setResponse(message){
  document.getElementById("response").innerText = message;
}


function displayMessages(){
  const message = messageList.map(obj => obj).join('\n');
  document.getElementById("messages").innerText = message;
}
/**
 * @param { MapIterator<Lobby> } lobbies - A game lobby
 */
function displayLobbies(lobbies){
  console.log(lobbies);
  lobbies.sort((a, b) => b.timestamp - a.timestamp)
  for(const lobby of lobbies){
    let lobbyObj = Lobby.fromObject(lobby);
    console.log("lobject", lobby, lobbyObj);
    createLobbyCard(Lobby.fromObject(lobby));
  }
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
  ownerElement.textContent = `Owner: ${lobby.owner.nickname}`;
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

function loadHTMLStuff() {
  document.addEventListener('DOMContentLoaded', function () {

    lobbiesContainer = document.getElementById("lobbies");
    document.getElementById("sendMessage").onclick = function () {
      socket.emit(EVENTS.client.action.message, "Hello from client!");
    };
    
    document.getElementById("refreshLobbies").onclick = getLobbies;
    document.getElementById("messageBoxButton").onclick = sendText;
  })
}


function sendText() {
  const text = document.getElementById('messageBox').value;
  if(!(text.length > 0)){
    return;
  }
  handleText(text);
  document.getElementById('messageBox').value = '';
}


