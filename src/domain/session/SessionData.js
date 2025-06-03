import { SocketGroup } from "../socket/SocketGroup.js";

export class SessionData {
  constructor({
    user,
    sessionToken,
    lobby = null,
    gameManager = null,
    socketGroup,
    channels,
  }) {
    this.user = user; // plain user object
    this.sessionToken = sessionToken;
    this.lobby = lobby;
    this.gameManager = gameManager;
    this.socketGroup = socketGroup || new SocketGroup();
    this.channels = channels;
  }

  isExpired() {
    return this.sessionToken.isExpired();
  }

  static update(sessionData, {
    lobby,
    gameManager,
    socketGroup,
    channels,
  }) {
    if (!sessionData) throw new Error("No SessionData");
    if (!(sessionData instanceof SessionData)) throw new Error("No SessionData");

    if (lobby !== undefined) sessionData.lobby = lobby;
    if (gameManager !== undefined) sessionData.gameManager = gameManager;
    if (socketGroup !== undefined) sessionData.socketGroup = socketGroup;
    if (channels !== undefined) sessionData.channels = channels;

    return sessionData;
  }
}
