
const db = require("../../database/db");
const playerModel = {};



playerModel.createPlayer = (userId, gameId) => {
    return new Promise(async (resolve, reject) => {
        try {
            //const existingPlayer = await playerModel.getPlayerByUserIdAndGameId(userId, gameId);
            //if (existingPlayer) {
            //    reject(new CustomError("Player already exists in this game", 409));
            //} else {
                const query = `INSERT INTO players (user_id, game_id) VALUES ($1, $2) RETURNING *`;
                const values = [userId, gameId];

                db.query(query, values)
                    .then((result) => {
                        if (result.rowCount > 0) {
                            resolve(result.rows[0]);
                        } else {
                            reject(new CustomError("No rows affected", 404));
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
            //}
        } catch (err) {
            reject(err);
        }
    });
};

playerModel.getPlayerByUserIdAndGameId = (userId, gameId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM players WHERE user_id = $1 AND game_id = $2`;
        const values = [userId, gameId];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                } else {
                    resolve(null);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

playerModel.removePlayerByUserIdAndGameId = (userId, gameId) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM players WHERE user_id = $1 AND game_id = $2`;
        const values = [userId, gameId];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve();
                } else {
                    reject(new CustomError("No rows affected", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};




playerModel.joinGame = (userId, gameId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Create a new player
            const player = await playerModel.createPlayer(userId, gameId);
            
            // Load the poker game
            //const pokerGame = await gameModel.loadGame(gameId);
            
            // Add the player to the poker game
            //pokerGame.joinGame(userId, playerName, buyIn);
            
            // Update the game state in the games_data table
            //await gameModel.updateGame(gameId, pokerGame.toJson());
            
            // Update the players_data table
            //await gameModel.updatePlayerData(userId, gameId, player);

            resolve(player);
        } catch (err) {
            reject(err);
        }
    });
};

playerModel.leaveGame = (userId, gameId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get the player object
            const removedPlayer = await playerModel.getPlayerByUserIdAndGameId(userId, gameId);
            
            if (removedPlayer) {
                // Load the poker game
                const pokerGame = await gameModel.loadGame(gameId);
                
                // Remove the player from the poker game
                pokerGame.leaveGame(userId);
                
                // Update the game state in the games_data table
                await gameModel.updateGame(gameId, pokerGame.toJson());
                
                // Remove the player from the players_data table
                await gameModel.removePlayerData(userId, gameId);
                
                // Return the removed player object
                resolve(removedPlayer);
            } else {
                reject(new CustomError("Player not found", 404));
            }
        } catch (err) {
            reject(err);
        }
    });
};


module.exports = playerModel;
