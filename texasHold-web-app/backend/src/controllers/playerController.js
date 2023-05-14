const playerModel = require('../models/players/playerModel');
const playerController = {};



playerController.createPlayer = async (user_id, game_id) => {
    
    return await playerModel.createPlayer(user_id, game_id);
};

playerController.addPLayer = async (game_id) => {
    
    return await playerModel.addPlayer(game_id);
};

module.exports = playerController;
