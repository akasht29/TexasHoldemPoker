const playerModel      = require('../models/playerModel');
const gameModel        = require('../models/gameModel');
const gameController   = require('../controllers/gameController');
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

playerController.dealCardToPlayer = async (playerId) => {
    let playerInfo = await playerModel.getPlayerData(playerId);
    let card       = await gameModel.popCardOffDeck(playerInfo.game_id);
    
    playerInfo.handCards.push(card);

    await playerModel.setHand(playerInfo.handCards);
}

playerController.isPlayerFolded = async (playerId) => {
    let playerInfo = await playerModel.getPlayerData(playerId);
    
    return playerInfo.status == 0;
}

playerController.isPlayerCalled = async (playerId) => {
    let playerInfo = await playerModel.getPlayerData(playerId);

    return playerInfo.status == 1;
}

playerController.isPlayerAllIn = async (playerId) => {
    let playerInfo = await playerModel.getPlayerData(playerId);

    return playerInfo.status == 2;
}

playerController.isPlayersTurn = async (playerId) => {
    let playerInfo  = await playerModel.getPlayerData(playerId);
    let players     = await playerModel.getAllPlayers(playerInfo.game_id);
    let playerIndex = await gameController.getCurrentPlayerIndex(playerInfo.game_id);
    console.log('current player:', players[playerIndex].player_id, " you:", playerId);
    
    return players[playerIndex].player_id == playerId;
}

playerController.isBigBlind = async (gameId, playerId) => {
    const players = await playerModel.getAllPlayers(gameId);
    let dealer    = await gameModel.getDealer(gameId);
    let index     = (dealer + 2) % players.length;

    return players[index].player_id == playerId;
}

playerController.isSmallBlind = async (gameId, playerId) => {
    const players = await playerModel.getAllPlayers(gameId);
    let dealer    = await gameModel.getDealer(gameId);
    let index     = (dealer + 1) % players.length;

    return players[index].player_id == playerId;
}

module.exports = playerController;
