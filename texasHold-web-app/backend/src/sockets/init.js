const { CHAT_MESSAGE, GAME_UPDATED } = require("../../../shared/constants");
const http = require("http");
const { Server } = require("socket.io");

const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    let game_id = socket.handshake.query?.path.substring(1);

    if (game_id === undefined) {
      return;
    }

    if (game_id === "lobby") {
      game_id = 0;
    } else {
      game_id = parseInt(game_id.substring(game_id.lastIndexOf("/") + 1));
    }

    socket.join(game_id);
    console.log("user connected4");

    socket.on("disconnect", () => {
      console.log("disconnection");
      //Sockets.remove(socket_id);
    });

    socket.on("send-message", (message, roomID) => {
      socket.emit(CHAT_MESSAGE, lookup(roomID));
    });
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;
