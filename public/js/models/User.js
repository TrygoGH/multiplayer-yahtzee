import { v4 as uuidv4 } from "uuid";

class User {
  constructor(username = "Guest", nickname = "Player") {
    this.id = uuidv4(); // Unique ID for persistence
    this.username = username;
    this.nickname = nickname;
  }
}

export default User;
