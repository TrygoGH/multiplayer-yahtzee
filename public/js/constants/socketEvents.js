export const EVENTS = {
    CLIENT: {
        MESSAGE: "message",
        CONNECT: "connection",
        JOIN_LOBBY: "join_lobby",
        LEAVE_LOBBY: "leave_lobby",
        UPDATE_LOBBY: "update_lobby",
        GET_LOBBIES: "get_lobbies",
        DISCONNECT: "disconnect",
    },

    SERVER: {
        MESSAGE: "message",
        SEND_LOBBIES: "receive_lobbies",
        JOIN_LOBBY: "join_lobby",
    },
};
  