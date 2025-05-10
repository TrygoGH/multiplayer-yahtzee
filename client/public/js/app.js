// import { io } from "socket.io-client";
import { EVENTS } from "../../src/constants/socketEvents.js";
import Lobby from "../../src/models/Lobby.js"
// import { io } from "https://cdn.socket.io/4.8.1/socket.io.min.js";

export const socket = io("http://localhost:3000");  // Connect to the server
export const lobbiesMapCache = new Map();
export const lobbyTracker = { current: null, next: null };

console.log(socket); 

socket.on(EVENTS.server.response.get_lobbies, ({lobbyKeys, lobbyValues}) => {
  document.getElementById("lobbies").replaceChildren();
  lobbiesMapCache.clear();
  lobbyKeys.forEach((key, index) => {
    lobbiesMapCache.set(key, lobbyValues[index]); // Set new key-value pairs in the map
  });
  console.log("lobbies", lobbiesMapCache);
  console.log(lobbiesMapCache);
});

socket.on(EVENTS.server.response.join_lobby, (lobbyJoinResult) =>{
  console.log(lobbyJoinResult.data);
  console.log(lobbyTracker.current);
  if(lobbyJoinResult.success){
    lobbyTracker.current = lobbyJoinResult.data;
  }
})


export function getLobbies(){
  socket.emit(EVENTS.client.request.get_lobbies);
}

/**
 * @param { Lobby } lobby - A game lobby
 */
export function joinLobby(newLobby) {
  const currentLobby = lobbyTracker.current;
  const currentLobbyID = currentLobby ? currentLobby.id : null;
  const lobbyPackage = {currentLobbyID: currentLobbyID, newLobbyID: newLobby.id} 
  socket.emit(EVENTS.client.request.join_lobby, lobbyPackage);
}

// Function that handles the text (for demonstration)
export function handleText(text) {
  if(!lobbyTracker.current){
    setResponse("You're not in a room");
    return;
  }

  socket.emit(EVENTS.client.request.message_room, {room: lobbyTracker.current.id, message: text});
  console.log("sending event to message request");
  // You can add further handling logic here (e.g., sending it to a server)
}

