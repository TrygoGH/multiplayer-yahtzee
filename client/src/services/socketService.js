// socketService.js
import { io } from "socket.io-client"
import Lobby from "../models/Lobby"

export const socket = io("http://localhost:3000")
export const lobbiesMapCache = new Map();
export const lobbyTracker = { current: null };
export const EVENTS = {
  client: {
    request: {
      join_lobby: "join_lobby_request",
      leave_lobby: "leave_lobby_request",
      get_lobbies: "get_lobbies_request",
      message_room: "message_room_request",
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
    },
    broadcast: {
      // Server-initiated broadcasts (if needed)
    },
    action: {
      message: "message",
      result_messages: "result_messages",
    },
  },
};

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

/*
Event Types:

- action: One-way actions that don't expect a response (e.g., "disconnect", "message").
- request: A client or server is requesting data or an operation. Expects a corresponding response event.
- response: Sent in reply to a request. Should be handled by the original requester.
- broadcast: Sent to multiple clients (e.g., a room or all clients). Can be combined with other types if needed.
*/

