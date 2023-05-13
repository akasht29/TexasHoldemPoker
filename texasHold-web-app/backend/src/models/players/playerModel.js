
const db = require("../../database/connection");
const playerModel = {};



playerModel.createPlayer = async (user_id, game_id) => {
    const chips = await playerModel.getChips(game_id);


    const insertStr = "INSERT INTO players (user_id, game_id, chips) ";
    const valuesStr = "VALUES ($1, $2, $3) RETURNING game_id";
    const query = insertStr + valuesStr;
    const values = [user_id, game_id, chips];

    return await db.one(query, values);
};

playerModel.getChips = async (game_id) => {
    const value = parseInt(game_id, 10);
    if (isNaN(value)) {
        throw new Error("Invalid game ID. Please provide a valid integer.");
    }

    const query = "SELECT chips FROM game WHERE game_id = $1";
    const result = await db.one(query, [value]);
    return result.chips;
};



playerModel.addPlayer = async () => {

};

playerModel.changeStatus = async (player_id) => {

};

playerModel.getAllPlayers = async (game_id) => {

};



module.exports = playerModel;
