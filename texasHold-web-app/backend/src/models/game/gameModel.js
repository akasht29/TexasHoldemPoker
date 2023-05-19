const gameModel   = {};
const db          = require("../../database/connection");
const pgarray     = require('pg-array');

gameModel.createGame = async (game_name, chips, num_players, num_turns, min_bet) => {
    const deck      = await gameModel.generateDeck();
    const insertStr = "INSERT INTO game (game_name, chips, num_players, num_turns, min_bet, deck) ";
    const valuesStr = `VALUES ($1, $2, $3, $4, $5, $6) RETURNING game_id`;
    const query     = insertStr + valuesStr;
    const values    = [game_name, chips, num_players, num_turns, min_bet, pgarray(deck)];

    return await db.one(
        query,
        values
    );
};

// ok, this is dumb, but pgarray likes decks as strings
gameModel.generateDeck = async () => {
    let deck = [];
    for (let i = 0; i < 52; i++) {
        deck.push(i);
    }

    deck = gameModel.shuffleDeck(deck);
    deck = JSON.stringify(deck);
    return deck.substring(1, deck.length - 1);
}

gameModel.resetDeck = async (game_id) => {
    newDeck = await gameModel.generateDeck();

    query = "UPDATE game SET deck = $1 WHERE game_id = $2";
    const values = [pgarray(newDeck), game_id];
    await db.none(query, values);
}

gameModel.getMinBet = async (gameId) => {
    query = "SELECT min_bet FROM game WHERE game_id = $1";

    let gameInfo = await db.one(db.query, [gameId]);
    return gameInfo.min_bet;
}

gameModel.updateDeck = async (game_id, deck) => {
    let query = "Update game SET deck = $1 WHERE game_id = $2"
    let values = [pgarray(deck), game_id];
    await db.none(query, values);
}

gameModel.getDeck = async (game_id) => {
    query = "SELECT deck FROM game WHERE game_id = $1";
    result = await db.one(query, [game_id]);

    console.log(result.deck);
    return result.deck;
}

gameModel.addCards = async (game_id, player_id) => {
    let deck = await gameModel.getDeck(game_id);
    let playerHand = deck.splice(0, 2);
    console.log(deck);
    let query = "Update players SET hand = $1 WHERE player_id = $2"
    let values = [playerHand, player_id];

    await db.none(query, values);

    await gameModel.updateDeck(game_id, deck);

}
gameModel.updateBigBlind = async (game_id, player_id) => {
    query = "UPDATE game SET big_blind = $1 WHERE game_id = $2";
    const values = [player_id, game_id];
    await db.none(query, values);


}

gameModel.getBigBlind = async (game_id) => {
    query = "SELECT big_blind FROM game WHERE game_id = $1";
    const values = [game_id];
    let blind = await db.one(query, values);
    return blind.big_blind;
}

gameModel.updateSmallBlind = async (game_id, player_id) => {
    query = "UPDATE game SET small_blind = $1 WHERE game_id = $2";
    const values = [player_id, game_id];
    await db.none(query, values);

}

gameModel.getSmallBlind = async (game_id) => {
    query = "SELECT small_blind FROM game WHERE game_id = $1";
    const values = [game_id];
    await db.one(query, values);
}

gameModel.shuffleDeck = async (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

gameModel.getCommunityCards = async(game_id) => {
    query = "SELECT * FROM game WHERE game_id = $1";
    result = await db.one(query, [game_id]);

    return result.communityCards;
}

gameModel.addToCommunityCards = async (game_id) => {

    let deck = await gameModel.getDeck(game_id);
    let card = deck.splice(0, 1);
    console.log(card[0])
    let cc = await gameModel.getCommunityCards(game_id);
    let query = "UPDATE game SET communitycards = array_append(communitycards, $1) WHERE game_id = $2";
    let values = [card[0], game_id];

    await db.none(query, values);

    await gameModel.updateDeck(game_id, deck);
}

gameModel.getAllGames = async () => {
    const query = `SELECT game_id, game_name, num_players FROM game`;
    return await db.any(query);
};

gameModel.getGameData = async (gameId) => {
    const query = `SELECT * FROM game WHERE game_id=${gameId}`;
    return await db.one(query);
}

gameModel.updateTurn = async (gameId, newTurnValue) => {
    const query = `UPDATE game SET curr_turn = $1`;
    await db.none(query, [newTurnValue]);
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
    values = [gameId, newPlayers];
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
