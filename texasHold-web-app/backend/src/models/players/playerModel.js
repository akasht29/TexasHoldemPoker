
const db = require("../../database/connection");
const playerModel = {};



playerModel.createPlayer = async (user_id, game_id) => {
    const chips = playerModel.getChips(game_id)
    const insertStr = "INSERT INTO players (user_id, game_id, chips) ";
    const valuesStr = `VALUES ($1, $2, $3) RETURNING game_id`;
    const query = insertStr + valuesStr;
    const values = [user_id, game_id, chips];

    return await db.one(
        query,
        values
    );
};



playerModel.addPlayer = async () => {

};

playerModel.getChips = async (game_id) => {
    const query = "SELECT * FROM game WHERE game_id = $1";
    const values = [game_id];
    const result = await db.one(
        query,
        values
    );

    return result.chips;
}

playerModel.changeStatus = async (player_id) => {

};

playerModel.getAllPlayers = async (game_id) => {

};



module.exports = playerModel;
