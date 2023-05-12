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
    } 
    else {

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