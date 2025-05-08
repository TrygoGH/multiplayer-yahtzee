/**
 * Class representing a finished game record.
 */
export class FinishedGameSchema {
    constructor({
      id,            // Integer: Auto Incremented ID of the finished game
      game_uuid,     // String: Unique identifier for the game (UUID)
      created_at,    // Date: The date and time when the game was created
      finished_at,   // Date: The date and time when the game was finished
      duration_seconds, // Integer: Duration of the game in seconds
      winner_uuid,   // String: UUID of the winner player (optional)
      players,       // Object: JSON object containing player information
      game_data      // Object: JSON object containing game data
    }) {
      this.id = id;
      this.gameUuid = game_uuid;
      this.createdAt = created_at;
      this.finishedAt = finished_at;
      this.durationSeconds = duration_seconds;
      this.winnerUuid = winner_uuid;
      this.players = players;
      this.gameData = game_data;
    }
  }
  