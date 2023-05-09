// socket.js
import {io} from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // Replace this URL with your server's address

const connectSocket = () => {
  const socket = io(SOCKET_URL);

  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
  });

  socket.on("error_message", (message) => {
    console.error("Error message:", message);
  });

  socket.on("chat_messages", (messages) => {
    console.log("Received chat messages:", messages);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server:", socket.id);
  });

  return socket;
};

export default connectSocket;
