// socketService.js
import { io } from "socket.io-client"
import Lobby from "../models/Lobby"
import { SocketWrapper } from "./socketWrapper";
import { getAuthData, setAuthData } from "./loginService";
import Result from "../utils/Result";

let _socket = null;
let socket = null;
let serverSessionToken = null;

export const lobbiesMapCache = new Map();
export const SOCKET_CHANNELS = {
  lobby: "lobby",
};
export const channels = {};
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
      login: "login_request",
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
      login: "login_response",
    },
    broadcast: {
      // Server-initiated broadcasts (if needed)
    },
    action: {
      message: "message",
      result_messages: "result_messages",
      send_game_data: "send_game_data",
      send_to_home: "send_to_home",
      send_token: "send_token",
      send_server_session_token: "send_server_session_token",
    },
  },
};


function setupSocket(socket) {
  socket.on(EVENTS.server.action.send_token, (sessionToken) =>{
    console.log("got token", sessionToken);
    console.log(setAuthData(sessionToken));
  })
  socket.on(EVENTS.server.action.send_server_session_token, (newServerSessionToken) =>{
    if(socket?.data?.serverSessionToken != newServerSessionToken && socket?.data?.serverSessionToken != null) socket.disconnect();
    socket.data = {};
    socket.data.serverSessionToken = newServerSessionToken;
    serverSessionToken = newServerSessionToken;

    console.log("got server token", newServerSessionToken);
    console.log(socket.data.serverSessionToken);
    console.log(serverSessionToken);

  })
  
  socket.on(EVENTS.server.response.get_lobbies, ({ lobbyKeys, lobbyValues }) => {
    lobbiesMapCache.clear()
    lobbyKeys.forEach((key, index) => {
      lobbiesMapCache.set(key, lobbyValues[index])
    })
    console.log("lobbies", lobbiesMapCache)
  })

  socket.on(EVENTS.server.response.join_lobby, (lobbyJoinResult) => {
    if (lobbyJoinResult.success) {
      channels[SOCKET_CHANNELS.lobby] = lobbyJoinResult.data.id;
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
  const lobbyPackage = {
    newLobbyID: newLobby.id
  }
  socket.emit(EVENTS.client.request.join_lobby, lobbyPackage)
}

export function handleText(text) {
  if (!channels[SOCKET_CHANNELS.lobby]) {
    console.warn("You're not in a room")
    return
  }

  socket.emit(EVENTS.client.request.message_room, {
    room: channels[SOCKET_CHANNELS.lobby],
    message: text
  })
}


export function connectSocket({token, username, email, nickname} = {}) {
  console.log("we have socket:", _socket != null, socket != null);

  if(_socket) {
    console.log("disconnecting socket cause already connected");
    socket = null;
    _socket.disconnect()
  }
  _socket = io(import.meta.env.VITE_API_URL, {
    auth: {token, username, email, nickname, serverSessionToken: serverSessionToken},
  });

  _socket.on('connect_error', (err) => {
    _socket.disconnect();
    _socket = null;
    socket = null;
    serverSessionToken = null;
    console.error('Socket connection error:', err.message);
  });

  socket = wrapSocket(_socket);
  setupSocket(socket);
  return Result.success(socket);
}

export function getSocket() {
  return socket 
  ? Result.success(socket)
  : Result.failure("Socket not connected yet");
}

export function getSocketSafe() {
  const isInvalidSocket = !socket;
  if (!isInvalidSocket) {
    return getSocket();
  }

  const getAuthDataResult = getAuthData();
  if(getAuthDataResult.isFailure()) return Result.failure(getAuthDataResult.error);

  const authData = getAuthDataResult.unwrap();
  const connectSocketResult = connectSocket(authData);
  if(connectSocketResult.isFailure()) return connectSocketResult;

  const connectedSocket = connectSocketResult.unwrap();
  return Result.success(connectedSocket);
}

function wrapSocket(socket){
  return new SocketWrapper(socket);
}

class SocketError{}
export class InvalidTokenError extends SocketError {}
export class TokenExpiredError extends SocketError {}
export class MissingTokenError extends SocketError {}
export class UnauthorizedError extends SocketError {} // Generic fallback
export class ForbiddenError extends SocketError {} // Authenticated but not allowed
export class ConnectionTimeoutError extends SocketError {}
export class ConnectionRefusedError extends SocketError {}
export class ServerUnavailableError extends SocketError {} // e.g., maintenance

/*
Event Types:

- action: One-way actions that don't expect a response (e.g., "disconnect", "message").
- request: A client or server is requesting data or an operation. Expects a corresponding response event.
- response: Sent in reply to a request. Should be handled by the original requester.
- broadcast: Sent to multiple clients (e.g., a room or all clients). Can be combined with other types if needed.
*/

