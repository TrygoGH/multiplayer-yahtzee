/*
Event Types:

- action: One-way actions that don't expect a response (e.g., "disconnect", "message").
- request: A client or server is requesting data or an operation. Expects a corresponding response event.
- response: Sent in reply to a request. Should be handled by the original requester.
- broadcast: Sent to multiple clients (e.g., a room or all clients). Can be combined with other types if needed.
*/

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
  