//game/js for the front end
export async function createGame() {
   
    const game_name   = document.querySelector('#create-game-form input[name="game_name"]').value;
    const chips       = document.querySelector('#create-game-form input[name="chips"]').value;
    const num_players = document.querySelector('#create-game-form input[name="num_players"]').value;
    const num_rounds  = document.querySelector('#create-game-form input[name="num_rounds"]').value;
    const min_bet     = document.querySelector('#create-game-form input[name="min_bet"]').value;
    const messageDiv  = document.getElementById("message");

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/game/create", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ game_name, chips, num_players, num_rounds, min_bet }),
        });

        const responseData = await response.json();

        if (response.status === 200) {
            console.log("Game created");// debugging
            messageDiv.textContent = `Game : ${game_name} created successfully`;
            return true;

        } 
        else if (response.status === 409) {
            messageDiv.textContent = responseData.message;
        } 
        else {
            console.error("Error creating a game",await response.json());
            messageDiv.textContent = "An error occurred during creating game";
            return false;
        }
    } catch (error) {
        messageDiv.textContent = message.error;
    }
}

export async function getGameList() {
    const gameListElement = document.getElementById("game-list");
  
    const token = localStorage.getItem("token");
    const response = await fetch("/game/list", {

      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    const resultResponse = await response.json();

    const gamesArray = resultResponse.result.games;
  
    if ( gamesArray.length === 0) {

      gameListElement.innerHTML = "<p>No games available. Create one!</p>";
    } else {

        const gamesObj = {};
    
        for (const game of gamesArray) {
            const gameId = game.game_id;
            const gameName = game.game_name;
            //const availableSpaces = game.max_players - game.num_players
            //const startTime = new Date(game.start_time).toLocaleString();
            const gameHtml = `
            <div class="game-item" data-game-id="${gameId}">
                <h3>${gameName}</h3>
                <button class="join-game">Join</button>
            </div>
            `;
        
        gamesObj[gameId] = {
          html: gameHtml,
          numPlayers: game.num_players
        };
      }
  
      gameListElement.innerHTML = Object.values(gamesObj)
        .map((game) => game.html)
        .join("");
    }

  }


export async function joinGame(gameId) {
    const messageDiv = document.getElementById("message");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id"); // Get the user ID from localStorage
  
    try {
      const response = await fetch(`/game/join/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
  
      const responseData = await response.json();
  
      if (response.status === 200) {
        messageDiv.textContent = "Player joined the game successfully.";
        return true;
      } else {
        messageDiv.textContent = responseData.message;
        return false;
      }
    } catch (error) {
      messageDiv.textContent = error.message;
    }
  }


export async function leaveGame(gameId, userId) {
    const messageDiv = document.getElementById("message");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`/game/leave/${gameId}/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();

        if (response.status === 200) {
            messageDiv.textContent = "Player left the game successfully.";
            return true;
        } else {
            messageDiv.textContent = responseData.message;
            return false;
        }
    } catch (error) {
        messageDiv.textContent = error.message;
    }
}