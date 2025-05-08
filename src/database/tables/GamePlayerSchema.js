/**
 * Class representing a player in a game.
 */
export class GamePlayerSchema {
    constructor({
      id,             // Integer: Auto Incremented ID of the player
      game_id,        // Integer: The ID of the game the player belongs to
      player_uuid,    // String: UUID of the player
      nickname,       // String: Nickname of the player
      player_status,  // String: Status of the player ('active', 'eliminated', 'finished')
      score           // Integer: Score of the player in the game
    }) {
      this.id = id;
      this.gameId = game_id;
      this.playerUuid = player_uuid;
      this.nickname = nickname;
      this.playerStatus = player_status;
      this.score = score;
    }
  }
  