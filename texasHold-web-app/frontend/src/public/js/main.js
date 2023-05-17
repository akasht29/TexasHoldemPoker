import socket   from "./common/index.js";

const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

socket.on('error', function (err) {
  console.log(err);
});

socket.on('CHAT_MESSAGE', ({ username, message }) => {
  console.log("message recieved");
  appendMessage(`${username}`,`${message}`);
});

socket.on('PLAYER_JOINED', ({username}) => {
  console.log(username + " connected ");
  appendMessage(`${username}`, `connected`);
});

socket.on('PLAYER_LEFT', ({username}) => {
  console.log(username + " disconnected ");
  appendMessage(`${username}`, `disconnected`);
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value;

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