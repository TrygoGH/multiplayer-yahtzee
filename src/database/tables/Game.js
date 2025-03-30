/**
 * Class representing a game.
 */
export class Game {
    constructor({
      id,            // Integer: Auto Incremented ID of the game
      uuid,          // String: Unique identifier for the game (UUID)
      lobby_id,      // Integer: The ID of the lobby the game belongs to
      game_status,   // String: The current status of the game ('waiting', 'started', 'ended')
      start_time,    // Date: The start time of the game (if started)
      end_time,      // Date: The end time of the game (if ended)
      created_at     // Date: The date and time when the game was created
    }) {
      this.id = id;
      this.uuid = uuid;
      this.lobbyId = lobby_id;
      this.gameStatus = game_status;
      this.startTime = start_time;
      this.endTime = end_time;
      this.createdAt = created_at;
    }
  }
  