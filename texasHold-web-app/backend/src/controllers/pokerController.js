const gameModel = require("../models/game/gameModel");

pokerController = {};

pokerController.isBigBlind = async (gameId, playerId) => {
    let gameInfo            = await gameModel.getGameData(gameId);
    let curPlayerIndex      = await getCurrentPlayerIndex(gameId);
    let bigBlindPlayerIndex = (curPlayerIndex + 2) % gameInfo.players.length;
    
    if (gameInfo.players[bigBlindPlayerIndex].player_id == playerId) {
        return true
    }

    return false;
}

pokerController.isSmallBlind = async (gameId, playerId) => {
    let gameInfo              = await gameModel.getGameData(gameId);
    let curPlayerIndex        = await getCurrentPlayerIndex(gameId);
    let smallBlindPlayerIndex = (curPlayerIndex + 1) % gameInfo.players.length;
    
    if (gameInfo.players[smallBlindPlayerIndex].player_id == playerId) {
        return true
    }

    return false;
}

pokerController.incrementTurn = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    
    gameInfo.curr_turn++;
    
    await gameModel.updateTurn(gameId, gameInfo.curr_turn);
}

pokerController.getCurrentPlayerIndex = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    
    return gameInfo.curr_turn % gameInfo.players.length;
}

pokerController.isNewRound = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);

    return (gameInfo.curr_turn % gameInfo.players.length) == 0;
}

pokerController.isPlayersTurn = async (gameId, playerId) => {
    let gameInfo    = await gameModel.getGameData(gameId);
    let playerIndex = await pokerController.getCurrentPlayerIndex(gameId);
    
    if (gameInfo[playerIndex] == playerId) {
        return true;
    }

    return false;
}

pokerController.isGameOver = async (gameId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    
    if (gameInfo.curr_turn >= gameInfo.num_turns) {
        return true;
    }

    return false;
}

getScore = (bigRank, littleRank) => {
    return Math.pow(2, (bigRank * 13)) + (bigRank * littleRank);
}

rateHand = (handCards, communityCards) => {
    let score             = 0; 
    let rankCounter       = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    let suitCounter       = [ 0, 0, 0, 0 ];
    let straightPossible  = true;
    let fullHousePossible = 0;
    let allCards          = communityCards.concat(handCards);
    
    for (let i = 0; i < allCards.length; i++) {
        rankCounter[allCards[i] % 13]++;
        suitCounter[Math.trunc(allCards[i] / 13)]++;
    }

    for (let i = 0; i < handCards.length; i++) {
        if (
            (rankCounter[handCards[i] % 13] > 1) ||
            (suitCounter[handCards[i] / 13] > 4)
        ) {
            // don't do anything
        }
        else {
            score += getScore(1, handCards[i] % 13);
        }
    }

    for (let k = rankCounter.length - 1; k >= 0; k--) {
        if (rankCounter[k] == 2) {
            // PAIR DETECTED!!!
            if (fullHousePossible == 3) {
                // FULL HOUSE DETECTED!!!
                score += getScore(7, k);
            }
            fullHousePossible = 2;

            score += getScore(2, k);
        }
        else if (rankCounter[k] == 3) {
            if (fullHousePossible == 2) {
                // FULL HOUSE DETECTED!!!
                score += getScore(7, k);
            }
            fullHousePossible = 3;
            straightPossible  = false

            score += getScore(3, k);
        }
        else if (rankCounter[k] == 4) {
            // FOUR OF A KIND DETECTED!!!
            score += getScore(8, k);

            fullHousePossible = false;
            straightPossible  = false;
        }
    }

    let straightHappened = false;
    if (straightPossible) {
        let contiguous = 0;
        for (let i = rankCounter.length - 2; i >= 0; i--) {
            if (rankCounter[i] > 0 && rankCounter[i + 1] > 0) {
                contiguous++;
            }
            else {
                contiguous = 0;
            }

            if (contiguous > 3) {
                // STRAIGHT DETECTED!!!
                score += getScore(4, i);
                straightHappened = true;
                break;
            }
        }
    }
    
    // check for flushes
    for (let j = 0; j < suitCounter.length; j++) {
        if (suitCounter[j] > 4) {
            // FLUSH DETECTED!!!
            score += getScore(5, 1);

            if (straightHappened) {
                score += getScore(9, 2);
            }
        }
    }

    return score;
}

pokerController.ratePlayerHand = async (gameId, playerId) => {
    let gameInfo = await gameModel.getGameData(gameId);
    console.log("gameInfo:", gameInfo);
}

module.exports = pokerController;