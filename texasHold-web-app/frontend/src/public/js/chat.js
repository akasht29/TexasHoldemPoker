import io from "socket.io-client";
const socket = io();
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

socket.on('chat_message', data => {
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on('user-connected', name => {
  appendMessage(`${name} connected`);
});

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`);
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage(`You: ${message}`);
  socket.emit('send_message', message, roomID);
  messageInput.value = '';
});



function appendMessage(message) {
  const chatDiv        = document.getElementById("chat-view");
  chatDiv.style        = "margin-bottom: 2em; padding-left: 0.5em;"
  const newMessageDiv  = document.createElement("div");
  const newMessageText = document.createTextNode(`${message}`);
  newMessageDiv.appendChild(newMessageText);
  chatDiv.appendChild(newMessageDiv);
}

function clearChat() {
  const chatDiv = document.getElementById("chat-view");
  chatDiv.innerHTML = '';
}