const http = require("http");
const { Server } = require("socket.io");

const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    let game_id = socket.handshake.query?.path.substring(1);
    const username = socket.request?.session?.user?.username;

    if (game_id === undefined) {
      return;
    }

    if (game_id === "lobby") {
      game_id = 0;
    } else {
      game_id = parseInt(game_id.substring(game_id.lastIndexOf("/") + 1));
    }

    socket.join(game_id);

    io.in(game_id).emit("PLAYER_JOINED", {
      username,
    });

    socket.on("disconnect", () => {
      socket.leave(game_id);
      console.log("disconnection");
    });
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;
