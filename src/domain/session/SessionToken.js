export class SessionToken {
  constructor({token, expiresAt = null}) {
    this.token = token;
    this.expiresAt = expiresAt; // timestamp in ms
  }

  isExpired() {
    const canExpire = this.token != null;
    const isExpired = canExpire && Date.now() > this.expiresAt;
    return isExpired;
  }

  // Optionally extend the expiry
  renew(durationMs) {
    this.expiresAt = Date.now() + durationMs;
  }
}
