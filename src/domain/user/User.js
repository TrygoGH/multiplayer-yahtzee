export class User {
  constructor({id, username = "Guest", email = null, nickname = "Player"}) {
    this.id = id; // Unique ID for persistence
    this.username = username;
    this.email = email;
    this.nickname = nickname;
  }
}

export default User;
