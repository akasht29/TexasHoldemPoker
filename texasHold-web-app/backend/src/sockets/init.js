const http       = require("http");
const { Server } = require("socket.io");

const initSockets = (app, sessionMiddleware) => {
    const server = http.createServer(app);
    const io     = new Server(server);

    io.engine.use(sessionMiddleware);

    io.on("connection", (socket) => {
        socket.on("new-user", (roomID) => {
          socket.join(roomID);
        });
    
        socket.on("send-message", (message, roomID) => {
          socket.to(roomID).emit("chat_message", message);
        });
    
        socket.on("disconnect", (roomID) => {
            socket.leave(roomID);
          });
      });

    app.set("io", io);

    return server;
};

module.exports = initSockets;