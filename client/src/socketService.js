// socketService.js
import { io } from "socket.io-client"
import { EVENTS } from "./constants/socketEvents"
import Lobby from "./models/Lobby"

export const socket = io("http://localhost:3000")
export const lobbiesMapCache = new Map();
export const lobbyTracker = { current: null };

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
