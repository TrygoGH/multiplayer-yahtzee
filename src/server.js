import express from "express";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { Server as SocketServer, Socket } from "socket.io";
import Lobby from './models/Lobby.js';  // Ensure this path is correct for your project structure
import { v4 as uuidv4 } from "uuid";
import { EVENTS } from './constants/socketEvents.js';
console.log("Starting server...");

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

const lobbies = [
  new Lobby(uuidv4(), "Lobby1", "Test"),
  new Lobby(uuidv4(), "Lobby2", "Test2"),
];


console.log(path.join(__dirname, "../node_modules/socket.io-client/dist/socket.io.min.js"));

app.use(express.static(publicFolderPath));
console.log(publicFolderPath);

app.get('/', (req, res) => {
  res.sendFile(path.join(publicFolderPath, '/html','index.html'));
});

console.log(path.join(publicFolderPath, '/html','index.html'));

// Set up a simple connection event
io.on("connection", (socket) => {
  console.log("a user connected");

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
    socket.emit(EVENTS.SERVER.SEND_LOBBIES, lobbies);
    console.log(lobbies);
  });

  socket.on(EVENTS.CLIENT.JOIN_LOBBY, (data) => {
    socket.emit(EVENTS.SERVER.MESSAGE, `Join lobby with id: ${data}`);
    socket.join(data);
  });
});

// Start the server on port 3000
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
