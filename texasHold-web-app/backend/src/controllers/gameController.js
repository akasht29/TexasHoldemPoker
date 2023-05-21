const gameModel      = require("../models/gameModel");
const gameController = {};

gameController.createGame = async (gameName, numPlayers, numRounds, minBet) => {
    let chips = 1000;
    return await gameModel.createGame(
        gameName, 
        chips,
        numPlayers, 
        numRounds, 
        minBet
    );
};

gameController.getDealer = async (gameId) => {
    return await gameModel.getDealer(gameId);
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
    
    return (
        !gameData.players ||
        gameData.players.length == 0 ||
        // playerIds are created sequentially 
        // from lowest to highest
        gameData.players[0] == playerId
    );
}

gameController.incrementTurn = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    
    gameInfo.curr_turn++;
    
    await gameModel.setTurn(gameId, gameInfo.curr_turn);
}

gameController.incrementRound = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    
    gameInfo.curr_round++;
    
    await gameModel.setRound(gameId, gameInfo.curr_round);
}

gameController.incrementDealer = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    
    gameInfo.curr_dealer = (gameInfo.curr_dealer + 1) % gameInfo.players.length;
    
    await gameModel.setDealer(gameId, gameInfo.curr_dealer);

    return gameInfo.curr_dealer;
}

gameController.isGameOver = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    
    if (gameInfo.curr_round >= gameInfo.num_rounds) {
        return true;
    }

    return false;
}

gameController.dealCardToCommunity = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId)
    let card     = await gameModel.popCardOffDeck(gameId);
    
    gameInfo.communityCards.push(card);

    await gameModel.setCommunityCards(gameId);
}

gameController.getCurrentPlayerIndex = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);

    return gameInfo.curr_turn % gameInfo.players.length;
}

gameController.getCurrentPlayer = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);

    return gameInfo.players[ await gameController.getCurrentPlayerIndex(gameId) ];
}

module.exports = gameController;
