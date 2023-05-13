const playerModel = require('../models/players/playerModel');
const playerController = {};



playerController.createPlayer = async (user_id, game_id) => {

    console.log("test");
    
    return await playerModel.createPlayer(user_id, game_id);
};



module.exports = playerController;
