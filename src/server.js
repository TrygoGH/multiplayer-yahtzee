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
import { getAllUsers, registerUser } from "./database/dbUserFunctions.js";
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
    ],
    methods: ["GET", "POST"]
  }
});

const lobbiesMap = new Map();

for (let i = 0; i < 10; i++) {
  let lobbyID = uuidv4();
  let lobby = new Lobby(lobbyID, Date.now(), `Lobby${i + 1}`, `Test${i + 1}`);
  console.log(lobby);
  lobbiesMap.set(lobbyID, lobby);
}

console.log(path.join(__dirname, "../node_modules/socket.io-client/dist/socket.io.min.js"));

app.use(express.static(publicFolderPath));
console.log(publicFolderPath);

app.get('/', (req, res) => {
  res.sendFile(path.join(publicFolderPath, '/html', 'index.html'));
});

console.log(path.join(publicFolderPath, '/html', 'index.html'));

testConnection().then(result =>{
  console.log(`server connection result:`, result);
});

getAllUsers().then(result =>{
  console.log(`server connection result:`, result);
});


// Set up a simple connection event
io.on("connection", (socket) => {
  console.log(`a user connected with socket id: ${socket.id}`);

  // Listening for a message from the client
  socket.on(EVENTS.CLIENT.MESSAGE, (data) => {
    console.log("Message received:", data);
    // Sending a message back to the client
    socket.emit(EVENTS.SERVER.MESSAGE, "Hello from server!");
  });

  // Handle disconnect event
  socket.on(EVENTS.CLIENT.DISCONNECT, () => {
    console.log("user disconnected");
  });

  socket.on(EVENTS.CLIENT.GET_LOBBIES, () => {
    console.log(lobbiesMap);
    console.log(`sending lobbies to ${socket.id}`);
    const lobbyKeys = Array.from(lobbiesMap.keys());
    const lobbyValues = Array.from(lobbiesMap.values());
    socket.emit(EVENTS.SERVER.SEND_LOBBIES, { lobbyKeys: lobbyKeys, lobbyValues: lobbyValues });
  });

  socket.on(EVENTS.CLIENT.JOIN_LOBBY, (lobbyID) => {
    leaveCurrentLobby(socket);
    joinLobby(socket, lobbiesMap[lobbyID]);
    socket.emit(EVENTS.SERVER.JOIN_LOBBY, new Result())
  })
});

function joinLobby(socket, lobby) {
  socket.join(lobby);
  socket.emit(EVENTS.SERVER.MESSAGE, `Joined lobby with id: ${lobby.id}`);
}

function leaveCurrentLobby(socket) {
  lobbiesMap.forEach(lobby => {
    if (socket.rooms.has(lobby.id)) {
      leaveLobby(lobby.id);
      return;
    }
  });
}
function leaveLobby(socket, lobby) {
  socket.leave(lobby);
  socket.emit(EVENTS.SERVER.MESSAGE, `Left lobby with id: ${lobby.id}`);
}
// Start the server on port 3000
server.listen(PORT, () => {
  const currentTime = new Date();
  const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
  console.log(`Server is running on http://localhost:${PORT}. Started at ${formattedTime}`);

});
