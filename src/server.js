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

console.log(`Starting server at ${Date.now().toLocaleString()}`);

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicFolderPath = path.join(__dirname, '../public');

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

testConnection().then(result =>{
  console.log(`server connection result:, result`);
});

getAllUsers().then(result =>{
  console.log(`server connection result:, result`);
});

createTestLobbies();
await storeTestLobbies();


// Set up a simple connection event
io.on("connection", (socket) => {
  console.log(`a user connected with socket id: ${socket.id}`);

  // Listening for a message from the client
  socket.on(EVENTS.client.action.message, (data) => {
    console.log("Message received:", data);
    // Sending a message back to the client
    socket.emit(EVENTS.server.action.message, "Hello from server!");
  });

  // Handle disconnect event
  socket.on(EVENTS.client.action.disconnect, () => {
    console.log("user disconnected");
  });

  socket.on(EVENTS.client.request.message_room, ({room, message}) => {
    console.log("sending a message to room", room);
    socket.to(room).emit(EVENTS.client.broadcast.message_room, {sender: socket.id, message: message});
  });

  socket.on(EVENTS.client.request.get_lobbies, () => {
    console.log(`sending lobbies to ${socket.id}`);
    const lobbyKeys = Array.from(lobbiesMap.keys());
    const lobbyValues = Array.from(lobbiesMap.values());
    socket.emit(EVENTS.server.response.get_lobbies, { lobbyKeys: lobbyKeys, lobbyValues: lobbyValues });
  });

  socket.on(EVENTS.client.request.join_lobby, async ({currentLobbyID, newLobbyID}) => {
    if(currentLobbyID === newLobbyID){
      socket.emit(EVENTS.server.response.join_lobby, Result.failure("Client is already in this lobby"));
      return;
    }
    const leaveLobbyResult = leaveLobby(socket, currentLobbyID);
    const joinLobbyResult = await joinLobby(socket, newLobbyID);
    console.log("lobbiesID", newLobbyID);
    socket.emit(EVENTS.server.response.join_lobby, Result.success(lobbiesMap.get(newLobbyID)));
    socket.emit(EVENTS.server.action.result_messages, [
      leaveLobbyResult,
      joinLobbyResult
    ]);
  })
});

async function joinLobby(socket, lobbyID) {
  const lobbyResult = await selectLobby(lobbyID);
  if(lobbyResult.isFailure()) 
    return Result.failure(`Failed to join lobby. ${lobbyResult.error}`);

  socket.join(lobbyID);
  return Result.success(`Joined lobby with id: ${lobbyID}`);
}

function leaveLobby(socket, lobbyID) {
  socket.leave(lobbyID);
  return Result.success(`Left lobby with id: ${lobbyID}`);
}

function createTestLobbies(){
  for (let i = 0; i < 10; i++) {
    let lobby = new Lobby({
      id: uuidv4(), 
      timestamp: Date.now(), 
      name: `Lobby${i + 1}`, 
      owner: new User({
        id: uuidv4(),
        name: `Test${i + 1}`,
        nickname: `TestNick${i + 1}`
      }),
      maxPlayers: 4
    });
    lobbiesMap.set(lobby.id, lobby);
  }
}

async function storeTestLobbies(){
  console.log("CURRENT DATE:", getMySQLDate());
  console.log(await deleteAll(TABLES.LOBBIES))
  //console.log(await deleteOldLobbies(getMySQLDate()));
  for(const lobby of lobbiesMap.values()){
    createLobby(lobby);
  }
}

async function createLobby(lobby){
  const lobbySchema = lobbyToLobbySchema(lobby);
  await insertLobby(lobbySchema);
}

async function getLobby(lobbyUUID){
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

// Start the server on port 3000
server.listen(PORT, () => {
  const currentTime = new Date();
  const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
  console.log(`Server is running on http://localhost:${PORT}. Started at ${formattedTime}`);

});