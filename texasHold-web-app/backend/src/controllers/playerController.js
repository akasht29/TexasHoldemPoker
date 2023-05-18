const playerModel      = require('../models/players/playerModel');
const gameModel        = require('../models/game/gameModel')
const playerController = {};
/**
 * Returns the id of the player that was added/created
 */
playerController.addPlayer = async (gameId, userId) => {
    let playerId = await playerModel.createPlayer(userId, gameId);
    
    if (!playerId) {
        throw new Error("Could not add player.")
    }

    let gameData = await gameModel.getGameData(gameId);
    if (!gameData.players) {
        gameData.players = [];
    }

    gameData.players.push(playerId);
    
    await gameModel.updateGamePlayers(
        gameId, 
        gameData.players
    );
    
    await playerModel.addPlayer(gameId);

    return playerId;
};


/**
 * Returns the id of the player that was removed/deleted
 */
playerController.removePlayer = async (gameId, playerId) => {
    let gameData = await gameModel.getGameData(gameId);
    
    //console.log("removePlayerGameData:", gameData);
    //console.log("removePLayerPlayers:", gameData.players);
    // find player to remove
    let playerTargetIndex = -1;
    for (let i = 0; i < gameData.players.length; i++) {
        if (gameData.players[i] == playerId) {
            playerTargetIndex = i;
            break;
        }
    }

    // could not find player
    if (playerTargetIndex == -1) {
        console.log(`WARNING: player ${playerId} not in game ${gameId}`);
        return;
    }

    // remove player
    gameData.players.splice(playerTargetIndex, 1);

    await gameModel.updateGamePlayers(gameId, gameData.players);
    await playerModel.removePlayer(playerId);
}



//test funtion 
playerController.testController = async(game_id,player_id) =>{
    await gameModel.addToCommunityCards(game_id);
    console.log("controller success");
}

module.exports = playerController;
