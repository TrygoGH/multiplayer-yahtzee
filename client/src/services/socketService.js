// socketService.js
import { io } from "socket.io-client"
import Lobby from "../models/Lobby"

export let socket = null;
export const lobbiesMapCache = new Map();
export const lobbyTracker = { current: null };
export const EVENTS = {
    client: {
      request: {
        join_lobby: "join_lobby_request",
        leave_lobby: "leave_lobby_request",
        get_lobbies: "get_lobbies_request",
        message_room: "message_room_request",
        start_game: "start_game_request",
        roll: "roll_request",
        toggle_hold: "toggle_hold_request",
        score: "score_request",
        make_lobby: "make_lobby_request",
      },
      response: {
        
      },
      broadcast: {
        message_room: "message_room_broadcast",
      },
      action: {
        connect: "connection",
        disconnect: "disconnect",
        message: "message",
        update_lobby: "update_lobby",
      },
    },
  
    server: {
      request: {
        // Server-to-client requests, if any
      },
      response: {
        join_lobby: "join_lobby_response",
        leave_lobby: "leave_lobby_response",
        get_lobbies: "get_lobbies_response",
        message_room: "message_room_response",
        start_game: "start_game_response",
        roll: "roll_response",
        score: "score_response",
      },
      broadcast: {
        // Server-initiated broadcasts (if needed)
      },
      action: {
        message: "message",
        result_messages: "result_messages",
        send_game_data: "send_game_data",
        send_to_home: "send_to_home",
      },
    },
  };
  

function setupSocket(socket){
  socket.on(EVENTS.server.response.get_lobbies, ({ lobbyKeys, lobbyValues }) => {
  lobbiesMapCache.clear()
  lobbyKeys.forEach((key, index) => {
    lobbiesMapCache.set(key, lobbyValues[index])
  })
  console.log("lobbies", lobbiesMapCache)
})

socket.on(EVENTS.server.response.join_lobby, (lobbyJoinResult) => {
  if (lobbyJoinResult.success) {
    lobbyTracker.current = lobbyJoinResult.data
  }
})

socket.on(EVENTS.server.action.send_to_home, () => {
  console.log("waaaaaaaaa");
})
}

// Functions you can call from Vue components
export function getLobbies() {
  socket.emit(EVENTS.client.request.get_lobbies)
}

export function joinLobby(newLobby) {
  const currentLobby = lobbyTracker.current
  const currentLobbyID = currentLobby ? currentLobby.id : null
  const lobbyPackage = {
    currentLobbyID: currentLobbyID,
    newLobbyID: newLobby.id
  }
  socket.emit(EVENTS.client.request.join_lobby, lobbyPackage)
}

export function handleText(text) {
  if (!lobbyTracker.current) {
    console.warn("You're not in a room")
    return
  }

  socket.emit(EVENTS.client.request.message_room, {
    room: lobbyTracker.current.id,
    message: text
  })
}


export function connectSocket(authData) {
  socket = io('http://localhost:3000', {
    auth: authData
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  sessionStorage.setItem("authData", JSON.stringify(authData));

  setupSocket(socket);
  return socket;
}

export function getSocket() {
  if (!socket) {
    throw new Error('Socket not connected yet')
  }
  return socket
}

export function getSocketSafe(){
  const invalidSocket = (!socket || socket.disconnected);
  if(!invalidSocket){
    return getSocket();
  }

  const storedAuthData = sessionStorage.getItem("authData");

  if (!storedAuthData) {
    throw new Error('Socket not connected yet');
  }

  const authData = JSON.parse(storedAuthData);
  
  return connectSocket(authData);
}

export function replace(eventName, callback) {
  socket.off(eventName);
  socket.on(eventName, callback);
}

export function clearAll(socket) {
  const events = socket.eventNames(); 
  events.forEach((event) => {
    socket.off(event); 
  });
}

/*
Event Types:

- action: One-way actions that don't expect a response (e.g., "disconnect", "message").
- request: A client or server is requesting data or an operation. Expects a corresponding response event.
- response: Sent in reply to a request. Should be handled by the original requester.
- broadcast: Sent to multiple clients (e.g., a room or all clients). Can be combined with other types if needed.
*/

