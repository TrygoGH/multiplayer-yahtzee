import { Socket } from "socket.io";
import User from "./User.js";

class Player {
  constructor(user, socket) {
    this.user = user;  // Composition: Player has a User
    this.socket = socket;  // Player has a WebSocket
  }

  sendMessage(event, data) {
    this.socket.emit(event, data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default Player;
