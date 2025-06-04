import express from "express";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { Server as SocketServer, Socket } from "socket.io";
import Lobby from './models/Lobby.js';  // Ensure this path is correct for your project structure
import { v4 as uuidv4 } from "uuid";
import { EVENTS } from './constants/socketEvents.js';
import { Result, ensureResult, tryCatch, tryCatchAsync, tryCatchAsyncFlex, tryCatchFlex } from "./utils/Result.js";
import { getConnection, testConnection } from "./database/database.js";
import { deleteOldLobbies, deleteAll, getAllUsers, getMySQLDate, insertLobby, registerUser, selectLobby } from "./database/dbUserFunctions.js";
import User from "./domain/user/User.js";
import { LobbySchema } from "./database/tables/LobbySchema.js";
import { REFUSED } from "dns";
import { TABLES } from "./database/dbTableNames.js";
import { Tests } from "./utils/Test.js";
import { Player } from "./domain/game/models/Player.js";
import { time } from "console";
import { UserSocketConnections } from "./domain/user/userSocketConnections.js";
import { MatchManager } from "./domain/game/managers/MatchManager.js";
import { LinkMap } from "./utils/Maps.js";
import { SessionData } from "./domain/session/SessionData.js";
import { SocketGroup } from "./domain/socket/socketGroup.js";
import { SessionToken } from "./domain/session/SessionToken.js";

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  return;
  Tests.printAll();
  Tests.summary();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  return;
  Tests.printAll();
  Tests.summary();
  process.exit(1);
});

console.log(`Starting server at ${Date.now().toLocaleString()}`);

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicFolderPath = path.join(__dirname, '../public');

const tokenToSessionDataMap = new Map();
const connectedUsersMap = new Map();
const userIDtoSessionTokenMap = new Map();
const tokensToUserIdMap = new Map();
const userPlayersMap = new Map();
const userSocketConnections = new UserSocketConnections();

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
const matchesMap = new Map();
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
  const { token: storedToken, nickname, username, email } = socket.handshake.auth;
  console.log("SESSIONTOKEN", socket.handshake.auth);

  if (storedToken) {
    console.log("SESSIONTOKENS!!!", tokenToSessionDataMap);
    if (!tokenToSessionDataMap.has(storedToken)) {
      return next(new Error("Bad token"));
    }

    try {
      const sessionData = tokenToSessionDataMap.get(storedToken);
      const user = sessionData.user;

      socket.data.token = storedToken;
      socket.data.sessionToken = sessionData.sessionToken;
      socket.data.user = user;

      console.log("user connected with token");
      Tests.assertNotNull({
        message: "User should not be null",
        value: user,
      });

      return next();
    } catch (err) {
      return next(err);
    }
  }

  // No token present: create new session
  const sessionToken = new SessionToken({
    token: uuidv4(),
  });
  const user = new User({
    id: uuidv4(),
    username,
    email,
    nickname
  });

  socket.data.user = user;
  socket.data.token = sessionToken.token;
  socket.data.sessionToken = sessionToken;

  const sessionData = new SessionData({
    sessionToken,
    socketGroup: new SocketGroup([socket]),
    user,
    channels: { ...SOCKET_CHANNELS },
  });

  tokenToSessionDataMap.set(sessionToken.token, sessionData);
  userIDtoSessionTokenMap.set(user.id, sessionToken);

  Tests.assertNotNull({ value: sessionData, message: "sessionData should not be null" });
  Tests.assertNotNull({ value: user, message: "user should not be null" });
  Tests.assertNotNull({ value: socket.handshake.auth, message: "handshake should not be null" });

  return next();
});


// Set up a simple connection event
io.on("connection", (socket) => {
  const sessionToken = socket.data.sessionToken;
  if (sessionToken) {
    socket.emit(EVENTS.server.action.send_token, sessionToken)
    const user = socket.data.user;
    const userID = user.id;
    const sessionTokenFromMap = userIDtoSessionTokenMap.get(userID);
    const token = sessionTokenFromMap.token;
    console.log(token);
    const sessionData = tokenToSessionDataMap.get(token);
    const sessionUser = sessionData.user;
    sessionData.channels = {
      lobby: null,
    };
    Tests.assertEqual({
      actual: sessionUser,
      expected: user,
      message: "Session user should be the same as user from socket"
    })
  }

  console.log(`A user connected with socket id: ${socket.id}`);

  setupBaseSocketEvents(socket);

  //sendLobbiesToSocket(socket);  
});

function addConnectedUser(user) {
  const userID = user?.username;
  connectedUsersMap.set(userID, user);
}

function removeConnectedUser(user) {
  const userID = user?.username;
  connectedUsersMap.delete(userID);
}

function disconnectSocket(socket) {
  const userID = socket?.data?.user?.id;
  const user = connectedUsersMap.get(userID);
  if (!user) {
    console.log(`Socket disconnected with socket id: ${socket.id}`);
    return;
  }
  const nickname = user.nickname ?? "unknown";
  console.log(`User ${nickname} disconnected with socket id: ${socket.id}`);
  userSocketConnections.removeSocket(userID, socket);
}

function setupBaseSocketEvents(socket) {
  // Listening for a message from the client
  socket.on(EVENTS.client.action.message, (data) => {
    console.log("Message received:", data);
    // Sending a message back to the client
    socket.emit(EVENTS.server.action.message, "Hello from server!");
  });

  // Handle disconnect event
  socket.on(EVENTS.client.action.disconnect, () => {
    disconnectSocket(socket);
  });

  socket.on(EVENTS.client.request.make_lobby, async ({ name }) => {
    const getSessionDataResult = getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;

    const sessionData = getSessionDataResult.unwrap();
    const user = sessionData.user;
    const lobby = createLobby({
      name: name,
      owner: user,
    })
    console.log(lobby);
    await storeLobby(lobby);
    await sendLobbiesToSocket(socket);
    console.log(await joinLobbyResponse({ socket: socket, newLobbyID: lobby.id }));
  });

  socket.on(EVENTS.client.request.start_game, () => socketRequestStartGame(socket));

  socket.on(EVENTS.client.request.roll, async () => {
    const getSessionDataResult = getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;

    const sessionData = getSessionDataResult.unwrap();
    const player = sessionData.gameManager.getPlayer();
    if (!player) {
      sendToHome(socket);
      return;
    }
    player.roll();

    socket.emit(EVENTS.server.response.roll, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, (await getGameData({ socket: socket })).unwrap());
  });

  socket.on(EVENTS.client.request.toggle_hold, async (index) => {
    const getSessionDataResult = getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;

    const sessionData = getSessionDataResult.unwrap();
    const player = sessionData.gameManager.getPlayer();
    if (!player) {
      sendToHome(socket);
      return;
    }
    player.toggleHoldDie(index);
    //socket.emit(EVENTS.server.response.roll, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, (await getGameData({ socket: socket })).unwrap());
  });

  socket.on(EVENTS.client.request.score, async (category) => {
    console.log("score", category);
    const getSessionDataResult = getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;
    
    const sessionData = getSessionDataResult.unwrap();
    const player = sessionData.gameManager.getPlayer();
    if (!player) {
      sendToHome(socket);
      return;
    }
    player.score(category);
    socket.emit(EVENTS.server.response.score, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, (await getGameData({ socket: socket })).unwrap());
  });

  socket.on(EVENTS.client.request.message_room, ({ message }) => {
    tryCatchAsync(async () => {
      const sessionData = getSessionDataBySocket(socket).unwrap();
      const room = sessionData.channels[SOCKET_CHANNELS.lobby];
      console.log("sending a message to room", room);
      socket.to(room).emit(EVENTS.client.broadcast.message_room, { sender: socket.user.nickname, message: message });
    })
  });

  socket.on(EVENTS.client.request.leave_lobby, async () => {
    tryCatchAsync(async () => {
      const sessionData = getSessionDataBySocket(socket).unwrap();
      const user = sessionData.user;
      await leaveLobbyResponse(user);
    })
  })


  socket.on(EVENTS.client.request.get_lobbies, () => {
    sendLobbiesToSocket(socket);
  });

  socket.on(EVENTS.client.request.join_lobby, async ({ newLobbyID }) => {
    console.log("trying to join lobby", newLobbyID);
    await joinLobbyResponse({ socket: socket, newLobbyID: newLobbyID });
  })
}

async function socketRequestStartGame(socket) {
  console.log("trying to start game");
  const result = await tryCatchAsyncFlex(async () => {
    console.log("does go wrong here?");
    const sessionData = getSessionDataBySocket(socket).unwrap();

    const lobbyID = sessionData.lobby.id;
    const lobby = lobbiesMap.get(lobbyID);
    if (!lobby) throw new Error("Lobby not found");

    const room = lobby.id;
    const user = sessionData.user;

    const matchManager = makeNewGame({ room, owner: user }).unwrap();

    const gameManager = matchManager
      .getPlayerOfUser(user)
      .bindSync(player => matchManager.getGameManagerOfPlayer(player))
      .unwrap();

    updateUserSessionData(user.id, { gameManager })
    io.in(room).emit(EVENTS.server.response.start_game, "starting game");

    return true;
  });
  if (result.isFailure()) {
    console.error(result.getError());
    sendToHome(socket);
    // Optionally emit failure event here, if you want
    // io.in(room).emit(EVENTS.server.response.start_game, "couldnt start game");
  }
}

function getSessionDataByUserID(userID) {
  return tryCatch(() => {
    const sessionToken = userIDtoSessionTokenMap.get(userID);
    const token = sessionToken.token;
    const sessionData = tokenToSessionDataMap.get(token);
    return sessionData;
  })
}

function getUserIdFromSocket(socket) {
  return tryCatch(() => {
    const userID = socket.data.user.id;
    return userID;
  })
}

function getSessionDataBySocket(socket) {
  return tryCatchFlex(() => {
    const result = getUserIdFromSocket(socket)
      .bindSync(userID => getSessionDataByUserID(userID));
    return result;
  })
}

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
  const getSessionDataResult = getSessionDataBySocket(socket);
  if (getSessionDataResult.isFailure()) return getSessionDataResult;

  const sessionData = getSessionDataResult.unwrap();
  const user = sessionData.user;
  const userID = user.id;
  lobby.addPlayer({ user: user });
  updateUserSessionData(userID, {
    lobby: lobby,
  })
  return Result.success(lobby);
}

async function leaveLobby({ socket, lobby }) {
  const getSessionDataResult = getSessionDataBySocket(socket);
  if (getSessionDataResult.isFailure()) return getSessionDataResult;

  const sessionData = getSessionDataResult.unwrap();
  const user = sessionData.user;
  const userID = user.id;
  lobby.removePlayer({ user: user });
  updateUserSessionData(userID, {
    lobby: null,
  })
  return Result.success("Left lobby");
}

async function switchLobbies({ socket, lobby }) {
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

async function joinChannel({ socket, channelID, channelName }) {
  const getSessionDataResult = getSessionDataBySocket(socket);
  if (getSessionDataResult.isFailure()) return getSessionDataResult;

  const sessionData = getSessionDataResult.unwrap();
  const channels = sessionData.channels;
  if (channels[channelID]) return Result.failure("Already in channel with same name");

  await joinRoom(socket, channelID);
  channels[channelName] = channelID;
  return Result.success("Joined channel");
}

async function leaveChannel({ socket, channelName, channelID }) {
  return tryCatchAsync(async () => {
    getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;

    const sessionData = getSessionDataResult.unwrap();
    const channels = sessionData.channels;
    if (!channels[channelID]) return Result.failure("Already not in that channel");

    await leaveRoom(socket, channelID);
    delete channels[channelName];
    return Result.success("Left channel");
  })
}

async function replaceChannel({ socket, channelName, channelID }) {
  const result = await tryCatchAsyncFlex(async () =>
    await getSessionDataBySocket(socket)
      .bindAsync(async sessionData => {
        const { socketGroup, channels } = sessionData;

        await socketGroup.forEachAsync(async socket => {
          await leaveRoom(socket, channels);
          await joinRoom(socket, channelID);
        });

        channels[channelName] = channelID;
        console.log("im being run!!!!");
        return Result.success("Replaced channel");
      })
  );
  return result;
}

async function joinLobbyResponse({ socket, newLobbyID }) {
  const getSessionDataResult = getSessionDataBySocket(socket);
  if (getSessionDataResult.isFailure()) return getSessionDataResult;

  const sessionData = getSessionDataResult.unwrap();
  const currentLobby = sessionData.lobby;
  if (currentLobby !== null && currentLobby.id === newLobbyID) {
    socket.emit(EVENTS.server.response.join_lobby, Result.failure("Client is already in this lobby"));
    return;
  }

  const lobbyResult = await getLobby(newLobbyID);
  if (lobbyResult.isFailure()) {
    socket.emit(EVENTS.server.response.join_lobby, lobbyResult);
    return;
  }

  const lobby = lobbyResult.unwrap();
  const user = sessionData.user;
  const userID = user.id;
  lobby.addPlayer(userID);

  const replaceChannelResult = await replaceChannel({
    socket: socket,
    channelName: SOCKET_CHANNELS.lobby,
    channelID: newLobbyID,
  });
  const switchLobbiesResult = await switchLobbies({
    socket: socket,
    lobby: lobby,
  });
  socket.emit(EVENTS.server.response.join_lobby, lobbyResult);

  console.log("JOINED", newLobbyID);
  Tests.assertTrue({
    value: switchLobbiesResult.isSuccess(),
    message: "switchLobbiesResult should always pass"
  });
  Tests.assertTrue({
    value: replaceChannelResult.isSuccess(),
    message: "replaceChannelResult should always pass"
  });
  Tests.assertNotNull({
    value: lobby,
    message: "lobby should not be null",
  });


}

async function leaveLobbyResponse(user) {
  const result = await tryCatchAsync(async () => {
    const sessionData = getSessionDataByUserID(user.id).unwrap();
    const user = sessionData.user;
    const socketGroup = sessionData.socketGroup;
    const currentLobby = sessionData.lobby;
    const currentLobbyID = currentLobby.id;

    const lobby = await getLobby(currentLobbyID).unwrap();
    const userID = user.id;
    lobby.addPlayer(userID);

    const replaceChannelResult = await replaceChannel({
      socket: socket,
      channelName: SOCKET_CHANNELS.lobby,
      channelID: newLobbyID,
    });
    const switchLobbiesResult = await switchLobbies({
      socket: socket,
      lobby: lobby,
    });

    socket.emit(EVENTS.server.response.join_lobby, lobbyResult);

    console.log("JOINED", newLobbyID);
  })
  if (result.isFailure()) {
    socket.emit(EVENTS.server.response.join_lobby, lobbyResult);
    return;
  }
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

  return lobby;
}

function updateUserSessionData(userID, { lobby, gameManager, socketGroup, channels }) {
  if (!userID) return Result.failure("No user ID");

  return getSessionDataByUserID(userID)
    .mapSync(sessionData => SessionData.update(sessionData, { lobby, gameManager, socketGroup, channels }));
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


function makeNewGame({ room, owner }) {
  const matchManager = new MatchManager();
  matchManager.init(room);
  matchManager.addUserAsPlayer(owner)
  return Result.success(matchManager);
}

async function getGameData({ socket }) {
  const result = await getSessionDataBySocket(socket)
  .bind(sessionData => sessionData.gameManager.getGameData());

  return result;
}

/*
const game = new Game();
console.log(game.useRuleset(Game.defaultRuleset));
console.log(game); 
console.log(game.init());
console.log(game);
*/
