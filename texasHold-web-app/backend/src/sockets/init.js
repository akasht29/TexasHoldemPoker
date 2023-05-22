const http = require("http");
const { Server } = require("socket.io");
const playerModel = require("../models/playerModel");
const userModel = require('../models/userModel');

const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", async (socket) => {
    let game_id = socket.handshake.query?.path.substring(1);
    const username = socket.request?.session?.user?.username;

    socket.rooms.forEach(room => socket.leave(room));

    if (game_id === undefined) {
      return;
    }

    if (game_id === "lobby") {
      game_id = 0;
    } else {
      game_id = parseInt(game_id.substring(game_id.lastIndexOf("/") + 1));
    }

    socket.join(game_id);

    var players = await playerModel.getAllPlayers(game_id);
    for (let i = 0; i < players.length; i++) {
      players[i].player_id = await userModel.getUserNameById(
        players[i].user_id
      );
    }
    io.in(parseInt(game_id)).emit("PLAYER_JOINED", { username }, players);

    socket.on("disconnect", async () => {
      socket.leave(game_id);
      console.log("disconnection");
    });
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;
