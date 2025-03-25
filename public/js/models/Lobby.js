import User from "./User.js";
import Player from "./Player.js";
import Result from "../utils/Result.js";

/**
 * @typedef {Object} LobbyData
 * @property {string} name - The name of the lobby
 * @property {string} id - Id of the lobby
 * @property {number} timestamp - Time of the created lobby
 * @property {string} owner - Owner of the lobby
 * @property {Player[]} players - Array of Players
 * @property {number} maxPlayers - Maximum number of players
 */

class Lobby {
  /**
   * @param {string} id - Id of the lobby
   * @param {number} timestamp - Time of creation
   * @param {string} name - Name of the lobby
   * @param {string} owner - Owner's ID
   * @param {number} [maxPlayers=4] - Max players allowed
   */
  constructor(id, timestamp, name, owner, maxPlayers = 4) {
    this.id = id;
    this.timestamp = timestamp;
    this.name = name;
    this.owner = owner;
    this.maxPlayers = maxPlayers;
    this.players = []; // Ordered collection of players
  }

  /**
   * Create a `Lobby` instance from an existing object (e.g., received from the server)
   * @param {LobbyData} lobbyData - The plain object representing a lobby
   * @returns {Lobby} - A new `Lobby` instance
   */
  static fromObject(lobbyData) {
    const lobby = new Lobby(
      lobbyData.id,
      lobbyData.timestamp,
      lobbyData.name,
      lobbyData.owner,
      lobbyData.maxPlayers
    );

    // Restore players if needed
    if (Array.isArray(lobbyData.players)) {
      lobby.players = lobbyData.players.map(playerData => 
        new Player(playerData.user, playerData.socket) // Assuming Player constructor works this way
      );
    }

    return lobby;
  }

  addPlayer(socket, user) {
    if (this.players.length >= this.maxPlayers) {
      return new Result(false, null, "Lobby is full");
    }

    const player = new Player(user, socket);
    this.players.push(player);

    return new Result(true, player);
  }

  removePlayer(playerId) {
    this.players = this.players.filter(player => player.user.id !== playerId);
  }

  getPlayer(index) {
    return this.players[index] || null;
  }

  broadcast(event, data) {
    this.players.forEach(player => player.sendMessage(event, data));
  }
}

export default Lobby;
