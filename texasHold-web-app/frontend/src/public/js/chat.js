import  events  from "../../../../shared/constants.js";
import socket   from "./common/index.js";

const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

export const chat = () => {

  socket.on(events.CHAT_MESSAGE, ({ username, message }) => {
    console.log("message recieved");
    appendMessage(`${username}: ${message}`);
  });
  
  socket.on(events.PLAYER_JOINED, username => {
    console.log("player connected");
    appendMessage(`${username} connected`);
  });
  
  socket.on(events.PLAYER_LEFT, username => {
    console.log("player disconnected");
    appendMessage(`${username} disconnected`);
  });

  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);

    fetch("/chat/0", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    messageInput.value = '';
  });
  
  function appendMessage(username, message) {
    const chatDiv        = document.getElementById("chat-view");
    chatDiv.style        = "margin-bottom: 2em; padding-left: 0.5em;"
    const newMessageDiv  = document.createElement("div");
    const newMessageText = document.createTextNode(`${username}: ${message}`);
    newMessageDiv.appendChild(newMessageText);
    chatDiv.appendChild(newMessageDiv);
  }
  
  function clearChat() {
    const chatDiv = document.getElementById("chat-view");
    chatDiv.innerHTML = '';
  }


  return chat;
};

export default chat;
