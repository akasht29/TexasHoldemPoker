import io from "socket.io-client";
import events from "/backend/src/sockets/constants";
const socket = io({ query: { path: window.location.pathname } });
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

socket.on(events.CHAT_MESSAGE_RECEIVED, ({ username, message, timestamp }) => {
  appendMessage(`${username}: ${message}`);
});

socket.on(events.PLAYER_JOINED, username => {
  appendMessage(`${username} connected`);
});

socket.on(events.PLAYER_LEFT, username => {
  appendMessage(`${username} disconnected`);
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage(`You: ${message}`);
  socket.emit('send_message', message, roomID);
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