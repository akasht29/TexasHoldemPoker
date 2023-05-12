const PokerGame  = require("./pokerGame");
const tableModel  = require("../table/tableModel");
const gameModel   = {};
const playerModel = require("../players/playerModel");
const db          = require("../../database/connection");

gameModel.createGame = async (game_name, chips, num_players, num_rounds, min_bet) => {
    const insertStr = "INSERT INTO game (game_name, chips, num_players, num_rounds, min_bet) ";
    const valuesStr = `VALUES ($1, $2, $3, $4, $5) RETURNING game_id`;
    const query     = insertStr + valuesStr;
    const values    = [ game_name, chips, num_players, num_rounds, min_bet ];

    return await db.one(
        query,
        values
    );
};

    
gameModel.getAllGames = async () => {
    console.log("hicreategame");
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


gameModel.updateGame = (gameId, pokerGame) => {
    const updateGameQuery = `UPDATE games_data SET game_data = $2 WHERE game_id = $1`;

    const values = [gameId, pokerGame.toJson()];

    return (
        db.query(updateGameQuery, values)
        .then((result) => {
            if (result.rowCount === 0) {
                throw new CustomError("Failed to update game data", 500);
            }
        })
        .catch((err) => {
            throw err;
        })
    );
};


module.exports = gameModel;
