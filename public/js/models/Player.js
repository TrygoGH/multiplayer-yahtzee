class Player {
  constructor(user, socket) {
    this.user = user;  // Composition: Player has a User
    this.socket = socket;  // Player has a WebSocket
    this.room = null;
  }

  sendMessage(event, data) {
    this.socket.emit(event, data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default Player;
