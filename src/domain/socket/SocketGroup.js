import { Socket } from "socket.io";
export class SocketGroup {
  constructor(sockets = []) {
    /** @type {Set<Socket>} */
    this.sockets = new Set(sockets); // Use a Set to avoid duplicates
  }

  /**
   * Adds a new socket to the list
   * @param {Socket} socket - A Socket.IO socket instance
   */
  add(socket) {
    this.sockets.add(socket);
  }

  /**
   * Removes a socket from the list
   * @param {Socket} socket - The socket to remove
   */
  remove(socket) {
    this.sockets.delete(socket);
  }

  has(socket) {
    return this.sockets.includes(socket);
  }

  /**
   * Disconnects all sockets and clears the list
   */
  disconnectAll() {
    for (const socket of this.sockets) {
      socket.disconnect(true); // true = close underlying connection
    }
    this.sockets.clear();
  }

  emitAll(ev, ...args){
    for (const socket of this.sockets) {
      socket.emit(ev, ...args); 
    }
  }

  /**
   * Returns the number of active sockets
   * @returns {number}
   */
  count() {
    return this.sockets.size;
  }

  /**
   * Executes a function on every socket
   * @param {(socket: Socket) => void} callback 
   */
  forEach(callback) {
    this.sockets.forEach(callback);
  }

  async forEachAsync(callback) {
  for (const socket of this.sockets) {
    await callback(socket);
  }
}
}
