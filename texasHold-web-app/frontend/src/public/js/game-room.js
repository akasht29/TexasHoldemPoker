const CardImageLinks = {
    "AC": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/English_pattern_ace_of_clubs.svg/800px-English_pattern_ace_of_clubs.svg.png",
    "2C": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/English_pattern_2_of_clubs.svg/800px-English_pattern_2_of_clubs.svg.png",
    "3C": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/English_pattern_3_of_clubs.svg/800px-English_pattern_3_of_clubs.svg.png",
    "4C": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/English_pattern_4_of_clubs.svg/800px-English_pattern_4_of_clubs.svg.png",
    "5C": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/English_pattern_5_of_clubs.svg/800px-English_pattern_5_of_clubs.svg.png",
    "6C": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/English_pattern_6_of_clubs.svg/800px-English_pattern_6_of_clubs.svg.png",
    "7C": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/English_pattern_7_of_clubs.svg/800px-English_pattern_7_of_clubs.svg.png"
}

function addCardToHand(key) {
    let handDiv    = document.getElementById("hand-cards");
    let newCardImg = new Image();
    newCardImg.src = CardImageLinks[key];
    newCardImg.id  = key;
    newCardImg.alt = key;
    newCardImg.style = "height: 90%; padding-left: 0.5em; padding-right: 0.5em;"
    handDiv.appendChild(newCardImg);
}

function clearHand() {
    const handDiv = document.getElementById("hand-cards");
    handDiv.innerHTML = '';
}

function addCardToTable(key) {
    let handDiv    = document.getElementById("table-cards");
    let newCardImg = new Image();
    newCardImg.src = CardImageLinks[key];
    newCardImg.id  = key;
    newCardImg.alt = key;
    newCardImg.style = "height: 90%; padding-left: 0.5em; padding-right: 0.5em;"
    handDiv.appendChild(newCardImg);
}

function clearTable() {
    const handDiv = document.getElementById("hand-cards");
    handDiv.innerHTML = '';
}

function logMessage(user, message) {
    const chatDiv        = document.getElementById("chat-view");
    chatDiv.style        = "margin-bottom: 2em; padding-left: 0.5em;"
    const newMessageDiv  = document.createElement("div");
    const newMessageText = document.createTextNode(`${user}: ${message}`);
    newMessageDiv.appendChild(newMessageText);
    chatDiv.appendChild(newMessageDiv);
}

function clearChat() {
    const chatDiv = document.getElementById("chat-view");
    chatDiv.innerHTML = '';
}
