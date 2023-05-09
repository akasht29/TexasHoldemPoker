const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");

const tableModel = {};

tableModel.createTable = ( game_id, maxPlayers, minBuyIn, maxBuyIn) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO tables (game_id,max_players, min_buy_in, max_buy_in) VALUES ($1, $2, $3, $4)`;
        const values = [ game_id, maxPlayers, minBuyIn, maxBuyIn];
        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve();
                } else {
                    reject(new CustomError("Failed to create table", 500));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};



module.exports = tableModel;
