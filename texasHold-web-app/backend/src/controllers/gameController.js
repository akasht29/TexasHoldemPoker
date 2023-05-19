const gameModel   = require("../models/game/gameModel");
const tableModel  = require("../models/table/tableModel");
const playerModel = require("../models/players/playerModel");
const gameController = {};

gameController.createGame = async (gameName, numPlayers, numRounds, minBet) => {
    let chips = 10;
    return await gameModel.createGame(
        gameName, 
        chips,
        numPlayers, 
        numRounds * numPlayers, 
        minBet
    );
};

gameController.deleteGameIfEmpty = async (gameId) => {
    let gameData = await gameModel.getGameData(gameId);

    if (!gameData) {
        throw new Error(`Game ${gameId} does not exist`);
    }

    if (gameData.players.length == 0) {
        await gameModel.deleteGame(gameId);
    }
}

gameController.gameFull = async (gameId) => {
    let gameData = await gameModel.getGameData(gameId);

    return (
        (gameData.players != null) &&
        (gameData.players.length == gameData.num_players)
    );
}

gameController.getAllGames = async () => {
    return await gameModel.getAllGames();
};

gameController.gameStarted = async (gameId) => {
    let gameData = await gameModel.getGameData(gameId);
    return gameData.curr_round > 0;
}

gameController.firstPlayer = async (gameId, playerId) => {
    let gameData = await gameModel.getGameData(gameId);
    console.log("firstPlayerGameData:", gameData);
    console.log('PlayerId:', playerId);
    return (
        !gameData.players ||
        gameData.players.length == 0 ||
        // playerIds are created sequentially 
        // from lowest to highest
        gameData.players[0] == playerId
    );
}

module.exports = gameController;
