import User from "./User.js";
import Player from "./Player.js";
import Result from "./Result.js";

/**
 * @typedef {Object} Lobby
 * @property {string} name - The name of the lobby
 * @property {string} id - Id of the lobby
 * @property {string} owner - Owner of the lobby
 * @property {Player[]} players - Array of Players
 * @property {number} maxPlayers - Maximum number of players
 */
class Lobby {
  constructor(id, name, owner, maxPlayers = 4) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.maxPlayers = maxPlayers;
    this.players = []; // Ordered collection of players
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
