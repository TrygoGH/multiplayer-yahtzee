export class SocketUser {
  constructor({user, socket}) {
    this.user = user;  // Composition: Player has a User
    this.socket = socket;
  }
}


