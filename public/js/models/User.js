class User {
  constructor(id = 0, username = "Guest", nickname = "Player") {
    this.id = id // Unique ID for persistence
    this.username = username;
    this.nickname = nickname;
  }
}

export default User;
