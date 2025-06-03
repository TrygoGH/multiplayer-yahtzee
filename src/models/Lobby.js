import { User } from "../domain/user/User.js";
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
    this.playerIDs = new Set(); // Ordered collection of players
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

    return lobby;
  }

  addPlayer(userID) {
    console.log("added user", userID);
    if (this.playerIDs.length >= this.maxPlayers) return new Result.failure("Lobby is full");

    this.playerIDs.add(userID);
    return Result.success("Added player")
  }

  removePlayer(userID) {
    console.log("a", this.playerIDs);
    this.playerIDs.delete(userID);
  }

  getPlayer(index) {
    return this.playerIDs[index] || null;
  }
}

export default Lobby;
