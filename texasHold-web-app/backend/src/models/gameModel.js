const gameModel = {};
const db        = require("../database/connection");
const pgarray   = require('pg-array');

gameModel.createGame = async (game_name, chips, num_players, num_rounds, min_bet) => {
    const deck      = await gameModel.generateDeck();
    console.log(deck)
    const insertStr = "INSERT INTO game (game_name, chips, num_players, num_rounds, min_bet, deck) ";
    const valuesStr = `VALUES ($1, $2, $3, $4, $5, $6) RETURNING game_id`;
    const query     = insertStr + valuesStr;
    const values    = [game_name, chips, num_players, num_rounds, min_bet, deck];

    return await db.one(
        query,
        values
    );
};

gameModel.shuffleDeck = async (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

gameModel.generateDeck = async () => {
    let deck = [];

    for (let i = 0; i < 52; i++) {
        deck.push(i);
    }

    deck = await gameModel.shuffleDeck(deck);
    const deckStr = JSON.stringify(deck);
    return pgarray(deckStr.substring(1, deckStr.length - 1));
}

gameModel.getMinBet = async (gameId) => {
    const query = "SELECT min_bet FROM game WHERE game_id = $1";

    let gameInfo = await db.one(query, [gameId]);
    return gameInfo.min_bet;
}

gameModel.setDeck = async (game_id, deck) => {
    let query = "UPDATE game SET deck = $1 WHERE game_id = $2";
    const deckStr = JSON.stringify(deck);
    let values = [pgarray(deckStr.substring(1, deckStr.length - 1)), game_id];
    
    await db.none(query, values);
}

gameModel.getDeck = async (game_id) => {
    const query = "SELECT deck FROM game WHERE game_id = $1";
    const result = await db.one(query, [game_id]);
    
    return result.deck;
}

gameModel.popCardOffDeck = async (gameId) => {
    let deck = await gameModel.getDeck(gameId);
    let card = deck.pop();
    
    await gameModel.setDeck(gameId, deck);

    return card;
}

gameModel.addCards = async (game_id, player_id) => {
    let deck = await gameModel.getDeck(game_id);
    let playerHand = deck.splice(0, 2);
    let query = "Update players SET hand = $1 WHERE player_id = $2"
    let values = [playerHand, player_id];

    await db.none(query, values);

    await gameModel.setDeck(game_id, deck);
}

gameModel.getCommunityCards = async (game_id) => {
    const query = "SELECT * FROM game WHERE game_id = $1";
    const result = await db.one(query, [game_id]);
    
    return result.communitycards;
}

gameModel.clearCommunityCards = async (game_id) => {
    const query = "UPDATE game SET communitycards = {} WHERE game_id = $1";

    await db.none(query, [game_id]);
}

gameModel.setCommunityCards = async (game_id, cards) => {
    let query = "UPDATE game SET communitycards = $2 WHERE game_id = $1";
    let values = [game_id, cards];

    await db.none(query, values);
}

gameModel.getAllGames = async () => {
    const query = `SELECT game_id, game_name, num_players FROM game`;
    return await db.any(query);
};

gameModel.getGameData = async (gameId) => {
    const query = `SELECT * FROM game WHERE game_id=${gameId}`;
    return await db.one(query);
}

gameModel.setTurn = async (gameId, newTurn) => {
    const query = `UPDATE game SET curr_turn = $1 WHERE game_id = $2`;
    
    await db.none(query, [ newTurn, gameId ]);
}

gameModel.setRound = async (gameId, newRound) => {
    const query = `UPDATE game SET curr_round = $2 WHERE game_id = $1`;
    
    await db.none(query, [gameId, newRound]);
}

gameModel.setDealer = async (gameId, newDealer) => {
    const query = `UPDATE game SET curr_dealer = $2 WHERE game_id = $1`;
    
    await db.none(query, [gameId, newDealer]);
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
    const values = [gameId, newPlayers];
    return await db.one(query, values);
};

gameModel.deleteGame = async (gameId) => {
    const query = `DELETE FROM game WHERE game_id = $1`;
    const value = [gameId]

    await db.none(
        query,
        value
    );
}

module.exports = gameModel;
