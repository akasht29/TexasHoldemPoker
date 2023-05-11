const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");
const PokerGame = require("./pokerGame");
const tableModel = require("../table/tableModel");
const gameModel = {};
const playerModel = require("../players/playerModel");


gameModel.createGame = async (game_name, chips, num_players, num_rounds, min_bet) => {
    return new Promise(async (resolve, reject) => {
        try {
            const insertStr = "INSERT INTO game (game_name, chips, num_players, num_rounds, min_bet) ";
            const valuesStr = `VALUES ('${game_name}', ${chips}, ${num_players}, ${num_rounds}, ${min_bet}) RETURNING game_id`
            const query = insertStr + valuesStr;
            
            db.query(query)
            .then(async (result) => {
                if (result.rowCount > 0) {
                    const game = result.rows[0];

                    console.log(game);

                    resolve(game); // Resolve after storing the token
                } 
                else {
                    reject(new CustomError("No rows affected", 404));
                }
            })
        }
        catch (error) {
            reject(error);
        }
    });
};

    
gameModel.getAllGames = async () => {
    console.log("hicreategame");
    const query = `SELECT game_id, game_name, num_players FROM game`;
    return await db.query(query)
        .then((result) => {
            if (result.rowCount === 0){
                return [];
            }
            return result.rows;
        })
        .catch((err) => {
            throw err;
        });
};



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
