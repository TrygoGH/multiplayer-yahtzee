/*
Event Types:

- action: One-way actions that don't expect a response (e.g., "disconnect", "message").
- request: A client or server is requesting data or an operation. Expects a corresponding response event.
- response: Sent in reply to a request. Should be handled by the original requester.
- broadcast: Sent to a room/multiple clients. Can be combined with other types if needed.
*/

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
    },
  },
};
  