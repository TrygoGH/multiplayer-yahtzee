class Player {
  constructor(user, socket, socketId) {
    this.user = user;  // Composition: Player has a User
    this.socket = socket;
    this.socketId = socketId; // Player has a WebSocket
    this.room = null;
  }
}

export default Player;
