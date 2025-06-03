/**
 * A wrapper class for a Socket.IO client instance.
 */
export class SocketWrapper {
  /**
   * @param {import('socket.io-client').Socket} socket - The Socket.IO client socket instance.
   */
  constructor(socket) {
    console.log(socket);
    this.socket = socket;
    
  }
  get disconnected(){
    return this.socket.disconnected;
  }
  /**
   * Listen for an event.
   * @param {string | symbol} eventName
   * @param {(...args: any[]) => void} listener
   */
  on(eventName, listener) {
    this.socket.on(eventName, listener);
  }

  /**
   * Listen once for an event.
   * @param {string | symbol} eventName
   * @param {(...args: any[]) => void} listener
   */
  once(eventName, listener) {
    this.socket.once(eventName, listener);
  }

  /**
   * Remove a specific listener.
   * @param {string | symbol} eventName
   * @param {(...args: any[]) => void} listener
   */
  off(eventName, listener) {
    this.socket.off(eventName, listener);
  }

  /**
   * Remove all listeners for an event or all events if no name is given.
   * @param {string | symbol} [eventName]
   */
  removeAllListeners(eventName) {
    this.socket.removeAllListeners(eventName);
  }

  /**
   * Emit an event with optional data.
   * @param {string | symbol} eventName
   * @param  {...any} args
   */
  emit(eventName, ...args) {
    this.socket.emit(eventName, ...args);
  }

  /**
   * Replace all listeners for a given event with a new one.
   * @param {string | symbol} eventName
   * @param {(...args: any[]) => void} callback
   */
  replace(eventName, callback) {
    this.socket.off(eventName);
    this.socket.on(eventName, callback);
  }

  /**
   * Get a list of all event names with listeners.
   * @returns {(string | symbol)[]}
   */
  eventNames() {
    return this.socket.eventNames();
  }

  /**
   * Clear all registered listeners for all events.
   */
  clearAll() {
    this.eventNames().forEach((event) => {
      this.socket.off(event);
    });
  }

  /**
   * Check if the socket is currently connected.
   * @returns {boolean}
   */
  isConnected() {
    return this.socket.connected;
  }

  /**
   * Force the socket to disconnect.
   */
  disconnect() {
    this.socket.disconnect();
  }

  /**
   * Attempt to reconnect the socket.
   */
  connect() {
    this.socket.connect();
  }

  /**
   * Register a middleware function (use with socket.io-middleware client-side support if applicable).
   * @param {(packet: any, next: (err?: Error) => void) => void} fn
   */
  use(fn) {
    if (typeof this.socket.use === 'function') {
      this.socket.use(fn);
    } else {
      console.warn('Socket middleware not supported in this client version.');
    }
  }

  leave(room){
    this.socket.leave(room);
  }

  join(room){
    this.socket.join(room);
  }
}

