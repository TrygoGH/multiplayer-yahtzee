import { SocketGroup } from "../socket/socketGroup.js"

export class UserSocketConnections {
  constructor() {
    /**
     * Maps user ID to their SocketGroup instance
     * @type {Map<string, SocketGroup>}
     */
    this.userSocketConnections = new Map();

    /**
     * Maps socket ID to user ID for reverse lookup
     * @type {Map<string, string>}
     */
    this.socketToUserId = new Map();
  }

  /**
   * Adds or updates a user's socket group
   * @param {string} id - The unique user ID
   */
  addUser(id) {
    const socketGroup = new SocketGroup();
    this.userSocketConnections.set(id, socketGroup);
  }

  addSocket(id, socket) {
    const socketGroup = this.userSocketConnections.get(id);
    if (!socketGroup) return;

    socketGroup.add(socket);
    this.socketToUserId.set(socket.id, id);
  }

  removeSocket(id, socket) {
    const socketGroup = this.userSocketConnections.get(id);
    if (!socketGroup) return;

    socketGroup.remove(socket);
    this.socketToUserId.delete(socket.id);
  }

  /**
   * Removes a user and their socket group
   * @param {string} id - The unique user ID
   */
  removeUser(id) {
    const socketGroup = this.userSocketConnections.get(id);
    if (socketGroup) {
      for (const socket of socketGroup.sockets) {
        this.socketToUserId.delete(socket.id);
      }
    }

    this.userSocketConnections.delete(id);
  }

  /**
   * Gets a user's socket group or undefined if not found
   * @param {string} id - The unique user ID
   * @returns {SocketGroup | undefined}
   */
  getSocketGroup(id) {
    return this.userSocketConnections.get(id);
  }

  /**
   * Finds the user ID associated with a socket
   * @param {Socket} socket
   * @returns {string | null}
   */
  getUserIDBySocket(socket) {
    return this.socketToUserId.get(socket.id) || null;
  }

  /**
   * Checks if a user exists
   * @param {string} id - The unique user ID
   * @returns {boolean}
   */
  hasUser(id) {
    return this.userSocketConnections.has(id);
  }
}
