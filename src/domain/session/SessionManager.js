export class SessionManager {
  constructor() {
    /** 
     * Map user IDs (string or number) to their SessionData 
     * @type {Map<string, SessionData>} 
     */
    this.sessions = new Map();
  }

  /**
   * Create or update session data for a user ID
   * @param {string} userId
   * @param {SessionData} sessionData
   */
  setSession(userId, sessionData) {
    this.sessions.set(userId, sessionData);
  }

  /**
   * Get session data by user ID
   * @param {string} userId
   * @returns {SessionData | undefined}
   */
  getSession(userId) {
    return this.sessions.get(userId);
  }

  /**
   * Remove session data for a user ID
   * @param {string} userId
   */
  removeSession(userId) {
    this.sessions.delete(userId);
  }

  /**
   * Check if a session exists for a user ID
   * @param {string} userId
   * @returns {boolean}
   */
  hasSession(userId) {
    return this.sessions.has(userId);
  }
}
