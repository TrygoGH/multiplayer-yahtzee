import { ChannelManager } from "../channels/ChannelManager.js";
import { MatchManager } from "../game/managers/MatchManager.js";
import { SocketGroup } from "../socket/SocketGroup.js";

/**
 * @class SessionData
 * @classdesc Stores data related to a user's active session.
 *
 * @param {Object} opts - Configuration options for the session
 * @param {Object} opts.user - The user object associated with the session
 * @param {string} opts.sessionToken - Unique session token
 * @param {Object|null} [opts.lobby=null] - The lobby the user is in, if any
 * @param {MatchManager} opts.matchManager - The match manager instance handling game logic
 * @param {Object|null} [opts.player=null] - Player data associated with the user, if any
 * @param {Object} opts.socketGroup - Group of socket connections tied to this session
 * @param {Object} opts.channels - Object containing channel references (e.g., chat, game updates)
 */

export class SessionData {
  constructor({
    user,
    sessionToken,
    lobby = null,
    matchManager = null,
    player = null,
    gameManager = null,
    socketGroup = new SocketGroup(),
    channelManager = new ChannelManager(),
  }) {
    this.user = user; // plain user object
    this.sessionToken = sessionToken;
    this.lobby = lobby;
    this.matchManager = matchManager;
    this.gameManager = gameManager;
    this.player = player;
    this.socketGroup = socketGroup;
    this.channelManager = channelManager;
  }

  isExpired() {
    return this.sessionToken.isExpired();
  }

  update({
    lobby,
    matchManager,
    player,
    gameManager,
    socketGroup,
    channelManager,
  }) {
    try {
      if (lobby !== undefined) this.lobby = lobby;
      if (matchManager !== undefined) this.matchManager = matchManager;
      if (player !== undefined) this.player = player;
      if (gameManager !== undefined) this.gameManager = gameManager;
      if (socketGroup !== undefined) this.socketGroup = socketGroup;
      if (channelManager !== undefined) this.channelManager = channelManager;
    } catch (error) {
      return false;
    }
    return true;
  }

  setRoom({ channelName, channelID }) {
    return this.channelManager.setRoom(channelName, channelID);
  }

  removeRoom(channelName){
    return this.channelManager.deleteRoom(channelName);
  }
}
