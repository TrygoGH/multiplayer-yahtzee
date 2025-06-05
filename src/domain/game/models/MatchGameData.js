export class MatchGameData {
  /**
   * @param {Object} opts
   * @param {Map<string, PlayerGameData>} opts.players – Map of player IDs/usernames to game data
   * @param {string} opts.currentPlayerID              – The ID of the player whose turn it is
   * @param {boolean} opts.matchState                      – Optional flag for game over
   */
  constructor({ players = new Map(), currentPlayerID, matchState = false }) {
    this.players = players;                 // Map or plain object
    this.currentPlayerID = currentPlayerID;
    this.matchState = matchState;
  }
  updatePlayerGameData({playerID, gameData}){
    this.players.set(playerID, gameData)
  }
}
                                                        