/**
 * Class representing a player in a lobby.
 */
export class LobbyPlayer {
    constructor({
      id,            // Integer: Auto Incremented ID of the player in the lobby
      lobby_id,      // Integer: The ID of the lobby the player belongs to
      player_uuid,   // String: UUID of the player
      nickname,      // String: Nickname of the player
      joined_at      // Date: The date and time when the player joined the lobby
    }) {
      this.id = id;
      this.lobbyId = lobby_id;
      this.playerUuid = player_uuid;
      this.nickname = nickname;
      this.joinedAt = joined_at;
    }
  }
  