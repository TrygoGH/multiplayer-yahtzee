/**
 * Class representing a user in the system.
 */
export class User {
    constructor({
      id,           // Integer: Auto Incremented ID of the user
      uuid,         // String: Unique identifier for the user (UUID)
      username,     // String: Username of the user
      display_name, // String: Display name of the user
      email,        // String: Email of the user
      password_hash, // String: Hashed password of the user
      role,         // String: Role of the user ('user' or 'admin')
      created_at    // Date: The date and time when the user was created
    }) {
      this.id = id;
      this.uuid = uuid;
      this.username = username;
      this.displayName = display_name;
      this.email = email;
      this.passwordHash = password_hash;
      this.role = role;
      this.createdAt = created_at;
    }
  }
  