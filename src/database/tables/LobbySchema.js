/**
 * Class representing a lobby.
 */
export class LobbySchema {
  /**
   * Creates a new LobbySchema instance.
   * @param {Object} params - The parameters for the lobby.
   * @param {number} params.id - Auto-incremented ID of the lobby.
   * @param {string} params.uuid - Unique identifier for the lobby (UUID).
   * @param {string} params.name - Name of the lobby.
   * @param {string} params.owner_uuid - UUID of the lobby owner.
   * @param {number} params.max_players - Maximum number of players in the lobby.
   * @param {Date} params.created_at - The date and time when the lobby was created.
   */
  constructor({ id, uuid, name, owner_uuid, max_players, created_at }) {
    /** @type {number} */
    this.id = id;
    
    /** @type {string} */
    this.uuid = uuid;
    
    /** @type {string} */
    this.name = name;
    
    /** @type {string} */
    this.owner_uuid = owner_uuid;
    
    /** @type {number} */
    this.max_players = max_players;
    
    /** @type {Date} */
    this.created_at = created_at;
  }
}
