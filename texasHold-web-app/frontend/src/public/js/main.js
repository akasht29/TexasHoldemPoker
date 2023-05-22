import socket from "./common/index.js";

function addCardToTable(key) {
  let handDiv = document.getElementById("table-cards");
  let newCardImg = new Image();
  newCardImg.src = CardImageLinks[key];
  newCardImg.id = key;
  newCardImg.alt = key;
  newCardImg.style = "height: 90%; padding-left: 0.5em; padding-right: 0.5em;";
  handDiv.appendChild(newCardImg);
}

function clearTable() {
  const handDiv = document.getElementById("hand-cards");
  handDiv.innerHTML = "";
}

function updatePlayers(players) {
  let playersDiv = document.getElementById("player-view");
  playersDiv.innerHTML = "";

  const titleDiv = document.createElement("div");
  titleDiv.style =
    "color:black;font-size: 22px; padding: 30px; border: 5px solid green; text-align: center;";
  const newMessageText = document.createTextNode(`Players`);
  titleDiv.appendChild(newMessageText);
  playersDiv.appendChild(titleDiv);

  for (let i = 0; i < players.length; i++) {
    players[i].player_id;
    players[i].chips;

    const newPlayerDiv = document.createElement("div");
    newPlayerDiv.style =
      "color:black;font-size: 22px; padding: 30px; border: 5px solid green; margin: 10px;";

    newPlayerDiv.appendChild(document.createTextNode(
      `Username: ${players[i].player_id}`
    ));

    newPlayerDiv.appendChild( document.createElement("div"));

    newPlayerDiv.appendChild(document.createTextNode(
      `Chips: ${players[i].chips} `
    ));

    playersDiv.appendChild(newPlayerDiv);
  }
}

const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

socket.on("error", function (err) {
  console.log(err);
});

socket.on("GAME_STARTING", function (destination) {
  window.location.replace(destination.redirectURL);
});

socket.on("CHAT_MESSAGE", ({ username, message }) => {
  console.log("message recieved");
  appendMessage(`${username}: `, `${message}`);
});

socket.on("GAME_UPDATE", ({ username, action, gameData }) => {
  console.log(username + " performed " + action);
  console.log("New game data fetched");
  appendMessage(`Server: `, `${action} from ${username}`);
});

socket.on("SESSION_ERROR", () => {
  console.log("SESSION_ERROR");
  appendMessage(`Server: `, `Browser session error`);
});

socket.on("PLAYER_JOINED", ({ username }, players) => {
  console.log(username + " connected ");
  appendMessage(`${username} `, `connected`);
  console.log(players);
  updatePlayers(players);
});

socket.on("PLAYER_LEFT", ({ username }, players) => {
  console.log(username + " disconnected ");
  appendMessage(`${username} `, `disconnected`);
  console.log(players);
  updatePlayers(players);
});

//Chat event
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;

  fetch("/chat/0", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  messageInput.value = "";
});

function appendMessage(username, message) {
  const chatDiv = document.getElementById("chat-view");
  const newMessageDiv = document.createElement("div");
  if (message === `connected`) {
    newMessageDiv.style = "color:green;font-size: 16px; padding-bottom: 5px;";
  } else if (message === `disconnected`) {
    newMessageDiv.style = "color:red;font-size: 16px; padding-bottom: 5px;";
  } else if (username === `Server: `) {
    newMessageDiv.style = "color:orange;font-size: 16px; padding-bottom: 5px;";
  } else {
    newMessageDiv.style = "font-size: 16px; padding-bottom: 5px;";
  }

  const newMessageText = document.createTextNode(`${username}${message}`);
  newMessageDiv.appendChild(newMessageText);
  chatDiv.prepend(newMessageDiv);
}

function clearChat() {
  const chatDiv = document.getElementById("chat-view");
  chatDiv.innerHTML = "";
}

socket.on("NEW_COMMUNITY_CARDS", function (cards) {
  console.log("dealing a card to the community cards!");
  const communityCards = cards.communityCards;
  console.log(communityCards);

  const handDiv = document.getElementById("table-cards");
  handDiv.innerHTML = "";

  for (let i = 0; i < communityCards.length; i++) {
    addCardToTable(communityCards[i]);
  }
});

socket.on("FOLD", ({ playername, amount }) => {
  // Update the frontend indicateing that the player has bet
});

socket.on("BET", ({ playername, amount }) => {
  // Update the frontend indicateing that the player has bet
});
