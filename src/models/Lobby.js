import { User } from "./User.js";
import { Result}  from "../utils/Result.js";

/**
 * @typedef {Object} Lobby
 * @property {string} name - The name of the lobby
 * @property {string} id - Id of the lobby
 * @property {number} timestamp - Time of the created lobby
 * @property {User} owner - Owner of the lobby
 * @property {Player[]} players - Array of Players
 * @property {number} maxPlayers - Maximum number of players
 */

class Lobby {
  /**
   * @param {string} id - Id of the lobby
   * @param {number} timestamp - Time of creation
   * @param {string} name - Name of the lobby
   * @param {User} owner - Owner's User
   * @param {number} [maxPlayers=4] - Max players allowed
   */
  constructor({id, timestamp, name, owner, maxPlayers = 4}) {
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
    const lobby = new Lobby({
      id: lobbyData.id,
      timestamp: lobbyData.timestamp,
      name: lobbyData.name,
      owner: lobbyData.owner,
      maxPlayers: lobbyData.maxPlayers
    });

    // Restore players if needed
    if (Array.isArray(lobbyData.players)) {
            /*
      lobby.players = lobbyData.players.map(playerData => 
        new User(playerData.user, playerData.socket) // Assuming Player constructor works this way
      );
      */
    }

    return lobby;
  }

  addPlayer({user}) {
    console.log("added user", user);
    if (this.players.length >= this.maxPlayers) return new Result.failure("Lobby is full");

    this.players.push(user);
    return Result.success("Added player")
  }

  removePlayer({user}) {
    console.log("a", this.players);
    this.players = this.players.filter(player => player.id !== user.id);
  }

  getPlayer(index) {
    return this.players[index] || null;
  }

  broadcast(event, data) {
    this.players.forEach(player => player.sendMessage(event, data));
  }
}

export default Lobby;
