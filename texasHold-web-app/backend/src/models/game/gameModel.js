const PokerGame   = require("./pokerGame");
const tableModel  = require("../table/tableModel");
const gameModel   = {};
const playerModel = require("../players/playerModel");
const db          = require("../../database/connection");
const pgarray     = require('pg-array');

gameModel.createGame = async (game_name, chips, num_players, num_rounds, min_bet) => {
    const deck = await gameModel.generateDeck();
    const insertStr = "INSERT INTO game (game_name, chips, num_players, num_rounds, min_bet, deck) ";
    const valuesStr = `VALUES ($1, $2, $3, $4, $5, $6) RETURNING game_id`;
    const query     = insertStr + valuesStr;
    const values    = [ game_name, chips, num_players, num_rounds, min_bet, pgarray(deck) ];

    return await db.one(
        query,
        values
    );
};

gameModel.generateDeck = async () => {
    const suits = ["C", "D", "H", "S"];
    console.log("inside gen deck")

    let deck = [];

    for (let i = 1; i <= 13; i++) {
        for (let j = 0; j < suits.length; j++) {
            deck.push(suits[j] + i);
        }
    }

    console.log(deck);

    deck = gameModel.shuffleDeck(deck)

    return deck;
}

gameModel.resetDeck = async(game_id) => {
    newDeck = await gameModel.generateDeck();

    query = "UPDATE game SET deck = $1 WHERE game_id = $2";
    const values = [pgarray(newDeck), game_id];
    await db.none(query, values);

}

gameModel.updateDeck = async(game_id, deck) => {
    let query = "Update game SET deck = $1 WHERE game_id = $2"
    let values = [pgarray(deck), game_id];
    await db.none(query, values);
}

gameModel.getDeck = async(game_id) => {
    query = "SELECT deck FROM game WHERE game_id = $1";
    result = await db.one(query, [game_id] );

    console.log(result.deck);
    return result.deck;
    

}

gameModel.addCards = async(game_id, player_id) => {
    let deck = await gameModel.getDeck(game_id);
    let playerHand = deck.splice(0,2);
    console.log(deck);
    let query = "Update players SET hand = $1 WHERE player_id = $2"
    let values = [playerHand, player_id];

    await db.none(query, values);

    await gameModel.updateDeck(game_id, deck);
   
}
gameModel.updateBigBlind = async(game_id, player_id) =>{
    query = "UPDATE game SET big_blind = $1 WHERE game_id = $2";
    const values = [player_id, game_id];
    await db.none(query, values);


}

gameModel.getBigBlind = async(game_id) =>{
    query = "SELECT big_blind FROM game WHERE game_id = $1";
    const values = [game_id];
    let blind = await db.one(query, values);
    return blind.big_blind;
    
}

gameModel.updateSmallBlind = async(game_id, player_id) =>{
    query = "UPDATE game SET small_blind = $1 WHERE game_id = $2";
    const values = [player_id, game_id];
    await db.none(query, values);
    
}

gameModel.getSmallBlind = async(game_id) =>{
    query = "SELECT small_blind FROM game WHERE game_id = $1";
    const values = [game_id];
    await db.one(query, values);
}

gameModel.shuffleDeck = async (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    
      console.log(deck);

      return deck;

}
    
gameModel.getAllGames = async () => {
    const query = `SELECT game_id, game_name, num_players FROM game`;
    return await db.any(query);
};

gameModel.getGameData = async (gameId) => {
    const query = `SELECT * FROM game WHERE game_id=${gameId}`;
    return await db.one(query);
}

gameModel.storeGame = (gameId, pokerGame) => {
    const query = `INSERT INTO games_data (game_id, game_data) VALUES ($1, $2)`;
    const values = [gameId, pokerGame.toJson()];
    return db
        .query(query, values)
        .then((result) => {
            if (result.rowCount === 0) {
                throw new CustomError("Failed to store game data", 500);
            }
        })
        .catch((err) => {
            throw err;
        });
};



gameModel.updatePlayerData = (user_id, game_id, playerData) => {
    const updatePlayerDataQuery = `
        INSERT INTO player_data (player_id, game_id, game_data)
        VALUES ((SELECT player_id FROM players WHERE user_id = $1 AND game_id = $2), $2, $3)
        ON CONFLICT (player_id, game_id) DO UPDATE SET game_data = $3
    `;

    const values = [user_id, game_id, playerData];

    return db
        .query(updatePlayerDataQuery, values)
        .then((result) => {
            if (result.rowCount === 0) {
                throw new CustomError("Failed to update player data", 500);
            }
        })
        .catch((err) => {
            throw err;
        });
};


gameModel.updateGamePlayers = async (gameId, newPlayers) => {
    const query = `UPDATE game SET players = $2 WHERE game_id = $1 RETURNING game_id`;
    values      = [ gameId, newPlayers ];
    return await db.one(query, values);
};

gameModel.deleteGame = async (gameId) => {
    console.log("wtfwtfwtf");
    const query = `DELETE FROM game WHERE game_id = $1`;
    const value = [ gameId ]

    await db.none(
        query,
        value
    );
}

module.exports = gameModel;
