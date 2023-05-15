const http = require("http");
const { Server } = require("socket.io");
import events from "./constants";

const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    const { id: user_id } = socket.request.session.user;
    const { id: socket_id } = socket;

    if (user_id === undefined || game_id === undefined) {
      return;
    }

    let game_id = socket.handshake.query?.path.substring(1);

    if (game_id === "lobby") {
      game_id = 0;
    } else {
      game_id = parseInt(game_id.substring(game_id.lastIndexOf("/") + 1));
    }

    Sockets.add(game_id, user_id, socket.id);

    if (game_id !== 0) {
      Games.state(game_id).then(({ lookup }) => {
        socket.emit(events.GAME_UPDATED, lookup(user_id));
      });
    }

    socket.on("disconnect", () => {
      Sockets.remove(socket_id);
    });

    socket.on("send-message", (message, roomID) => {
      socket.emit(events.CHAT_MESSAGE, lookup(roomID));
    });
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;
