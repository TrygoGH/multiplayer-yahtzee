import express from "express";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { Server as SocketServer, Socket } from "socket.io";
import Lobby from './models/Lobby.js';  // Ensure this path is correct for your project structure
import { v4 as uuidv4 } from "uuid";
import { EVENTS } from './constants/socketEvents.js';
import Result from "./utils/Result.js";
import { getConnection, testConnection } from "./database/database.js";
import { deleteOldLobbies, deleteAll, getAllUsers, getMySQLDate, insertLobby, registerUser, selectLobby } from "./database/dbUserFunctions.js";
import User from "./models/User.js";
import { LobbySchema } from "./database/tables/LobbySchema.js";
import { REFUSED } from "dns";
import { TABLES } from "./database/dbTableNames.js";
import { test } from "./utils/Test.js";
import { GameManager } from "./models/game/managers/GameManager.js";
import { Game } from "./models/game/models/Game.js";
import { Player } from "./models/game/models/Player.js";
import { time } from "console";

console.log(`Starting server at ${Date.now().toLocaleString()}`);

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicFolderPath = path.join(__dirname, '../public');

const socketPlayerMap = new Map();

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:5173",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"]
  }
});

const lobbiesMap = new Map();
const gamesMap = new Map();
const SOCKET_CHANNELS = {
  lobby: "lobby",
};

console.log(path.join(__dirname, "../node_modules/socket.io-client/dist/socket.io.min.js"));

app.use(express.static(publicFolderPath));
console.log(publicFolderPath);

/*
app.get('*', (req, res) => {
  res.sendFile(path.join(publicFolderPath, '/html', 'index.html'));
});
*/

app.get('/', (req, res) => {
  res.sendFile(path.join(publicFolderPath, '/html', 'home.html'));
});

app.get('/lobby', (req, res) => {
  res.sendFile(path.join(publicFolderPath, '/html', 'lobby.html'));
});


console.log(path.join(publicFolderPath, '/html', 'index.html'));

testConnection().then(result => {
  console.log(`server connection result:, result`);
});

getAllUsers().then(result => {
  console.log(`server connection result:, result`);
});

console.log(await deleteAll(TABLES.LOBBIES));

io.use((socket, next) => {
  console.log(socket.handshake.auth);
  const { token, nickname, username, email } = socket.handshake.auth;

  socket.user = new User({
    id: uuidv4(), 
    username: username, 
    email: email, 
    nickname: nickname 
  });
  socket.lobby = null;
  socket.channels = {};
  console.log("userdata", socket.user.username);

  next();
});

// Set up a simple connection event
io.on("connection", (socket) => {
  console.log(`A user connected with socket id: ${socket.id}`);
  socket.player = null;
  // Listening for a message from the client
  socket.on(EVENTS.client.action.message, (data) => {
    console.log("Message received:", data);
    // Sending a message back to the client
    socket.emit(EVENTS.server.action.message, "Hello from server!");
  });

  // Handle disconnect event
  socket.on(EVENTS.client.action.disconnect, () => {
    console.log(`A user disconnected with socket id: ${socket.id}`);
  });

  socket.on(EVENTS.client.request.make_lobby, async ({ name }) => {
    console.log(name);
    const lobby = createLobby({ 
        name: name,
        owner: socket.user, 
      })
      console.log(lobby);
    await storeLobby(lobby);
    await sendLobbiesToSocket(socket);
    console.log(await joinLobbyResponse({socket: socket, newLobbyID: lobby.id}));
  });


  socket.on(EVENTS.client.request.start_game, async () => {
    console.log("starting game");
    const lobby = socket.lobby;
    console.log(lobby);
    if(!lobby){
      sendToHome(socket);
      return;
    }
    const room = lobby.id;
    const socketArray = [];
    const sockets = await io.in(room).fetchSockets();
    console.log("sockets first", sockets);
    sockets.forEach(socket => {
      socketArray.push(socket);
    });
    console.log("sockets array", socketArray);
    makeNewGame({ sockets: socketArray, room: room });
    io.in(room).emit(EVENTS.server.response.start_game, "starting game");
  });

  socket.on(EVENTS.client.request.roll, () => {
    const player = socketPlayerMap.get(socket);
    if (!player) {
      sendToHome(socket);
      return;
    }
    player.roll();
    socket.emit(EVENTS.server.response.roll, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, getGameData({ socket: socket }).unwrapOr());
  });

  socket.on(EVENTS.client.request.toggle_hold, (index) => {
    const player = socketPlayerMap.get(socket);
    if (!player) {
      sendToHome(socket);
      return;
    }
    player.toggleHoldDie(index);
    //socket.emit(EVENTS.server.response.roll, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, getGameData({ socket: socket }).unwrapOr());
  });

  socket.on(EVENTS.client.request.score, (category) => {
    console.log("score", category);
    const player = socketPlayerMap.get(socket);
    if (!player) {
      sendToHome(socket);
      return;
    }
    player.score(category);
    socket.emit(EVENTS.server.response.score, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, getGameData({ socket: socket }).unwrapOr());
  });

  socket.on(EVENTS.client.request.message_room, ({ message }) => {
    const room = socket.channels[SOCKET_CHANNELS.lobby];
    console.log("sending a message to room", room);
    socket.to(room).emit(EVENTS.client.broadcast.message_room, { sender: socket.user.nickname, message: message });
  });

  socket.on(EVENTS.client.request.get_lobbies, () => {
    sendLobbiesToSocket(socket);
  });

  socket.on(EVENTS.client.request.join_lobby, async ({ newLobbyID }) => {
    await joinLobbyResponse({socket: socket, newLobbyID: newLobbyID});
  })

  sendLobbiesToSocket(socket);
});

async function sendLobbiesToSocket(socket) {  
  console.log(`sending lobbies to ${socket.id}`);
  console.log(lobbiesMap.size);
  const lobbyKeys = Array.from(lobbiesMap.keys());
  const lobbyValues = Array.from(lobbiesMap.values());
  socket.emit(EVENTS.server.response.get_lobbies, { lobbyKeys: lobbyKeys, lobbyValues: lobbyValues });
}
async function joinRoom(socket, room) {
  socket.join(room);                 
  return Result.success(`Joined room: ${room}`);
}

async function leaveRoom(socket, room) {
  socket.leave(room);
  return Result.success(`Left room: ${room}`);
}

async function joinLobby({ socket, lobby }) {
  const user = socket.user;
  socket.lobby = lobby;
  lobby.addPlayer({user: user});
  return Result.success(lobby);
}

async function leaveLobby({ socket, lobby }) {
  const user = socket.user;
  console.log(user);
  socket.lobby = null;
  lobby.removePlayer({user: user});
  return Result.success("Left lobby");
}

async function switchLobbies({ socket, lobby }){
  const leaveLobbyResult = await leaveLobby({
    socket: socket,
    lobby: lobby,
  });

  const joinLobbyResult = await joinLobby({
    socket: socket,
    lobby: lobby,
  });
  return Result.success([joinLobbyResult, leaveLobbyResult]);
}

async function getLobby(lobbyID) {
  const lobby = lobbiesMap.get(lobbyID);
  const lobbyResult = lobby
    ? Result.success(lobby)
    : Result.failure(`no lobby with id: ${lobbyID}`);
  return lobbyResult;
}

async function joinChannel({socket, channelID, channelName}){
  const channels = socket.channels;
  if(channels[channelID]) return Result.failure("Already in channel with same name");

  await joinRoom(socket, channelID);
  channels[channelName] = channelID;
  return Result.success("Joined channel");
}

async function leaveChannel({socket, channelName, channelID}){
  const channels = socket.channels;
  if(!channels[channelID]) return Result.failure("Already not in that channel");

  await leaveRoom(socket, channelID);
  delete channels[channelName];
  return Result.success("Left channel");
}

async function replaceChannel({socket, channelName, channelID}){
  const channels = socket.channels;
  const previous = channels[channelName];

  await leaveRoom(socket, previous);
  await joinRoom(socket, channelID);
  channels[channelName] = channelID;
  return Result.success("Replaced channel");
}

async function joinLobbyResponse({socket, newLobbyID}){
   if (socket.lobby !== null && socket.lobby.id === newLobbyID) {
      socket.emit(EVENTS.server.response.join_lobby, Result.failure("Client is already in this lobby"));
      return;
    }

    const lobbyResult = await getLobby(newLobbyID);
    if (lobbyResult.isFailure()) {
      socket.emit(EVENTS.server.response.join_lobby, lobbyResult);
      return;
    }

    const lobby = lobbyResult.unwrap();
    console.log("lobby", lobby);
    const replaceChannelResult = await replaceChannel({
      socket: socket, 
      channelName: "lobby",
      channelID: newLobbyID,
    });
    const switchLobbiesResult = await switchLobbies({
      socket: socket,
      lobby: lobby,
    });

    console.log(switchLobbiesResult.unwrapOr());
    console.log("JOINED", newLobbyID);
    console.log(replaceChannelResult.unwrapOr());
    console.log(socket.channels);
    console.log(socket.lobby);
    socket.emit(EVENTS.server.response.join_lobby, lobbyResult);
}


function createLobby({
  id = uuidv4(),
  timestamp = Date.now(),
  name = "Lobby",
  owner = {
    id: uuidv4(),
    name: "Test",
    nickname: "TestNick"
  },
  maxPlayers = 4
}) {
  const lobby = new Lobby({
    id: id,
    timestamp: timestamp,
    name: name,
    owner: owner,
    maxPlayers: maxPlayers,
  });

  lobby.players.push(owner);

  return lobby;
}

async function storeLobby(lobby) {
  lobbiesMap.set(lobby.id, lobby);
  let lobbySchema = await createLobbySchema(lobby);
  await insertLobby(lobbySchema);
}

async function createLobbySchema(lobby) {
  const lobbySchema = lobbyToLobbySchema(lobby);
  return lobbySchema;
}

async function getLobbyFromDatabase(lobbyUUID) {
  const result = await selectLobby(lobbyUUID);
  return result.isFailure()
    ? result
    : Result.success(result.unwrap());
}

/**
 * Converts a lobby object to a LobbySchema instance.
 *
 * @param {Lobby} lobby - The lobby object to convert.
 * @returns {LobbySchema} A new instance of LobbySchema with mapped properties.
 */
function lobbyToLobbySchema(lobby) {
  return new LobbySchema({
    uuid: lobby.id,
    owner_uuid: lobby.owner.id,
    name: lobby.name,
    max_players: lobby.maxPlayers,
    created_at: lobby.timestamp,
  });
}

function sendToHome(socket) {
  console.log(`Sending socket with id: ${socket.id} to home`);
  socket.emit(EVENTS.server.action.send_to_home);
}

// Start the server on port 3000
server.listen(PORT, () => {
  const currentTime = new Date();
  const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
  console.log(`Server is running on http://localhost:${PORT}. Started at ${formattedTime}`);

});

const players = new Set();
for (let i = 0; i < 4; i++) {
  players.add(new Player);
}


const gameManager = new GameManager();
gameManager.init(players)

for (let i = 0; i < 4; i++) {
  gameManager.turnManager.next();
}

console.log(gameManager.turnManager);

function makeNewGame({ sockets, room }) {
  const gameManager = new GameManager();
  gameManager.init();
  console.log("sockets", sockets);
  sockets.forEach(socket => {
    const player = new Player();
    player.room = room;
    gameManager.addPlayer(player);
    socketPlayerMap.set(socket, player);
  });
  console.log(socketPlayerMap);
  gamesMap.set(room, gameManager);
  gameManager.start();
}

function getGameData({ socket }) {
  const player = socketPlayerMap.get(socket);
  const room = player.room;
  const gameManager = gamesMap.get(room);
  const gameDataResult = gameManager.getGameDataOfPlayer(player);
  return gameDataResult;
}
/*
const game = new Game();
console.log(game.useRuleset(Game.defaultRuleset));
console.log(game); 
console.log(game.init());
console.log(game);
*/
