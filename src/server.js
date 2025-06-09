import express from "express";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { Server as SocketServer, Socket } from "socket.io";
import Lobby from './models/Lobby.js';  // Ensure this path is correct for your project structure
import { v4 as uuidv4 } from "uuid";
import { EVENTS } from './constants/socketEvents.js';
import { Result, tryCatch, tryCatchAsync, tryCatchAsyncFlex, tryCatchFlex } from "./utils/Result.js";
import { getConnection, testConnection } from "./database/databasePG.js";
import { deleteOldLobbies, deleteAll, getAllUsers, getPostgresDate, insertLobby, registerUser, selectLobby } from "./database/dbUserFunctions.js";
import User from "./domain/user/User.js";
import { LobbySchema } from "./database/tables/LobbySchema.js";
import { TABLES } from "./database/dbTableNames.js";
import { Tests } from "./utils/Test.js";
import { UserSocketConnections } from "./domain/user/UserSocketConnections.js";
import { MatchManager } from "./domain/game/managers/MatchManager.js";
import { SessionData } from "./domain/session/SessionData.js";
import { SocketGroup } from "./domain/socket/SocketGroup.js";
import { SessionToken } from "./domain/session/SessionToken.js";
import { ChannelManager } from "./domain/channels/ChannelManager.js";
import { Channel } from "./domain/channels/Channel.js";
import { Any, match } from "./utils/Match.js";
import { curry } from "./utils/Curry.js";
import { Failure, matchToResult } from "./utils/ResultMatch.js";

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
      "https://multiplayer-yahtzee-frontend.onrender.com",
    ],
    methods: ["GET", "POST"]
  }
});

const lobbiesMap = new Map();
const matchesMap = new Map();
const SOCKET_CHANNELS = {
  rooms: {
    lobby: "lobby",
  }
}

console.log(SOCKET_CHANNELS);

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
const serverSessionToken = uuidv4();
io.use((socket, next) => {
  const { token: storedToken, nickname, username, email, serverSessionToken: socketServerSessionToken } = socket.handshake.auth;
  console.log("a", socketServerSessionToken, socketServerSessionToken != null);
  console.log("SESSIONTOKEN", socket.handshake.auth);
  if (socketServerSessionToken != serverSessionToken && socketServerSessionToken != null) {
    return next(new Error("Old server session"));
  }

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
    channelManager: new ChannelManager({
      rooms: [new Channel("lobby", null)]
    }),
  });
  console.log("CREATED NEW SESSIONDATA");

  tokenToSessionDataMap.set(sessionToken.token, sessionData);
  userIDtoSessionTokenMap.set(user.id, sessionToken);

  Tests.assertNotNull({ value: sessionData, message: "sessionData should not be null" });
  Tests.assertNotNull({ value: user, message: "user should not be null" });
  Tests.assertNotNull({ value: socket.handshake.auth, message: "handshake should not be null" });

  return next();
});

// Set up a simple connection event
io.on("connection", (socket) => {
  socket.emit(EVENTS.server.action.send_server_session_token, serverSessionToken);

  const sessionToken = socket.data.sessionToken;
  if (sessionToken) {
    console.log(reconnectSocketToRooms(socket));
    console.log("connected! toekn")
    socket.emit(EVENTS.server.action.send_token, sessionToken);
    const user = socket.data.user;
    const userID = user.id;
    const sessionTokenFromMap = userIDtoSessionTokenMap.get(userID);
    const token = sessionTokenFromMap.token;
    console.log(token);
    const sessionData = tokenToSessionDataMap.get(token);
    const sessionUser = sessionData.user;
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

function reconnectSocketToRooms(socket) {
  const result = Result.success({})
    .bindKeepSync("sessionData", () => getSessionDataBySocket(socket))
    .bindKeepSync("channelManager", ({ sessionData }) => Result.expectTypes({ vals: ChannelManager, fn: () => sessionData.channelManager }))
    .bindKeepSync("rooms", ({ channelManager }) => Result.expectTypes({ vals: Object, fn: () => channelManager.getAllRooms() }))
    .bindKeepSync("joinRoomResults", ({ rooms }) => {
      const results = [];
      console.log("Rooms to reconnect to", rooms);
      console.log("socket rooms pre:", socket.rooms)
      for (const [channelKey, channel] of Object.entries(rooms)) {
        console.log("Channel to reconnect to", rooms);
        const channelName = channel.channelName;
        const channelId = channel.channelId;
        const joinRoomResult = joinRoom(socket, channelId);
        results.push(joinRoomResult);
        console.log("CHANNEL TO RECONNECT TOOOOO", channelName, channelId);
      }
      console.log("socket rooms:", socket.rooms)
      return Result.all(results);
    });

  return result
}
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
    sendLobbiesToSocket(socket);
    console.log(joinLobbyResponse({ socket: socket, newLobbyID: lobby.id }));
  });

  socket.on(EVENTS.client.request.start_game, () => socketRequestStartGame(socket));

  socket.on(EVENTS.client.request.roll, () => {
    const getSessionDataResult = getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;

    const sessionData = getSessionDataResult.unwrap();
    const player = sessionData.player;
    if (!player) {
      sendToHome(socket);
      return;
    }
    player.roll();

    socket.emit(EVENTS.server.response.roll, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, (getGameData({ socket: socket })).unwrap());
  });

  socket.on(EVENTS.client.request.toggle_hold, (index) => {
    const getSessionDataResult = getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;

    const sessionData = getSessionDataResult.unwrap();
    const player = sessionData.player;
    if (!player) {
      console.log(sessionData)
      //sendToHome(socket);
      return;
    }
    player.toggleHoldDie(index);
    //socket.emit(EVENTS.server.response.roll, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, (getGameData({ socket: socket })).unwrap());
  });

  socket.on(EVENTS.client.request.score, (category) => {
    console.log("score", category);
    const getSessionDataResult = getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;

    const sessionData = getSessionDataResult.unwrap();
    const player = sessionData.player;
    if (!player) {
      sendToHome(socket);
      return;
    }
    player.score(category);
    socket.emit(EVENTS.server.response.score, "rolling");
    socket.emit(EVENTS.server.action.send_game_data, (getGameData({ socket: socket })).unwrap());
  });

  socket.on(EVENTS.client.request.message_room, ({ message }) => {
    console.log("sending message to room");
    console.log("has sent message:", tryCatchFlex(() => {
      const messageResult = Result.success({})
        .bindKeepSync("sessionData", () => getSessionDataBySocket(socket))
        .bindKeepSync("channelManager", ({ sessionData }) => Result.expectTypes({ vals: ChannelManager, fn: () => sessionData.channelManager }))
        .bindKeepSync("channel", ({ channelManager }) => Result.expectTypes({ vals: Channel, fn: () => channelManager.getRoom(SOCKET_CHANNELS.rooms.lobby) }))
        .bindKeepSync("room", ({ channel }) => Result.expectTypes({ vals: [String], fn: () => channel.channelId }))
        .bindKeepSync("user", ({ sessionData }) => Result.success(sessionData.user))
        .bindKeepSync("messageSent", ({ user, room }) => {
          console.log(room);
          console.log("socket rooms:", socket.rooms);
          socket.to(room).emit(EVENTS.client.broadcast.message_room, { sender: user.nickname, message: message });
          return Result.success(true);
        })
      return messageResult;
    }))
  });

  socket.on(EVENTS.client.request.leave_lobby, () => {
    leaveLobbyResponse(socket);
  })


  socket.on(EVENTS.client.request.get_lobbies, () => {
    sendLobbiesToSocket(socket);
  });

  socket.on(EVENTS.client.request.join_lobby, ({ newLobbyID }) => {
    console.log("trying to join lobby", newLobbyID);
    joinLobbyResponse({ socket: socket, newLobbyID: newLobbyID });
  })
}

function socketRequestStartGame(socket) {
  console.log("trying to start game");
  const result = tryCatchFlex(() => {
    const result = Result.success({})
      .bindKeepSync("sessionData", () => getSessionDataBySocket(socket))
      .bindKeepSync("lobby", ({ sessionData }) => Result.expectTypes({ vals: Lobby, fn: () => lobbiesMap.get(sessionData.lobby.id) }))
      .bindKeepSync("isOwner", ({ sessionData, lobby }) => {
        const user = sessionData.user;
        const owner = lobby.owner;
        return matchToResult(user.id, [
          [owner.id, () => `User with id "${user.id}" is owner of lobby with id ${lobby.id}.`],
          [Failure, () => `User with id "${user.id}" is not owner of lobby with id ${lobby.id}. Owner of that lobby is ${owner.id}`]
        ]
        )
      })
      .bindKeepSync("addPlayersToGameData", ({ lobby }) => addPlayersFromLobbyToGame(lobby))
      .bindKeepSync("room", ({ lobby }) => Result.expectTypes({ vals: String, fn: () => lobby.id }))
      .bindKeepSync("matchManager", ({ addPlayersToGameData }) => Result.expectTypes({ vals: MatchManager, fn: () => addPlayersToGameData.matchManager }))
    //.bindKeepSync("test", ({ lobby, addPlayersToGameData }) => Result.success(console.log(lobby, "addplayer", addPlayersToGameData.matchManager)))

    const { room } = result.unwrap();
    io.in(room).emit(EVENTS.server.response.start_game, "starting game");

    return true;
  });
  if (result.isFailure()) {
    //console.error(result.getError());
    sendToHome(socket);
    // Optionally emit failure event here, if you want
    // io.in(room).emit(EVENTS.server.response.start_game, "couldnt start game");
  }
}

function addPlayersFromLobbyToGame(lobby) {
  console.log("lobby", lobby);
  const result = Result.success({})
    .bindKeepSync("room", _ => Result.expectTypes({ vals: String, fn: () => lobby.id }))
    .bindKeepSync("owner", _ => Result.expectTypes({ vals: User, fn: () => lobby.owner }))
    .bindKeepSync("users", _ => Result.expectTypes({ vals: Set, fn: () => lobby.getUsers() }))
    .bindKeepSync("a", ({ users }) => Result.success(console.log("users", users)))
    .bindKeepSync("matchManager", ({ room, owner }) => makeNewGame({ room: room, owner: owner }))
    .bindKeepSync("addUsersToGameResult", ({ users, matchManager }) => {
      const results = [];
      for (const user of users) {
        const addResult = matchManager.addUserAsPlayer(user);
        results.push(addResult);
      }
      return Result.wrap(Result.all(results));
    })
    .bindKeepSync("playerToUserIdMap", ({ matchManager }) => Result.expectTypes({ vals: Map, fn: () => matchManager.getPlayerUserMap() }))
    .bindKeepSync("updateUserSessions", ({ matchManager, playerToUserIdMap }) => {
      const results = [];
      console.log("playerrrrrrrr");
      console.log("playerrrrrrrr");
      console.log("playerrrrrrrr");
      console.log(playerToUserIdMap, playerToUserIdMap.entries())

      for (const [player, userID] of playerToUserIdMap.entries()) {
        console.log("playerrrrrrrr", player, userID);
        const gameManager = matchManager.getGameManagerOfPlayer(player).unwrap();
        const updateResult = updateUserSessionData(userID, { matchManager: matchManager, player: player, gameManager: gameManager })
        results.push(updateResult);
      }
      return Result.wrap(Result.all(results));
    })

  return result;
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
  return getUserIdFromSocket(socket)
    .bindSync(userID => getSessionDataByUserID(userID));
}

function sendLobbiesToSocket(socket) {
  console.log(`sending lobbies to ${socket.id}`);
  console.log(lobbiesMap.size);
  const lobbyKeys = Array.from(lobbiesMap.keys());
  const lobbyValues = Array.from(lobbiesMap.values());
  socket.emit(EVENTS.server.response.get_lobbies, { lobbyKeys: lobbyKeys, lobbyValues: lobbyValues });
}
function joinRoom(socket, room) {
  socket.join(room);
  return Result.success(`Joined room: ${room}`);
}

function leaveRoom(socket, room) {
  socket.leave(room);
  return Result.success(`Left room: ${room}`);
}

function joinLobby({ user, lobby }) {
  return Result.success({})
    .bindKeepSync("sessionData", () => getSessionDataByUserID(user.id))
    .bindKeepSync("user", ({ sessionData }) => Result.expectTypes({ vals: User, fn: () => sessionData.user }))
    .bindKeepSync("addUserResult", ({ user }) => Result.wrap(lobby.addUser(user)))
    .bindKeepSync("updateUserSessionResult", ({ user }) => updateUserSessionData(user.id, { lobby: lobby, }))
}

function leaveLobby({ user, lobby }) {
  return Result.success({})
    .bindKeepSync("sessionData", () => getSessionDataByUserID(user.id))
    .bindKeepSync("user", ({ sessionData }) => Result.expectTypes({ vals: User, fn: () => sessionData.user }))
    .bindKeepSync("addUserResult", ({ user }) => Result.wrap(lobby.removeUser(user)))
    .bindKeepSync("updateUserSessionResult", ({ user }) => updateUserSessionData(user.id, { lobby: null, }))
}

function switchLobbies({ user, lobby }) {
  const leaveLobbyResult = leaveLobby({
    user: user,
    lobby: lobby,
  });

  const joinLobbyResult = joinLobby({
    user: user,
    lobby: lobby,
  });
  return joinLobbyResult;
}

function getLobby(lobbyID) {
  const lobby = lobbiesMap.get(lobbyID);
  const lobbyResult = lobby
    ? Result.success(lobby)
    : Result.failure(`no lobby with id: ${lobbyID}`);
  return lobbyResult;
}

function joinChannel({ socket, channelID, channelName }) {
  const getSessionDataResult = getSessionDataBySocket(socket);
  if (getSessionDataResult.isFailure()) return getSessionDataResult;

  const sessionData = getSessionDataResult.unwrap();
  const channels = sessionData.channels;
  if (channels[channelID]) return Result.failure("Already in channel with same name");

  joinRoom(socket, channelID);
  channels[channelName] = channelID;
  return Result.success("Joined channel");
}

function leaveChannel({ socket, channelName, channelID }) {
  return tryCatch(() => {
    getSessionDataBySocket(socket);
    if (getSessionDataResult.isFailure()) return getSessionDataResult;

    const sessionData = getSessionDataResult.unwrap();
    const channels = sessionData.channels;
    if (!channels[channelID]) return Result.failure("Already not in that channel");

    leaveRoom(socket, channelID);
    delete channels[channelName];
    return Result.success("Left channel");
  })
}

function replaceChannel({ socket, channelName, channelID }) {
  console.log("trying to join:", channelName, "with id:", channelID);
  const result = Result.success({})
    .bindKeepSync("sessionData", () => getSessionDataBySocket(socket))
    .bindKeepSync("socketGroup", ({ sessionData }) => Result.expectTypes({ vals: SocketGroup, fn: () => sessionData.socketGroup }))
    .bindKeepSync("channelManager", ({ sessionData }) => Result.expectTypes({ vals: ChannelManager, fn: () => sessionData.channelManager }))
    .bindKeepSync("a", ({ channelManager }) => Result.success(console.log(channelManager.getRoom(channelName))))
    .bindKeepSync("b", ({ channelManager }) => Result.success(console.log(channelName, "channelName")))
    .bindKeepSync("currentChannelId", ({ channelManager }) => Result.expectTypes({ vals: [String, null], fn: () => channelManager.getRoom(channelName).channelId }))
    .bindKeepSync("updateSockets", ({ socketGroup, currentChannelId }) => {
      const results = [];
      console.log("current", currentChannelId, channelID);
      socketGroup.forEach(socket => {
        console.log("socket rooms pre", socket.rooms);
        const leaveRoomResult = leaveRoom(socket, currentChannelId);
        const joinRoomResult = channelID ? joinRoom(socket, channelID) : Result.success("No room to join");
        results.push(leaveRoomResult);
        results.push(joinRoomResult);
        console.log("socket rooms", socket.rooms, channelID ? true : false);
      });
      return Result.all(results);
    })
    .bindKeepSync("setRoom", ({ channelManager }) => Result.expectTypes({ vals: Boolean, fn: () => channelManager.setRoom(new Channel(channelName, channelID)) }))
  return result;
}

function joinLobbyResponse({ socket, newLobbyID }) {
  const result = Result.success({})
    .bindKeepSync("sessionData", () => getSessionDataBySocket(socket))
    .bindKeepSync("currentLobby", ({ sessionData }) => Result.expectTypes({ vals: [Lobby, null], fn: () => sessionData.lobby }))
    .bindKeepSync("isInLobby", ({ currentLobby }) =>
      match(currentLobby?.id, [
        [newLobbyID, () => Result.failure(true)],
        [Any, () => Result.success(false)],
      ]))
    .bindKeepSync("lobby", () => getLobby(newLobbyID))
    .bindKeepSync("user", ({ sessionData }) => Result.expectTypes({ vals: [User], fn: () => sessionData.user }))
    .bindKeepSync("updateResult", ({ user, lobby }) => updateUserSessionData(user.id, { lobby: lobby }))
    .bindKeepSync("replaceAndSwitch", ({ user, lobby }) => {
      const results = [];
      const replaceChannelResult = replaceChannel({
        socket: socket,
        channelName: SOCKET_CHANNELS.rooms.lobby,
        channelID: newLobbyID,
      });
      results.push(replaceChannelResult);

      const switchLobbiesResult = switchLobbies({
        user: user,
        lobby: lobby,
      });
      results.push(switchLobbiesResult);

      const all = Result.all(results);
      return all;
    })

  if (result.isFailure()) {

    socket.emit(EVENTS.server.response.join_lobby, result);
    return result;
  }
  socket.emit(EVENTS.server.response.join_lobby, result);
  console.log("JOINED", newLobbyID);
  return result;
}

function leaveLobbyResponse(socket) {
  const result = tryCatch(() => {
    return Result.success({})
      .bindKeepSync("sessionData", () => getSessionDataBySocket(socket))
      .bindKeepSync("user", ({ sessionData }) => Result.expectTypes({ vals: User, fn: () => sessionData.user }))
      .bindKeepSync("lobby", ({ sessionData }) => Result.expectTypes({ vals: [Lobby, null], fn: () => sessionData.lobby }))
      .bindKeepSync("socketGroup", ({ sessionData }) => Result.expectTypes({ vals: [SocketGroup], fn: () => sessionData.socketGroup }))
      .bindKeepSync("socketReplace", ({ socketGroup, lobby, user }) => {
        const results = [];
        socketGroup.forEach(socket => {
          const replaceChannelResult = replaceChannel({
            socket: socket,
            channelName: SOCKET_CHANNELS.rooms.lobby,
            channelID: null,
          });
          const leaveLobbyResult = leaveLobby({
            user: user,
            lobby: lobby,
          });
          results.push(replaceChannelResult);
          results.push(leaveLobbyResult);
          if (replaceChannelResult.isSuccess() || leaveLobbyResult.isSuccess()) {
            socket.emit(EVENTS.server.response.leave_lobby, Result.success("Left lobby"));
          }
        });

        return Result.all(results);
      })
      .bindKeepSync("updateUserResult", ({ user }) => updateUserSessionData(user.id, { lobby: null }))
  })
  if (result.isFailure()) {
    console.log("socket with id:", socket.id, "could not leeave lobby", result);
    socket.emit(EVENTS.server.response.leave_lobby, Result.failure("Could not leave lobby"));
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

function addUserToLobby() {

}
function updateUserSessionData(userID, { lobby, matchManager, gameManager, player, socketGroup, channels }) {
  if (!userID) return Result.failure("No user ID");

  return getSessionDataByUserID(userID)
    .bindSync(sessionData => {
      const didUpdate = sessionData.update({ lobby, matchManager, gameManager, player, socketGroup, channels })
      const result = matchToResult(didUpdate, [
        [true, () => "Successfully updated session data"],
        [Failure, () => "Could not update session data"],
      ])
      return result;
    });
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

function matchTests() {
  // === 1. Primitive match ===
  Tests.assertEqual({
    message: 'Match primitive number (exact)',
    actual: match(42, [
      [1, () => 'one'],
      [42, () => 'the answer'],
      [Any, () => 'fallback'],
    ]),
    expected: 'the answer',
  });

  // === 2. Predicate function ===
  Tests.assertEqual({
    message: 'Match via predicate: value is even',
    actual: match(8, [
      [x => x < 0, () => 'negative'],
      [x => x % 2 === 0, () => 'even'],
      [Any, () => 'fallback'],
    ]),
    expected: 'even',
  });

  // === 3. Deep object matching ===
  Tests.assertEqual({
    message: 'Match object with exact structure and values',
    actual: match({ role: 'admin', id: 1 }, [
      [{ role: 'user' }, () => 'user'],
      [{ role: 'admin', id: 1 }, () => 'admin'],
      [Any, () => 'unknown'],
    ]),
    expected: 'admin',
  });

  // === 4. Partial deep object match ===
  Tests.assertEqual({
    message: 'Match object with subset pattern (deep match)',
    actual: match({ name: 'Alice', age: 30, active: true }, [
      [{ active: false }, () => 'inactive'],
      [{ name: 'Alice' }, () => 'found Alice'],
      [Any, () => 'no match'],
    ]),
    expected: 'found Alice',
  });

  // === 5. Fallback to Any ===
  Tests.assertEqual({
    message: 'Fallback match using Any wildcard',
    actual: match('something', [
      ['this', () => 'nope'],
      ['that', () => 'still nope'],
      [Any, () => 'caught'],
    ]),
    expected: 'caught',
  });

  // === 6. No match throws ===
  Tests.assertThrows({
    message: 'Throws when nothing matches and no Any fallback exists',
    fn: () => match(100, [
      [x => x < 10, () => 'low'],
      [x => x > 1000, () => 'high'],
    ]),
  });

}

function expectTypesInsideTests() {
  class CustomError extends Error { }
  class AnotherError extends Error { }
  // ========== TEST CASES ==========

  // ✅ Success: Matching value type
  Tests.assertEqual({
    message: "Returns success when value type matches",
    actual: Result.expectTypesInside({
      fn: () => Result.success(42),
      vals: Number
    }).isFailure(),
    expected: false
  });

  // ❌ Fail: Value type mismatch
  Tests.assertTrue({
    message: "Returns failure when value type does not match",
    value: Result.expectTypesInside({
      fn: () => Result.success("oops"),
      vals: Number
    }).isFailure()
  });

  // ✅ Success: Throws error that matches type
  Tests.assertEqual({
    message: "Returns failure when error type matches",
    actual: Result.expectTypesInside({
      fn: () => Result.failure(new CustomError("boom")),
      errs: [CustomError]
    }).getError() instanceof CustomError,
    expected: true
  });

  // ❌ Fail: Error type doesn't match
  Tests.assertThrows({
    message: "Throws if error type doesn't match",
    fn: () => Result.expectTypesInside({
      fn: () => Result.failure(new Error("unhandled")),
      errs: [CustomError]
    })
  });

  // ❌ Fail: Not a Result return type
  Tests.assertTrue({
    message: "Throws but catches and returns result if fn() does not return a Result",
    value: Result.expectTypesInside({
      fn: () => 123,
      vals: Number
    }).isFailure()
  });

  // ❌ Fail: No value or error types provided
  Tests.assertThrows({
    message: "Throws if neither vals nor errs are provided",
    fn: () => Result.expectTypesInside({
      fn: () => Result.success(1)
    })
  });

  // ✅ Success: Uses object pattern match
  Tests.assertTrue({
    message: "Returns success when object matches",
    value: !Result.expectTypesInside({
      fn: () => Result.success({ type: "ok", code: 200 }),
      vals: [{ type: "ok" }]
    }).isFailure()
  });
}
function curryTests() {
  function subtract(a, b) {
    return a - b;
  }

  const curriedSubtract = curry(subtract);

  // === Tests ===
  Tests.assertEqual({
    message: "Curried subtract: full application",
    actual: curriedSubtract(5, 2),
    expected: 3
  });

  Tests.assertEqual({
    message: "Curried subtract: partial then full",
    actual: curriedSubtract(5)(2),
    expected: 3
  });

  const subtractFrom10 = curriedSubtract(10);

  Tests.assertEqual({
    message: "Curried subtract: partially applied subtractFrom10(4)",
    actual: subtractFrom10(4),
    expected: 6
  });

  Tests.assertEqual({
    message: "Curried subtract: subtractFrom10(0)",
    actual: subtractFrom10(0),
    expected: 10
  });

  Tests.assertEqual({
    message: "Curried subtract: subtractFrom10(10)",
    actual: subtractFrom10(10),
    expected: 0
  });
}
function tests() {
  expectTypesInsideTests();
  matchTests();
  curryTests();
  Tests.summary();
}

// Start the server on port 3000
server.listen(PORT, () => {
  const currentTime = new Date();
  const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
  console.log(`Server is running on http://localhost:${PORT}. Started at ${formattedTime}`);
  tests();
});


function makeNewGame({ room }) {
  const matchManager = new MatchManager();
  matchManager.init(room);
  return Result.success(matchManager);
}

function getGameData({ socket }) {
  const result = getSessionDataBySocket(socket)
    .bindSync(sessionData => sessionData.gameManager.getGameData());
  console.log(result);
  return result;
}

/*
const game = new Game();
console.log(game.useRuleset(Game.defaultRuleset));
console.log(game); 
console.log(game.init());
console.log(game);
*/
